// src/components/home/HeroSection.tsx
import React from 'react';

const HeroSection: React.FC = () => {
  return (
    <section className="bg-gradient-to-r from-[#0f3460] to-[#1a527f] text-white py-20 text-center">
      <div className="container mx-auto px-4">
        <h1 className="text-5xl font-bold mb-4">재능 거래, 이제 <span className="text-yellow-300">수수료 없이</span>!</h1>
        <p className="text-xl mb-8">AI Talent Hub에서 당신의 재능을 100% 수익으로 전환하세요.</p>
        <button className="bg-white text-[#0f3460] font-bold py-3 px-8 rounded-full text-lg hover:bg-gray-100 transition duration-300">
          AI 재능 찾아보기
        </button>
      </div>
    </section>
  );
};

export default HeroSection;
