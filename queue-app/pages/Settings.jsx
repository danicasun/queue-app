import React, { useState } from 'react';
import { LogOut, ChevronRight, Bell, Shield, HelpCircle, Moon } from 'lucide-react';

export default function Settings() {
  const [shareToggle, setShareToggle] = useState(true);

  const menuSections = [
    {
      items: [
        { icon: Bell, label: 'Notifications', action: 'nav' },
        { icon: Shield, label: 'Privacy', action: 'nav' },
        { icon: Moon, label: 'Appearance', action: 'nav' },
      ]
    },
    {
      items: [
        { icon: HelpCircle, label: 'Help & Feedback', action: 'nav' },
      ]
    },
  ];

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-[#FAFAF8]/80 backdrop-blur-xl">
        <div className="px-5 pt-3 pb-3">
          <h1 className="text-[28px] font-bold text-gray-900 tracking-tight">Settings</h1>
        </div>
      </div>

      <div className="px-5 pb-28 pt-2">
        {/* Profile Card */}
        <div className="bg-white rounded-2xl shadow-sm p-5 mb-5 flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#7EB09B] to-[#A8D4C4] flex items-center justify-center">
            <span className="text-[20px] font-bold text-white">A</span>
          </div>
          <div className="flex-1">
            <h2 className="text-[17px] font-semibold text-gray-900">Alex Chen</h2>
            <p className="text-[13px] text-gray-400">alex@example.com</p>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-300" />
        </div>

        {/* Share Toggle */}
        <div className="bg-white rounded-2xl shadow-sm p-5 mb-5">
          <div className="flex items-center justify-between">
            <div className="flex-1 pr-4">
              <h3 className="text-[15px] font-medium text-gray-800">Share my learning with others</h3>
              <p className="text-[12px] text-gray-400 mt-0.5">Topics you mark as shared will appear in Discover</p>
            </div>
            <button
              onClick={() => setShareToggle(!shareToggle)}
              className={`relative w-[51px] h-[31px] rounded-full transition-colors duration-300 ${
                shareToggle ? 'bg-[#7EB09B]' : 'bg-gray-200'
              }`}
            >
              <div
                className={`absolute top-[2px] w-[27px] h-[27px] rounded-full bg-white shadow-sm transition-transform duration-300 ${
                  shareToggle ? 'translate-x-[22px]' : 'translate-x-[2px]'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Menu Sections */}
        {menuSections.map((section, si) => (
          <div key={si} className="bg-white rounded-2xl shadow-sm divide-y divide-gray-50 mb-5">
            {section.items.map((item, ii) => (
              <button key={ii} className="w-full flex items-center gap-3.5 px-5 py-3.5">
                <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center">
                  <item.icon className="w-4 h-4 text-gray-400" />
                </div>
                <span className="flex-1 text-left text-[15px] text-gray-800">{item.label}</span>
                <ChevronRight className="w-4 h-4 text-gray-300" />
              </button>
            ))}
          </div>
        ))}

        {/* Sign Out */}
        <button className="w-full py-3.5 rounded-2xl bg-white shadow-sm text-[15px] font-medium text-red-400 flex items-center justify-center gap-2">
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>

        {/* Version */}
        <p className="text-center text-[11px] text-gray-300 mt-6">Queue v1.0.0</p>
      </div>
    </div>
  );
}