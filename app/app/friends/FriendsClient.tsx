"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  sendFriendRequest,
  acceptFriendRequest,
  declineOrCancelFriendRequest,
  removeFriend,
  type FriendSummary,
  type PendingRequest
} from "@/lib/actions/friends";
import { toast } from "@/lib/toast";

type FriendsClientProps = {
  initialData: {
    friends: FriendSummary[];
    incoming: PendingRequest[];
    outgoing: PendingRequest[];
  };
};

export default function FriendsClient({ initialData }: FriendsClientProps) {
  const router = useRouter();
  const [friendIdInput, setFriendIdInput] = useState("");
  const [pending, startTransition] = useTransition();

  const handleSend = () => {
    startTransition(async () => {
      const result = await sendFriendRequest(friendIdInput);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Friend request sent.");
      setFriendIdInput("");
      router.refresh();
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-5 lg:px-8 pb-28 lg:pb-10 pt-4 space-y-10">
      <section>
        <h2 className="text-[13px] font-semibold text-gray-400 uppercase tracking-wider mb-3">
          Add a friend
        </h2>
        <p className="text-[13px] text-gray-500 mb-3">
          Paste their user ID from Settings → Profile. They must accept your
          request.
        </p>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={friendIdInput}
            onChange={(e) => setFriendIdInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSend();
            }}
            placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
            className="flex-1 text-[14px] border border-gray-200 rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-gray-200 font-mono text-[13px]"
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={pending || !friendIdInput.trim()}
            className="px-4 py-2.5 rounded-lg bg-gray-900 text-white text-[14px] font-medium disabled:opacity-40"
          >
            Send request
          </button>
        </div>
      </section>

      {initialData.incoming.length > 0 && (
        <section>
          <h2 className="text-[13px] font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Requests for you
          </h2>
          <ul className="space-y-2">
            {initialData.incoming.map((req) => (
              <li
                key={req.friendshipId}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3"
              >
                <span className="text-[15px] text-gray-800">{req.displayName}</span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      startTransition(async () => {
                        const r = await acceptFriendRequest(req.friendshipId);
                        if (r.error) toast.error(r.error);
                        else {
                          toast.success("Friend added.");
                          router.refresh();
                        }
                      });
                    }}
                    className="text-[13px] font-medium px-3 py-1.5 rounded-lg bg-gray-900 text-white"
                  >
                    Accept
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      startTransition(async () => {
                        const r = await declineOrCancelFriendRequest(
                          req.friendshipId
                        );
                        if (r.error) toast.error(r.error);
                        else router.refresh();
                      });
                    }}
                    className="text-[13px] font-medium px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600"
                  >
                    Decline
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {initialData.outgoing.length > 0 && (
        <section>
          <h2 className="text-[13px] font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Pending
          </h2>
          <ul className="space-y-2">
            {initialData.outgoing.map((req) => (
              <li
                key={req.friendshipId}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3"
              >
                <span className="text-[15px] text-gray-800">{req.displayName}</span>
                <span className="text-[12px] text-gray-400">Waiting…</span>
                <button
                  type="button"
                  onClick={() => {
                    startTransition(async () => {
                      await declineOrCancelFriendRequest(req.friendshipId);
                      router.refresh();
                    });
                  }}
                  className="text-[13px] text-gray-500 hover:text-gray-800"
                >
                  Cancel
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section>
        <h2 className="text-[13px] font-semibold text-gray-400 uppercase tracking-wider mb-3">
          Friends
        </h2>
        {initialData.friends.length === 0 ? (
          <p className="text-[14px] text-gray-400">No friends yet.</p>
        ) : (
          <ul className="space-y-2">
            {initialData.friends.map((f) => (
              <li
                key={f.friendshipId}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3"
              >
                <Link
                  href={`/app/u/${f.userId}`}
                  className="text-[15px] font-medium text-gray-900 hover:underline"
                >
                  {f.displayName}
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    if (!confirm("Remove this friend?")) return;
                    startTransition(async () => {
                      const r = await removeFriend(f.friendshipId);
                      if (r.error) toast.error(r.error);
                      else {
                        toast.success("Removed.");
                        router.refresh();
                      }
                    });
                  }}
                  className="text-[12px] text-gray-400 hover:text-red-500"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
