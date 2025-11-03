
import React from 'react';

const categories = [
  { name: '생활 서비스', icon: '🏠' },
  { name: '심부름', icon: '🚲' },
  { name: 'AI 서비스', icon: '🤖' },
  { name: '디자인', icon: '🎨' },
  { name: 'IT/프로그래밍', icon: '</>' },
  { name: '마케팅', icon: '📢' },
  { name: '영상/사진', icon: '📷' },
  { name: '번역/통역', icon: '🌐' },
  { name: '문서/글쓰기', icon: '✍️' },
  { name: '음악/오디오', icon: '🎵' },
  { name: '비즈니스', icon: '💼' },
  { name: '전체 보기', icon: '▦' },
];

const CategoryItem: React.FC<{ name: string; icon: string }> = ({ name, icon }) => (
  <a href="#" className="flex flex-col items-center justify-center space-y-2 text-center group">
    <div className={`text-3xl p-4 rounded-lg flex items-center justify-center ${icon === '▦' ? 'bg-gray-200' : ''}`}>
      {icon}
    </div>
    <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600">{name}</span>
  </a>
);

const Categories: React.FC = () => {
  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-12 gap-y-8 gap-x-4">
          {categories.map((category) => (
            <CategoryItem key={category.name} name={category.name} icon={category.icon} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Categories;
