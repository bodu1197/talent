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

function CategoryIcon({ icon, color }: { icon?: string; color: string }) {
  const iconClass = `${color}`;

  if (icon === "robot") return <FaRobot className={iconClass} />;
  if (icon === "palette") return <FaPalette className={iconClass} />;
  if (icon === "scissors") return <FaCut className={iconClass} />;
  if (icon === "code") return <FaCode className={iconClass} />;
  if (icon === "bullhorn") return <FaBullhorn className={iconClass} />;
  if (icon === "camera") return <FaCamera className={iconClass} />;
  if (icon === "language") return <FaLanguage className={iconClass} />;
  if (icon === "pen-fancy") return <FaPenFancy className={iconClass} />;
  if (icon === "briefcase") return <FaBriefcase className={iconClass} />;
  if (icon === "book") return <FaBook className={iconClass} />;
  if (icon === "music") return <FaMusic className={iconClass} />;
  if (icon === "calendar") return <FaCalendar className={iconClass} />;
  if (icon === "spa") return <FaSpa className={iconClass} />;
  if (icon === "bullseye") return <FaBullseye className={iconClass} />;
  if (icon === "star") return <FaStar className={iconClass} />;
  if (icon === "book-open") return <FaBookOpen className={iconClass} />;
  if (icon === "gavel") return <FaGavel className={iconClass} />;
  if (icon === "hammer") return <FaHammer className={iconClass} />;
  if (icon === "graduation-cap")
    return <FaGraduationCap className={iconClass} />;
  if (icon === "chart-line") return <FaChartLine className={iconClass} />;
  if (icon === "home") return <FaHome className={iconClass} />;
  if (icon === "motorcycle") return <FaMotorcycle className={iconClass} />;

  return <FaCircle className={iconClass} />;
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
