"use server";

import { revalidatePath } from "next/cache";
import { createServerClient } from "@/lib/supabase/server";

export type FriendSummary = {
  friendshipId: string;
  userId: string;
  displayName: string;
  websiteUrl: string | null;
  twitterHandle: string | null;
};

export type PendingRequest = {
  friendshipId: string;
  userId: string;
  displayName: string;
};

async function requireUserId(): Promise<string> {
  const supabase = createServerClient();
  const {
    data: { user },
    error
  } = await supabase.auth.getUser();
  if (error || !user) {
    throw new Error("Not authenticated.");
  }
  return user.id;
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value.trim()
  );
}

export async function areAcceptedFriends(a: string, b: string): Promise<boolean> {
  if (a === b) return true;
  const supabase = createServerClient();
  const { data: row1 } = await supabase
    .from("friendships")
    .select("id")
    .eq("requester_id", a)
    .eq("addressee_id", b)
    .eq("status", "accepted")
    .maybeSingle();
  if (row1) return true;
  const { data: row2 } = await supabase
    .from("friendships")
    .select("id")
    .eq("requester_id", b)
    .eq("addressee_id", a)
    .eq("status", "accepted")
    .maybeSingle();
  return !!row2;
}

export type FriendProfileView =
  | { kind: "self" }
  | { kind: "denied" }
  | {
      kind: "ok";
      userId: string;
      displayName: string;
      websiteUrl: string | null;
      twitterHandle: string | null;
    };

