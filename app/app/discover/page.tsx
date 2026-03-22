import DiscoverClient from "./DiscoverClient";
import { getDiscoverFeed } from "@/lib/actions/discover";

export default async function DiscoverPage() {
  let feed: Awaited<ReturnType<typeof getDiscoverFeed>> = [];
  try {
    feed = await getDiscoverFeed();
  } catch {
    feed = [];
  }
  return <DiscoverClient initialFeed={feed} />;
}
