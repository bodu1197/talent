import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'

interface ServiceDetailProps {
  params: Promise<{
    id: string
  }>
}

// 임시 서비스 데이터 (나중에 실제 데이터로 교체)
const getServiceById = (id: string) => {
  // 예시 데이터
  return {
    id,
    title: "전문 AI 로고 디자인 - Midjourney를 활용한 프리미엄 브랜딩",
    seller: {
      name: "디자인마스터",
      avatar: "/avatars/seller1.jpg",
      level: "PRO",
      rating: 4.9,
      reviewCount: 1234,
      responseTime: "1시간 이내",
      completedProjects: 3456,
      joinDate: "2022.01",
    },
    price: {
      basic: 50000,
      standard: 150000,
      premium: 300000,
    },
    images: [
      "/services/logo1.jpg",
      "/services/logo2.jpg",
      "/services/logo3.jpg",
      "/services/logo4.jpg",
    ],
    description: `
      <h3>🎨 Midjourney AI를 활용한 차별화된 로고 디자인</h3>
      <p>안녕하세요, 10년차 브랜드 디자이너입니다.</p>
      <p>최신 AI 기술과 전문 디자인 감각을 결합하여 귀하의 브랜드에 완벽한 로고를 제작해 드립니다.</p>

      <h3>✨ 서비스 특징</h3>
      <ul>
        <li>Midjourney V6를 활용한 최신 AI 디자인</li>
        <li>무제한 수정 (스탠다드 이상)</li>
        <li>상업적 이용 가능한 라이선스 제공</li>
        <li>벡터 파일 변환 포함</li>
      </ul>

      <h3>📦 제공 파일</h3>
      <ul>
        <li>AI (Adobe Illustrator)</li>
        <li>PNG (투명 배경)</li>
        <li>JPG (고해상도)</li>
        <li>SVG (웹 사용)</li>
        <li>PDF (인쇄용)</li>
      </ul>
    `,
    packages: [
      {
        name: "BASIC",
        title: "베이직",
        price: 50000,
        delivery: 3,
        revisions: 2,
        features: [
          "AI 로고 3개 시안",
          "JPG, PNG 파일",
          "2회 수정",
          "3일 작업",
        ]
      },
      {
        name: "STANDARD",
        title: "스탠다드",
        price: 150000,
        delivery: 5,
        revisions: -1,
        features: [
          "AI 로고 5개 시안",
          "모든 파일 형식",
          "무제한 수정",
          "5일 작업",
          "명함 디자인 포함",
        ],
        recommended: true
      },
      {
        name: "PREMIUM",
        title: "프리미엄",
        price: 300000,
        delivery: 7,
        revisions: -1,
        features: [
          "AI 로고 10개 시안",
          "모든 파일 형식",
          "무제한 수정",
          "7일 작업",
          "명함 디자인 포함",
          "브랜드 가이드라인",
          "SNS 템플릿 5종",
        ]
      }
    ],
    tags: ["Midjourney", "AI디자인", "로고", "브랜딩", "벡터변환"],
    category: ["AI 서비스", "AI 이미지 생성", "AI 로고 디자인"],
    stats: {
      views: 15234,
      likes: 823,
      purchases: 456,
    },
    faqs: [
      {
        question: "AI로 만든 로고도 상업적으로 사용 가능한가요?",
        answer: "네, 제공되는 모든 디자인은 상업적 이용이 가능합니다. 필요시 저작권 양도 확인서도 제공해 드립니다."
      },
      {
        question: "벡터 파일로 변환이 가능한가요?",
        answer: "네, 모든 패키지에 AI 파일 (Adobe Illustrator) 형식의 벡터 파일이 포함됩니다."
      },
      {
        question: "수정은 몇 번까지 가능한가요?",
        answer: "베이직은 2회, 스탠다드와 프리미엄은 무제한 수정이 가능합니다."
      }
    ],
    reviews: [
      {
        id: 1,
        user: "김**",
        rating: 5,
        date: "2024.01.15",
        package: "STANDARD",
        comment: "정말 만족스러운 결과물이었습니다. AI로 만든 것 같지 않을 정도로 퀄리티가 높았고, 수정 요청도 빠르게 반영해 주셨습니다.",
        images: ["/reviews/review1.jpg"],
        sellerReply: "좋은 평가 감사합니다! 앞으로도 최선을 다하겠습니다."
      },
      {
        id: 2,
        user: "이**",
        rating: 4.5,
        date: "2024.01.10",
        package: "BASIC",
        comment: "가격 대비 퀄리티가 좋습니다. 다만 베이직은 수정 횟수가 적어서 아쉬웠어요.",
        sellerReply: "소중한 의견 감사합니다. 다음에는 스탠다드 패키지를 추천드립니다!"
      }
    ]
  }
}

