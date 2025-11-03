
import React from 'react';

const SearchIcon = () => (
    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
);

const Hero: React.FC = () => {
  return (
    <section className="py-20 md:py-32 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight">
          숨은 비용 없습니다
        </h1>
        <p className="mt-4 text-lg text-gray-600">
          구매 수수료 0원. 보이는 그대로 결제하세요.
        </p>
        <div className="mt-10 max-w-2xl mx-auto">
          <div className="relative">
            <input
              type="search"
              placeholder="어떤 재능이 필요하신가요?"
              className="w-full h-16 pl-6 pr-20 rounded-full border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
            />
            <button className="absolute right-3 top-1/2 -translate-y-1/2 w-12 h-12 bg-blue-900 rounded-full flex items-center justify-center hover:bg-blue-800 transition-colors">
              <SearchIcon />
            </button>
          </div>
        </div>
        <div className="mt-6 flex justify-center items-center flex-wrap gap-3">
          <button className="px-5 py-2 bg-blue-100 text-blue-800 font-semibold rounded-full text-sm flex items-center space-x-2">
            <span>🤖</span>
            <span>AI 서비스</span>
          </button>
          <button className="px-5 py-2 bg-gray-100 text-gray-700 font-medium rounded-full text-sm hover:bg-gray-200">
            IT/프로그래밍
          </button>
          <button className="px-5 py-2 bg-gray-100 text-gray-700 font-medium rounded-full text-sm hover:bg-gray-200">
            디자인
          </button>
          <button className="px-5 py-2 bg-gray-100 text-gray-700 font-medium rounded-full text-sm hover:bg-gray-200">
            마케팅
          </button>
          <button className="px-5 py-2 bg-gray-100 text-gray-700 font-medium rounded-full text-sm hover:bg-gray-200">
            글쓰기
          </button>
        </div>
      </div>
    </section>
  );
};

export default Hero;
