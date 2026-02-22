import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

type RouteContext = {
  params: { topicId: string };
};

export async function GET(_request: Request, context: RouteContext) {
  const { topicId } = context.params;
  if (!topicId) {
    return NextResponse.json(
      { error: "Topic id is required." },
      { status: 400 }
    );
  }

  const supabase = createServerClient();
  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("comments")
    .select("id,body,created_at,user_id")
    .eq("topic_id", topicId)
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const comments = (data ?? []).map((comment) => ({
    id: comment.id,
    userId: comment.user_id,
    name: comment.user_id === user.id ? "You" : "Friend",
    text: comment.body,
    time: new Date(comment.created_at).toLocaleDateString(),
    createdAt: comment.created_at
  }));

  return NextResponse.json({ data: comments });
}
