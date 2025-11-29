'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Search, Eye, MessageSquare, Clock, CheckCircle, Loader2, X, Mail } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Inquiry {
  id: string;
  user_id: string | null;
  name: string;
  email: string;
  category: string;
  title: string;
  content: string;
  status: string;
  admin_reply: string | null;
  replied_at: string | null;
  created_at: string;
}

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  pending: { label: '대기 중', color: 'bg-yellow-100 text-yellow-800' },
  in_progress: { label: '처리 중', color: 'bg-blue-100 text-blue-800' },
  resolved: { label: '답변 완료', color: 'bg-green-100 text-green-800' },
  closed: { label: '종료', color: 'bg-gray-100 text-gray-800' },
};

const CATEGORY_MAP: Record<string, string> = {
  account: '회원/계정',
  payment: '결제/환불',
  service: '서비스 이용',
  seller: '판매자',
  technical: '기술적 문제',
  other: '기타',
};

export default function AdminInquiriesPage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterCategory, setFilterCategory] = useState('');

  // Modal states
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [replying, setReplying] = useState(false);

  useEffect(() => {
    fetchInquiries();
  }, []);

  async function fetchInquiries() {
    setLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase
      .from('inquiries')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('문의를 불러오는데 실패했습니다.');
      console.error(error);
    } else {
      setInquiries(data || []);
    }
    setLoading(false);
  }

  function openDetailModal(inquiry: Inquiry) {
    setSelectedInquiry(inquiry);
    setReplyContent(inquiry.admin_reply || '');
  }

  async function handleReply() {
    if (!selectedInquiry || !replyContent.trim()) {
      toast.error('답변 내용을 입력해주세요.');
      return;
    }

    setReplying(true);
    const supabase = createClient();

    const { error } = await supabase
      .from('inquiries')
      .update({
        admin_reply: replyContent.trim(),
        status: 'resolved',
        replied_at: new Date().toISOString(),
      })
      .eq('id', selectedInquiry.id);

    if (error) {
      toast.error('답변 저장에 실패했습니다.');
      console.error(error);
    } else {
      toast.success('답변이 저장되었습니다.');
      setSelectedInquiry(null);
      fetchInquiries();
    }
    setReplying(false);
  }

  async function updateStatus(inquiryId: string, newStatus: string) {
    const supabase = createClient();
    const { error } = await supabase
      .from('inquiries')
      .update({ status: newStatus })
      .eq('id', inquiryId);

    if (error) {
      toast.error('상태 변경에 실패했습니다.');
    } else {
      toast.success('상태가 변경되었습니다.');
      fetchInquiries();
    }
  }

  const filteredInquiries = inquiries.filter((inquiry) => {
    const matchesSearch =
      inquiry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inquiry.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inquiry.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = !filterStatus || inquiry.status === filterStatus;
    const matchesCategory = !filterCategory || inquiry.category === filterCategory;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const pendingCount = inquiries.filter((i) => i.status === 'pending').length;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">1:1 문의 관리</h1>
          {pendingCount > 0 && (
            <span className="px-3 py-1 bg-red-500 text-white text-sm font-semibold rounded-full">
              {pendingCount}건 대기
            </span>
          )}
        </div>
      </div>

      {/* 검색 및 필터 */}
      <div className="bg-white rounded-lg p-4 mb-6 flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="제목, 이름, 이메일 검색"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary"
        >
          <option value="">전체 상태</option>
          {Object.entries(STATUS_MAP).map(([key, { label }]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary"
        >
          <option value="">전체 유형</option>
          {Object.entries(CATEGORY_MAP).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {/* 문의 목록 */}
      {loading && <div className="text-center py-12 text-gray-500">로딩 중...</div>}
      {!loading && filteredInquiries.length === 0 && (
        <div className="text-center py-12 text-gray-500">문의가 없습니다.</div>
      )}
      {!loading && filteredInquiries.length > 0 && (
        <div className="bg-white rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">상태</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">유형</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">제목</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">작성자</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                  접수일
                </th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredInquiries.map((inquiry) => (
                <tr key={inquiry.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold ${STATUS_MAP[inquiry.status]?.color || 'bg-gray-100'}`}
                    >
                      {inquiry.status === 'pending' && <Clock className="w-3 h-3" />}
                      {inquiry.status === 'resolved' && <CheckCircle className="w-3 h-3" />}
                      {STATUS_MAP[inquiry.status]?.label || inquiry.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {CATEGORY_MAP[inquiry.category] || inquiry.category}
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-medium">{inquiry.title}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm">
                      <p className="font-medium">{inquiry.name}</p>
                      <p className="text-gray-500 text-xs">{inquiry.email}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center text-sm text-gray-600">
                    {new Date(inquiry.created_at).toLocaleDateString('ko-KR')}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => openDetailModal(inquiry)}
                        className="p-1.5 text-gray-600 hover:text-brand-primary hover:bg-gray-100 rounded"
                        title="상세 보기"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <a
                        href={`mailto:${inquiry.email}?subject=Re: ${encodeURIComponent(inquiry.title)}`}
                        className="p-1.5 text-gray-600 hover:text-brand-primary hover:bg-gray-100 rounded"
                        title="이메일 보내기"
                      >
                        <Mail className="w-4 h-4" />
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 상세/답변 모달 */}
      {selectedInquiry && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">문의 상세</h2>
              <button
                onClick={() => setSelectedInquiry(null)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              {/* 상태 변경 */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">상태:</span>
                <select
                  value={selectedInquiry.status}
                  onChange={(e) => {
                    updateStatus(selectedInquiry.id, e.target.value);
                    setSelectedInquiry({ ...selectedInquiry, status: e.target.value });
                  }}
                  className="px-3 py-1 border rounded text-sm"
                >
                  {Object.entries(STATUS_MAP).map(([key, { label }]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              {/* 문의 정보 */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">작성자:</span>
                    <span className="ml-2 font-medium">{selectedInquiry.name}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">이메일:</span>
                    <span className="ml-2">{selectedInquiry.email}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">유형:</span>
                    <span className="ml-2">
                      {CATEGORY_MAP[selectedInquiry.category] || selectedInquiry.category}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">접수일:</span>
                    <span className="ml-2">
                      {new Date(selectedInquiry.created_at).toLocaleString('ko-KR')}
                    </span>
                  </div>
                </div>

                <div className="border-t pt-3">
                  <h4 className="font-semibold mb-2">{selectedInquiry.title}</h4>
                  <p className="text-gray-700 whitespace-pre-wrap">{selectedInquiry.content}</p>
                </div>
              </div>

              {/* 답변 영역 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MessageSquare className="w-4 h-4 inline mr-1" />
                  관리자 답변
                </label>
                <textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="답변 내용을 입력하세요..."
                  rows={6}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary resize-none"
                />
                {selectedInquiry.replied_at && (
                  <p className="text-xs text-gray-500 mt-1">
                    마지막 답변: {new Date(selectedInquiry.replied_at).toLocaleString('ko-KR')}
                  </p>
                )}
              </div>

              {/* 버튼 */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  onClick={() => setSelectedInquiry(null)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  닫기
                </button>
                <a
                  href={`mailto:${selectedInquiry.email}?subject=Re: ${encodeURIComponent(selectedInquiry.title)}&body=${encodeURIComponent(replyContent)}`}
                  className="px-4 py-2 border border-brand-primary text-brand-primary rounded-lg hover:bg-brand-primary/10"
                >
                  이메일로 발송
                </a>
                <button
                  onClick={handleReply}
                  disabled={replying || !replyContent.trim()}
                  className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-dark disabled:opacity-50 flex items-center gap-2"
                >
                  {replying && <Loader2 className="w-4 h-4 animate-spin" />}
                  답변 저장
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
