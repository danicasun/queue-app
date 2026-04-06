"use client";

import { useState, useEffect, type KeyboardEvent } from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type AddTopicPayload = {
  title: string;
  note: string;
  tags: string[];
};

type AddTopicSheetProps = {
  isOpen: boolean;
  onClose: () => void;
  availableTags: string[];
  onAdd?: (
    payload: AddTopicPayload
  ) => void | boolean | Promise<boolean | void>;
};

function normalizeTagName(raw: string): string {
  return raw.trim().replace(/\s+/g, " ");
}

export default function AddTopicSheet({
  isOpen,
  onClose,
  availableTags,
  onAdd
}: AddTopicSheetProps) {
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [newTagInput, setNewTagInput] = useState("");

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const addTagByName = (name: string) => {
    const trimmed = normalizeTagName(name);
    if (!trimmed) return;
    const exists = selectedTags.some(
      (t) => t.toLowerCase() === trimmed.toLowerCase()
    );
    if (exists) return;
    setSelectedTags((prev) => [...prev, trimmed]);
    setNewTagInput("");
  };

  const handleNewTagKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      addTagByName(newTagInput);
    }
  };

  const toggleExisting = (tag: string) => {
    setSelectedTags((prev) => {
      const has = prev.some((item) => item.toLowerCase() === tag.toLowerCase());
      if (has) {
        return prev.filter((item) => item.toLowerCase() !== tag.toLowerCase());
      }
      return [...prev, tag];
    });
  };

  const removeTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.filter((item) => item.toLowerCase() !== tag.toLowerCase())
    );
  };

  const isTagSelected = (tag: string) =>
    selectedTags.some((s) => s.toLowerCase() === tag.toLowerCase());

  const handleAdd = async () => {
    if (!title.trim()) return;
    const result = onAdd?.({ title, note, tags: selectedTags });
    const resolved = result instanceof Promise ? await result : result;
    if (resolved === false) return;
    setTitle("");
    setNote("");
    setSelectedTags([]);
    setNewTagInput("");
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-[#FAFAF8] rounded-t-3xl"
            style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
          >
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-9 h-1 rounded-full bg-gray-200" />
            </div>

            <div className="flex items-center justify-between px-5 pb-3">
              <h3 className="text-[17px] font-semibold text-gray-900">
                New Topic
              </h3>
              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            <div className="px-5 pb-6 space-y-5 max-h-[min(70vh,520px)] overflow-y-auto">
              <div>
                <label className="text-[11px] font-medium text-gray-400 uppercase tracking-wider mb-1.5 block">
                  What are you curious about?
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="e.g. How satellites orbit Earth"
                  className="w-full text-[16px] text-gray-800 placeholder:text-gray-300 bg-gray-50 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#7EB09B]/30 transition-all"
                  autoFocus
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-gray-400 uppercase tracking-wider mb-1.5 block">
                  Note (optional)
                </label>
                <textarea
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  placeholder="Any initial thoughts..."
                  rows={2}
                  className="w-full text-[14px] text-gray-700 placeholder:text-gray-300 bg-gray-50 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#7EB09B]/30 transition-all resize-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-gray-400 uppercase tracking-wider mb-2 block">
                  Tags
                </label>
                {selectedTags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {selectedTags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 pl-2.5 pr-1 py-1 rounded-full text-[12px] font-medium bg-gray-900 text-white"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="p-0.5 rounded-full hover:bg-white/20"
                          aria-label={`Remove ${tag}`}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                {availableTags.length > 0 && (
                  <>
                    <p className="text-[12px] text-gray-500 mb-2">Existing tags</p>
                    <div className="flex gap-2 flex-wrap mb-4">
                      {availableTags.map((tag) => {
                        const selected = isTagSelected(tag);
                        return (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => toggleExisting(tag)}
                            className={`px-3 py-1.5 rounded-full text-[12px] font-medium transition-colors ${
                              selected
                                ? "bg-[#7EB09B] text-white"
                                : "bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100"
                            }`}
                          >
                            {tag}
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}

                <label className="text-[12px] text-gray-500 mb-1.5 block">
                  New tag
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newTagInput}
                    onChange={(event) => setNewTagInput(event.target.value)}
                    onKeyDown={handleNewTagKeyDown}
                    placeholder="Type a name, press Enter"
                    className="flex-1 text-[14px] text-gray-800 placeholder:text-gray-300 bg-gray-50 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-[#7EB09B]/30 border border-gray-100"
                  />
                  <button
                    type="button"
                    onClick={() => addTagByName(newTagInput)}
                    disabled={!normalizeTagName(newTagInput)}
                    className="px-4 py-2.5 rounded-xl text-[13px] font-medium border border-gray-200 bg-white text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Add
                  </button>
                </div>
                <p className="text-[11px] text-gray-400 mt-1.5">
                  Select from above or add a new tag; it will be created when you
                  save.
                </p>
              </div>

              <button
                type="button"
                onClick={handleAdd}
                disabled={!title.trim()}
                className={`w-full py-3.5 rounded-2xl text-[15px] font-semibold transition-all active:scale-[0.98] ${
                  title.trim()
                    ? "bg-[#7EB09B] text-white border border-[#6a9d86]"
                    : "bg-gray-100 text-gray-300"
                }`}
              >
                Add to Queue
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
