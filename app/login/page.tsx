import LoginForm from "./LoginForm";
import LoginTagline from "./LoginTagline";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-[#FAFAF8] px-6 py-16 flex items-center justify-center">
      <div className="max-w-sm w-full space-y-12 text-center">
        <div className="space-y-6">
          <p className="text-[12px] uppercase tracking-[0.2em] text-gray-400">
            Queue
          </p>
          <h1 className="text-[28px] font-bold text-gray-900 tracking-tight">
            Welcome back
          </h1>
          <LoginTagline />
        </div>
        <LoginForm />
      </div>
    </main>
  );
}
