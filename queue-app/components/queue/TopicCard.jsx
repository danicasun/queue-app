import React from 'react';
import { Bookmark, ChevronRight } from 'lucide-react';

const statusStyles = {
  active: { bg: 'bg-emerald-50', text: 'text-emerald-600', label: 'Active' },
  completed: { bg: 'bg-gray-100', text: 'text-gray-400', label: 'Completed' },
};

export default function TopicCard({ topic, onClick }) {
  const status = statusStyles[topic.status] || statusStyles.active;
  const isCompleted = topic.status === 'completed';

  return (
    <button
      onClick={onClick}
      className={`w-full text-left rounded-2xl bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.03)] p-4 active:scale-[0.98] transition-all duration-200 ${isCompleted ? 'opacity-60' : ''}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1 flex-wrap">
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${status.bg} ${status.text}`}>
              {status.label}
            </span>
            {topic.tags?.map((tag, i) => (
              <span key={i} className="inline-block px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 text-gray-500">
                {tag}
              </span>
            ))}
          </div>
          <h3 className={`text-[16px] font-semibold tracking-tight leading-snug ${isCompleted ? 'line-through text-gray-400' : 'text-gray-900'}`}>
            {topic.title}
          </h3>
          {topic.note && (
            <p className="text-[13px] text-gray-400 mt-0.5 line-clamp-1">{topic.note}</p>
          )}
          {topic.resourceCount > 0 && (
            <div className="flex items-center gap-1 mt-2.5">
              <span className="inline-flex items-center gap-1 text-[11px] text-gray-400">
                <Bookmark className="w-3 h-3" />
                {topic.resourceCount} resource{topic.resourceCount !== 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>
        <ChevronRight className="w-4 h-4 text-gray-300 mt-1 flex-shrink-0" />
      </div>
    </button>
  );
}