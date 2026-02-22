"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { List, Compass, FolderOpen, Settings } from "lucide-react";

const tabs = [
  { name: "Queue", href: "/app", icon: List },
  { name: "Discover", href: "/app/discover", icon: Compass },
  { name: "Organize", href: "/app/organize", icon: FolderOpen },
  { name: "Settings", href: "/app/settings", icon: Settings }
];

export default function BottomTabs() {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-40">
      <div className="bg-white/80 backdrop-blur-xl border-t border-gray-100/60">
        <div
          className="flex items-center justify-around px-2"
          style={{ paddingBottom: "env(safe-area-inset-bottom, 8px)" }}
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
                className={`flex flex-col items-center gap-0.5 py-2 px-4 min-w-[60px] transition-colors ${
                  isActive ? "text-[#7EB09B]" : "text-gray-400"
                }`}
              >
                <Icon
                  className="w-[22px] h-[22px]"
                  strokeWidth={isActive ? 2.2 : 1.8}
                />
                <span
                  className={`text-[10px] ${
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
