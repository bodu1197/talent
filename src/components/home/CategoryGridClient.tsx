"use client";

import { useState } from "react";
import Link from "next/link";
import {
  FaRobot,
  FaPalette,
  FaCut,
  FaCode,
  FaBullhorn,
  FaCamera,
  FaLanguage,
  FaPenFancy,
  FaBriefcase,
  FaBook,
  FaMusic,
  FaCalendar,
  FaSpa,
  FaBullseye,
  FaStar,
  FaBookOpen,
  FaGavel,
  FaHammer,
  FaGraduationCap,
  FaChartLine,
  FaHome,
  FaMotorcycle,
  FaCircle,
  FaMinus,
  FaTh,
} from "react-icons/fa";

interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
}

interface Props {
  categoriesInFirstRow: Category[];
  remainingCategories: Category[];
  hasMoreCategories: boolean;
  brightColors: string[];
  initialVisibleCount: number;
}

// Icon mapping using lookup table for O(1) access
const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  robot: FaRobot,
  palette: FaPalette,
  scissors: FaCut,
  code: FaCode,
  bullhorn: FaBullhorn,
  camera: FaCamera,
  language: FaLanguage,
  "pen-fancy": FaPenFancy,
  briefcase: FaBriefcase,
  book: FaBook,
  music: FaMusic,
  calendar: FaCalendar,
  spa: FaSpa,
  bullseye: FaBullseye,
  star: FaStar,
  "book-open": FaBookOpen,
  gavel: FaGavel,
  hammer: FaHammer,
  "graduation-cap": FaGraduationCap,
  "chart-line": FaChartLine,
  home: FaHome,
  motorcycle: FaMotorcycle,
};

function CategoryIcon({ icon, color }: { icon?: string; color: string }) {
  const iconClass = `${color}`;
  const IconComponent = (icon && ICON_MAP[icon]) || FaCircle;
  return <IconComponent className={iconClass} />;
}

export default function CategoryGridClient({
  categoriesInFirstRow,
  remainingCategories,
  hasMoreCategories,
  brightColors,
  initialVisibleCount,
}: Props) {
  const [showAllCategories, setShowAllCategories] = useState(false);

  return (
    <>
      <div className="hidden lg:flex flex-wrap gap-x-3 sm:gap-x-6 md:gap-x-8 gap-y-3 sm:gap-y-4 items-center justify-between">
        {categoriesInFirstRow.map((category, index) => (
          <Link
            key={category.id}
            href={`/categories/${category.slug}`}
            className="flex flex-col items-center group cursor-pointer"
          >
            <div
              className={`text-2xl sm:text-3xl md:text-4xl mb-1 h-10 w-10 sm:h-11 sm:w-11 md:h-12 md:w-12 flex items-center justify-center rounded-full transition-all duration-200 ${brightColors[index % brightColors.length]} group-hover:text-brand-primary`}
            >
              <CategoryIcon icon={category.icon} color="" />
            </div>
            <div className="text-gray-700 group-hover:text-brand-primary transition-colors duration-200 font-bold text-xs sm:text-sm md:text-[15px] text-center">
              {category.name}
            </div>
          </Link>
        ))}

        {hasMoreCategories && (
          <button
            onClick={() => setShowAllCategories(!showAllCategories)}
            className="flex flex-col items-center justify-center h-16 w-16 sm:h-18 sm:w-18 md:h-20 md:w-20 bg-gray-100 text-gray-500 hover:bg-brand-primary hover:text-white transition-all duration-200 cursor-pointer rounded-lg"
            aria-label={
              showAllCategories ? "카테고리 간략히 보기" : "모든 카테고리 보기"
            }
            aria-expanded={showAllCategories}
          >
            <div className="grid grid-cols-2 gap-1">
              {showAllCategories ? (
                <FaMinus className="text-lg" aria-hidden="true" />
              ) : (
                <FaTh className="text-lg" aria-hidden="true" />
              )}
              {showAllCategories ? (
                <FaMinus className="text-lg" aria-hidden="true" />
              ) : (
                <FaTh className="text-lg" aria-hidden="true" />
              )}
              {showAllCategories ? (
                <FaMinus className="text-lg" aria-hidden="true" />
              ) : (
                <FaTh className="text-lg" aria-hidden="true" />
              )}
              {showAllCategories ? (
                <FaMinus className="text-lg" aria-hidden="true" />
              ) : (
                <FaTh className="text-lg" aria-hidden="true" />
              )}
            </div>
            <span className="text-xs font-medium mt-1">
              {showAllCategories ? "간략히 보기" : "전체 보기"}
            </span>
          </button>
        )}
      </div>

      {showAllCategories && remainingCategories.length > 0 && (
        <div className="hidden lg:flex flex-wrap gap-x-8 gap-y-4 items-center mt-4">
          {remainingCategories.map((category, index) => (
            <Link
              key={category.id}
              href={`/categories/${category.slug}`}
              className="flex flex-col items-center group cursor-pointer"
            >
              <div
                className={`text-4xl mb-1 h-12 w-12 flex items-center justify-center rounded-full transition-all duration-200 ${brightColors[(index + initialVisibleCount) % brightColors.length]} group-hover:text-brand-primary`}
              >
                <CategoryIcon icon={category.icon} color="" />
              </div>
              <div className="text-gray-700 group-hover:text-brand-primary transition-colors duration-200 font-bold text-[15px]">
                {category.name}
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
