import Link from "next/link";

type AppSidebarProps = {
  tags: string[];
};

export default function AppSidebar({ tags }: AppSidebarProps) {
  return (
    <div className="flex flex-col h-full min-h-screen px-6 py-8 bg-[#FAFAF8]">
      <Link href="/app" className="text-[15px] font-semibold text-gray-900 tracking-tight">
        Queue
      </Link>

      <div className="mt-8">
        <p className="text-[11px] uppercase tracking-wider text-gray-400 mb-2">Profile</p>
        <div className="rounded-lg border border-gray-200 bg-white px-3 py-2.5">
          <p className="text-[14px] font-medium text-gray-800">Your learning</p>
          <p className="text-[12px] text-gray-400 mt-0.5">Add details in Settings</p>
        </div>
      </div>

      <div className="mt-8 flex-1 min-h-0">
        <p className="text-[11px] uppercase tracking-wider text-gray-400 mb-2">Tags</p>
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

      <nav className="mt-auto pt-8 border-t border-gray-100 space-y-1">
        <Link
          href="/app/organize"
          className="block text-[13px] text-gray-600 hover:text-gray-900 py-1"
        >
          Organize
        </Link>
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
