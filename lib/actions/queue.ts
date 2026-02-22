"use server";

import { revalidatePath } from "next/cache";
import { createServerClient } from "@/lib/supabase/server";
import { normalizeUrl, validateRequiredText, validateUrl } from "@/lib/validation";

type TopicVisibility =
  | "private"
  | "topic_only"
  | "topic_and_notes"
  | "topic_and_resources";

type TopicStatus = "active" | "completed";

type TopicSummary = {
  id: string;
  title: string;
  note: string | null;
  status: TopicStatus;
  visibility: TopicVisibility;
  tags: string[];
  resourceCount: number;
  createdAt: string;
};

type TopicDetail = TopicSummary & {
  resources: ResourceDetail[];
};

type ResourceDetail = {
  id: string;
  title: string;
  url: string | null;
  note: string | null;
  createdAt: string;
};

type ActionResult<T> = { data?: T; error?: string };

type TopicTagRelation = {
  tags?: { name?: string | null } | null;
};

type TopicRowWithRelations = {
  id: string;
  title: string;
  note: string | null;
  status: TopicStatus;
  visibility: TopicVisibility;
  created_at: string;
  topic_tags?: TopicTagRelation[] | null;
  resources?: { count?: number }[] | null;
};

type ResourceRowWithCreatedAt = {
  id: string;
  title: string;
  url: string | null;
  note: string | null;
  created_at: string;
};

async function requireUserId() {
  const supabase = createServerClient();
  const {
    data: { user },
    error
  } = await supabase.auth.getUser();
  if (error || !user) {
    throw new Error("Not authenticated.");
  }
  return user.id;
}

async function ensureTags(tagNames: string[]) {
  const supabase = createServerClient();
  const userId = await requireUserId();
  const uniqueNames = Array.from(
    new Set(tagNames.map((name) => name.trim()).filter(Boolean))
  );

  if (uniqueNames.length === 0) return [];

  const { data: existingTags, error: existingError } = await supabase
    .from("tags")
    .select("id,name")
    .eq("user_id", userId)
    .in("name", uniqueNames);

  if (existingError) {
    throw new Error(existingError.message);
  }

  const existingMap = new Map(
    (existingTags ?? []).map((tag) => [tag.name, tag.id])
  );
  const missingNames = uniqueNames.filter((name) => !existingMap.has(name));

  if (missingNames.length > 0) {
    const { data: newTags, error: insertError } = await supabase
      .from("tags")
      .insert(missingNames.map((name) => ({ name, user_id: userId })))
      .select("id,name");

    if (insertError) {
      throw new Error(insertError.message);
    }

    for (const tag of newTags ?? []) {
      existingMap.set(tag.name, tag.id);
    }
  }

  return uniqueNames.map((name) => ({
    id: existingMap.get(name) as string,
    name
  }));
}

function mapTopicRow(row: TopicRowWithRelations): TopicSummary {
  const tags = (row.topic_tags ?? [])
    .map((relation) => relation.tags?.name)
    .filter(Boolean);
  const resourceCount = row.resources?.[0]?.count ?? 0;
  return {
    id: row.id,
    title: row.title,
    note: row.note,
    status: row.status,
    visibility: row.visibility,
    tags,
    resourceCount,
    createdAt: row.created_at
  };
}

export async function getTopics(): Promise<TopicSummary[]> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("topics")
    .select(
      "id,title,note,status,visibility,created_at,topic_tags(tags(name)),resources(count)"
    )
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map(mapTopicRow);
}

export async function getTopicsByTag(tagName: string): Promise<TopicSummary[]> {
  const supabase = createServerClient();
  const userId = await requireUserId();
  const { data, error } = await supabase
    .from("topics")
    .select(
      "id,title,note,status,visibility,created_at,topic_tags!inner(tags!inner(name)),resources(count)"
    )
    .eq("user_id", userId)
    .eq("topic_tags.tags.name", tagName)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map(mapTopicRow);
}

