import React, { useState, useEffect } from 'react';
import { X, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const mockComments = [
  { id: 1, name: "Alex", text: "I found a great MIT OpenCourseWare lecture on this — worth checking out.", time: "2h ago" },
  { id: 2, name: "Sam", text: "Been reading about this too. The Wikipedia rabbit hole is surprisingly good here.", time: "4h ago" },
  { id: 3, name: "Jordan", text: "Reminds me of a podcast episode I heard last week. Let me find the link.", time: "1d ago" },
];

export default function CommentSheet({ isOpen, onClose, topicTitle }) {
  const [message, setMessage] = useState('');
  const [comments, setComments] = useState(mockComments);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const handleSend = () => {
    if (!message.trim()) return;
    setComments(prev => [...prev, { id: Date.now(), name: 'You', text: message, time: 'Just now' }]);
    setMessage('');
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
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
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
                <h3 className="text-[15px] font-semibold text-gray-900 truncate">{topicTitle || 'Discussion'}</h3>
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
              {comments.map((c) => (
                <div key={c.id} className="flex gap-3">
                  <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-[11px] font-semibold text-gray-500">{c.name[0]}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2">
                      <span className="text-[13px] font-medium text-gray-800">{c.name}</span>
                      <span className="text-[10px] text-gray-300">{c.time}</span>
                    </div>
                    <p className="text-[14px] text-gray-600 leading-relaxed mt-0.5">{c.text}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Composer */}
            <div className="px-5 py-3 border-t border-gray-100 bg-white">
              <div className="flex items-center gap-2 bg-gray-50 rounded-2xl px-4 py-2.5">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Share a thought or resource (optional)"
                  className="flex-1 bg-transparent text-[14px] text-gray-700 placeholder:text-gray-300 outline-none"
                />
                <button
                  onClick={handleSend}
                  disabled={!message.trim()}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                    message.trim()
                      ? 'bg-[#7EB09B] text-white'
                      : 'bg-gray-200 text-gray-400'
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