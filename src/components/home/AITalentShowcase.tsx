// src/components/home/AITalentShowcase.tsx
import React from 'react';

const AITalentShowcase: React.FC = () => {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold mb-8">AI 재능 쇼케이스</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-2">AI 이미지 생성</h3>
            <p className="text-gray-600">Midjourney, Stable Diffusion 전문가</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-2">AI 영상 제작</h3>
            <p className="text-gray-600">AI 기반 영상 편집 및 모션 그래픽</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-2">AI 글쓰기/콘텐츠</h3>
            <p className="text-gray-600">ChatGPT 활용 블로그, 기사 작성</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AITalentShowcase;
