"use server";

import { revalidatePath } from "next/cache";
import { createServerClient } from "@/lib/supabase/server";
import { validateRequiredText } from "@/lib/validation";

type DiscoverItem = {
  id: string;
  name: string;
  avatarColor: string;
  topicTitle: string;
  context: string;
  tag: string | null;
  privacyLabel: string;
  saved: boolean;
  topicId: string;
};

type CommentItem = {
  id: string;
  name: string;
  text: string;
  time: string;
  userId: string;
  createdAt: string;
};

type TopicTagRelation = {
  tags?: { name?: string | null } | null;
};

type DiscoverTopicRow = {
  id: string;
  title: string;
  note: string | null;
  visibility: string;
  user_id: string;
  topic_tags?: TopicTagRelation[] | null;
};

const avatarColors = [
  "#C4A1D4",
  "#A1C4D4",
  "#D4C4A1",
  "#A1D4B8",
  "#D4A1B8",
  "#B8C4BB"
];

function getAvatarColor(seed: string) {
  const hash = seed
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return avatarColors[hash % avatarColors.length];
}

function visibilityLabel(visibility: string) {
  switch (visibility) {
    case "topic_and_resources":
      return "Notes + resources shared";
    case "topic_and_notes":
      return "Notes shared";
    case "topic_only":
      return "Shared topic";
    default:
      return "Resources private";
  }
}

async function requireUser() {
  const supabase = createServerClient();
  const {
    data: { user },
    error
  } = await supabase.auth.getUser();
  if (error || !user) {
    throw new Error("Not authenticated.");
  }
  return user;
}

async function ensureTagsForUser(userId: string, names: string[]) {
  const supabase = createServerClient();
  const uniqueNames = Array.from(new Set(names.filter(Boolean)));
  if (uniqueNames.length === 0) return [];

  const { data: existing, error: existingError } = await supabase
    .from("tags")
    .select("id,name")
    .eq("user_id", userId)
    .in("name", uniqueNames);

  if (existingError) throw new Error(existingError.message);

  const existingMap = new Map(
    (existing ?? []).map((tag) => [tag.name, tag.id])
  );
  const missing = uniqueNames.filter((name) => !existingMap.has(name));

  if (missing.length > 0) {
    const { data: created, error: createError } = await supabase
      .from("tags")
      .insert(missing.map((name) => ({ name, user_id: userId })))
      .select("id,name");
    if (createError) throw new Error(createError.message);
    for (const tag of created ?? []) {
      existingMap.set(tag.name, tag.id);
    }
  }

  return uniqueNames.map((name) => ({
    id: existingMap.get(name) as string,
    name
  }));
}

export async function getDiscoverFeed(): Promise<DiscoverItem[]> {
  const supabase = createServerClient();
  const user = await requireUser();

  const { data, error } = await supabase
    .from("topics")
    .select("id,title,note,visibility,user_id,topic_tags(tags(name))")
    .neq("visibility", "private")
    .neq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  return (data ?? []).map((topic: DiscoverTopicRow) => {
    const tags = (topic.topic_tags ?? [])
      .map((relation) => relation.tags?.name)
      .filter(Boolean);
    const visibleNote =
      topic.visibility === "topic_and_notes" ||
      topic.visibility === "topic_and_resources"
        ? topic.note ?? ""
        : "";
    return {
      id: topic.id,
      topicId: topic.id,
      name: "Friend",
      avatarColor: getAvatarColor(topic.user_id),
      topicTitle: topic.title,
      context: visibleNote,
      tag: tags[0] ?? null,
      privacyLabel: visibilityLabel(topic.visibility),
      saved: false
    };
  });
}

export async function saveTopicToQueue(topicId: string) {
  const supabase = createServerClient();
  const user = await requireUser();

  const { data: topic, error } = await supabase
    .from("topics")
    .select("id,title,visibility,topic_tags(tags(name))")
    .eq("id", topicId)
    .neq("visibility", "private")
    .single();

  if (error || !topic) {
    return { error: "Topic not available to save." };
  }

  const { data: newTopic, error: createError } = await supabase
    .from("topics")
    .insert({
      title: topic.title,
      note: null,
      status: "active",
      visibility: "private",
      user_id: user.id
    })
    .select("id")
    .single();

  if (createError || !newTopic) {
    return { error: createError?.message ?? "Unable to save topic." };
  }

  const tags = (topic.topic_tags ?? [])
    .map((relation: TopicTagRelation) => relation.tags?.name)
    .filter(Boolean);
  const ensuredTags = await ensureTagsForUser(user.id, tags);
  if (ensuredTags.length > 0) {
    const { error: tagError } = await supabase.from("topic_tags").insert(
      ensuredTags.map((tag) => ({
        topic_id: newTopic.id,
        tag_id: tag.id
      }))
    );
    if (tagError) {
      return { error: tagError.message };
    }
  }

  revalidatePath("/app");
  revalidatePath("/app/discover");
  return { data: { id: newTopic.id } };
}

export async function getCommentsForTopic(topicId: string): Promise<CommentItem[]> {
  const supabase = createServerClient();
  const user = await requireUser();

  const { data, error } = await supabase
    .from("comments")
    .select("id,body,created_at,user_id")
    .eq("topic_id", topicId)
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);

  return (data ?? []).map((comment) => ({
    id: comment.id,
    userId: comment.user_id,
    name: comment.user_id === user.id ? "You" : "Friend",
    text: comment.body,
    time: new Date(comment.created_at).toLocaleDateString(),
    createdAt: comment.created_at
  }));
}

export async function addComment(topicId: string, body: string) {
  const error = validateRequiredText(body, "Comment");
  if (error) return { error };

  const supabase = createServerClient();
  const user = await requireUser();

  const { data, error: insertError } = await supabase
    .from("comments")
    .insert({
      topic_id: topicId,
      user_id: user.id,
      body: body.trim()
    })
    .select("id,body,created_at,user_id")
    .single();

  if (insertError || !data) {
    return { error: insertError?.message ?? "Unable to add comment." };
  }

  revalidatePath("/app/discover");
  return {
    data: {
      id: data.id,
      userId: data.user_id,
      name: "You",
      text: data.body,
      time: new Date(data.created_at).toLocaleDateString(),
      createdAt: data.created_at
    }
  };
}
