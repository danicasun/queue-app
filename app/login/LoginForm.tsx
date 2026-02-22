"use client";

import { useFormState, useFormStatus } from "react-dom";
import { signInWithEmail } from "./actions";
import { initialSignInState } from "./state";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={`inline-flex items-center justify-center w-full py-3.5 rounded-2xl text-[15px] font-semibold transition-all ${
        pending
          ? "bg-gray-200 text-gray-400"
          : "bg-[#7EB09B] text-white shadow-lg shadow-[#7EB09B]/20"
      }`}
    >
      {pending ? "Sending..." : "Send magic link"}
    </button>
  );
}

export default function LoginForm() {
  const [state, formAction] = useFormState(
    signInWithEmail,
    initialSignInState
  );

  return (
    <form action={formAction} className="space-y-4">
      <label className="text-[11px] font-medium text-gray-400 uppercase tracking-wider block text-left">
        Email address
      </label>
      <input
        name="email"
        type="email"
        placeholder="you@example.com"
        className="w-full text-[16px] text-gray-800 placeholder:text-gray-300 bg-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#7EB09B]/30 transition-all"
        autoComplete="email"
        required
      />

      {state.status !== "idle" && (
        <p
          className={`text-[12px] ${
            state.status === "success" ? "text-[#7EB09B]" : "text-red-400"
          }`}
        >
          {state.message}
        </p>
      )}

      <SubmitButton />
    </form>
  );
}
