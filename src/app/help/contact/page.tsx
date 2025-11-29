'use client';

import { useState } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { createClient } from '@/lib/supabase/client';
import { Clock, Phone, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const CATEGORIES = [
  { value: 'account', label: '회원/계정' },
  { value: 'payment', label: '결제/환불' },
  { value: 'service', label: '서비스 이용' },
  { value: 'seller', label: '판매자' },
  { value: 'technical', label: '기술적 문제' },
  { value: 'other', label: '기타' },
];

export default function ContactPage() {
  const { user, profile } = useAuth();
  const [formData, setFormData] = useState({
    name: profile?.name || '',
    email: user?.email || '',
    category: '',
    title: '',
    content: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.name ||
      !formData.email ||
      !formData.category ||
      !formData.title ||
      !formData.content
    ) {
      toast.error('모든 필수 항목을 입력해주세요.');
      return;
    }

    setSubmitting(true);

    try {
      const supabase = createClient();

      const { error } = await supabase.from('inquiries').insert({
        user_id: user?.id || null,
        name: formData.name.trim(),
        email: formData.email.trim(),
        category: formData.category,
        title: formData.title.trim(),
        content: formData.content.trim(),
        status: 'pending',
      });

      if (error) {
        console.error('문의 저장 실패:', error);
        toast.error('문의 접수에 실패했습니다. 잠시 후 다시 시도해주세요.');
        return;
      }

      setSubmitted(true);
      toast.success('문의가 접수되었습니다.');
    } catch (err) {
      console.error('문의 저장 오류:', err);
      toast.error('문의 접수 중 오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  // 제출 완료 화면
  if (submitted) {
    return (
      <div className="container-1200 py-16">
        <div className="max-w-xl mx-auto text-center">
          <div className="bg-white rounded-lg border border-gray-200 p-12">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6" />
            <h1 className="text-2xl font-bold mb-4">문의가 접수되었습니다</h1>
            <p className="text-gray-600 mb-6">
              빠른 시일 내에 입력하신 이메일({formData.email})로 답변드리겠습니다.
              <br />
              영업일 기준 1-2일 내에 답변이 발송됩니다.
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => {
                  setSubmitted(false);
                  setFormData({
                    name: profile?.name || '',
                    email: user?.email || '',
                    category: '',
                    title: '',
                    content: '',
                  });
                }}
                className="px-6 py-3 bg-brand-primary text-white rounded-lg hover:bg-brand-dark transition-colors"
              >
                추가 문의하기
              </button>
              <a
                href="/"
                className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                홈으로
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-1200 py-16">
      <h1 className="text-3xl font-semibold mb-8">1:1 문의</h1>

      <div className="max-w-4xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 문의 폼 */}
          <div className="lg:col-span-2">
            <form
              onSubmit={handleSubmit}
              className="bg-white rounded-lg border border-gray-200 p-8"
            >
              <div className="space-y-6">
                {/* 이름 */}
                <div>
                  <label htmlFor="contact-name" className="block text-sm font-medium mb-2">
                    이름 <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="contact-name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary"
                    placeholder="이름을 입력하세요"
                    autoComplete="name"
                    required
                  />
                </div>

                {/* 이메일 */}
                <div>
                  <label htmlFor="contact-email" className="block text-sm font-medium mb-2">
                    이메일 <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="contact-email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary"
                    placeholder="답변 받을 이메일을 입력하세요"
                    autoComplete="email"
                    required
                  />
                </div>

                {/* 문의 유형 */}
                <div>
                  <label htmlFor="contact-category" className="block text-sm font-medium mb-2">
                    문의 유형 <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="contact-category"
                    name="category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary"
                    required
                  >
                    <option value="">선택하세요</option>
                    {CATEGORIES.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 제목 */}
                <div>
                  <label htmlFor="contact-title" className="block text-sm font-medium mb-2">
                    제목 <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="contact-title"
                    name="title"
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary"
                    placeholder="문의 제목을 입력하세요"
                    autoComplete="off"
                    maxLength={200}
                    required
                  />
                </div>

                {/* 내용 */}
                <div>
                  <label htmlFor="contact-content" className="block text-sm font-medium mb-2">
                    문의 내용 <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="contact-content"
                    name="content"
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary h-48 resize-none"
                    placeholder="문의 내용을 상세히 입력해주세요"
                    required
                  />
                </div>

                {/* 제출 버튼 */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-4 bg-brand-primary text-white rounded-lg hover:bg-opacity-90 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitting && <Loader2 className="w-5 h-5 animate-spin" />}
                  {submitting ? '접수 중...' : '문의하기'}
                </button>
              </div>
            </form>
          </div>

          {/* 안내 */}
          <div className="space-y-6">
            {/* 운영 시간 */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-brand-primary" />
                운영 시간
              </h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>평일</span>
                  <span className="font-semibold">09:00 - 18:00</span>
                </div>
                <div className="flex justify-between">
                  <span>주말/공휴일</span>
                  <span className="font-semibold">휴무</span>
                </div>
                <div className="border-t border-gray-200 my-3"></div>
                <p className="text-xs text-gray-500">
                  * 점심시간: 12:00 - 13:00
                  <br />* 운영시간 외 문의는 익일 순차적으로 답변됩니다.
                </p>
              </div>
            </div>

            {/* 연락처 */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Phone className="w-5 h-5 text-brand-primary" />
                연락처
              </h3>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-gray-600 mb-1">전화</p>
                  <p className="font-semibold text-brand-primary">1234-5678</p>
                </div>
                <div>
                  <p className="text-gray-600 mb-1">이메일</p>
                  <p className="font-semibold text-brand-primary">support@dolpagu.com</p>
                </div>
              </div>
            </div>

            {/* 유의사항 */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <h3 className="font-semibold mb-3 flex items-center gap-2 text-sm">
                <AlertCircle className="w-4 h-4 text-yellow-600" />
                유의사항
              </h3>
              <ul className="space-y-2 text-xs text-gray-700">
                <li>• 문의 답변은 영업일 기준 1-2일 소요됩니다.</li>
                <li>• 정확한 답변을 위해 상세한 내용을 기재해주세요.</li>
                <li>• 등록한 이메일로 답변이 발송됩니다.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
