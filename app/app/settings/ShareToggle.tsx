"use client";

import { useState } from "react";

type ShareToggleProps = {
  initialEnabled?: boolean;
};

export default function ShareToggle({
  initialEnabled = true
}: ShareToggleProps) {
  const [isEnabled, setIsEnabled] = useState(initialEnabled);

  return (
    <button
      onClick={() => setIsEnabled(!isEnabled)}
      className={`relative w-[51px] h-[31px] rounded-full transition-colors duration-300 ${
        isEnabled ? "bg-[#7EB09B]" : "bg-gray-200"
      }`}
    >
      <div
        className={`absolute top-[2px] w-[27px] h-[27px] rounded-full bg-white shadow-sm transition-transform duration-300 ${
          isEnabled ? "translate-x-[22px]" : "translate-x-[2px]"
        }`}
      />
    </button>
  );
}