export async function getTopicWithResources(
  topicId: string
): Promise<TopicDetail | null> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("topics")
    .select(
      "id,title,note,status,visibility,created_at,topic_tags(tags(name)),resources(id,title,url,note,created_at)"
    )
    .eq("id", topicId)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null;
    }
    throw new Error(error.message);
  }

  const topic = mapTopicRow(data);
  const resources = (data.resources ?? [])
    .map((resource: ResourceRowWithCreatedAt) => ({
      id: resource.id,
      title: resource.title,
      url: resource.url,
      note: resource.note,
      createdAt: resource.created_at
    }))
    .sort((a: ResourceDetail, b: ResourceDetail) =>
      a.createdAt.localeCompare(b.createdAt)
    );

  return { ...topic, resources };
}

export async function createTopic(payload: {
  title: string;
  note?: string;
  tags?: string[];
}): Promise<ActionResult<TopicSummary>> {
  const titleError = validateRequiredText(payload.title, "Topic title");
  if (titleError) {
    return { error: titleError };
  }

  const supabase = createServerClient();
  const userId = await requireUserId();
  const { data, error } = await supabase
    .from("topics")
    .insert({
      title: payload.title.trim(),
      note: payload.note?.trim() || null,
      status: "active",
      visibility: "private",
      user_id: userId
    })
    .select("id,title,note,status,visibility,created_at")
    .single();

  if (error) {
    return { error: error.message };
  }

  const tags = await ensureTags(payload.tags ?? []);
  if (tags.length > 0) {
    const { error: tagError } = await supabase.from("topic_tags").insert(
      tags.map((tag) => ({
        topic_id: data.id,
        tag_id: tag.id
      }))
    );
    if (tagError) {
      return { error: tagError.message };
    }
  }

  revalidatePath("/app");
  revalidatePath("/app/organize");

  return {
    data: {
      id: data.id,
      title: data.title,
      note: data.note,
      status: data.status,
      visibility: data.visibility,
      tags: tags.map((tag) => tag.name),
      resourceCount: 0,
      createdAt: data.created_at
    }
  };
}

export async function updateTopic(payload: {
  id: string;
  title?: string;
  note?: string | null;
  status?: TopicStatus;
  visibility?: TopicVisibility;
  tags?: string[];
}): Promise<ActionResult<TopicSummary>> {
  if (payload.title !== undefined) {
    const titleError = validateRequiredText(payload.title, "Topic title");
    if (titleError) {
      return { error: titleError };
    }
  }

  const supabase = createServerClient();
  const updateFields: Record<string, unknown> = {};
  if (payload.title !== undefined) updateFields.title = payload.title.trim();
  if (payload.note !== undefined) updateFields.note = payload.note?.trim() || null;
  if (payload.status !== undefined) updateFields.status = payload.status;
  if (payload.visibility !== undefined) updateFields.visibility = payload.visibility;

  let data: {
    id: string;
    title: string;
    note: string | null;
    status: TopicStatus;
    visibility: TopicVisibility;
    created_at: string;
  };
  if (Object.keys(updateFields).length === 0) {
    const { data: existing, error } = await supabase
      .from("topics")
      .select("id,title,note,status,visibility,created_at")
      .eq("id", payload.id)
      .single();
    if (error || !existing) {
      return { error: error?.message ?? "Unable to load topic." };
    }
    data = existing;
  } else {
    const { data: updated, error } = await supabase
      .from("topics")
      .update(updateFields)
      .eq("id", payload.id)
      .select("id,title,note,status,visibility,created_at")
      .single();

    if (error || !updated) {
      return { error: error?.message ?? "Unable to update topic." };
    }
    data = updated;
  }

  let tags: string[] = [];
  if (payload.tags) {
    const ensured = await ensureTags(payload.tags);
    tags = ensured.map((tag) => tag.name);
    const { error: deleteError } = await supabase
      .from("topic_tags")
      .delete()
      .eq("topic_id", payload.id);
    if (deleteError) {
      return { error: deleteError.message };
    }
    if (ensured.length > 0) {
      const { error: insertError } = await supabase.from("topic_tags").insert(
        ensured.map((tag) => ({
          topic_id: payload.id,
          tag_id: tag.id
        }))
      );
      if (insertError) {
        return { error: insertError.message };
      }
    }
  } else {
    const { data: existingTags } = await supabase
      .from("topic_tags")
      .select("tags(name)")
      .eq("topic_id", payload.id);
    tags = (existingTags ?? [])
      .map((relation: TopicTagRelation) => relation.tags?.name)
      .filter(Boolean);
  }

  const { count: resourceCount } = await supabase
    .from("resources")
    .select("*", { count: "exact", head: true })
    .eq("topic_id", payload.id);

  revalidatePath("/app");
  revalidatePath(`/app/topic/${payload.id}`);
  revalidatePath("/app/organize");

  return {
    data: {
      id: data.id,
      title: data.title,
      note: data.note,
      status: data.status,
      visibility: data.visibility,
      tags,
      resourceCount: resourceCount ?? 0,
      createdAt: data.created_at
    }
  };
}

