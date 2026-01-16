'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Plus, Edit, Trash2, Eye, EyeOff, Star, Search, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { logger } from '@/lib/logger';

interface Notice {
  id: string;
  title: string;
  content: string;
  category: string;
  is_important: boolean;
  is_published: boolean;
  view_count: number;
  created_at: string;
  updated_at: string;
}

const CATEGORIES = ['공지', '이벤트', '업데이트', '점검', '정책'];

function getCategoryColor(cat: string) {
  switch (cat) {
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

async function sendNotificationToAllUsers(noticeId: string, noticeTitle: string) {
  const supabase = createClient();
  const { data: notifyResult, error: notifyError } = await supabase.rpc(
    'notify_all_users_new_notice',
    {
      p_notice_id: noticeId,
      p_notice_title: noticeTitle,
    }
  );

  if (notifyError) {
    logger.error('알림 발송 실패', notifyError);
    return;
  }
  toast.success(`${notifyResult}명에게 알림이 발송되었습니다.`);
}

export default function AdminNoticesPage() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNotice, setEditingNotice] = useState<Notice | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('');

  // Form states
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('공지');
  const [isImportant, setIsImportant] = useState(false);
  const [isPublished, setIsPublished] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchNotices();
  }, []);

  async function fetchNotices() {
    setLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase
      .from('notices')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('공지사항을 불러오는데 실패했습니다.');
      logger.error('공지사항 로드 실패', error);
    } else {
      setNotices(data || []);
    }
    setLoading(false);
  }

  function openCreateModal() {
    setEditingNotice(null);
    setTitle('');
    setContent('');
    setCategory('공지');
    setIsImportant(false);
    setIsPublished(true);
    setIsModalOpen(true);
  }

  function openEditModal(notice: Notice) {
    setEditingNotice(notice);
    setTitle(notice.title);
    setContent(notice.content);
    setCategory(notice.category);
    setIsImportant(notice.is_important);
    setIsPublished(notice.is_published);
    setIsModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      toast.error('제목과 내용을 입력해주세요.');
      return;
    }

    setSaving(true);
    const supabase = createClient();

    if (editingNotice) {
      await handleUpdateNotice(supabase);
    } else {
      await handleCreateNotice(supabase);
    }
    setSaving(false);
  }

  async function handleUpdateNotice(supabase: ReturnType<typeof createClient>) {
    if (!editingNotice) return;

    const { error } = await supabase
      .from('notices')
      .update({
        title: title.trim(),
        content: content.trim(),
        category,
        is_important: isImportant,
        is_published: isPublished,
      })
      .eq('id', editingNotice.id);

    if (error) {
      toast.error('수정에 실패했습니다.');
      logger.error('공지사항 수정 실패', error);
      return;
    }
    toast.success('공지사항이 수정되었습니다.');
    setIsModalOpen(false);
    fetchNotices();
  }

  async function handleCreateNotice(supabase: ReturnType<typeof createClient>) {
    const { data: newNotice, error } = await supabase
      .from('notices')
      .insert({
        title: title.trim(),
        content: content.trim(),
        category,
        is_important: isImportant,
        is_published: isPublished,
      })
      .select('id')
      .single();

    if (error) {
      toast.error('등록에 실패했습니다.');
      logger.error('공지사항 등록 실패', error);
      return;
    }

    toast.success('공지사항이 등록되었습니다.');

    // 공개 공지사항인 경우 전체 회원에게 알림 발송
    if (isPublished && newNotice?.id) {
      await sendNotificationToAllUsers(newNotice.id, title.trim());
    }

    setIsModalOpen(false);
    fetchNotices();
  }

  async function handleDelete(id: string) {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    const supabase = createClient();
    const { error } = await supabase.from('notices').delete().eq('id', id);

    if (error) {
      toast.error('삭제에 실패했습니다.');
      logger.error('공지사항 삭제 실패', error);
    } else {
      toast.success('공지사항이 삭제되었습니다.');
      fetchNotices();
    }
  }

  async function togglePublish(notice: Notice) {
    const supabase = createClient();
    const { error } = await supabase
      .from('notices')
      .update({ is_published: !notice.is_published })
      .eq('id', notice.id);

    if (error) {
      toast.error('상태 변경에 실패했습니다.');
    } else {
      toast.success(notice.is_published ? '비공개로 변경되었습니다.' : '공개로 변경되었습니다.');
      fetchNotices();
    }
  }

  const filteredNotices = notices.filter((notice) => {
    const matchesSearch =
      notice.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notice.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !filterCategory || notice.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">공지사항 관리</h1>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-dark transition-colors"
        >
          <Plus className="w-5 h-5" />
          공지 작성
        </button>
      </div>

      {/* 검색 및 필터 */}
      <div className="bg-white rounded-lg p-4 mb-6 flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="제목 또는 내용 검색"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary"
            aria-label="공지사항 검색"
          />
        </div>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary"
          aria-label="카테고리 필터"
        >
          <option value="">전체 카테고리</option>
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* 공지사항 목록 */}
      {loading && <div className="text-center py-12 text-gray-500">로딩 중...</div>}
      {!loading && filteredNotices.length === 0 && (
        <div className="text-center py-12 text-gray-500">공지사항이 없습니다.</div>
      )}
      {!loading && filteredNotices.length > 0 && (
        <div className="bg-white rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                  카테고리
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">제목</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">상태</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                  조회수
                </th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                  작성일
                </th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredNotices.map((notice) => (
                <tr key={notice.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex px-2 py-1 rounded text-xs font-semibold ${getCategoryColor(notice.category)}`}
                    >
                      {notice.category}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {notice.is_important && (
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      )}
                      <span className="font-medium">{notice.title}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => togglePublish(notice)}
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
                        notice.is_published
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {notice.is_published ? (
                        <>
                          <Eye className="w-3 h-3" /> 공개
                        </>
                      ) : (
                        <>
                          <EyeOff className="w-3 h-3" /> 비공개
                        </>
                      )}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-center text-sm text-gray-600">
                    {notice.view_count.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-center text-sm text-gray-600">
                    {new Date(notice.created_at).toLocaleDateString('ko-KR', {
                      timeZone: 'Asia/Seoul',
                    })}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => openEditModal(notice)}
                        className="p-1.5 text-gray-600 hover:text-brand-primary hover:bg-gray-100 rounded"
                        title="수정"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(notice.id)}
                        className="p-1.5 text-gray-600 hover:text-red-600 hover:bg-gray-100 rounded"
                        title="삭제"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 작성/수정 모달 */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">
                {editingNotice ? '공지사항 수정' : '공지사항 작성'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="notice-category"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    카테고리
                  </label>
                  <select
                    id="notice-category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-end gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isImportant}
                      onChange={(e) => setIsImportant(e.target.checked)}
                      className="w-4 h-4 text-brand-primary focus:ring-brand-primary border-gray-300 rounded"
                    />
                    <span className="text-sm">중요 공지</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isPublished}
                      onChange={(e) => setIsPublished(e.target.checked)}
                      className="w-4 h-4 text-brand-primary focus:ring-brand-primary border-gray-300 rounded"
                    />
                    <span className="text-sm">바로 공개</span>
                  </label>
                </div>
              </div>

              <div>
                <label
                  htmlFor="notice-title"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  제목
                </label>
                <input
                  id="notice-title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="공지사항 제목을 입력하세요"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  maxLength={200}
                />
              </div>

              <div>
                <label
                  htmlFor="notice-content"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  내용
                </label>
                <textarea
                  id="notice-content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="공지사항 내용을 입력하세요"
                  rows={10}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-dark disabled:opacity-50"
                >
                  {saving && '저장 중...'}
                  {!saving && editingNotice && '수정'}
                  {!saving && !editingNotice && '등록'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
