import LoginForm from "./LoginForm";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-[#FAFAF8] px-6 py-12 flex items-center justify-center">
      <div className="max-w-sm w-full space-y-6 text-center">
        <div className="space-y-4">
          <p className="text-[12px] uppercase tracking-[0.2em] text-gray-400">
            Queue
          </p>
          <h1 className="text-[28px] font-bold text-gray-900 tracking-tight">
            Welcome back
          </h1>
          <p className="text-[14px] text-gray-500">
            Sign in to a learning queue.
          </p>
          <p className="text-[14px] text-gray-500 leading-relaxed whitespace-pre-line">
            {`Too many things you want to learn?
Queue it. Come back anytime.
Your curiosity, organized.`}
          </p>
        </div>
        <LoginForm />
      </div>
    </main>
  );
}
