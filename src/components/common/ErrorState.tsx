interface ErrorStateProps {
  title?: string
  message: string
  retry?: () => void
}

export default function ErrorState({
  title = '오류가 발생했습니다',
  message,
  retry
}: ErrorStateProps) {
  return (
    <div className="text-center py-12">
      <i className="fas fa-exclamation-triangle text-6xl text-red-500 mb-4"></i>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-6">{message}</p>
      {retry && (
        <button
          onClick={retry}
          className="px-6 py-2 bg-[#0f3460] text-white rounded-lg hover:bg-[#1a4b7d] transition-colors"
        >
          다시 시도
        </button>
      )}
    </div>
  )
}
