"use server";

import { revalidatePath } from "next/cache";
import { createServerClient } from "@/lib/supabase/server";
import { validateRequiredText } from "@/lib/validation";

type TagSummary = {
  id: string;
  name: string;
  count: number;
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

export async function getTagSummaries(): Promise<TagSummary[]> {
  const supabase = createServerClient();
  const userId = await requireUserId();

  const { data, error } = await supabase
    .from("tags")
    .select("id,name,topic_tags(topic_id)")
    .eq("user_id", userId)
    .order("name", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    count: (row.topic_tags ?? []).length
  }));
}

export async function getTagNames(): Promise<string[]> {
  const supabase = createServerClient();
  const userId = await requireUserId();
  const { data, error } = await supabase
    .from("tags")
    .select("name")
    .eq("user_id", userId)
    .order("name", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((row) => row.name).filter(Boolean);
}

export async function createTag(name: string) {
  const error = validateRequiredText(name, "Tag name");
  if (error) return { error };

  const supabase = createServerClient();
  const userId = await requireUserId();
  const trimmedName = name.trim();

  const { data, error: insertError } = await supabase
    .from("tags")
    .insert({ name: trimmedName, user_id: userId })
    .select("id,name")
    .single();

  if (insertError || !data) {
    return { error: insertError?.message ?? "Unable to create tag." };
  }

  revalidatePath("/app");
  revalidatePath("/app/organize");
  return { data };
}

export async function renameTag(tagId: string, name: string) {
  const error = validateRequiredText(name, "Tag name");
  if (error) return { error };

  const supabase = createServerClient();
  const userId = await requireUserId();
  const trimmedName = name.trim();

  const { data, error: updateError } = await supabase
    .from("tags")
    .update({ name: trimmedName })
    .eq("id", tagId)
    .eq("user_id", userId)
    .select("id,name")
    .single();

  if (updateError || !data) {
    return { error: updateError?.message ?? "Unable to rename tag." };
  }

  revalidatePath("/app");
  revalidatePath("/app/organize");
  return { data };
}

export async function deleteTag(tagId: string) {
  const supabase = createServerClient();
  const userId = await requireUserId();
  const { error } = await supabase
    .from("tags")
    .delete()
    .eq("id", tagId)
    .eq("user_id", userId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/app");
  revalidatePath("/app/organize");
  return { data: null };
}
