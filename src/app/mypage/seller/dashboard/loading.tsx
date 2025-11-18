import LoadingSpinner from '@/components/common/LoadingSpinner'

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <LoadingSpinner message="판매자 대시보드를 불러오는 중..." />
    </div>
  )
}
