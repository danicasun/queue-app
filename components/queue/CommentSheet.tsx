"use client";

import { useState, useEffect } from "react";
import { X, Send } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { addComment } from "@/lib/actions/discover";
import { toast } from "@/lib/toast";

type CommentItem = {
  id: string;
  name: string;
  text: string;
  time: string;
};

type CommentSheetProps = {
  isOpen: boolean;
  onClose: () => void;
  topicTitle?: string;
  topicId?: string | null;
};

export default function CommentSheet({
  isOpen,
  onClose,
  topicTitle,
  topicId,
}: CommentSheetProps) {
  const [message, setMessage] = useState("");
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

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

  useEffect(() => {
    let isActive = true;
    const loadComments = async () => {
      if (!isOpen || !topicId) {
        setComments([]);
        return;
      }
      setLoading(true);
      try {
        const response = await fetch(`/api/comments/${topicId}`, {
          cache: "no-store"
        });
        const payload = await response.json();
        if (!response.ok) {
          throw new Error(payload.error ?? "Unable to load comments.");
        }
        if (isActive) {
          setComments(payload.data ?? []);
        }
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Unable to load comments.";
        toast.error(message);
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };
    loadComments();
    return () => {
      isActive = false;
    };
  }, [isOpen, topicId]);

  const handleSend = async () => {
    if (!message.trim() || !topicId) return;
    setSending(true);
    const result = await addComment(topicId, message.trim());
    setSending(false);
    if (result.error || !result.data) {
      toast.error(result.error ?? "Unable to add comment.");
      return;
    }
    setComments((prev) => [
      ...prev,
      {
        id: result.data.id,
        name: result.data.name,
        text: result.data.text,
        time: result.data.time
      }
    ]);
    setMessage("");
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
            className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl max-h-[85vh] flex flex-col"
            style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-9 h-1 rounded-full bg-gray-200" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 pb-3 border-b border-gray-100">
              <div className="flex-1 min-w-0 pr-4">
                <h3 className="text-[15px] font-semibold text-gray-900 truncate">
                  {topicTitle || "Discussion"}
                </h3>
                <p className="text-[11px] text-gray-400">{comments.length} thoughts</p>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            {/* Comments */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
              {loading ? (
                <div className="py-4 text-center text-[14px] text-gray-400">
                  Loading comments…
                </div>
              ) : comments.length === 0 ? (
                <p className="text-[12px] text-gray-400">
                  Be the first to share a thought.
                </p>
              ) : (
                comments.map((c) => (
                  <div key={c.id} className="flex gap-3">
                    <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-[11px] font-semibold text-gray-500">
                        {c.name[0]}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2">
                        <span className="text-[13px] font-medium text-gray-800">
                          {c.name}
                        </span>
                        <span className="text-[10px] text-gray-300">
                          {c.time}
                        </span>
                      </div>
                      <p className="text-[14px] text-gray-600 leading-relaxed mt-0.5">
                        {c.text}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Composer */}
            <div className="px-5 py-3 border-t border-gray-100 bg-white">
              <div className="flex items-center gap-2 bg-gray-50 rounded-2xl px-4 py-2.5">
                <input
                  type="text"
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  onKeyDown={(event) =>
                    event.key === "Enter" && handleSend()
                  }
                  placeholder="Share a thought or resource (optional)"
                  className="flex-1 bg-transparent text-[14px] text-gray-700 placeholder:text-gray-300 outline-none"
                />
                <button
                  onClick={handleSend}
                  disabled={!message.trim() || sending}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                    message.trim()
                      ? "bg-[#7EB09B] text-white"
                      : "bg-gray-200 text-gray-400"
                  }`}
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}