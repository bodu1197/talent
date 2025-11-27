// src/components/home/PremiumPlacements.tsx
import React from 'react';

const PremiumPlacements: React.FC = () => {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl font-semibold mb-8">프리미엄 재능</h2>
        <p className="text-gray-600 mb-12">엄선된 최고의 전문가들을 만나보세요.</p>
        {/* Placeholder for premium service cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-gray-100 p-6 rounded-lg shadow-md h-48 flex items-center justify-center text-gray-500">
            프리미엄 서비스 카드 1
          </div>
          <div className="bg-gray-100 p-6 rounded-lg shadow-md h-48 flex items-center justify-center text-gray-500">
            프리미엄 서비스 카드 2
          </div>
          <div className="bg-gray-100 p-6 rounded-lg shadow-md h-48 flex items-center justify-center text-gray-500">
            프리미엄 서비스 카드 3
          </div>
        </div>
      </div>
    </section>
  );
};

export default PremiumPlacements;
