"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { label: "Queue", href: "/app" },
  { label: "Discover", href: "/app/discover" },
  { label: "Friends", href: "/app/friends" },
  { label: "Organize", href: "/app/organize" }
] as const;

export default function AppMainTabs() {
  const pathname = usePathname();

  const hideOnProfile =
    pathname?.startsWith("/app/u/") || pathname?.startsWith("/app/topic/");
  const showTabs =
    !hideOnProfile &&
    (pathname === "/app" ||
      pathname === "/app/discover" ||
      pathname === "/app/friends" ||
      pathname?.startsWith("/app/organize"));

  if (!showTabs) {
    return null;
  }

  return (
    <div className="border-b border-gray-200 bg-[#FAFAF8] px-5 lg:px-8 pt-6">
      <nav className="flex flex-wrap gap-x-5 gap-y-2 sm:gap-8 max-w-4xl mx-auto w-full">
        {tabs.map((tab) => {
          const isActive =
            tab.href === "/app"
              ? pathname === "/app"
              : pathname?.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`pb-3 text-[14px] border-b-2 -mb-px transition-colors ${
                isActive
                  ? "border-gray-900 text-gray-900 font-medium"
                  : "border-transparent text-gray-400 hover:text-gray-600"
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