export default async function ServiceDetailPage({ params }: ServiceDetailProps) {
  const { id } = await params
  const service = getServiceById(id)

  if (!service) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 상단 네비게이션 */}
      <nav className="bg-white border-b sticky top-16 z-30">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 py-3 text-sm">
            <Link href="/" className="text-gray-500 hover:text-gray-700">홈</Link>
            {service.category.map((cat, index) => (
              <div key={index} className="flex items-center gap-2">
                <span className="text-gray-400">/</span>
                <Link href="#" className="text-gray-500 hover:text-gray-700">{cat}</Link>
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
                <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                  <i className="fas fa-image text-[40px]"></i>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-2 p-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="aspect-square bg-gray-100 rounded-lg"></div>
                ))}
              </div>
            </div>

            {/* 서비스 설명 */}
            <div className="bg-white rounded-xl p-8 shadow-sm">
              <h1 className="text-2xl font-bold mb-6">{service.title}</h1>

              {/* 통계 */}
              <div className="flex items-center gap-6 py-4 border-y border-gray-200 mb-6">
                <div className="flex items-center gap-2">
                  <i className="fas fa-star text-yellow-400"></i>
                  <span className="font-bold">{service.seller.rating}</span>
                  <span className="text-gray-500">({service.seller.reviewCount})</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <i className="fas fa-shopping-cart"></i>
                  <span>{service.stats.purchases}회 구매</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <i className="fas fa-heart"></i>
                  <span>{service.stats.likes}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <i className="fas fa-eye"></i>
                  <span>{service.stats.views.toLocaleString()}</span>
                </div>
              </div>

              <div
                className="prose prose-lg max-w-none"
                dangerouslySetInnerHTML={{ __html: service.description }}
              />

              {/* 태그 */}
              <div className="flex flex-wrap gap-2 mt-8">
                {service.tags.map((tag) => (
                  <span key={tag} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            {/* FAQ */}
            <div className="bg-white rounded-xl p-8 shadow-sm">
              <h2 className="text-xl font-bold mb-6">자주 묻는 질문</h2>
              <div className="space-y-4">
                {service.faqs.map((faq, index) => (
                  <details key={index} className="group">
                    <summary className="flex items-center justify-between cursor-pointer py-3 hover:text-[#0f3460]">
                      <span className="font-medium">{faq.question}</span>
                      <i className="fas fa-chevron-down group-open:rotate-180 transition-transform"></i>
                    </summary>
                    <div className="pt-2 pb-4 text-gray-600">
                      {faq.answer}
                    </div>
                  </details>
                ))}
              </div>
            </div>

            {/* 리뷰 */}
            <div className="bg-white rounded-xl p-8 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">구매 후기</h2>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <i className="fas fa-star text-yellow-400"></i>
                    <span className="font-bold text-lg">{service.seller.rating}</span>
                    <span className="text-gray-500">({service.seller.reviewCount}개)</span>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                {service.reviews.map((review) => (
                  <div key={review.id} className="border-b border-gray-200 pb-6 last:border-0">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                        <div>
                          <div className="font-medium">{review.user}</div>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <div className="flex text-yellow-400">
                              {[...Array(5)].map((_, i) => (
                                <i key={i} className={`fas fa-star ${i < Math.floor(review.rating) ? '' : 'text-gray-300'}`}></i>
                              ))}
                            </div>
                            <span>{review.date}</span>
                            <span className="px-2 py-0.5 bg-gray-100 rounded text-xs">{review.package}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-700 mb-3">{review.comment}</p>
                    {review.sellerReply && (
                      <div className="ml-12 p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium">판매자 답변</span>
                        </div>
                        <p className="text-sm text-gray-600">{review.sellerReply}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 오른쪽: 구매 옵션 */}
          <div className="lg:col-span-1">
            <div className="sticky top-32 space-y-6">
              {/* 판매자 정보 */}
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold">{service.seller.name}</h3>
                      <span className="px-2 py-0.5 bg-[#0f3460] text-white text-xs rounded">
                        {service.seller.level}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">{service.seller.joinDate} 가입</div>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">응답시간</span>
                    <span className="font-medium">{service.seller.responseTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">완료 프로젝트</span>
                    <span className="font-medium">{service.seller.completedProjects.toLocaleString()}건</span>
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
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="flex border-b">
                  {service.packages.map((pkg) => (
                    <button
                      key={pkg.name}
                      className={`flex-1 py-3 px-4 text-sm font-medium ${
                        pkg.recommended
                          ? 'bg-[#0f3460] text-white'
                          : 'bg-gray-50 hover:bg-gray-100'
                      }`}
                    >
                      {pkg.title}
                      {pkg.recommended && (
                        <span className="block text-xs mt-1">추천</span>
                      )}
                    </button>
                  ))}
                </div>

                {/* 선택된 패키지 정보 (기본: 스탠다드) */}
                {service.packages.map((pkg) => (
                  <div key={pkg.name} className={`p-6 ${pkg.recommended ? '' : 'hidden'}`}>
                    <div className="text-3xl font-bold mb-1">
                      ₩{pkg.price.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600 mb-6">
                      {pkg.delivery}일 이내 완료 · {pkg.revisions === -1 ? '무제한' : `${pkg.revisions}회`} 수정
                    </div>

                    <ul className="space-y-2 mb-6">
                      {pkg.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <i className="fas fa-check text-green-500 mt-0.5"></i>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <button className="w-full py-3 bg-[#0f3460] text-white rounded-lg font-medium hover:bg-[#1a4b7d] transition-colors">
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
                ))}
              </div>

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