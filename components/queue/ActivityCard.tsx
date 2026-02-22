"use client";

import type { MouseEvent } from "react";
import { Check, MessageCircle, Lock } from "lucide-react";

type Activity = {
  name: string;
  avatarColor?: string;
  topicTitle: string;
  context?: string;
  tag?: string;
  privacyLabel?: string;
  saved?: boolean;
};

type ActivityCardProps = {
  activity: Activity;
  onSave?: (nextSaved: boolean) => void;
  onOpenComments: () => void;
};

export default function ActivityCard({
  activity,
  onSave,
  onOpenComments
}: ActivityCardProps) {
  const saved = Boolean(activity.saved);

  const handleSave = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    onSave?.(!saved);
  };

  return (
    <div className="rounded-2xl bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.03)] p-4">
      <div className="flex items-center gap-3 mb-3">
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-white text-[13px] font-semibold"
          style={{ backgroundColor: activity.avatarColor || "#B8C4BB" }}
        >
          {activity.name?.[0]?.toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-[13px] text-gray-400">
            <span className="font-medium text-gray-600">{activity.name}</span>{" "}
            is curious about
          </span>
        </div>
      </div>

      <h3 className="text-[16px] font-semibold text-gray-900 tracking-tight leading-snug mb-1">
        {activity.topicTitle}
      </h3>
      {activity.context && (
        <p className="text-[13px] text-gray-400 mb-2.5 line-clamp-1">
          {activity.context}
        </p>
      )}

      <div className="flex items-center gap-2 mb-3 flex-wrap">
        {activity.tag && (
          <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#F0F4F2] text-[#7EB09B]">
            {activity.tag}
          </span>
        )}
        <span className="inline-flex items-center gap-1 text-[10px] text-gray-300">
          <Lock className="w-2.5 h-2.5" />
          {activity.privacyLabel || "Resources private"}
        </span>
      </div>

      <div className="flex items-center gap-2 pt-2.5 border-t border-gray-50">
        <button
          onClick={handleSave}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 active:scale-[0.97] ${
            saved
              ? "bg-[#F0F4F2] text-[#7EB09B]"
              : "bg-gray-50 text-gray-500 active:bg-gray-100"
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
          onClick={onOpenComments}
          className="flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-gray-50 text-[13px] font-medium text-gray-500 hover:bg-gray-100 transition-all active:scale-[0.97]"
        >
          <MessageCircle className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}