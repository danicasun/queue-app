import React from 'react';

export default function EmptyState({ icon: Icon, title, subtitle }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-8">
      {Icon && (
        <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center mb-4">
          <Icon className="w-6 h-6 text-gray-300" />
        </div>
      )}
      <p className="text-[15px] font-medium text-gray-400 text-center">{title}</p>
      {subtitle && (
        <p className="text-[13px] text-gray-300 text-center mt-1">{subtitle}</p>
      )}
    </div>
  );
}