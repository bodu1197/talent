export default function LoadingSpinner({
  message = "로딩 중...",
}: {
  message?: string;
}) {
  return (
    <output
      className="flex items-center justify-center py-12"
      aria-live="polite"
    >
      <div className="text-center">
        <div
          className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"
          aria-hidden="true"
        ></div>
        <p className="mt-4 text-gray-600">{message}</p>
        <span className="sr-only">{message}</span>
      </div>
    </output>
  );
}
