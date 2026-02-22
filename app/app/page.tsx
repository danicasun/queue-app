import QueueClient from "./QueueClient";
import { getTopics } from "@/lib/actions/queue";
import { getTagNames } from "@/lib/actions/tags";

export default async function QueuePage() {
  let topics = [];
  let availableTags: string[] = [];
  try {
    topics = await getTopics();
    availableTags = await getTagNames();
  } catch {
    topics = [];
    availableTags = [];
  }
  return <QueueClient initialTopics={topics} availableTags={availableTags} />;
}
