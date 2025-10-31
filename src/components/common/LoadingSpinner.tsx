export default function LoadingSpinner({ message = '로딩 중...' }: { message?: string }) {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
        <p className="mt-4 text-gray-600">{message}</p>
      </div>
    </div>
  )
}
