type LoadingSpinnerProps = {
  label?: string;
  containerClassName?: string;
  spinnerClassName?: string;
};

export default function LoadingSpinner({
  label = "Loading…",
  containerClassName = "flex flex-col items-center justify-center min-h-[200px] gap-3",
  spinnerClassName = "w-8 h-8 rounded-full border-2 border-[#7EB09B]/30 border-t-[#7EB09B] animate-spin"
}: LoadingSpinnerProps) {
  return (
    <div className={containerClassName}>
      <div className={spinnerClassName} aria-hidden />
      <p className="text-[13px] text-gray-400">{label}</p>
    </div>
  );
}