export async function getFriendProfileView(
  targetUserId: string
): Promise<FriendProfileView> {
  const supabase = createServerClient();
  const {
    data: { user },
    error
  } = await supabase.auth.getUser();
  if (error || !user) {
    return { kind: "denied" };
  }

  if (user.id === targetUserId) {
    return { kind: "self" };
  }

  const ok = await areAcceptedFriends(user.id, targetUserId);
  if (!ok) {
    return { kind: "denied" };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("display_name, website_url, twitter_handle")
    .eq("user_id", targetUserId)
    .maybeSingle();

  if (profileError || !profile) {
    return {
      kind: "ok",
      userId: targetUserId,
      displayName: "Friend",
      websiteUrl: null,
      twitterHandle: null
    };
  }

  return {
    kind: "ok",
    userId: targetUserId,
    displayName: profile.display_name,
    websiteUrl: profile.website_url ?? null,
    twitterHandle: profile.twitter_handle ?? null
  };
}

async function findExistingFriendshipPair(
  requesterId: string,
  addresseeId: string
) {
  const supabase = createServerClient();
  const { data: a } = await supabase
    .from("friendships")
    .select("id, status, requester_id, addressee_id")
    .eq("requester_id", requesterId)
    .eq("addressee_id", addresseeId)
    .maybeSingle();
  if (a) return a;
  const { data: b } = await supabase
    .from("friendships")
    .select("id, status, requester_id, addressee_id")
    .eq("requester_id", addresseeId)
    .eq("addressee_id", requesterId)
    .maybeSingle();
  return b ?? null;
}

export async function sendFriendRequest(
  friendUserIdRaw: string
): Promise<{ error?: string }> {
  const me = await requireUserId();
  const friendUserId = friendUserIdRaw.trim();
  if (!isUuid(friendUserId)) {
    return { error: "Enter a valid user ID (UUID)." };
  }
  if (friendUserId === me) {
    return { error: "You cannot add yourself." };
  }

  const supabase = createServerClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("user_id")
    .eq("user_id", friendUserId)
    .maybeSingle();
  if (!profile) {
    return { error: "No user found with that ID." };
  }

  const existing = await findExistingFriendshipPair(me, friendUserId);
  if (existing) {
    if (existing.status === "accepted") {
      return { error: "You are already friends." };
    }
    if (existing.status === "pending") {
      if (existing.requester_id === me) {
        return { error: "Friend request already sent." };
      }
      return {
        error: "This person already sent you a request. Accept it below."
      };
    }
  }

  const { error } = await supabase.from("friendships").insert({
    requester_id: me,
    addressee_id: friendUserId,
    status: "pending"
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/app/friends");
  return {};
}

export async function acceptFriendRequest(
  friendshipId: string
): Promise<{ error?: string }> {
  const me = await requireUserId();
  const supabase = createServerClient();

  const { error } = await supabase
    .from("friendships")
    .update({ status: "accepted" })
    .eq("id", friendshipId)
    .eq("addressee_id", me)
    .eq("status", "pending");

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/app/friends");
  revalidatePath("/app/discover");
  return {};
}

export async function declineOrCancelFriendRequest(
  friendshipId: string
): Promise<{ error?: string }> {
  await requireUserId();
  const supabase = createServerClient();

  const { error } = await supabase
    .from("friendships")
    .delete()
    .eq("id", friendshipId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/app/friends");
  return {};
}

export async function removeFriend(
  friendshipId: string
): Promise<{ error?: string }> {
  return declineOrCancelFriendRequest(friendshipId);
}

export async function getFriendsData(): Promise<{
  friends: FriendSummary[];
  incoming: PendingRequest[];
  outgoing: PendingRequest[];
}> {
  const me = await requireUserId();
  const supabase = createServerClient();

  const { data: acceptedRows, error: accErr } = await supabase
    .from("friendships")
    .select("id, requester_id, addressee_id")
    .eq("status", "accepted")
    .or(`requester_id.eq.${me},addressee_id.eq.${me}`);

  if (accErr) {
    throw new Error(accErr.message);
  }

  const friendIds = (acceptedRows ?? []).map((row) =>
    row.requester_id === me ? row.addressee_id : row.requester_id
  );

  const friendIdToRow = new Map(
    (acceptedRows ?? []).map((row) => {
      const fid =
        row.requester_id === me ? row.addressee_id : row.requester_id;
      return [fid, row] as const;
    })
  );

  let friends: FriendSummary[] = [];
  if (friendIds.length > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("user_id, display_name, website_url, twitter_handle")
      .in("user_id", friendIds);

    friends = (profiles ?? []).map((p) => {
      const row = friendIdToRow.get(p.user_id);
      return {
        friendshipId: row!.id,
        userId: p.user_id,
        displayName: p.display_name,
        websiteUrl: p.website_url ?? null,
        twitterHandle: p.twitter_handle ?? null
      };
    });
    friends.sort((a, b) => a.displayName.localeCompare(b.displayName));
  }

  const { data: incomingRows } = await supabase
    .from("friendships")
    .select("id, requester_id")
    .eq("addressee_id", me)
    .eq("status", "pending");

  const incomingIds = (incomingRows ?? []).map((r) => r.requester_id);
  let incoming: PendingRequest[] = [];
  if (incomingIds.length > 0) {
    const { data: inProfiles } = await supabase
      .from("profiles")
      .select("user_id, display_name")
      .in("user_id", incomingIds);
    const nameById = new Map(
      (inProfiles ?? []).map((p) => [p.user_id, p.display_name] as const)
    );
    incoming = (incomingRows ?? []).map((row) => ({
      friendshipId: row.id,
      userId: row.requester_id,
      displayName: nameById.get(row.requester_id) ?? "Someone"
    }));
  }

  const { data: outgoingRows } = await supabase
    .from("friendships")
    .select("id, addressee_id")
    .eq("requester_id", me)
    .eq("status", "pending");

  const outgoingIds = (outgoingRows ?? []).map((r) => r.addressee_id);
  let outgoing: PendingRequest[] = [];
  if (outgoingIds.length > 0) {
    const { data: outProfiles } = await supabase
      .from("profiles")
      .select("user_id, display_name")
      .in("user_id", outgoingIds);
    const nameById = new Map(
      (outProfiles ?? []).map((p) => [p.user_id, p.display_name] as const)
    );
    outgoing = (outgoingRows ?? []).map((row) => ({
      friendshipId: row.id,
      userId: row.addressee_id,
      displayName: nameById.get(row.addressee_id) ?? "Someone"
    }));
  }

  return { friends, incoming, outgoing };
}
