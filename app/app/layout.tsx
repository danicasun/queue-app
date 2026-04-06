import { Inter } from "next/font/google";
import BottomTabs from "@/components/queue/BottomTabs";
import AppSidebar from "@/components/queue/AppSidebar";
import AppMainTabs from "@/components/queue/AppMainTabs";
import { getTagNames } from "@/lib/actions/tags";
import { getMyProfile } from "@/lib/actions/profile";

const inter = Inter({ subsets: ["latin"] });

export default async function AppLayout({
  children
}: {
  children: React.ReactNode;
}) {
  let tags: string[] = [];
  try {
    tags = await getTagNames();
  } catch {
    tags = [];
  }

  let profile = {
    displayName: "Your learning",
    websiteUrl: null as string | null,
    twitterHandle: null as string | null
  };
  try {
    const p = await getMyProfile();
    if (p) {
      profile = {
        displayName: p.displayName,
        websiteUrl: p.websiteUrl,
        twitterHandle: p.twitterHandle
      };
    }
  } catch {
    /* keep defaults */
  }

  return (
    <div
      className={`${inter.className} min-h-screen bg-[#FAFAF8] flex flex-col lg:flex-row relative`}
    >
      <aside className="hidden lg:flex lg:w-[260px] lg:flex-shrink-0 lg:h-screen lg:sticky lg:top-0 lg:flex-col border-r border-gray-200 overflow-hidden">
        <AppSidebar tags={tags} profile={profile} />
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <AppMainTabs />
        <div className="flex-1">{children}</div>
      </div>

      <BottomTabs />
    </div>
  );
}
