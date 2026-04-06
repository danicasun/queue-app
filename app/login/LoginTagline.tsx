"use client";

import { motion } from "framer-motion";

const lines = [
  "Too many things you want to learn?",
  "Queue it. Come back anytime.",
  "Your curiosity, organized."
];

export default function LoginTagline() {
  return (
    <div className="space-y-6 pt-4 text-center">
      {lines.map((line, index) => (
        <motion.p
          key={line}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.55,
            delay: 0.2 + index * 0.45,
            ease: [0.25, 0.1, 0.25, 1]
          }}
          className="text-[14px] text-gray-500 leading-relaxed"
        >
          {line}
        </motion.p>
      ))}
    </div>
  );
}
