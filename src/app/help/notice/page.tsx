import { Star, ChevronRight, ChevronLeft } from 'lucide-react';

const notices = [
  {
    id: 1,
    category: '공지',
    title: '돌파구 서비스 정식 오픈 안내',
    date: '2025-10-27',
    important: true,
  },
  {
    id: 2,
    category: '이벤트',
    title: '신규 회원 가입 이벤트 - 첫 구매 10% 할인',
    date: '2025-10-26',
    important: false,
  },
  {
    id: 3,
    category: '업데이트',
    title: '서비스 개선 업데이트 안내',
    date: '2025-10-25',
    important: false,
  },
  {
    id: 4,
    category: '점검',
    title: '시스템 정기 점검 안내 (2025.10.30)',
    date: '2025-10-24',
    important: false,
  },
  {
    id: 5,
    category: '정책',
    title: '이용약관 및 개인정보처리방침 변경 안내',
    date: '2025-10-23',
    important: false,
  },
];

export default function NoticePage() {
  return (
    <div className="container-1200 py-16">
      <h1 className="text-3xl font-bold mb-8">공지사항</h1>

      <div className="max-w-4xl">
        {/* 공지사항 목록 */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {notices.map((notice, index) => (
            <div
              key={notice.id}
              className={`flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                index === notices.length - 1 ? '' : 'border-b border-gray-200'
              }`}
            >
              {/* 카테고리 */}
              <div className="flex-shrink-0">
                <span
                  className={`px-3 py-1 rounded text-xs font-semibold ${(() => {
                    if (notice.category === '공지') return 'bg-brand-primary text-white';
                    if (notice.category === '이벤트') return 'bg-green-100 text-green-800';
                    if (notice.category === '업데이트') return 'bg-blue-100 text-blue-800';
                    if (notice.category === '점검') return 'bg-yellow-100 text-yellow-800';
                    return 'bg-gray-100 text-gray-800';
                  })()}`}
                >
                  {notice.category}
                </span>
              </div>

              {/* 제목 */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  {notice.important && <Star className="w-4 h-4 text-yellow-500 fill-current flex-shrink-0" />}
                  <h3 className="font-semibold truncate">{notice.title}</h3>
                </div>
              </div>

              {/* 날짜 */}
              <div className="flex-shrink-0 text-sm text-gray-500">{notice.date}</div>

              {/* 화살표 */}
              <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
            </div>
          ))}
        </div>

        {/* 페이지네이션 */}
        <div className="flex justify-center gap-2 mt-8">
          <button className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-50">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button className="w-10 h-10 flex items-center justify-center bg-brand-primary text-white rounded">
            1
          </button>
          <button className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-50">
            2
          </button>
          <button className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-50">
            3
          </button>
          <button className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-50">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
