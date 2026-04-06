import {
  ExternalLink,
  MoreHorizontal,
  Youtube,
  BookOpen,
  Mic,
  GraduationCap,
  FileText
} from "lucide-react";

type ResourceCategory = "video" | "article" | "podcast" | "course" | "reading" | string;

type Resource = {
  title: string;
  domain?: string;
  note?: string;
  category?: ResourceCategory;
};

type ResourceRowProps = {
  resource: Resource;
  onOpen?: () => void;
  onMore?: () => void;
  /** When false, hides the delete/more control (e.g. viewing someone else’s topic). */
  showMore?: boolean;
};

const categoryConfig: Record<
  string,
  { icon: typeof FileText; bg: string; text: string; label: string | null }
> = {
  video: { icon: Youtube, bg: "bg-red-50", text: "text-red-400", label: "Video" },
  article: {
    icon: FileText,
    bg: "bg-sky-50",
    text: "text-sky-500",
    label: "Article"
  },
  podcast: {
    icon: Mic,
    bg: "bg-amber-50",
    text: "text-amber-500",
    label: "Podcast"
  },
  course: {
    icon: GraduationCap,
    bg: "bg-violet-50",
    text: "text-violet-500",
    label: "Course"
  },
  reading: {
    icon: BookOpen,
    bg: "bg-emerald-50",
    text: "text-emerald-500",
    label: "Reading"
  }
};

export default function ResourceRow({
  resource,
  onOpen,
  onMore,
  showMore = true
}: ResourceRowProps) {
  const category =
    categoryConfig[resource.category ?? ""] || {
      icon: FileText,
      bg: "bg-gray-50",
      text: "text-gray-300",
      label: null
    };
  const Icon = category.icon;

  return (
    <div className="flex items-center gap-3 py-3.5 group">
      <div
        className={`w-9 h-9 rounded-xl ${category.bg} flex items-center justify-center flex-shrink-0`}
      >
        <Icon className={`w-3.5 h-3.5 ${category.text}`} />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-[14px] font-medium text-gray-800 truncate">{resource.title}</h4>
        <div className="flex items-center gap-1.5 mt-0.5">
          {resource.domain && (
            <p className="text-[11px] text-gray-400 truncate">{resource.domain}</p>
          )}
          {category.label && resource.domain && (
            <span className="text-gray-200 text-[10px]">·</span>
          )}
          {category.label && (
            <span className={`text-[10px] font-medium ${category.text}`}>
              {category.label}
            </span>
          )}
        </div>
        {resource.note && (
          <p className="text-[12px] text-gray-400 mt-0.5 line-clamp-1">{resource.note}</p>
        )}
      </div>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={onOpen}
          className="w-8 h-8 rounded-full flex items-center justify-center text-gray-300 hover:bg-gray-50 transition-colors"
        >
          <ExternalLink className="w-3.5 h-3.5" />
        </button>
        {showMore && onMore && (
          <button
            type="button"
            onClick={onMore}
            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-300 hover:bg-gray-50 transition-colors"
          >
            <MoreHorizontal className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}