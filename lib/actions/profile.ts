"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import { normalizeUrl, validateRequiredText, validateUrl } from "@/lib/validation";

export type PublicProfile = {
  userId: string;
  displayName: string;
  websiteUrl: string | null;
  twitterHandle: string | null;
  email: string | null;
};

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

function normalizeTwitterHandle(raw: string): string {
  let s = raw.trim();
  if (!s) return "";
  s = s.replace(/^@+/, "");
  if (/^(https?:)?\/\//i.test(s) || s.includes("twitter.com") || s.includes("x.com")) {
    try {
      const url = new URL(s.startsWith("http") ? s : `https://${s}`);
      const seg = url.pathname.replace(/^\//, "").split("/").filter(Boolean)[0];
      if (seg) s = seg;
    } catch {
      /* keep s */
    }
  }
  return s.replace(/^@/, "");
}

export async function getMyProfile(): Promise<PublicProfile | null> {
  const supabase = createServerClient();
  const {
    data: { user },
    error: authError
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return null;
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("display_name, website_url, twitter_handle")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!profile) {
    const fallback =
      user.email?.split("@")[0]?.trim() || "Anonymous";
    const { data: inserted, error: insertError } = await supabase
      .from("profiles")
      .insert({
        user_id: user.id,
        display_name: fallback
      })
      .select("display_name, website_url, twitter_handle")
      .single();

    if (insertError || !inserted) {
      return {
        userId: user.id,
        displayName: fallback,
        websiteUrl: null,
        twitterHandle: null,
        email: user.email ?? null
      };
    }

    return {
      userId: user.id,
      displayName: inserted.display_name,
      websiteUrl: inserted.website_url ?? null,
      twitterHandle: inserted.twitter_handle ?? null,
      email: user.email ?? null
    };
  }

  return {
    userId: user.id,
    displayName: profile.display_name,
    websiteUrl: profile.website_url ?? null,
    twitterHandle: profile.twitter_handle ?? null,
    email: user.email ?? null
  };
}

export async function updateMyProfile(payload: {
  displayName: string;
  websiteUrl: string;
  twitterHandle: string;
}): Promise<{ error?: string }> {
  const user = await requireUser();
  const supabase = createServerClient();

  const nameError = validateRequiredText(payload.displayName, "Name");
  if (nameError) {
    return { error: nameError };
  }

  const websiteTrimmed = payload.websiteUrl.trim();
  if (websiteTrimmed) {
    const urlError = validateUrl(websiteTrimmed);
    if (urlError) {
      return { error: urlError };
    }
  }

  const twitterNormalized = normalizeTwitterHandle(payload.twitterHandle);
  if (twitterNormalized) {
    if (!/^[\w]{1,15}$/.test(twitterNormalized)) {
      return {
        error:
          "X handle must be 1–15 letters, numbers, or underscores (no @ in storage)."
      };
    }
  }

  const websiteStored = websiteTrimmed
    ? normalizeUrl(websiteTrimmed)
    : null;

  const { error } = await supabase.from("profiles").upsert(
    {
      user_id: user.id,
      display_name: payload.displayName.trim(),
      website_url: websiteStored,
      twitter_handle: twitterNormalized || null
    },
    { onConflict: "user_id" }
  );

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/app");
  revalidatePath("/app/settings");
  return {};
}

export async function signOut() {
  const supabase = createServerClient();
  await supabase.auth.signOut();
  redirect("/login");
}
