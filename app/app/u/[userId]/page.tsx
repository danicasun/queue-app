import Link from "next/link";
import { redirect } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { getFriendProfileView } from "@/lib/actions/friends";

function websiteHref(raw: string): string {
  const t = raw.trim();
  return t.startsWith("http") ? t : `https://${t}`;
}

export default async function PublicProfilePage({
  params
}: {
  params: { userId: string };
}) {
  const view = await getFriendProfileView(params.userId);

  if (view.kind === "self") {
    redirect("/app/settings");
  }

  if (view.kind === "denied") {
    return (
      <div className="min-h-screen bg-[#FAFAF8] px-5 py-12 max-w-md mx-auto">
        <p className="text-[15px] text-gray-600 mb-4">
          You can&apos;t view this profile. You need to be friends to see each
          other&apos;s details.
        </p>
        <Link
          href="/app/friends"
          className="text-[14px] font-medium text-gray-900 underline"
        >
          Go to Friends
        </Link>
      </div>
    );
  }

  const website = view.websiteUrl?.trim();
  const twitter = view.twitterHandle?.trim();

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <div className="sticky top-0 z-20 bg-[#FAFAF8] border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-5 lg:px-8 py-3">
          <Link
            href="/app/friends"
            className="text-[13px] text-gray-600 hover:text-gray-900"
          >
            ← Friends
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-5 lg:px-8 pb-28 lg:pb-10 pt-6">
        <div className="flex items-start gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-[#7EB09B] flex items-center justify-center text-[22px] font-semibold text-white flex-shrink-0">
            {view.displayName.trim()[0]?.toUpperCase() ?? "?"}
          </div>
          <div>
            <h1 className="text-[22px] font-semibold text-gray-900">
              {view.displayName}
            </h1>
          </div>
        </div>

        <div className="space-y-4 text-[14px]">
          {website && (
            <a
              href={websiteHref(website)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-700 hover:text-gray-900 inline-flex items-center gap-1 break-all"
            >
              {websiteHref(website)}
              <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" />
            </a>
          )}
          {twitter && (
            <a
              href={`https://x.com/${twitter}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-gray-700 hover:text-gray-900 break-all"
            >
              {`https://x.com/${twitter}`}
            </a>
          )}
          {!website && !twitter && (
            <p className="text-gray-400">No links shared yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
