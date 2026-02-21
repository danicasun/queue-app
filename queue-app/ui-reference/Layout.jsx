import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { List, Compass, FolderOpen, Settings } from 'lucide-react';

const tabs = [
  { name: 'Queue', icon: List, label: 'Queue' },
  { name: 'Discover', icon: Compass, label: 'Discover' },
  { name: 'Organize', icon: FolderOpen, label: 'Organize' },
  { name: 'Settings', icon: Settings, label: 'Settings' },
];

export default function Layout({ children, currentPageName }) {
  const showTabs = ['Queue', 'Discover', 'Organize', 'Settings'].includes(currentPageName);

  return (
    <div className="max-w-[430px] mx-auto min-h-screen bg-[#FAFAF8] relative">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        * { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; }
        body { background: #EDEDEB; margin: 0; }
        ::-webkit-scrollbar { display: none; }
      `}</style>

      {children}

      {showTabs && (
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-40">
          <div className="bg-white/80 backdrop-blur-xl border-t border-gray-100/60">
            <div className="flex items-center justify-around px-2" style={{ paddingBottom: 'env(safe-area-inset-bottom, 8px)' }}>
              {tabs.map(tab => {
                const isActive = currentPageName === tab.name;
                return (
                  <Link
                    key={tab.name}
                    to={createPageUrl(tab.name)}
                    className={`flex flex-col items-center gap-0.5 py-2 px-4 min-w-[60px] transition-colors ${
                      isActive ? 'text-[#7EB09B]' : 'text-gray-400'
                    }`}
                  >
                    <tab.icon className="w-[22px] h-[22px]" strokeWidth={isActive ? 2.2 : 1.8} />
                    <span className={`text-[10px] ${isActive ? 'font-semibold' : 'font-medium'}`}>
                      {tab.label}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}