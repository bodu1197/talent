import Link from "next/link";
import { getTopLevelCategories } from "@/lib/categories";
import {
  FaRobot,
  FaLaptopCode,
  FaPalette,
  FaBullhorn,
  FaVideo,
  FaBriefcase,
  FaThLarge,
} from "react-icons/fa";

// 카테고리 아이콘 매핑
const categoryIcons: Record<string, React.ReactNode> = {
  "ai-services": <FaRobot className="text-lg" aria-hidden="true" />,
  "it-programming": <FaLaptopCode className="text-lg" aria-hidden="true" />,
  design: <FaPalette className="text-lg" aria-hidden="true" />,
  marketing: <FaBullhorn className="text-lg" aria-hidden="true" />,
  "video-photo": <FaVideo className="text-lg" aria-hidden="true" />,
  business: <FaBriefcase className="text-lg" aria-hidden="true" />,
};

export default async function CategoryBar() {
  const topLevelCategories = await getTopLevelCategories();

  return (
    <div className="bg-white border-b border-gray-200 fixed top-16 left-0 right-0 z-40">
      <div className="container-1200 px-4 sm:px-6 lg:px-8">
        {/* PC: 가로 스크롤 카테고리 */}
        <div className="hidden lg:flex items-center gap-6 overflow-x-auto py-3 scrollbar-hide">
          {/* 전체 카테고리 */}
          <Link
            href="/categories"
            className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-brand-primary hover:bg-gray-50 rounded-lg transition-colors whitespace-nowrap font-medium focus:ring-2 focus:ring-brand-primary focus:outline-none"
            aria-label="전체 카테고리 보기"
          >
            <FaThLarge className="text-lg" aria-hidden="true" />
            <span>전체 카테고리</span>
          </Link>

          {/* 개별 카테고리 */}
          {topLevelCategories.map((category) => (
            <Link
              key={category.id}
              href={`/categories/${category.slug}`}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-brand-primary hover:bg-gray-50 rounded-lg transition-colors whitespace-nowrap font-medium focus:ring-2 focus:ring-brand-primary focus:outline-none"
              aria-label={`${category.name} 카테고리로 이동`}
            >
              {categoryIcons[category.slug] || null}
              <span>{category.name}</span>
            </Link>
          ))}
        </div>

        {/* 모바일/태블릿: 2줄 그리드 */}
        <div className="lg:hidden grid grid-cols-4 gap-2 py-3">
          {/* 전체 카테고리 */}
          <Link
            href="/categories"
            className="flex flex-col items-center gap-1 p-2 text-gray-700 hover:text-brand-primary hover:bg-gray-50 rounded-lg transition-colors focus:ring-2 focus:ring-brand-primary focus:outline-none"
            aria-label="전체 카테고리 보기"
          >
            <FaThLarge className="text-xl" aria-hidden="true" />
            <span className="text-xs font-medium text-center">전체</span>
          </Link>

          {/* 개별 카테고리 (최대 7개) */}
          {topLevelCategories.slice(0, 7).map((category) => (
            <Link
              key={category.id}
              href={`/categories/${category.slug}`}
              className="flex flex-col items-center gap-1 p-2 text-gray-700 hover:text-brand-primary hover:bg-gray-50 rounded-lg transition-colors focus:ring-2 focus:ring-brand-primary focus:outline-none"
              aria-label={`${category.name} 카테고리로 이동`}
            >
              {categoryIcons[category.slug] || (
                <FaThLarge className="text-xl" aria-hidden="true" />
              )}
              <span className="text-xs font-medium text-center line-clamp-1">
                {category.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
