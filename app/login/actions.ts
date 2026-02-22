"use server";

import { headers } from "next/headers";
import { createServerClient } from "@/lib/supabase/server";
import type { SignInState } from "./state";

export async function signInWithEmail(
  _prevState: SignInState,
  formData: FormData
): Promise<SignInState> {
  const email = String(formData.get("email") || "").trim();

  if (!email) {
    return { status: "error", message: "Email is required." };
  }

  const supabase = createServerClient();
  const origin =
    headers().get("origin") || process.env.NEXT_PUBLIC_SITE_URL || "";

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: origin ? `${origin}/auth/callback` : undefined
    }
  });

  if (error) {
    return { status: "error", message: error.message };
  }

  return {
    status: "success",
    message: "Check your email for a magic sign-in link."
  };
}
