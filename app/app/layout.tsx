import { Inter } from "next/font/google";
import BottomTabs from "@/components/queue/BottomTabs";
import AppSidebar from "@/components/queue/AppSidebar";
import AppMainTabs from "@/components/queue/AppMainTabs";
import { getTagNames } from "@/lib/actions/tags";

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

  return (
    <div
      className={`${inter.className} min-h-screen bg-[#FAFAF8] flex flex-col lg:flex-row relative`}
    >
      <aside className="hidden lg:flex lg:w-[260px] lg:flex-shrink-0 lg:flex-col border-r border-gray-200">
        <AppSidebar tags={tags} />
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <AppMainTabs />
        <div className="flex-1">{children}</div>
      </div>

      <BottomTabs />
    </div>
  );
}
