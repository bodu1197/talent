"use client";

import { useState } from "react";
import { FaSearch } from "react-icons/fa";

export default function TestSearchPage() {
  const [searchQuery1, setSearchQuery1] = useState("");
  const [searchQuery2, setSearchQuery2] = useState("");
  const [searchQuery3, setSearchQuery3] = useState("");
  const [searchQuery4, setSearchQuery4] = useState("");

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          검색창 Focus 스타일 테스트
        </h1>

        {/* 테스트 1: 현재 적용된 스타일 (ring-1 gray-300) */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4 text-gray-700">
            1. 현재 적용 (ring-1 + gray-300) ✅
          </h2>
          <form className="relative w-full max-w-[490px]" autoComplete="off">
            <input
              type="text"
              value={searchQuery1}
              onChange={(e) => setSearchQuery1(e.target.value)}
              placeholder="어떤 재능이 필요하신가요?"
              autoComplete="off"
              className="w-full px-6 py-4 pr-14 border-2 border-gray-300 rounded-full focus:rounded-full hover:border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-300 focus:border-gray-300 transition-all text-gray-900"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center text-gray-400 hover:text-blue-600 transition-colors rounded-full hover:bg-gray-100"
            >
              <FaSearch className="text-lg" />
            </button>
          </form>
        </div>

        {/* 테스트 2: 완전히 focus 제거 */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4 text-gray-700">
            2. Focus 완전 제거 ❌ (접근성 위반)
          </h2>
          <form className="relative w-full max-w-[490px]" autoComplete="off">
            <input
              type="text"
              value={searchQuery2}
              onChange={(e) => setSearchQuery2(e.target.value)}
              placeholder="어떤 재능이 필요하신가요?"
              autoComplete="off"
              className="w-full px-6 py-4 pr-14 border-2 border-gray-300 rounded-full hover:border-gray-300 focus:outline-none focus:border-gray-300 transition-all text-gray-900"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center text-gray-400 hover:text-blue-600 transition-colors rounded-full hover:bg-gray-100"
            >
              <FaSearch className="text-lg" />
            </button>
          </form>
        </div>

        {/* 테스트 3: Border 색상만 변경 */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4 text-gray-700">
            3. Border 색상만 변경 (gray-400)
          </h2>
          <form className="relative w-full max-w-[490px]" autoComplete="off">
            <input
              type="text"
              value={searchQuery3}
              onChange={(e) => setSearchQuery3(e.target.value)}
              placeholder="어떤 재능이 필요하신가요?"
              autoComplete="off"
              className="w-full px-6 py-4 pr-14 border-2 border-gray-300 rounded-full hover:border-gray-300 focus:outline-none focus:border-gray-400 transition-all text-gray-900"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center text-gray-400 hover:text-blue-600 transition-colors rounded-full hover:bg-gray-100"
            >
              <FaSearch className="text-lg" />
            </button>
          </form>
        </div>

        {/* 테스트 4: 원래 스타일 (ring-2 brand-primary) */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4 text-gray-700">
            4. 원래 스타일 (ring-2 + 파란색) - "못난이 네모칸"
          </h2>
          <form className="relative w-full max-w-[490px]" autoComplete="off">
            <input
              type="text"
              value={searchQuery4}
              onChange={(e) => setSearchQuery4(e.target.value)}
              placeholder="어떤 재능이 필요하신가요?"
              autoComplete="off"
              className="w-full px-6 py-4 pr-14 border-2 border-gray-300 rounded-full hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-gray-300 transition-all text-gray-900"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center text-gray-400 hover:text-blue-600 transition-colors rounded-full hover:bg-gray-100"
            >
              <FaSearch className="text-lg" />
            </button>
          </form>
        </div>

        {/* 설명 */}
        <div className="bg-blue-50 p-6 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-3">테스트 방법:</h3>
          <ul className="space-y-2 text-gray-700">
            <li>• 각 검색창을 클릭해보세요</li>
            <li>• Chrome DevTools (F12)를 열고 Elements 탭을 보세요</li>
            <li>• Styles 패널에서 CSS 변화를 관찰하세요</li>
            <li>• Tab 키로 이동하면서 focus indicator를 확인하세요</li>
            <li>• 1번이 가장 깔끔하면서도 접근성을 지킵니다! ✅</li>
          </ul>
        </div>

        {/* 비교표 */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="font-semibold text-gray-900 mb-4">비교 결과:</h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2">
                <th className="text-left p-2">스타일</th>
                <th className="text-center p-2">시각적 변화</th>
                <th className="text-center p-2">접근성</th>
                <th className="text-center p-2">결과</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="p-2">1. ring-1 gray-300</td>
                <td className="text-center p-2">⭐⭐⭐⭐⭐</td>
                <td className="text-center p-2">✅</td>
                <td className="text-center p-2">🏆 최고</td>
              </tr>
              <tr className="border-b">
                <td className="p-2">2. Focus 제거</td>
                <td className="text-center p-2">⭐⭐⭐⭐⭐</td>
                <td className="text-center p-2">❌</td>
                <td className="text-center p-2">💔 위반</td>
              </tr>
              <tr className="border-b">
                <td className="p-2">3. Border 변경</td>
                <td className="text-center p-2">⭐⭐⭐</td>
                <td className="text-center p-2">⚠️</td>
                <td className="text-center p-2">🤔 애매</td>
              </tr>
              <tr>
                <td className="p-2">4. 원래 (파란색)</td>
                <td className="text-center p-2">⭐</td>
                <td className="text-center p-2">✅</td>
                <td className="text-center p-2">😭 못난이</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
