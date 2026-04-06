"use client";

import type { MouseEvent } from "react";
import Link from "next/link";
import { Check, MessageCircle, Lock } from "lucide-react";

type Activity = {
  name: string;
  avatarColor?: string;
  topicTitle: string;
  context?: string;
  tag?: string | null;
  privacyLabel?: string;
  saved?: boolean;
  createdAt?: string;
  resourceCount?: number;
};

type ActivityCardProps = {
  activity: Activity;
  onSave?: (nextSaved: boolean) => void;
  onOpenComments: () => void;
  /** When set, title and body link to this topic (e.g. Discover). */
  topicHref?: string;
};

function formatRelativeTime(iso: string): string {
  const d = new Date(iso);
  const diffMs = Date.now() - d.getTime();
  if (diffMs < 0) return "just now";
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return d.toLocaleDateString();
}

export default function ActivityCard({
  activity,
  onSave,
  onOpenComments,
  topicHref
}: ActivityCardProps) {
  const saved = Boolean(activity.saved);
  const timeLabel =
    activity.createdAt != null ? formatRelativeTime(activity.createdAt) : null;
  const resourceCount = activity.resourceCount ?? 0;

  const handleSave = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    onSave?.(!saved);
  };

  const handleOpenComments = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    onOpenComments();
  };

  const mainBlock = (
    <>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-white text-[13px] font-semibold flex-shrink-0"
            style={{ backgroundColor: activity.avatarColor || "#B8C4BB" }}
          >
            {activity.name?.[0]?.toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-[13px] text-gray-500">
              <span className="font-medium text-gray-700">{activity.name}</span>{" "}
              is curious about
            </p>
          </div>
        </div>
        {timeLabel && (
          <span className="text-[11px] text-gray-400 flex-shrink-0 tabular-nums">
            {timeLabel}
          </span>
        )}
      </div>

      <h3 className="text-[17px] font-semibold text-gray-900 tracking-tight leading-snug mb-2 group-hover:text-gray-700">
        {activity.topicTitle}
      </h3>
      {activity.context ? (
        <p className="text-[14px] text-gray-500 mb-3 line-clamp-3 leading-relaxed">
          {activity.context}
        </p>
      ) : null}

      <div className="flex items-center gap-2 mb-0 flex-wrap text-[11px] text-gray-400">
        {activity.tag && (
          <span className="inline-block px-2 py-0.5 rounded border border-gray-200 text-[10px] font-medium uppercase tracking-wide text-gray-600">
            {activity.tag}
          </span>
        )}
        <span className="inline-flex items-center gap-1">
          <Lock className="w-2.5 h-2.5" />
          {activity.privacyLabel || "Resources private"}
        </span>
        {resourceCount > 0 && (
          <span className="text-gray-400">
            {resourceCount} resource{resourceCount !== 1 ? "s" : ""}
          </span>
        )}
      </div>
    </>
  );

  return (
    <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
      {topicHref ? (
        <Link
          href={topicHref}
          className="block p-4 text-left hover:bg-gray-50/80 transition-colors group"
        >
          {mainBlock}
        </Link>
      ) : (
        <div className="p-4">{mainBlock}</div>
      )}

      <div className="flex items-center gap-2 px-4 pb-4 pt-3 border-t border-gray-100">
        <button
          type="button"
          onClick={handleSave}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-[13px] font-medium transition-colors ${
            saved
              ? "bg-gray-100 text-gray-800"
              : "bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100"
          }`}
        >
          {saved ? (
            <>
              <Check className="w-3.5 h-3.5" />
              Saved
            </>
          ) : (
            "Save to My Queue"
          )}
        </button>
        <button
          type="button"
          onClick={handleOpenComments}
          className="flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-lg border border-gray-200 bg-white text-[13px] font-medium text-gray-600 hover:bg-gray-50"
          aria-label="Comments"
        >
          <MessageCircle className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
