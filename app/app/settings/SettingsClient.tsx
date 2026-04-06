"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { LogOut, ChevronRight, Bell, Shield, HelpCircle, Moon } from "lucide-react";
import ShareToggle from "./ShareToggle";
import { updateMyProfile, signOut, type PublicProfile } from "@/lib/actions/profile";
import { toast } from "@/lib/toast";

const menuSections = [
  {
    items: [
      { icon: Bell, label: "Notifications", action: "nav" },
      { icon: Shield, label: "Privacy", action: "nav" },
      { icon: Moon, label: "Appearance", action: "nav" }
    ]
  },
  {
    items: [{ icon: HelpCircle, label: "Help & Feedback", action: "nav" }]
  }
];

function initialFromProfile(p: PublicProfile) {
  return {
    displayName: p.displayName,
    websiteUrl: p.websiteUrl ?? "",
    twitterHandle: p.twitterHandle ? `@${p.twitterHandle}` : ""
  };
}

function avatarLetter(name: string, email: string | null) {
  const c = name.trim()[0] ?? email?.trim()[0];
  return c ? c.toUpperCase() : "?";
}

type SettingsClientProps = {
  profile: PublicProfile;
};

export default function SettingsClient({ profile }: SettingsClientProps) {
  const router = useRouter();
  const [form, setForm] = useState(() => initialFromProfile(profile));
  const [pending, startTransition] = useTransition();

  const handleSave = () => {
    startTransition(async () => {
      const result = await updateMyProfile({
        displayName: form.displayName,
        websiteUrl: form.websiteUrl,
        twitterHandle: form.twitterHandle
      });
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Profile saved.");
      router.refresh();
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-5 lg:px-8 pb-28 lg:pb-10 pt-2">
      <div className="bg-white rounded-lg border border-gray-200 p-5 mb-5">
        <div className="flex items-start gap-4 mb-5">
          <div className="w-14 h-14 rounded-full bg-[#7EB09B] flex items-center justify-center flex-shrink-0">
            <span className="text-[20px] font-bold text-white">
              {avatarLetter(form.displayName, profile.email)}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] uppercase tracking-wider text-gray-400 mb-3">
              Profile
            </p>
            <div className="space-y-3">
              <div>
                <label className="text-[12px] text-gray-500 block mb-1">Name</label>
                <input
                  type="text"
                  value={form.displayName}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, displayName: e.target.value }))
                  }
                  className="w-full text-[15px] text-gray-900 border border-gray-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-gray-200"
                  autoComplete="name"
                />
              </div>
              <div>
                <label className="text-[12px] text-gray-500 block mb-1">Email</label>
                <input
                  type="email"
                  value={profile.email ?? ""}
                  readOnly
                  className="w-full text-[14px] text-gray-500 bg-gray-50 border border-gray-100 rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="text-[12px] text-gray-500 block mb-1">
                  Your user ID
                </label>
                <p className="text-[11px] text-gray-400 mb-1.5">
                  Friends paste this in Friends → Add a friend to send you a
                  request.
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={profile.userId}
                    className="flex-1 text-[12px] text-gray-700 bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      void navigator.clipboard.writeText(profile.userId);
                      toast.success("Copied");
                    }}
                    className="px-3 py-2 rounded-lg border border-gray-200 text-[13px] font-medium text-gray-700 hover:bg-gray-50 flex-shrink-0"
                  >
                    Copy
                  </button>
                </div>
              </div>
              <div>
                <label className="text-[12px] text-gray-500 block mb-1">
                  Personal website
                </label>
                <input
                  type="url"
                  value={form.websiteUrl}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, websiteUrl: e.target.value }))
                  }
                  placeholder="https://yoursite.com"
                  className="w-full text-[15px] text-gray-900 border border-gray-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-gray-200"
                  autoComplete="url"
                />
              </div>
              <div>
                <label className="text-[12px] text-gray-500 block mb-1">
                  X (Twitter) handle
                </label>
                <input
                  type="text"
                  value={form.twitterHandle}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, twitterHandle: e.target.value }))
                  }
                  placeholder="@username"
                  className="w-full text-[15px] text-gray-900 border border-gray-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-gray-200"
                  autoComplete="username"
                />
              </div>
            </div>
            <button
              type="button"
              onClick={handleSave}
              disabled={pending}
              className="mt-4 w-full sm:w-auto px-5 py-2.5 rounded-lg bg-gray-900 text-white text-[14px] font-medium disabled:opacity-50"
            >
              {pending ? "Saving…" : "Save profile"}
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-5 mb-5">
        <div className="flex items-center justify-between">
          <div className="flex-1 pr-4">
            <h3 className="text-[15px] font-medium text-gray-800">
              Share my learning with others
            </h3>
            <p className="text-[12px] text-gray-400 mt-0.5">
              Topics you mark as shared will appear in Discover
            </p>
          </div>
          <ShareToggle initialEnabled />
        </div>
      </div>

      {menuSections.map((section, sectionIndex) => (
        <div
          key={sectionIndex}
          className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-100 mb-5"
        >
          {section.items.map((item, itemIndex) => (
            <button
              key={itemIndex}
              type="button"
              className="w-full flex items-center gap-3.5 px-5 py-3.5"
            >
              <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center">
                <item.icon className="w-4 h-4 text-gray-400" />
              </div>
              <span className="flex-1 text-left text-[15px] text-gray-800">
                {item.label}
              </span>
              <ChevronRight className="w-4 h-4 text-gray-300" />
            </button>
          ))}
        </div>
      ))}

      <form action={signOut}>
        <button
          type="submit"
          className="w-full py-3.5 rounded-lg border border-gray-200 bg-white text-[15px] font-medium text-red-400 flex items-center justify-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </form>

      <p className="text-center text-[11px] text-gray-300 mt-6">Queue v1.0.0</p>
    </div>
  );
}
