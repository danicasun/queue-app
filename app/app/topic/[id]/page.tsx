import Link from "next/link";
import TopicDetailClient from "./TopicDetailClient";
import { getTopicWithResources } from "@/lib/actions/queue";
import { getTagNames } from "@/lib/actions/tags";

type PageProps = {
  params: { id: string };
  searchParams?: { from?: string; tag?: string };
};

export default async function TopicDetailPage({
  params,
  searchParams
}: PageProps) {
  let topic = null;
  let availableTags: string[] = [];
  try {
    topic = await getTopicWithResources(params.id);
    availableTags = await getTagNames();
  } catch {
    topic = null;
    availableTags = [];
  }
  if (!topic) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] flex flex-col items-center justify-center gap-4">
        <p className="text-[14px] text-gray-400">Topic not found</p>
        <Link href="/app" className="text-[14px] font-medium text-[#7EB09B]">
          Back to Queue
        </Link>
      </div>
    );
  }

  const fromOrganize = searchParams?.from === "organize";
  const backHref = fromOrganize
    ? `/app/organize${searchParams?.tag ? `?tag=${encodeURIComponent(searchParams.tag)}` : ""}`
    : "/app";
  return (
    <TopicDetailClient
      topic={topic}
      availableTags={availableTags}
      backHref={backHref}
    />
  );
}
