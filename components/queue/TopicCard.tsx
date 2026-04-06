import { Bookmark, ChevronRight } from "lucide-react";

type Topic = {
  title: string;
  note?: string | null;
  tags?: string[];
  status?: "active" | "completed" | string;
  resourceCount?: number;
};

type TopicCardProps = {
  topic: Topic;
  onClick?: () => void;
};

export default function TopicCard({ topic, onClick }: TopicCardProps) {
  const isCompleted = topic.status === "completed";
  const hasTags = (topic.tags?.length ?? 0) > 0;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left rounded-lg border border-gray-200 bg-white p-4 active:scale-[0.99] transition-transform duration-150 ${
        isCompleted ? "opacity-55" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          {(isCompleted || hasTags) && (
            <div className="flex items-center gap-1.5 mb-2 flex-wrap">
              {isCompleted && (
                <span className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                  Done
                </span>
              )}
              {isCompleted && hasTags && (
                <span className="text-gray-200 text-[10px] mx-0.5">·</span>
              )}
              {topic.tags?.map((tag) => (
                <span
                  key={tag}
                  className="inline-block px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#F0F4F2] text-[#7EB09B]"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          <h3
            className={`text-[15px] font-semibold tracking-tight leading-snug ${
              isCompleted ? "line-through text-gray-400" : "text-gray-900"
            }`}
          >
            {topic.title}
          </h3>
          {topic.note && (
            <p className="text-[13px] text-gray-400 mt-1 line-clamp-1 leading-relaxed">
              {topic.note}
            </p>
          )}
          {Boolean(topic.resourceCount) && (
            <div className="flex items-center gap-1 mt-2.5">
              <span className="inline-flex items-center gap-1 text-[11px] text-gray-300">
                <Bookmark className="w-3 h-3" />
                {topic.resourceCount} resource
                {topic.resourceCount !== 1 ? "s" : ""}
              </span>
            </div>
          )}
        </div>
        <ChevronRight className="w-4 h-4 text-gray-200 mt-0.5 flex-shrink-0" />
      </div>
    </button>
  );
}
