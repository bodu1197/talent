'use client'

import { useState } from 'react'
import MypageLayoutWrapper from '@/components/mypage/MypageLayoutWrapper'
import Link from 'next/link'
import { deletePortfolioItem } from '@/lib/supabase/queries/earnings'
import { useRouter } from 'next/navigation'
import { logger } from '@/lib/logger'
import { Portfolio } from '@/types/common'

interface PortfolioWithService extends Portfolio {
  service?: {
    id: string
    title: string
  } | null
}

interface Props {
  portfolio: PortfolioWithService[]
}

export default function SellerPortfolioClient({ portfolio: initialPortfolio }: Props) {
  const router = useRouter()
  const [portfolio, setPortfolio] = useState(initialPortfolio)
  const [deleting, setDeleting] = useState<string | null>(null)

  async function handleDelete(itemId: string) {
    if (!confirm('정말 삭제하시겠습니까?')) return

    try {
      setDeleting(itemId)
      await deletePortfolioItem(itemId)
      setPortfolio(portfolio.filter(item => item.id !== itemId))
      router.refresh()
    } catch (err: unknown) {
      logger.error('삭제 실패:', err)
      alert('삭제에 실패했습니다')
    } finally {
      setDeleting(null)
    }
  }

  return (
    <MypageLayoutWrapper mode="seller">
      <div className="py-8 px-4">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">포트폴리오</h1>
              <p className="text-gray-600 mt-1 text-sm">작업물을 등록하고 관리하세요</p>
            </div>
            <Link
              href="/mypage/seller/portfolio/new"
              className="px-6 py-3 bg-brand-primary text-white rounded-lg hover:bg-[#1a4d8f] transition-colors font-medium"
            >
              <i className="fas fa-plus mr-2"></i>
              포트폴리오 등록
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {portfolio.length > 0 ? (
            portfolio.map((item) => (
              <div key={item.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:border-brand-primary transition-colors">
                <Link href={`/mypage/seller/portfolio/${item.id}`} className="block">
                  <div className="aspect-[4/3] bg-gray-100 flex items-center justify-center relative">
                    {item.thumbnail_url ? (
                      <img src={item.thumbnail_url} alt={item.title} className="w-full h-full object-cover" />
                    ) : (
                      <i className="fas fa-image text-gray-400 text-4xl"></i>
                    )}
                    {item.service && (
                      <div className="absolute top-2 right-2 bg-brand-primary text-white text-xs px-2 py-1 rounded-md flex items-center gap-1">
                        <i className="fas fa-link"></i>
                        <span>서비스 연동</span>
                      </div>
                    )}
                  </div>
                </Link>
                <div className="p-4">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{item.description}</p>
                  {item.service && (
                    <div className="mb-3 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center gap-2">
                        <i className="fas fa-briefcase text-brand-primary text-sm"></i>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-gray-600">연동된 서비스</p>
                          <Link
                            href={`/services/${item.service.id}`}
                            className="text-sm font-medium text-brand-primary hover:underline truncate block"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {item.service.title}
                          </Link>
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span><i className="fas fa-eye mr-1"></i>{item.view_count || 0}</span>
                    <span>{new Date(item.created_at).toLocaleDateString('ko-KR')}</span>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Link
                      href={`/mypage/seller/portfolio/${item.id}/edit`}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium text-center"
                    >
                      수정
                    </Link>
                    <button
                      onClick={() => handleDelete(item.id)}
                      disabled={deleting === item.id}
                      className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                      {deleting === item.id ? '삭제중...' : '삭제'}
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full bg-white border border-gray-200 rounded-lg p-12 text-center">
              <i className="fas fa-folder-open text-gray-300 text-6xl mb-4"></i>
              <p className="text-gray-500 mb-4">등록된 포트폴리오가 없습니다</p>
              <Link
                href="/mypage/seller/portfolio/new"
                className="inline-flex items-center px-6 py-3 bg-brand-primary text-white rounded-lg hover:bg-[#1a4d8f] transition-colors font-medium"
              >
                <i className="fas fa-plus mr-2"></i>
                포트폴리오 등록
              </Link>
            </div>
          )}
        </div>
      </div>
    </MypageLayoutWrapper>
  )
}
