'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Star, ChevronRight, ChevronLeft } from 'lucide-react';

interface Notice {
  id: string;
  title: string;
  category: string;
  is_important: boolean;
  created_at: string;
}

const ITEMS_PER_PAGE = 10;

export default function NoticePage() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    fetchNotices();
  }, [currentPage]);

  async function fetchNotices() {
    setLoading(true);
    const supabase = createClient();

    const { count } = await supabase
      .from('notices')
      .select('*', { count: 'exact', head: true })
      .eq('is_published', true);

    setTotalCount(count || 0);

    const from = (currentPage - 1) * ITEMS_PER_PAGE;
    const to = from + ITEMS_PER_PAGE - 1;

    const { data, error } = await supabase
      .from('notices')
      .select('id, title, category, is_important, created_at')
      .eq('is_published', true)
      .order('is_important', { ascending: false })
      .order('created_at', { ascending: false })
      .range(from, to);

    if (!error && data) {
      setNotices(data);
    }
    setLoading(false);
  }

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  function getCategoryStyle(category: string) {
    switch (category) {
      case '공지':
        return 'bg-brand-primary text-white';
      case '이벤트':
        return 'bg-green-100 text-green-800';
      case '업데이트':
        return 'bg-blue-100 text-blue-800';
      case '점검':
        return 'bg-yellow-100 text-yellow-800';
      case '정책':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-brand-primary to-brand-dark text-white py-10 md:py-12">
        <div className="container-1200 px-4">
          <h1 className="text-2xl md:text-3xl font-bold mb-3">공지사항</h1>
          <p className="text-base md:text-lg text-blue-100">돌파구의 최신 소식을 확인하세요.</p>
        </div>
      </section>

      {/* Notice List */}
      <section className="py-10 md:py-12">
        <div className="container-1200 px-4">
          <div className="max-w-3xl mx-auto">
            {loading && <div className="text-center py-12 text-sm text-gray-500">로딩 중...</div>}
            {!loading && notices.length === 0 && (
              <div className="text-center py-12 text-sm text-gray-500">공지사항이 없습니다.</div>
            )}
            {!loading && notices.length > 0 && (
              <>
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  {notices.map((notice, index) => (
                    <Link
                      key={notice.id}
                      href={`/help/notice/${notice.id}`}
                      className={`flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors ${
                        index === notices.length - 1 ? '' : 'border-b border-gray-200'
                      }`}
                    >
                      <div className="flex-shrink-0">
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-medium ${getCategoryStyle(notice.category)}`}
                        >
                          {notice.category}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          {notice.is_important && (
                            <Star className="w-3.5 h-3.5 text-yellow-500 fill-current flex-shrink-0" />
                          )}
                          <h3 className="text-sm font-medium truncate">{notice.title}</h3>
                        </div>
                      </div>
                      <div className="flex-shrink-0 text-xs text-gray-500">
                        {new Date(notice.created_at).toLocaleDateString('ko-KR', {
                          timeZone: 'Asia/Seoul',
                        })}
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    </Link>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center gap-2 mt-6">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter(
                        (page) =>
                          page === 1 ||
                          page === totalPages ||
                          (page >= currentPage - 1 && page <= currentPage + 1)
                      )
                      .map((page, index, arr) => (
                        <span key={page} className="flex items-center">
                          {index > 0 && arr[index - 1] !== page - 1 && (
                            <span className="px-1 text-gray-400 text-sm">...</span>
                          )}
                          <button
                            onClick={() => setCurrentPage(page)}
                            className={`w-8 h-8 flex items-center justify-center rounded text-sm ${
                              currentPage === page
                                ? 'bg-brand-primary text-white'
                                : 'border border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            {page}
                          </button>
                        </span>
                      ))}

                    <button
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
