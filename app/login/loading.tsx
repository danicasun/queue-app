import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default function LoginLoading() {
  return (
    <main className="min-h-screen bg-[#FAFAF8] flex items-center justify-center">
      <LoadingSpinner />
    </main>
  );
}
