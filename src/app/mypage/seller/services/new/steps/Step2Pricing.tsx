interface ServiceFormData {
  title: string
  category_ids: string[]
  price: string
  delivery_days: string
  revision_count: string
  description: string
  thumbnail_url: string
  thumbnail_file: File | null
  requirements: { question: string; required: boolean }[]
  create_portfolio: boolean
  portfolio_data: {
    title: string
    description: string
    youtube_url: string
    project_url: string
    tags: string[]
    images: File[]
  }
  features?: {
    commercial_use?: boolean
    source_files?: boolean
    express_delivery?: boolean
  }
}

interface Props {
  readonly formData: ServiceFormData
  readonly setFormData: (data: ServiceFormData) => void
}

export default function Step2Pricing({ formData, setFormData }: Props) {
  const formatPrice = (value: string) => {
    const number = value.replace(/[^\d]/g, '')
    return number.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  }

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^\d]/g, '')
    setFormData({ ...formData, price: value })
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">가격 설정</h2>

      {/* 서비스 가격 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          서비스 가격 <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <input
            type="text"
            value={formatPrice(formData.price)}
            onChange={handlePriceChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
            placeholder="0"
            required
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">원</span>
        </div>
        <p className="mt-2 text-sm text-gray-500">
          최소 금액: 5,000원
        </p>
      </div>

      {/* 작업 기간 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          작업 기간 <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <input
            type="number"
            value={formData.delivery_days}
            onChange={(e) => setFormData({ ...formData, delivery_days: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
            placeholder="7"
            min="1"
            max="365"
            required
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">일</span>
        </div>
        <p className="mt-2 text-sm text-gray-500">
          작업을 완료하는 데 필요한 평균 기간을 입력하세요 (1~365일)
        </p>
      </div>

      {/* 수정 횟수 */}
      <div>
        <label htmlFor="revisionCount" className="block text-sm font-medium text-gray-700 mb-2">
          수정 횟수
        </label>
        <select
          id="revisionCount"
          value={formData.revision_count}
          onChange={(e) => setFormData({ ...formData, revision_count: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
        >
          <option value="0">수정 불가</option>
          <option value="1">1회</option>
          <option value="2">2회</option>
          <option value="3">3회</option>
          <option value="5">5회</option>
          <option value="-1">무제한</option>
        </select>
        <p className="mt-2 text-sm text-gray-500">
          고객이 작업물을 받은 후 수정 요청할 수 있는 횟수
        </p>
      </div>

      {/* 가격 미리보기 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-8">
        <h3 className="text-lg font-bold text-gray-900 mb-4">가격 요약</h3>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-700">서비스 금액</span>
            <span className="font-bold text-gray-900">
              {formatPrice(formData.price || '0')}원
            </span>
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>운영자 커피값</span>
            <span>
              -1,000원
            </span>
          </div>
          <div className="border-t border-blue-300 pt-3 flex justify-between">
            <span className="font-bold text-gray-900">예상 수익</span>
            <span className="font-bold text-brand-primary text-lg">
              {formatPrice(Math.max(0, parseInt(formData.price || '0') - 1000).toString())}원
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
