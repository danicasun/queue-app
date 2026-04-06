"use client";

import { useState } from "react";
import { Compass } from "lucide-react";
import ActivityCard from "@/components/queue/ActivityCard";
import CommentSheet from "@/components/queue/CommentSheet";
import EmptyState from "@/components/queue/EmptyState";
import { saveTopicToQueue } from "@/lib/actions/discover";
import { toast } from "@/lib/toast";

type DiscoverItem = {
  id: string;
  topicId: string;
  name: string;
  avatarColor: string;
  topicTitle: string;
  context: string;
  tag: string | null;
  privacyLabel: string;
  saved: boolean;
  createdAt: string;
  resourceCount: number;
};

type DiscoverClientProps = {
  initialFeed: DiscoverItem[];
};

export default function DiscoverClient({ initialFeed }: DiscoverClientProps) {
  const [feed, setFeed] = useState(initialFeed);
  const [commentSheet, setCommentSheet] = useState<{
    open: boolean;
    topic: string;
    topicId: string | null;
  }>({ open: false, topic: "", topicId: null });

  const handleSave = async (topicId: string, nextSaved: boolean) => {
    setFeed((prev) =>
      prev.map((item) =>
        item.topicId === topicId ? { ...item, saved: nextSaved } : item
      )
    );
    if (!nextSaved) return;
    const result = await saveTopicToQueue(topicId);
    if (result.error) {
      toast.error(result.error);
      setFeed((prev) =>
        prev.map((item) =>
          item.topicId === topicId ? { ...item, saved: false } : item
        )
      );
      return;
    }
    toast.success("Saved to your queue.");
  };

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <div className="sticky top-0 z-20 bg-[#FAFAF8] border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-5 lg:px-8 pt-3 pb-3">
          <p className="text-[13px] text-gray-500">
            Things your friends are curious about
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-5 lg:px-8 pb-28 lg:pb-10 space-y-3 pt-2">
        {feed.length > 0 ? (
          feed.map((item) => (
            <ActivityCard
              key={item.id}
              activity={item}
              onSave={(nextSaved) => handleSave(item.topicId, nextSaved)}
              onOpenComments={() =>
                setCommentSheet({
                  open: true,
                  topic: item.topicTitle,
                  topicId: item.topicId
                })
              }
            />
          ))
        ) : (
          <EmptyState
            icon={Compass}
            title="Discover what others are exploring."
            subtitle="Follow friends to see their curiosities"
          />
        )}
      </div>

      <CommentSheet
        isOpen={commentSheet.open}
        onClose={() =>
          setCommentSheet({ open: false, topic: "", topicId: null })
        }
        topicTitle={commentSheet.topic}
        topicId={commentSheet.topicId}
      />
    </div>
  );
}
