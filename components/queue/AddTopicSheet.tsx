"use client";

import { useState, useEffect } from "react";
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

export default function AddTopicSheet({
  isOpen,
  onClose,
  availableTags,
  onAdd
}: AddTopicSheetProps) {
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

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

  const handleAdd = async () => {
    if (!title.trim()) return;
    const result = onAdd?.({ title, note, tags: selectedTags });
    const resolved =
      result instanceof Promise ? await result : result;
    if (resolved === false) return;
    setTitle("");
    setNote("");
    setSelectedTags([]);
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
            style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
          >
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-9 h-1 rounded-full bg-gray-200" />
            </div>

            <div className="flex items-center justify-between px-5 pb-3">
              <h3 className="text-[17px] font-semibold text-gray-900">
                New Topic
              </h3>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            <div className="px-5 pb-6 space-y-5">
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
                  Tag
                </label>
                <div className="flex gap-2 flex-wrap">
                  {availableTags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() =>
                        setSelectedTags((prev) =>
                          prev.includes(tag)
                            ? prev.filter((item) => item !== tag)
                            : [...prev, tag]
                        )
                      }
                      className={`px-3 py-1.5 rounded-full text-[12px] font-medium transition-all ${
                        selectedTags.includes(tag)
                          ? "bg-[#7EB09B] text-white"
                          : "bg-gray-50 text-gray-500"
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleAdd}
                disabled={!title.trim()}
                className={`w-full py-3.5 rounded-2xl text-[15px] font-semibold transition-all active:scale-[0.98] ${
                  title.trim()
                    ? "bg-[#7EB09B] text-white shadow-lg shadow-[#7EB09B]/20"
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