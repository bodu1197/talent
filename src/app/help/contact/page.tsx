'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/providers/AuthProvider';
import { createClient } from '@/lib/supabase/client';
import { CheckCircle, Loader2, ArrowRight, Send } from 'lucide-react';
import toast from 'react-hot-toast';

const CATEGORIES = [
  { value: 'account', label: '회원/계정' },
  { value: 'payment', label: '결제/환불' },
  { value: 'service', label: '서비스 이용' },
  { value: 'seller', label: '전문가' },
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

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50">
        <section className="bg-gradient-to-br from-brand-primary to-brand-dark text-white py-10 md:py-12">
          <div className="container-1200 px-4">
            <h1 className="text-2xl md:text-3xl font-bold">1:1 문의</h1>
          </div>
        </section>

        <section className="py-10 md:py-12">
          <div className="container-1200 px-4">
            <div className="max-w-md mx-auto text-center">
              <div className="bg-white rounded-lg border border-gray-200 p-8">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <h2 className="text-lg font-bold mb-2">문의가 접수되었습니다</h2>
                <p className="text-sm text-gray-600 mb-6">
                  빠른 시일 내에 {formData.email}로 답변드리겠습니다.
                  <br />
                  영업일 기준 1-2일 내에 답변이 발송됩니다.
                </p>
                <div className="flex gap-3 justify-center">
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
                    className="px-4 py-2 bg-brand-primary text-white text-sm font-medium rounded-lg hover:bg-brand-dark transition-colors"
                  >
                    추가 문의하기
                  </button>
                  <Link
                    href="/"
                    className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    홈으로
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-brand-primary to-brand-dark text-white py-10 md:py-12">
        <div className="container-1200 px-4">
          <h1 className="text-2xl md:text-3xl font-bold mb-3">1:1 문의</h1>
          <p className="text-base md:text-lg text-blue-100">궁금한 점이 있으시면 문의해주세요.</p>
        </div>
      </section>

      {/* Form */}
      <section className="py-10 md:py-12">
        <div className="container-1200 px-4">
          <div className="max-w-lg mx-auto">
            <form
              onSubmit={handleSubmit}
              className="bg-white rounded-lg border border-gray-200 p-6"
            >
              <div className="space-y-4">
                <div>
                  <label htmlFor="contact-name" className="block text-sm font-medium mb-1.5">
                    이름 <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="contact-name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary text-sm"
                    placeholder="이름을 입력하세요"
                    autoComplete="name"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="contact-email" className="block text-sm font-medium mb-1.5">
                    이메일 <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="contact-email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary text-sm"
                    placeholder="답변 받을 이메일을 입력하세요"
                    autoComplete="email"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="contact-category" className="block text-sm font-medium mb-1.5">
                    문의 유형 <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="contact-category"
                    name="category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary text-sm"
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

                <div>
                  <label htmlFor="contact-title" className="block text-sm font-medium mb-1.5">
                    제목 <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="contact-title"
                    name="title"
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary text-sm"
                    placeholder="문의 제목을 입력하세요"
                    autoComplete="off"
                    maxLength={200}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="contact-content" className="block text-sm font-medium mb-1.5">
                    문의 내용 <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="contact-content"
                    name="content"
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary text-sm h-36 resize-none"
                    placeholder="문의 내용을 상세히 입력해주세요"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 bg-brand-primary text-white rounded-lg hover:bg-brand-dark transition-colors text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      접수 중...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      문의하기
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Related Links */}
            <div className="mt-6 grid grid-cols-2 gap-3">
              <Link
                href="/help/faq"
                className="flex items-center justify-between bg-white rounded-lg p-3 border border-gray-200 hover:border-brand-primary transition-colors"
              >
                <span className="text-xs font-medium">자주 묻는 질문</span>
                <ArrowRight className="w-3 h-3 text-gray-400" />
              </Link>
              <Link
                href="/help"
                className="flex items-center justify-between bg-white rounded-lg p-3 border border-gray-200 hover:border-brand-primary transition-colors"
              >
                <span className="text-xs font-medium">고객센터</span>
                <ArrowRight className="w-3 h-3 text-gray-400" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
