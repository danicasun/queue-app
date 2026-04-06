"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronLeft, Lock, Globe, Plus, Trash2 } from "lucide-react";
import ResourceRow from "@/components/queue/ResourceRow";
import EmptyState from "@/components/queue/EmptyState";
import AddResourceSheet from "@/components/queue/AddResourceSheet";
import {
  createResource,
  deleteResource,
  deleteTopic,
  updateTopic
} from "@/lib/actions/queue";
import { toast } from "@/lib/toast";

type TopicDetail = {
  id: string;
  title: string;
  note: string | null;
  visibility: "private" | "topic_only" | "topic_and_notes" | "topic_and_resources";
  tags: string[];
  resources: {
    id: string;
    title: string;
    url: string | null;
    note: string | null;
  }[];
};

type TopicDetailClientProps = {
  topic: TopicDetail;
  availableTags: string[];
  backHref: string;
};

const visibilityOptions = [
  {
    value: "private",
    icon: Lock,
    label: "Private",
    desc: "Only you can see this"
  },
  {
    value: "topic_only",
    icon: Globe,
    label: "Shared with others",
    desc: "Topic visible, resources private"
  },
  {
    value: "topic_and_notes",
    icon: Globe,
    label: "Shared with notes",
    desc: "Notes visible, resources private"
  },
  {
    value: "topic_and_resources",
    icon: Globe,
    label: "Shared with resources",
    desc: "Notes + resources visible"
  }
] as const;

