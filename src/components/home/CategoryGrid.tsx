import Link from 'next/link';
import { getTopLevelCategories } from '@/lib/categories';
import CategoryGridClient from './CategoryGridClient';
import {
  Bot,
  Palette,
  Scissors,
  Code,
  Megaphone,
  Camera,
  Languages,
  PenTool,
  Briefcase,
  BookOpen,
  Music,
  Calendar,
  Sparkles,
  Target,
  Star,
  Library,
  Gavel,
  Hammer,
  GraduationCap,
  TrendingUp,
  Home,
  Bike,
  Activity,
  Circle,
} from 'lucide-react';

// Icon mapping using lookup table for O(1) access
const ICON_MAP: Record<string, React.ComponentType> = {
  robot: Bot,
  palette: Palette,
  scissors: Scissors,
  code: Code,
  bullhorn: Megaphone,
  camera: Camera,
  language: Languages,
  'pen-fancy': PenTool,
  briefcase: Briefcase,
  book: BookOpen,
  music: Music,
  calendar: Calendar,
  spa: Sparkles,
  bullseye: Target,
  star: Star,
  'book-open': Library,
  gavel: Gavel,
  hammer: Hammer,
  'graduation-cap': GraduationCap,
  'chart-line': TrendingUp,
  home: Home,
  motorcycle: Bike,
  running: Activity,
};

function CategoryIcon({ icon }: Readonly<{ icon?: string }>) {
  const IconComponent = (icon && ICON_MAP[icon]) || Circle;
  return <IconComponent />;
}

export default async function CategoryGrid() {
  // 데이터베이스에서 1단계 카테고리 가져오기
  const topLevelCategories = await getTopLevelCategories();

  const initialVisibleCount = 11;
  const categoriesInFirstRow = topLevelCategories.slice(0, initialVisibleCount);
  const remainingCategories = topLevelCategories.slice(initialVisibleCount);
  const hasMoreCategories = topLevelCategories.length > initialVisibleCount;

  const brightColors = [
    'text-red-500',
    'text-blue-500',
    'text-green-500',
    'text-yellow-500',
    'text-purple-500',
    'text-pink-500',
    'text-indigo-500',
    'text-teal-500',
    'text-orange-500',
    'text-cyan-500',
    'text-lime-500',
    'text-fuchsia-500',
  ];

  return (
    <section className="pt-2 pb-4 lg:py-8 bg-white">
      <div className="container-1200">
        {/* 모바일: 2줄 가로 스크롤 */}
        <div className="lg:hidden">
          <div className="flex flex-col gap-0">
            {/* 첫 번째 줄 */}
            <div className="flex gap-0 overflow-x-auto pb-2 scrollbar-hide">
              {topLevelCategories.slice(0, 11).map((category, index) => (
                <Link
                  key={category.id}
                  href={category.slug === 'errands' ? '/errands' : `/categories/${category.slug}`}
                  className="flex flex-col items-center group cursor-pointer flex-shrink-0 w-[76px]"
                >
                  <div
                    className={`text-[27px] mb-1 h-11 w-11 flex items-center justify-center rounded-full transition-all duration-200 ${brightColors[index % brightColors.length]} group-hover:text-brand-primary`}
                  >
                    <CategoryIcon icon={category.icon} />
                  </div>
                  <div className="text-gray-700 group-hover:text-brand-primary transition-colors duration-200 font-semibold text-mobile-sm text-center w-[76px] whitespace-nowrap px-0">
                    {category.name}
                  </div>
                </Link>
              ))}
            </div>

            {/* 두 번째 줄 */}
            <div className="flex gap-0 overflow-x-auto pb-2 scrollbar-hide">
              {topLevelCategories.slice(11).map((category, index) => (
                <Link
                  key={category.id}
                  href={category.slug === 'errands' ? '/errands' : `/categories/${category.slug}`}
                  className="flex flex-col items-center group cursor-pointer flex-shrink-0 w-[76px]"
                >
                  <div
                    className={`text-[27px] mb-1 h-11 w-11 flex items-center justify-center rounded-full transition-all duration-200 ${brightColors[(index + 11) % brightColors.length]} group-hover:text-brand-primary`}
                  >
                    <CategoryIcon icon={category.icon} />
                  </div>
                  <div className="text-gray-700 group-hover:text-brand-primary transition-colors duration-200 font-semibold text-mobile-sm text-center w-[76px] whitespace-nowrap px-0">
                    {category.name}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* PC: 클라이언트 컴포넌트 사용 */}
        <CategoryGridClient
          categoriesInFirstRow={categoriesInFirstRow}
          remainingCategories={remainingCategories}
          hasMoreCategories={hasMoreCategories}
          brightColors={brightColors}
        />
      </div>
    </section>
  );
}
