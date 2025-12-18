'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Plus, Edit, Trash2, Eye, EyeOff, Search, X, MessageCircle, ChevronUp, ChevronDown } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface FAQ {
  id: string;
  category: string;
  question: string;
  answer: string;
  keywords: string[];
  priority: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const CATEGORIES = ['수수료', '판매자', '구매', '결제', '계정', '채팅', '심부름', '신고', '기타', '서비스 이용', '고객지원'];

function getCategoryColor(cat: string) {
  const colors: Record<string, string> = {
    '수수료': 'bg-green-100 text-green-800',
    '판매자': 'bg-blue-100 text-blue-800',
    '구매': 'bg-purple-100 text-purple-800',
    '결제': 'bg-yellow-100 text-yellow-800',
    '계정': 'bg-gray-100 text-gray-800',
    '채팅': 'bg-pink-100 text-pink-800',
    '심부름': 'bg-orange-100 text-orange-800',
    '신고': 'bg-red-100 text-red-800',
    '기타': 'bg-slate-100 text-slate-800',
    '서비스 이용': 'bg-indigo-100 text-indigo-800',
    '고객지원': 'bg-cyan-100 text-cyan-800',
  };
  return colors[cat] || 'bg-gray-100 text-gray-800';
}

export default function AdminFAQPage() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  
  // 모달 상태
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<FAQ | null>(null);
  
  // 폼 상태
  const [formData, setFormData] = useState({
    category: '기타',
    question: '',
    answer: '',
    keywords: '',
    priority: 50,
    is_active: true,
  });

  const fetchFaqs = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();
    
    let query = supabase
      .from('ai_support_knowledge')
      .select('*')
      .order('priority', { ascending: false })
      .order('created_at', { ascending: false });
    
    if (selectedCategory) {
      query = query.eq('category', selectedCategory);
    }
    
    const { data, error } = await query;
    
    if (error) {
      toast.error('FAQ 목록을 불러오는데 실패했습니다.');
      console.error(error);
    } else {
      setFaqs(data || []);
    }
    setLoading(false);
  }, [selectedCategory]);

  useEffect(() => {
    fetchFaqs();
  }, [fetchFaqs]);

  const openCreateModal = () => {
    setEditingFaq(null);
    setFormData({
      category: '기타',
      question: '',
      answer: '',
      keywords: '',
      priority: 50,
      is_active: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (faq: FAQ) => {
    setEditingFaq(faq);
    setFormData({
      category: faq.category,
      question: faq.question,
      answer: faq.answer,
      keywords: faq.keywords.join(', '),
      priority: faq.priority,
      is_active: faq.is_active,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.question.trim() || !formData.answer.trim()) {
      toast.error('질문과 답변을 입력해주세요.');
      return;
    }

    const supabase = createClient();
    const keywordsArray = formData.keywords
      .split(',')
      .map(k => k.trim())
      .filter(k => k.length > 0);

    const faqData = {
      category: formData.category,
      question: formData.question.trim(),
      answer: formData.answer.trim(),
      keywords: keywordsArray,
      priority: formData.priority,
      is_active: formData.is_active,
    };

    if (editingFaq) {
      // 수정
      const { error } = await supabase
        .from('ai_support_knowledge')
        .update(faqData)
        .eq('id', editingFaq.id);

      if (error) {
        toast.error('FAQ 수정에 실패했습니다.');
        console.error(error);
      } else {
        toast.success('FAQ가 수정되었습니다.');
        setIsModalOpen(false);
        fetchFaqs();
      }
    } else {
      // 생성
      const { error } = await supabase
        .from('ai_support_knowledge')
        .insert(faqData);

      if (error) {
        toast.error('FAQ 추가에 실패했습니다.');
        console.error(error);
      } else {
        toast.success('FAQ가 추가되었습니다.');
        setIsModalOpen(false);
        fetchFaqs();
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('정말 이 FAQ를 삭제하시겠습니까?')) return;

    const supabase = createClient();
    const { error } = await supabase
      .from('ai_support_knowledge')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('FAQ 삭제에 실패했습니다.');
      console.error(error);
    } else {
      toast.success('FAQ가 삭제되었습니다.');
      fetchFaqs();
    }
  };

  const toggleActive = async (faq: FAQ) => {
    const supabase = createClient();
    const { error } = await supabase
      .from('ai_support_knowledge')
      .update({ is_active: !faq.is_active })
      .eq('id', faq.id);

    if (error) {
      toast.error('상태 변경에 실패했습니다.');
    } else {
      toast.success(faq.is_active ? 'FAQ가 비활성화되었습니다.' : 'FAQ가 활성화되었습니다.');
      fetchFaqs();
    }
  };

  const updatePriority = async (faq: FAQ, delta: number) => {
    const newPriority = Math.max(0, Math.min(100, faq.priority + delta));
    const supabase = createClient();
    const { error } = await supabase
      .from('ai_support_knowledge')
      .update({ priority: newPriority })
      .eq('id', faq.id);

    if (error) {
      toast.error('우선순위 변경에 실패했습니다.');
    } else {
      fetchFaqs();
    }
  };

  // 필터링된 FAQ
  const filteredFaqs = faqs.filter(faq => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      faq.question.toLowerCase().includes(query) ||
      faq.answer.toLowerCase().includes(query) ||
      faq.keywords.some(k => k.toLowerCase().includes(query))
    );
  });

  // 카테고리별 통계
  const categoryStats = faqs.reduce((acc, faq) => {
    acc[faq.category] = (acc[faq.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="p-6">
      {/* 헤더 */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <MessageCircle className="w-6 h-6 text-blue-600" />
            AI 챗봇 FAQ 관리
          </h1>
          <p className="text-gray-600 mt-1">
            AI 고객지원 챗봇의 지식베이스를 관리합니다. 총 {faqs.length}개 FAQ
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          <Plus className="w-5 h-5" />
          FAQ 추가
        </button>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
        {Object.entries(categoryStats).slice(0, 6).map(([category, count]) => (
          <div
            key={category}
            className={`p-3 rounded-lg cursor-pointer transition hover:scale-105 ${
              selectedCategory === category ? 'ring-2 ring-blue-500' : ''
            } ${getCategoryColor(category)}`}
            onClick={() => setSelectedCategory(selectedCategory === category ? '' : category)}
          >
            <div className="text-lg font-bold">{count}</div>
            <div className="text-sm">{category}</div>
          </div>
        ))}
      </div>

      {/* 검색 및 필터 */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="질문, 답변, 키워드 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="">전체 카테고리</option>
          {CATEGORIES.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* FAQ 목록 */}
      {loading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">로딩 중...</p>
        </div>
      )}
      
      {!loading && filteredFaqs.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">등록된 FAQ가 없습니다.</p>
        </div>
      )}
      
      {!loading && filteredFaqs.length > 0 && (
        <div className="space-y-4">
          {filteredFaqs.map((faq) => (
            <div
              key={faq.id}
              className={`bg-white rounded-lg border p-4 ${
                faq.is_active ? 'border-gray-200' : 'border-red-200 bg-red-50/30'
              }`}
            >
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getCategoryColor(faq.category)}`}>
                      {faq.category}
                    </span>
                    <span className="text-xs text-gray-500">우선순위: {faq.priority}</span>
                    {!faq.is_active && (
                      <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs">비활성</span>
                    )}
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Q: {faq.question}</h3>
                  <p className="text-gray-600 text-sm whitespace-pre-wrap line-clamp-3">
                    A: {faq.answer}
                  </p>
                  {faq.keywords.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {faq.keywords.map((keyword, idx) => (
                        <span key={idx} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                          #{keyword}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  {/* 우선순위 조절 */}
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={() => updatePriority(faq, 10)}
                      className="p-1 hover:bg-gray-100 rounded"
                      title="우선순위 올리기"
                    >
                      <ChevronUp className="w-5 h-5 text-gray-600" />
                    </button>
                    <button
                      onClick={() => updatePriority(faq, -10)}
                      className="p-1 hover:bg-gray-100 rounded"
                      title="우선순위 내리기"
                    >
                      <ChevronDown className="w-5 h-5 text-gray-600" />
                    </button>
                  </div>
                  {/* 액션 버튼 */}
                  <div className="flex gap-1">
                    <button
                      onClick={() => toggleActive(faq)}
                      className={`p-2 rounded ${faq.is_active ? 'hover:bg-gray-100' : 'hover:bg-green-100'}`}
                      title={faq.is_active ? '비활성화' : '활성화'}
                    >
                      {faq.is_active ? (
                        <Eye className="w-5 h-5 text-green-600" />
                      ) : (
                        <EyeOff className="w-5 h-5 text-gray-400" />
                      )}
                    </button>
                    <button
                      onClick={() => openEditModal(faq)}
                      className="p-2 hover:bg-blue-100 rounded"
                      title="수정"
                    >
                      <Edit className="w-5 h-5 text-blue-600" />
                    </button>
                    <button
                      onClick={() => handleDelete(faq.id)}
                      className="p-2 hover:bg-red-100 rounded"
                      title="삭제"
                    >
                      <Trash2 className="w-5 h-5 text-red-600" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 모달 */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
              <h2 className="text-xl font-bold">
                {editingFaq ? 'FAQ 수정' : '새 FAQ 추가'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              {/* 카테고리 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  카테고리 *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* 질문 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  질문 *
                </label>
                <input
                  type="text"
                  value={formData.question}
                  onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                  placeholder="예: 수수료가 얼마인가요?"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* 답변 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  답변 *
                </label>
                <textarea
                  value={formData.answer}
                  onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                  placeholder="마크다운 형식으로 작성 가능합니다. 예: **강조**, - 목록"
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* 키워드 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  키워드 (쉼표로 구분)
                </label>
                <input
                  type="text"
                  value={formData.keywords}
                  onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                  placeholder="예: 수수료, 비용, 무료, 공짜"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  사용자 질문에 이 키워드가 포함되면 이 FAQ가 참고됩니다.
                </p>
              </div>

              {/* 우선순위 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  우선순위 (0-100)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  숫자가 높을수록 더 중요한 FAQ로 먼저 검색됩니다.
                </p>
              </div>

              {/* 활성화 */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <label htmlFor="is_active" className="text-sm text-gray-700">
                  활성화 (체크 해제 시 AI가 이 FAQ를 참고하지 않습니다)
                </label>
              </div>

              {/* 버튼 */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editingFaq ? '수정하기' : '추가하기'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
