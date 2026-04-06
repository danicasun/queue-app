"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { List, Compass, Settings } from "lucide-react";

const tabs = [
  { name: "Queue", href: "/app", icon: List },
  { name: "Discover", href: "/app/discover", icon: Compass },
  { name: "Settings", href: "/app/settings", icon: Settings }
];

export default function BottomTabs() {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-0 left-0 right-0 w-full z-40 lg:hidden">
      <div className="bg-[#FAFAF8] border-t border-gray-200">
        <div
          className="grid grid-cols-3 gap-0 px-1"
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
                  className="w-[20px] h-[20px] flex-shrink-0"
                  strokeWidth={isActive ? 2.2 : 1.8}
                />
                <span
                  className={`text-[9px] sm:text-[10px] leading-tight text-center truncate max-w-full px-0.5 ${
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
