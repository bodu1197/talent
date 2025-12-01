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

    // Get total count
    const { count } = await supabase
      .from('notices')
      .select('*', { count: 'exact', head: true })
      .eq('is_published', true);

    setTotalCount(count || 0);

    // Get paginated data
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
    <div className="container-1200 py-16">
      <h1 className="text-3xl font-semibold mb-8">공지사항</h1>

      <div className="max-w-4xl">
        {loading && <div className="text-center py-12 text-gray-500">로딩 중...</div>}
        {!loading && notices.length === 0 && (
          <div className="text-center py-12 text-gray-500">공지사항이 없습니다.</div>
        )}
        {!loading && notices.length > 0 && (
          <>
            {/* 공지사항 목록 */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              {notices.map((notice, index) => (
                <Link
                  key={notice.id}
                  href={`/help/notice/${notice.id}`}
                  className={`flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors ${
                    index === notices.length - 1 ? '' : 'border-b border-gray-200'
                  }`}
                >
                  {/* 카테고리 */}
                  <div className="flex-shrink-0">
                    <span
                      className={`px-3 py-1 rounded text-xs font-semibold ${getCategoryStyle(notice.category)}`}
                    >
                      {notice.category}
                    </span>
                  </div>

                  {/* 제목 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {notice.is_important && (
                        <Star className="w-4 h-4 text-yellow-500 fill-current flex-shrink-0" />
                      )}
                      <h3 className="font-semibold truncate">{notice.title}</h3>
                    </div>
                  </div>

                  {/* 날짜 */}
                  <div className="flex-shrink-0 text-sm text-gray-500">
                    {new Date(notice.created_at).toLocaleDateString('ko-KR', {
                      timeZone: 'Asia/Seoul',
                    })}
                  </div>

                  {/* 화살표 */}
                  <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                </Link>
              ))}
            </div>

            {/* 페이지네이션 */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
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
                        <span className="px-2 text-gray-400">...</span>
                      )}
                      <button
                        onClick={() => setCurrentPage(page)}
                        className={`w-10 h-10 flex items-center justify-center rounded ${
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
                  className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