export async function deleteTopic(topicId: string): Promise<ActionResult<null>> {
  const supabase = createServerClient();
  const { error } = await supabase.from("topics").delete().eq("id", topicId);
  if (error) {
    return { error: error.message };
  }
  revalidatePath("/app");
  return { data: null };
}

export async function createResource(payload: {
  topicId: string;
  title: string;
  url?: string;
  note?: string;
}): Promise<ActionResult<ResourceDetail>> {
  const titleError = validateRequiredText(payload.title, "Resource title");
  if (titleError) {
    return { error: titleError };
  }
  const urlError = validateUrl(payload.url ?? "");
  if (urlError) {
    return { error: urlError };
  }

  const supabase = createServerClient();
  const userId = await requireUserId();
  const { data, error } = await supabase
    .from("resources")
    .insert({
      topic_id: payload.topicId,
      title: payload.title.trim(),
      url: payload.url ? normalizeUrl(payload.url) : null,
      note: payload.note?.trim() || null,
      user_id: userId
    })
    .select("id,title,url,note,created_at")
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/app/topic/${payload.topicId}`);
  return {
    data: {
      id: data.id,
      title: data.title,
      url: data.url,
      note: data.note,
      createdAt: data.created_at
    }
  };
}

export async function updateResource(payload: {
  id: string;
  topicId: string;
  title?: string;
  url?: string;
  note?: string | null;
}): Promise<ActionResult<ResourceDetail>> {
  if (payload.title !== undefined) {
    const titleError = validateRequiredText(payload.title, "Resource title");
    if (titleError) {
      return { error: titleError };
    }
  }
  const urlError = validateUrl(payload.url ?? "");
  if (urlError) {
    return { error: urlError };
  }

  const supabase = createServerClient();
  const updateFields: Record<string, unknown> = {};
  if (payload.title !== undefined) updateFields.title = payload.title.trim();
  if (payload.url !== undefined)
    updateFields.url = payload.url ? normalizeUrl(payload.url) : null;
  if (payload.note !== undefined)
    updateFields.note = payload.note?.trim() || null;

  const { data, error } = await supabase
    .from("resources")
    .update(updateFields)
    .eq("id", payload.id)
    .select("id,title,url,note,created_at")
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/app/topic/${payload.topicId}`);
  return {
    data: {
      id: data.id,
      title: data.title,
      url: data.url,
      note: data.note,
      createdAt: data.created_at
    }
  };
}

export async function deleteResource(payload: {
  id: string;
  topicId: string;
}): Promise<ActionResult<null>> {
  const supabase = createServerClient();
  const { error } = await supabase.from("resources").delete().eq("id", payload.id);
  if (error) {
    return { error: error.message };
  }
  revalidatePath(`/app/topic/${payload.topicId}`);
  return { data: null };
}