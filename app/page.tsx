import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#FAFAF8] px-6 py-12 flex items-center justify-center">
      <div className="max-w-sm w-full space-y-6 text-center">
        <div className="space-y-2">
          <p className="text-[12px] uppercase tracking-[0.2em] text-gray-400">
            Queue
          </p>
          <h1 className="text-[28px] font-bold text-gray-900 tracking-tight">
            A calm learning queue
          </h1>
          <p className="text-[14px] text-gray-500">
            Capture curiosities, learn gently, and share quietly.
          </p>
        </div>
        <Link
          href="/login"
          className="inline-flex items-center justify-center w-full py-3.5 rounded-2xl text-[15px] font-semibold bg-[#7EB09B] text-white shadow-lg shadow-[#7EB09B]/20"
        >
          Get started
        </Link>
      </div>
    </main>
  );
}
