import Link from "next/link";
import { ExternalLink } from "lucide-react";

export type SidebarProfile = {
  displayName: string;
  websiteUrl: string | null;
  twitterHandle: string | null;
};

type AppSidebarProps = {
  tags: string[];
  profile: SidebarProfile;
};

function initials(name: string) {
  const t = name.trim();
  return t ? t[0]!.toUpperCase() : "?";
}

function websiteHref(raw: string): string {
  const t = raw.trim();
  return t.startsWith("http") ? t : `https://${t}`;
}

function xProfileUrl(handle: string): string {
  return `https://x.com/${handle.trim()}`;
}

export default function AppSidebar({ tags, profile }: AppSidebarProps) {
  const website = profile.websiteUrl?.trim() || null;
  const twitter = profile.twitterHandle?.trim() || null;

  return (
    <div className="flex flex-col h-full min-h-0 overflow-hidden py-8 px-6 bg-[#FAFAF8]">
      <Link
        href="/app"
        className="text-[15px] font-semibold text-gray-900 tracking-tight flex-shrink-0"
      >
        Queue
      </Link>

      <div className="mt-8 flex-shrink-0">
        <p className="text-[11px] uppercase tracking-wider text-gray-400 mb-2">
          Profile
        </p>
        <div className="rounded-lg border border-gray-200 bg-white px-3 py-2.5">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-9 h-9 rounded-full bg-[#7EB09B] flex items-center justify-center flex-shrink-0 text-[13px] font-semibold text-white">
              {initials(profile.displayName)}
            </div>
            <p className="text-[14px] font-medium text-gray-800 leading-snug">
              {profile.displayName || "Your name"}
            </p>
          </div>
          {website && (
            <a
              href={websiteHref(website)}
              target="_blank"
              rel="noopener noreferrer"
              title={websiteHref(website)}
              className="text-[12px] text-gray-600 hover:text-gray-900 inline-flex items-start gap-1 mt-1 max-w-full min-w-0"
            >
              <span className="break-all">{websiteHref(website)}</span>
              <ExternalLink className="w-3 h-3 opacity-60 flex-shrink-0 mt-0.5" />
            </a>
          )}
          {twitter && (
            <a
              href={xProfileUrl(twitter)}
              target="_blank"
              rel="noopener noreferrer"
              title={xProfileUrl(twitter)}
              className="block text-[12px] text-gray-600 hover:text-gray-900 mt-1 break-all"
            >
              {xProfileUrl(twitter)}
            </a>
          )}
          {!website && !twitter && (
            <p className="text-[12px] text-gray-400 mt-0.5">
              Add website and X in Settings
            </p>
          )}
        </div>
      </div>

      <div className="mt-8 flex-1 min-h-0 flex flex-col overflow-hidden">
        <p className="text-[11px] uppercase tracking-wider text-gray-400 mb-2 flex-shrink-0">
          Tags
        </p>
        <div className="overflow-y-auto min-h-0 pr-1 -mr-1">
          {tags.length > 0 ? (
            <ul className="space-y-1">
              {tags.map((tag) => (
                <li key={tag}>
                  <Link
                    href={`/app/organize?tag=${encodeURIComponent(tag)}`}
                    className="inline-block text-[13px] text-gray-600 hover:text-gray-900 rounded-md px-2 py-1 -mx-2 hover:bg-gray-100/80"
                  >
                    {tag}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-[13px] text-gray-400">No tags yet</p>
          )}
        </div>
      </div>

      <nav className="mt-4 pt-6 border-t border-gray-100 flex-shrink-0">
        <Link
          href="/app/settings"
          className="block text-[13px] text-gray-600 hover:text-gray-900 py-1"
        >
          Settings
        </Link>
      </nav>
    </div>
  );
}
