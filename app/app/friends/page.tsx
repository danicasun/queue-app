import FriendsClient from "./FriendsClient";
import { getFriendsData } from "@/lib/actions/friends";

export default async function FriendsPage() {
  let data: Awaited<ReturnType<typeof getFriendsData>> = {
    friends: [],
    incoming: [],
    outgoing: []
  };
  try {
    data = await getFriendsData();
  } catch {
    /* empty */
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <div className="sticky top-0 z-20 bg-[#FAFAF8] border-b border-gray-100">
        <div className="max-w-4xl mx-auto w-full px-5 lg:px-8 pt-3 pb-3 text-left">
          <p className="text-[13px] text-gray-500">
            Connect with people you learn alongside
          </p>
        </div>
      </div>
      <FriendsClient initialData={data} />
    </div>
  );
}
