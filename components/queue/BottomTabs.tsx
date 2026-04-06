"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { List, Compass, Users, Settings } from "lucide-react";

const tabs = [
  { name: "Queue", href: "/app", icon: List },
  { name: "Discover", href: "/app/discover", icon: Compass },
  { name: "Friends", href: "/app/friends", icon: Users },
  { name: "Settings", href: "/app/settings", icon: Settings }
];

export default function BottomTabs() {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-0 left-0 right-0 w-full z-40 lg:hidden">
      <div className="bg-[#FAFAF8] border-t border-gray-200">
        <div
          className="grid grid-cols-4 gap-0 px-0.5"
          style={{ paddingBottom: "max(8px, env(safe-area-inset-bottom))" }}
        >
          {tabs.map((tab) => {
            const isActive =
              tab.href === "/app"
                ? pathname === "/app"
                : pathname?.startsWith(tab.href);
            const Icon = tab.icon;

            return (
              <Link
                key={tab.name}
                href={tab.href}
                className={`flex flex-col items-center justify-center gap-0.5 py-2 min-w-0 transition-colors ${
                  isActive ? "text-[#7EB09B]" : "text-gray-400"
                }`}
              >
                <Icon
                  className="w-[19px] h-[19px] flex-shrink-0"
                  strokeWidth={isActive ? 2.2 : 1.8}
                />
                <span
                  className={`text-[8px] sm:text-[9px] leading-tight text-center truncate max-w-full px-0.5 ${
                    isActive ? "font-semibold" : "font-medium"
                  }`}
                >
                  {tab.name}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
