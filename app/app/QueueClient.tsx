"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, Plus, List } from "lucide-react";
import TopicCard from "@/components/queue/TopicCard";
import EmptyState from "@/components/queue/EmptyState";
import AddTopicSheet from "@/components/queue/AddTopicSheet";
import { createTopic } from "@/lib/actions/queue";
import { toast } from "@/lib/toast";

type TopicSummary = {
  id: string;
  title: string;
  note: string | null;
  tags: string[];
  status: "active" | "completed";
  resourceCount: number;
  visibility: string;
};

type QueueClientProps = {
  initialTopics: TopicSummary[];
  availableTags: string[];
};

export default function QueueClient({
  initialTopics,
  availableTags
}: QueueClientProps) {
  const [topics, setTopics] = useState<TopicSummary[]>(initialTopics);
  const [showAddSheet, setShowAddSheet] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTopics = useMemo(() => {
    if (!searchQuery.trim()) return topics;
    const query = searchQuery.toLowerCase();
    return topics.filter((topic) =>
      topic.title.toLowerCase().includes(query)
    );
  }, [searchQuery, topics]);

  const handleAddTopic = async (topic: {
    title: string;
    note: string;
    tags: string[];
  }) => {
    const result = await createTopic(topic);
    if (result.error) {
      toast.error(result.error);
      return false;
    }
    if (result.data) {
      setTopics((prev) => [result.data!, ...prev]);
      toast.success("Topic added to your queue.");
    }
    return true;
  };

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <div className="sticky top-0 z-20 bg-[#FAFAF8]">
        <div className="max-w-4xl mx-auto px-5 lg:px-8 pt-3 pb-3">
          {!searchOpen ? (
            <div className="flex items-center justify-end">
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                className="w-10 h-10 rounded-full border border-gray-200 bg-white flex items-center justify-center"
                aria-label="Search topics"
              >
                <Search className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="flex-1 bg-white rounded-lg border border-gray-200 flex items-center px-3.5 py-2.5">
                <Search className="w-4 h-4 text-gray-300 mr-2 flex-shrink-0" />
                <input
                  autoFocus
                  type="text"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search topics..."
                  className="flex-1 bg-transparent text-[15px] text-gray-800 placeholder:text-gray-300 outline-none"
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  setSearchOpen(false);
                  setSearchQuery("");
                }}
                className="text-[14px] font-medium text-gray-600"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-5 lg:px-8 pb-28 lg:pb-10 space-y-3 pt-2">
        {filteredTopics.length > 0 ? (
          filteredTopics.map((topic) => (
            <Link
              key={topic.id}
              href={`/app/topic/${topic.id}`}
              className="block"
            >
              <TopicCard topic={topic} />
            </Link>
          ))
        ) : (
          <EmptyState
            icon={List}
            title="Add something you're curious about."
            subtitle="Your learning queue starts here"
          />
        )}
      </div>

      <button
        type="button"
        onClick={() => setShowAddSheet(true)}
        className="fixed bottom-24 right-5 lg:bottom-8 lg:right-8 z-30 w-14 h-14 rounded-full bg-[#7EB09B] border border-[#6a9d86] flex items-center justify-center active:scale-95 transition-transform duration-150"
        aria-label="Add topic"
      >
        <Plus className="w-6 h-6 text-white" strokeWidth={2.5} />
      </button>

      <AddTopicSheet
        isOpen={showAddSheet}
        onClose={() => setShowAddSheet(false)}
        onAdd={handleAddTopic}
        availableTags={availableTags}
      />
    </div>
  );
}
