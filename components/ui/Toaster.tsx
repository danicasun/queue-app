"use client";

import { Toaster } from "sonner";

export default function AppToaster() {
  return (
    <Toaster
      position="top-center"
      closeButton
      richColors
      toastOptions={{
        style: {
          fontSize: "13px",
          fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif"
        }
      }}
    />
  );
}
