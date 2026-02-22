import "./globals.css";
import AppToaster from "@/components/ui/Toaster";

export const metadata = {
  title: "Queue",
  description: "A calm learning queue"
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#FAFAF8] text-gray-900">
        {children}
        <AppToaster />
      </body>
    </html>
  );
}
