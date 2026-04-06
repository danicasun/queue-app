import SettingsClient from "./SettingsClient";
import { getMyProfile } from "@/lib/actions/profile";

export default async function SettingsPage() {
  const profile = await getMyProfile();

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center px-5">
        <p className="text-gray-500 text-[14px]">Unable to load profile.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <div className="sticky top-0 z-20 bg-[#FAFAF8] border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-5 lg:px-8 pt-3 pb-3">
          <h1 className="text-[22px] font-semibold text-gray-900 tracking-tight">
            Settings
          </h1>
        </div>
      </div>

      <SettingsClient profile={profile} />
    </div>
  );
}
