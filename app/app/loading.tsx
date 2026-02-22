import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default function AppLoading() {
  return (
    <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center">
      <LoadingSpinner />
    </div>
  );
}
