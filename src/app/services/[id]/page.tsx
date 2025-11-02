import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import ViewTracker from '@/components/services/ViewTracker'

interface ServiceDetailProps {
  params: Promise<{
    id: string
  }>
}

export default async function ServiceDetailPage({ params }: ServiceDetailProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data: service, error } = await supabase
    .from('services')
    .select(`
      *,
      seller:sellers(
        id,
        business_name,
        user_id
      ),
      service_categories(
        category:categories(id, name, slug)
      ),
      service_packages(*)
    `)
    .eq('id', id)
    .single()

  if (error) {
    console.error('Service fetch error:', error)
    notFound()
  }

  if (!service) {
    notFound()
  }

  // seller의 user 정보를 별도로 조회
  if (service?.seller?.user_id) {
    const { data: userData } = await supabase
      .from('users')
      .select('id, name, email, profile_image, created_at')
      .eq('id', service.seller.user_id)
      .single()

    if (userData) {
      service.seller.user = userData
    }
  }

  // 패키지 정렬: basic, standard, premium 순서
  const sortedPackages = service.service_packages?.sort((a: any, b: any) => {
    const order = { basic: 0, standard: 1, premium: 2 }
    return (order[a.package_type as keyof typeof order] || 0) - (order[b.package_type as keyof typeof order] || 0)
  }) || []

  const categories = service.service_categories?.map((sc: any) => sc.category) || []

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 조회수 추적 */}
      <ViewTracker serviceId={id} />

      {/* 상단 네비게이션 */}
      <nav className="bg-white border-b sticky top-16 z-30">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 py-3 text-sm">
            <Link href="/" className="text-gray-500 hover:text-gray-700">홈</Link>
            {categories.map((cat: any, index: number) => (
              <div key={index} className="flex items-center gap-2">
                <span className="text-gray-400">/</span>
                <Link href="#" className="text-gray-500 hover:text-gray-700">{cat.name}</Link>
              </div>
            ))}
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 왼쪽: 서비스 정보 */}
          <div className="lg:col-span-2 space-y-8">
            {/* 이미지 갤러리 */}
            <div className="bg-white rounded-xl overflow-hidden shadow-sm">
              <div className="aspect-video relative bg-gray-100">
                {service.thumbnail_url ? (
                  <img
                    src={service.thumbnail_url}
                    alt={service.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                    <i className="fas fa-image text-[40px]"></i>
                  </div>
                )}
              </div>
              {service.portfolio_urls && service.portfolio_urls.length > 0 && (
                <div className="grid grid-cols-4 gap-2 p-4">
                  {service.portfolio_urls.slice(0, 4).map((url: string, i: number) => (
                    <div key={i} className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                      <img src={url} alt={`Portfolio ${i + 1}`} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 서비스 설명 */}
            <div className="bg-white rounded-xl p-8 shadow-sm">
              <h1 className="text-2xl font-bold mb-6">{service.title}</h1>

              {/* 통계 */}
              <div className="flex items-center gap-6 py-4 border-y border-gray-200 mb-6">
                <div className="flex items-center gap-2">
                  <i className="fas fa-star text-yellow-400"></i>
                  <span className="font-bold">{service.rating || 0}</span>
                  <span className="text-gray-500">({service.review_count || 0})</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <i className="fas fa-shopping-cart"></i>
                  <span>{service.orders_count || 0}회 구매</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <i className="fas fa-eye"></i>
                  <span>{service.views || 0}</span>
                </div>
              </div>

              <div className="prose prose-lg max-w-none whitespace-pre-wrap">
                {service.description}
              </div>
            </div>
          </div>

          {/* 오른쪽: 구매 옵션 */}
          <div className="lg:col-span-1">
            <div className="sticky top-32 space-y-6">
              {/* 판매자 정보 */}
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-gray-200 rounded-full overflow-hidden">
                    {service.seller?.user?.profile_image ? (
                      <img src={service.seller.user.profile_image} alt={service.seller.user.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <i className="fas fa-user text-2xl"></i>
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold">{service.seller?.business_name || service.seller?.user?.name}</h3>
                    <div className="text-sm text-gray-600">
                      {service.seller?.user?.created_at && new Date(service.seller.user.created_at).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long' })} 가입
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 mt-4">
                  <button className="flex-1 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                    <i className="far fa-comment"></i> 문의
                  </button>
                  <button className="flex-1 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                    <i className="far fa-user"></i> 프로필
                  </button>
                </div>
              </div>

              {/* 패키지 선택 */}
              {sortedPackages.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                  <div className="flex border-b">
                    {sortedPackages.map((pkg: any) => (
                      <button
                        key={pkg.id}
                        className={`flex-1 py-3 px-4 text-sm font-medium ${
                          pkg.package_type === 'standard'
                            ? 'bg-[#0f3460] text-white'
                            : 'bg-gray-50 hover:bg-gray-100'
                        }`}
                      >
                        {pkg.name}
                        {pkg.package_type === 'standard' && (
                          <span className="block text-xs mt-1">추천</span>
                        )}
                      </button>
                    ))}
                  </div>

                  {/* 첫 번째 패키지 또는 standard 패키지 표시 */}
                  {(() => {
                    const displayPkg = sortedPackages.find((p: any) => p.package_type === 'standard') || sortedPackages[0]
                    return (
                      <div className="p-6">
                        <div className="text-3xl font-bold mb-1">
                          ₩{displayPkg.price.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-600 mb-6">
                          {displayPkg.delivery_days}일 이내 완료 · {displayPkg.revision_count === 999 ? '무제한' : `${displayPkg.revision_count}회`} 수정
                        </div>

                        <ul className="space-y-2 mb-6">
                          {displayPkg.features?.map((feature: string, i: number) => (
                            <li key={i} className="flex items-start gap-2 text-sm">
                              <i className="fas fa-check text-green-500 mt-0.5"></i>
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>

                        <button className="w-full py-3 bg-[#0f3460] text-white rounded-lg font-medium hover:bg-[#1a4d8f] transition-colors">
                          구매하기
                        </button>

                        <div className="flex gap-2 mt-3">
                          <button className="flex-1 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                            <i className="far fa-heart"></i> 찜하기
                          </button>
                          <button className="flex-1 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                            <i className="fas fa-share"></i> 공유
                          </button>
                        </div>
                      </div>
                    )
                  })()}
                </div>
              )}

              {/* 안전거래 배지 */}
              <div className="bg-blue-50 rounded-xl p-4 text-center">
                <i className="fas fa-shield-alt text-2xl text-[#0f3460] mb-2"></i>
                <h4 className="font-bold mb-1">100% 안전거래</h4>
                <p className="text-xs text-gray-600">
                  에스크로 결제 시스템으로<br/>
                  안전하게 거래하세요
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
