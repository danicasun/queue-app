"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Tag, Plus, Pencil, Trash2 } from "lucide-react";
import EmptyState from "@/components/queue/EmptyState";
import TopicCard from "@/components/queue/TopicCard";
import { toast } from "@/lib/toast";
import { createTag, deleteTag, renameTag } from "@/lib/actions/tags";
import { getTopicsByTag } from "@/lib/actions/queue";

type TagSummary = {
  id: string;
  name: string;
  count: number;
};

type TopicSummary = {
  id: string;
  title: string;
  note: string | null;
  tags: string[];
  status: "active" | "completed";
  resourceCount: number;
  visibility: string;
};

type OrganizeClientProps = {
  initialTags: TagSummary[];
};

export default function OrganizeClient({
  initialTags
}: OrganizeClientProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [folders, setFolders] = useState(initialTags);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [selectedTag, setSelectedTag] = useState<TagSummary | null>(null);
  const [tagTopics, setTagTopics] = useState<TopicSummary[]>([]);
  const [loadingTopics, setLoadingTopics] = useState(false);

  const handleAdd = () => {
    const newItem = { id: `temp-${Date.now()}`, name: "", count: 0 };
    setFolders((prev) => [newItem, ...prev]);
    setEditingId(newItem.id);
    setEditValue("");
  };

  const handleOpenTag = useCallback(
    async (tag: TagSummary) => {
      if (editingId === tag.id) return;
      setSelectedTag(tag);
      setLoadingTopics(true);
      try {
        const topics = await getTopicsByTag(tag.name);
        setTagTopics(topics);
      } catch (error) {
        setTagTopics([]);
        toast.error(
          error instanceof Error ? error.message : "Unable to load topics."
        );
      } finally {
        setLoadingTopics(false);
      }
    },
    [editingId]
  );

  const handleCloseTag = () => {
    setSelectedTag(null);
    setTagTopics([]);
    router.push("/app/organize");
  };

  useEffect(() => {
    const tagParam = searchParams.get("tag");
    if (!tagParam) return;
    const matchingTag = folders.find((tag) => tag.name === tagParam);
    if (!matchingTag) return;
    if (selectedTag?.id === matchingTag.id) return;
    handleOpenTag(matchingTag);
  }, [folders, handleOpenTag, searchParams, selectedTag?.id]);

  const handleSaveEdit = async (id: string) => {
    const trimmedName = editValue.trim();
    const isTemporaryId = id.startsWith("temp-");
    const currentItem = folders.find((item) => item.id === id);

    if (!trimmedName) {
      if (!currentItem) return;
      if (isTemporaryId) {
        setFolders((prev) => prev.filter((item) => item.id !== id));
      } else {
        const previous = folders;
        setFolders((prev) => prev.filter((item) => item.id !== id));
        const result = await deleteTag(id);
        if (result.error) {
          setFolders(previous);
          toast.error(result.error);
        }
      }
      setEditingId(null);
      setEditValue("");
      return;
    }

    if (isTemporaryId) {
      const previous = folders;
      setFolders((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, name: trimmedName } : item
        )
      );
      const result = await createTag(trimmedName);
      if (result.error || !result.data) {
        setFolders(previous);
        toast.error(result.error ?? "Unable to create tag.");
      } else {
        setFolders((prev) =>
          prev.map((item) =>
            item.id === id
              ? { ...item, id: result.data.id, name: result.data.name }
              : item
          )
        );
      }
    } else {
      if (!currentItem) return;
      const previousName = currentItem.name;
      setFolders((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, name: trimmedName } : item
        )
      );
      const result = await renameTag(id, trimmedName);
      if (result.error || !result.data) {
        setFolders((prev) =>
          prev.map((item) =>
            item.id === id ? { ...item, name: previousName } : item
          )
        );
        toast.error(result.error ?? "Unable to rename tag.");
      }
    }

    setEditingId(null);
    setEditValue("");
  };

  const handleDelete = async (id: string) => {
    if (id.startsWith("temp-")) {
      setFolders((prev) => prev.filter((item) => item.id !== id));
      return;
    }
    const previous = folders;
    setFolders((prev) => prev.filter((item) => item.id !== id));
    const result = await deleteTag(id);
    if (result.error) {
      setFolders(previous);
      toast.error(result.error);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <div className="sticky top-0 z-20 bg-[#FAFAF8] border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-5 lg:px-8 pt-3 pb-3">
          <h1 className="text-[22px] font-semibold text-gray-900 tracking-tight">
            Organize
          </h1>
          <p className="text-[13px] text-gray-500 mt-0.5">Tags</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-5 lg:px-8 pb-28 lg:pb-10 pt-2">
        <button
          onClick={handleAdd}
          className="w-full flex items-center gap-3 py-3 mb-2 text-[#7EB09B]"
        >
          <div className="w-10 h-10 rounded-xl bg-[#7EB09B]/10 flex items-center justify-center">
            <Plus className="w-4 h-4" />
          </div>
          <span className="text-[14px] font-medium">New tag</span>
        </button>

        {folders.length === 0 ? (
          <EmptyState
            icon={Tag}
            title="No tags yet."
            subtitle="Add a tag to organize your topics"
          />
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-100">
            {folders.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 px-4 py-3.5 cursor-pointer"
                onClick={() => handleOpenTag(item)}
              >
                <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center flex-shrink-0">
                  <Tag className="w-4 h-4 text-gray-300" />
                </div>
                <div className="flex-1 min-w-0">
                  {editingId === item.id ? (
                    <input
                      autoFocus
                      type="text"
                      value={editValue}
                      onChange={(event) => setEditValue(event.target.value)}
                      onClick={(event) => event.stopPropagation()}
                      onBlur={() => handleSaveEdit(item.id)}
                      onKeyDown={(event) =>
                        event.key === "Enter" && handleSaveEdit(item.id)
                      }
                      placeholder="Tag name..."
                      className="w-full text-[15px] text-gray-800 placeholder:text-gray-300 bg-transparent outline-none"
                    />
                  ) : (
                    <>
                      <h4 className="text-[15px] font-medium text-gray-800">
                        {item.name}
                      </h4>
                      <p className="text-[11px] text-gray-400">
                        {item.count} topic{item.count !== 1 ? "s" : ""}
                      </p>
                    </>
                  )}
                </div>
                {editingId !== item.id && (
                  <div className="flex items-center gap-0.5">
                    <button
                      onClick={(event) => {
                        event.stopPropagation();
                        setEditingId(item.id);
                        setEditValue(item.name);
                      }}
                      className="w-8 h-8 rounded-full flex items-center justify-center text-gray-300 hover:bg-gray-50"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(event) => {
                        event.stopPropagation();
                        handleDelete(item.id);
                      }}
                      className="w-8 h-8 rounded-full flex items-center justify-center text-gray-300 hover:bg-red-50 hover:text-red-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedTag && (
        <>
          <div
            className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-40"
            onClick={handleCloseTag}
          />
          <div className="fixed inset-0 z-50 flex flex-col">
            <div className="flex items-center justify-between px-5 pt-4 pb-3 bg-[#FAFAF8] shadow-sm">
              <div>
                <h3 className="text-[17px] font-semibold text-gray-900">
                  {selectedTag.name}
                </h3>
                <p className="text-[12px] text-gray-400">
                  {selectedTag.count} topic
                  {selectedTag.count !== 1 ? "s" : ""}
                </p>
              </div>
              <button
                onClick={handleCloseTag}
                className="text-[13px] font-medium text-[#7EB09B]"
              >
                Done
              </button>
            </div>
            <div className="flex-1 overflow-y-auto bg-[#FAFAF8] px-5 pb-28 lg:pb-10 pt-3 max-w-4xl mx-auto w-full">
              {loadingTopics ? (
                <p className="text-[13px] text-gray-400">Loading topics...</p>
              ) : tagTopics.length > 0 ? (
                <div className="space-y-3">
                  {tagTopics.map((topic) => (
                    <Link
                      key={topic.id}
                      href={`/app/topic/${topic.id}?from=organize&tag=${encodeURIComponent(
                        selectedTag.name
                      )}`}
                    >
                      <TopicCard topic={topic} />
                    </Link>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={Tag}
                  title="No topics for this tag."
                  subtitle="Add this tag to a topic to see it here."
                />
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