export default function TopicDetailClient({
  topic,
  availableTags,
  backHref
}: TopicDetailClientProps) {
  const [title, setTitle] = useState(topic.title);
  const [note, setNote] = useState(topic.note ?? "");
  const [savedTitle, setSavedTitle] = useState(topic.title);
  const [savedNote, setSavedNote] = useState(topic.note ?? "");
  const [visibility, setVisibility] = useState(topic.visibility);
  const [resources, setResources] = useState(topic.resources);
  const [selectedTags, setSelectedTags] = useState<string[]>(
    topic.tags ?? []
  );
  const [showTagPicker, setShowTagPicker] = useState(false);
  const [tagSearch, setTagSearch] = useState("");
  const [newTagInput, setNewTagInput] = useState("");
  const [showAddResource, setShowAddResource] = useState(false);

  const visibilityOption = useMemo(() => {
    return (
      visibilityOptions.find((option) => option.value === visibility) ??
      visibilityOptions[0]
    );
  }, [visibility]);

  const VisibilityIcon = visibilityOption.icon;

  const handleToggleVisibility = async () => {
    const currentIndex = visibilityOptions.findIndex(
      (option) => option.value === visibilityOption.value
    );
    const nextIndex = (currentIndex + 1) % visibilityOptions.length;
    const nextVisibility = visibilityOptions[nextIndex].value;
    setVisibility(nextVisibility);
    const result = await updateTopic({
      id: topic.id,
      visibility: nextVisibility
    });
    if (result.error) {
      toast.error(result.error);
      setVisibility(visibilityOption.value);
    }
  };

  const handleAddTag = async (tagName: string): Promise<boolean> => {
    const nextTags = [...selectedTags, tagName];
    setSelectedTags(nextTags);
    const result = await updateTopic({ id: topic.id, tags: nextTags });
    if (result.error) {
      toast.error(result.error);
      setSelectedTags(selectedTags);
      return false;
    }
    toast.success("Tag added.");
    return true;
  };

  const handleRemoveTag = async (tagName: string) => {
    const nextTags = selectedTags.filter((tag) => tag !== tagName);
    setSelectedTags(nextTags);
    const result = await updateTopic({ id: topic.id, tags: nextTags });
    if (result.error) {
      toast.error(result.error);
      setSelectedTags(selectedTags);
      return;
    }
    toast.success("Tag removed.");
  };

  const availableMatches = useMemo(() => {
    const normalizedQuery = tagSearch.trim().toLowerCase();
    const remaining = availableTags.filter(
      (tag) =>
        !selectedTags.some(
          (s) => s.toLowerCase() === tag.toLowerCase()
        )
    );
    if (!normalizedQuery) return remaining;
    return remaining.filter((tag) =>
      tag.toLowerCase().includes(normalizedQuery)
    );
  }, [availableTags, selectedTags, tagSearch]);

  const addNewTagFromInput = async () => {
    const trimmed = newTagInput.trim();
    if (!trimmed) return;
    if (
      selectedTags.some((s) => s.toLowerCase() === trimmed.toLowerCase())
    ) {
      toast.error("This topic already has that tag.");
      return;
    }
    const ok = await handleAddTag(trimmed);
    if (ok) {
      setNewTagInput("");
      setShowTagPicker(false);
    }
  };

  const handleTitleBlur = async () => {
    if (title.trim() === savedTitle) return;
    const result = await updateTopic({ id: topic.id, title });
    if (result.error) {
      toast.error(result.error);
      setTitle(savedTitle);
    } else {
      setSavedTitle(title.trim());
      toast.success("Topic updated.");
    }
  };

  const handleNoteBlur = async () => {
    if (note.trim() === savedNote) return;
    const result = await updateTopic({ id: topic.id, note });
    if (result.error) {
      toast.error(result.error);
      setNote(savedNote);
    } else {
      setSavedNote(note.trim());
    }
  };

  const handleAddResource = async (payload: {
    title: string;
    url: string;
    note: string;
  }) => {
    const result = await createResource({
      topicId: topic.id,
      title: payload.title,
      url: payload.url,
      note: payload.note
    });
    if (result.error || !result.data) {
      toast.error(result.error ?? "Unable to add resource.");
      return false;
    }
    setResources((prev) => [...prev, result.data!]);
    toast.success("Resource added.");
    return true;
  };

  const handleDeleteResource = async (resourceId: string) => {
    const confirmed = window.confirm(
      "Remove this resource from the topic?"
    );
    if (!confirmed) return;
    const result = await deleteResource({ id: resourceId, topicId: topic.id });
    if (result.error) {
      toast.error(result.error);
      return;
    }
    setResources((prev) => prev.filter((resource) => resource.id !== resourceId));
    toast.success("Resource removed.");
  };

  const handleDeleteTopic = async () => {
    const confirmed = window.confirm("Delete this topic permanently?");
    if (!confirmed) return;
    const result = await deleteTopic(topic.id);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Topic deleted.");
    window.location.href = "/app";
  };

  const handleOpenResource = (url?: string | null) => {
    if (!url) return;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const getDomain = (url: string | null) => {
    if (!url) return "";
    try {
      return new URL(url).hostname;
    } catch {
      return "";
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <div className="sticky top-0 z-20 bg-[#FAFAF8] border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-2 lg:px-8 pt-3 pb-3 flex items-center gap-1">
          <Link
            href={backHref}
            className="flex items-center gap-0.5 text-gray-700 hover:text-gray-900 px-2 py-2 -ml-1"
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="text-[15px] font-medium">
              {backHref.startsWith("/app/organize") ? "Organize" : "Queue"}
            </span>
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-5 lg:px-8 pb-28 lg:pb-10">
        <input
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          onBlur={handleTitleBlur}
          className="w-full text-[22px] font-bold text-gray-900 tracking-tight bg-transparent outline-none mb-2 leading-tight"
        />

        <textarea
          value={note}
          onChange={(event) => setNote(event.target.value)}
          onBlur={handleNoteBlur}
          placeholder="Add a note..."
          rows={3}
          className="w-full text-[14px] text-gray-500 leading-relaxed bg-transparent outline-none resize-none mb-5 placeholder:text-gray-300"
        />

        <button
          type="button"
          onClick={handleToggleVisibility}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-gray-200 mb-8"
        >
          <VisibilityIcon className="w-3.5 h-3.5 text-gray-400" />
          <span className="text-[12px] font-medium text-gray-600">
            {visibilityOption.label}
          </span>
          <span className="text-[11px] text-gray-300">·</span>
          <span className="text-[11px] text-gray-400">
            {visibilityOption.desc}
          </span>
        </button>

        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[13px] font-semibold text-gray-400 uppercase tracking-wider">
              Tags
            </h2>
            <button
              type="button"
              onClick={() => {
                setTagSearch("");
                setNewTagInput("");
                setShowTagPicker(true);
              }}
              className="text-[12px] font-medium text-gray-700 hover:text-gray-900"
            >
              Add tag
            </button>
          </div>
          {selectedTags.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {selectedTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => handleRemoveTag(tag)}
                  className="px-3 py-1.5 rounded-full text-[12px] font-medium bg-[#7EB09B] text-white transition-all"
                >
                  {tag}
                </button>
              ))}
            </div>
          ) : (
            <p className="text-[12px] text-gray-400">
              No tags yet. Add an existing tag or create a new one.
            </p>
          )}
        </div>

        <div className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[13px] font-semibold text-gray-400 uppercase tracking-wider">
              Resources
            </h2>
            <button
              onClick={() => setShowAddResource(true)}
              className="flex items-center gap-1.5 text-[13px] font-medium text-[#7EB09B]"
            >
              <Plus className="w-3.5 h-3.5" />
              Add resource
            </button>
          </div>

          {resources.length > 0 ? (
            <div className="bg-white rounded-2xl shadow-sm divide-y divide-gray-50 px-4">
              {resources.map((resource) => (
                <ResourceRow
                  key={resource.id}
                  resource={{
                    title: resource.title,
                    domain: getDomain(resource.url),
                    note: resource.note ?? ""
                  }}
                  onOpen={() => handleOpenResource(resource.url)}
                  onMore={() => handleDeleteResource(resource.id)}
                />
              ))}
            </div>
          ) : (
            <EmptyState title="Add a resource when you find something useful." />
          )}
        </div>

        <div className="pt-8 pb-4">
          <button
            onClick={handleDeleteTopic}
            className="flex items-center gap-2 text-[13px] text-red-400 font-medium mx-auto"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete topic
          </button>
        </div>
      </div>

      <AddResourceSheet
        isOpen={showAddResource}
        onClose={() => setShowAddResource(false)}
        onAdd={handleAddResource}
      />

      {showTagPicker && (
        <>
          <div
            className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-[60]"
            onClick={() => setShowTagPicker(false)}
            aria-hidden
          />
          <div className="fixed bottom-0 left-0 right-0 z-[70] bg-[#FAFAF8] rounded-t-3xl max-h-[85vh] overflow-y-auto shadow-[0_-4px_24px_rgba(0,0,0,0.08)]">
            <div
              className="px-5 pt-4 pb-6"
              style={{ paddingBottom: "max(1.5rem, env(safe-area-inset-bottom))" }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[17px] font-semibold text-gray-900">
                  Add tag
                </h3>
                <button
                  type="button"
                  onClick={() => setShowTagPicker(false)}
                  className="text-[13px] font-medium text-gray-600"
                >
                  Done
                </button>
              </div>

              <div className="mb-5">
                <label className="text-[11px] font-medium text-gray-400 uppercase tracking-wider block mb-2">
                  New tag
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newTagInput}
                    onChange={(event) => setNewTagInput(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        void addNewTagFromInput();
                      }
                    }}
                    placeholder="Type a name, press Enter"
                    className="flex-1 text-[14px] text-gray-800 placeholder:text-gray-300 bg-white rounded-xl border border-gray-200 px-4 py-3 outline-none focus:ring-2 focus:ring-gray-200"
                  />
                  <button
                    type="button"
                    onClick={() => void addNewTagFromInput()}
                    disabled={!newTagInput.trim()}
                    className="px-4 py-3 rounded-xl text-[13px] font-medium border border-gray-200 bg-white text-gray-800 disabled:opacity-40"
                  >
                    Add
                  </button>
                </div>
                <p className="text-[11px] text-gray-400 mt-1.5">
                  Creates the tag if it does not exist yet.
                </p>
              </div>

              {availableTags.length > 0 && (
                <>
                  <label className="text-[11px] font-medium text-gray-400 uppercase tracking-wider block mb-2">
                    Your tags
                  </label>
                  <input
                    type="text"
                    value={tagSearch}
                    onChange={(event) => setTagSearch(event.target.value)}
                    placeholder="Search…"
                    className="w-full text-[14px] text-gray-700 placeholder:text-gray-300 bg-white rounded-xl border border-gray-200 px-4 py-3 outline-none focus:ring-2 focus:ring-gray-200 mb-3"
                  />
                  <div className="max-h-[36vh] overflow-y-auto space-y-2">
                    {availableMatches.length > 0 ? (
                      availableMatches.map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={async () => {
                            const ok = await handleAddTag(tag);
                            if (ok) {
                              setTagSearch("");
                              setShowTagPicker(false);
                            }
                          }}
                          className="w-full text-left px-4 py-3 rounded-xl bg-white border border-gray-200 text-[14px] text-gray-700 hover:bg-gray-50"
                        >
                          {tag}
                        </button>
                      ))
                    ) : (
                      <p className="text-[12px] text-gray-400 px-1 py-2">
                        No matching tags. Use “New tag” above.
                      </p>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
