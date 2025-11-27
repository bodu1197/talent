// src/components/home/TrendingServices.tsx
import React from 'react';

const TrendingServices: React.FC = () => {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl font-semibold mb-8">인기 재능</h2>
        <p className="text-gray-600 mb-12">지금 가장 인기 있는 재능들을 확인해보세요.</p>
        {/* Placeholder for trending service cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md h-48 flex items-center justify-center text-gray-500">
            인기 서비스 카드 1
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md h-48 flex items-center justify-center text-gray-500">
            인기 서비스 카드 2
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md h-48 flex items-center justify-center text-gray-500">
            인기 서비스 카드 3
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md h-48 flex items-center justify-center text-gray-500">
            인기 서비스 카드 4
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrendingServices;
