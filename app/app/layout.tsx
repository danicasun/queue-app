import { Inter } from "next/font/google";
import BottomTabs from "@/components/queue/BottomTabs";

const inter = Inter({ subsets: ["latin"] });

export default function AppLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={`${inter.className} max-w-[430px] mx-auto min-h-screen bg-[#FAFAF8] relative`}
    >
      <style>{`
        body { background: #EDEDEB; margin: 0; }
        ::-webkit-scrollbar { display: none; }
      `}</style>
      {children}
      <BottomTabs />
    </div>
  );
}
