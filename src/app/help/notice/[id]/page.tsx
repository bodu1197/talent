'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { ChevronLeft, Star, Eye, Calendar } from 'lucide-react';

interface Notice {
  id: string;
  title: string;
  content: string;
  category: string;
  is_important: boolean;
  view_count: number;
  created_at: string;
  updated_at: string;
}

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

export default function NoticeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [notice, setNotice] = useState<Notice | null>(null);
  const [loading, setLoading] = useState(true);
  const [prevNotice, setPrevNotice] = useState<{ id: string; title: string } | null>(null);
  const [nextNotice, setNextNotice] = useState<{ id: string; title: string } | null>(null);

  useEffect(() => {
    if (params.id) {
      fetchNotice(params.id as string);
    }
  }, [params.id]);

  async function fetchNotice(id: string) {
    setLoading(true);
    const supabase = createClient();

    // Fetch current notice
    const { data, error } = await supabase
      .from('notices')
      .select('*')
      .eq('id', id)
      .eq('is_published', true)
      .single();

    if (error || !data) {
      router.push('/help/notice');
      return;
    }

    setNotice(data);

    // Increment view count
    await supabase.rpc('increment_notice_view_count', { notice_id: id });

    // Fetch previous notice
    const { data: prevData } = await supabase
      .from('notices')
      .select('id, title')
      .eq('is_published', true)
      .lt('created_at', data.created_at)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    setPrevNotice(prevData);

    // Fetch next notice
    const { data: nextData } = await supabase
      .from('notices')
      .select('id, title')
      .eq('is_published', true)
      .gt('created_at', data.created_at)
      .order('created_at', { ascending: true })
      .limit(1)
      .single();

    setNextNotice(nextData);
    setLoading(false);
  }

  if (loading) {
    return (
      <div className="container-1200 py-16">
        <div className="text-center py-12 text-gray-500">로딩 중...</div>
      </div>
    );
  }

  if (!notice) {
    return null;
  }

  return (
    <div className="container-1200 py-16">
      <div className="max-w-4xl">
        {/* 목록으로 돌아가기 */}
        <Link
          href="/help/notice"
          className="inline-flex items-center gap-1 text-gray-600 hover:text-brand-primary mb-6"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>목록으로</span>
        </Link>

        {/* 공지사항 헤더 */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-3 mb-3">
              <span
                className={`px-3 py-1 rounded text-xs font-semibold ${getCategoryStyle(notice.category)}`}
              >
                {notice.category}
              </span>
              {notice.is_important && (
                <span className="flex items-center gap-1 text-yellow-600 text-sm">
                  <Star className="w-4 h-4 fill-current" />
                  중요
                </span>
              )}
            </div>

            <h1 className="text-2xl font-bold mb-4">{notice.title}</h1>

            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {new Date(notice.created_at).toLocaleDateString('ko-KR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
              <span className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                조회수 {(notice.view_count + 1).toLocaleString()}
              </span>
            </div>
          </div>

          {/* 공지사항 내용 */}
          <div className="p-6">
            <div className="prose max-w-none whitespace-pre-wrap text-gray-700 leading-relaxed">
              {notice.content}
            </div>
          </div>
        </div>

        {/* 이전/다음 공지사항 */}
        <div className="mt-6 bg-white rounded-lg border border-gray-200 overflow-hidden">
          {nextNotice && (
            <Link
              href={`/help/notice/${nextNotice.id}`}
              className="flex items-center justify-between p-4 hover:bg-gray-50 border-b border-gray-200"
            >
              <span className="text-sm text-gray-500">다음 글</span>
              <span className="font-medium truncate ml-4">{nextNotice.title}</span>
            </Link>
          )}
          {prevNotice && (
            <Link
              href={`/help/notice/${prevNotice.id}`}
              className="flex items-center justify-between p-4 hover:bg-gray-50"
            >
              <span className="text-sm text-gray-500">이전 글</span>
              <span className="font-medium truncate ml-4">{prevNotice.title}</span>
            </Link>
          )}
          {!prevNotice && !nextNotice && (
            <div className="p-4 text-center text-gray-500 text-sm">다른 공지사항이 없습니다.</div>
          )}
        </div>

        {/* 목록 버튼 */}
        <div className="mt-6 text-center">
          <Link
            href="/help/notice"
            className="inline-flex items-center gap-2 px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            목록으로
          </Link>
        </div>
      </div>
    </div>
  );
}
