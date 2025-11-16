import Link from "next/link";
import { getTopLevelCategories } from "@/lib/categories";
import CategoryGridClient from "./CategoryGridClient";
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
  FaRunning,
  FaCircle,
} from "react-icons/fa";

function CategoryIcon({ icon }: { icon?: string }) {
  if (icon === "robot") return <FaRobot />;
  if (icon === "palette") return <FaPalette />;
  if (icon === "scissors") return <FaCut />;
  if (icon === "code") return <FaCode />;
  if (icon === "bullhorn") return <FaBullhorn />;
  if (icon === "camera") return <FaCamera />;
  if (icon === "language") return <FaLanguage />;
  if (icon === "pen-fancy") return <FaPenFancy />;
  if (icon === "briefcase") return <FaBriefcase />;
  if (icon === "book") return <FaBook />;
  if (icon === "music") return <FaMusic />;
  if (icon === "calendar") return <FaCalendar />;
  if (icon === "spa") return <FaSpa />;
  if (icon === "bullseye") return <FaBullseye />;
  if (icon === "star") return <FaStar />;
  if (icon === "book-open") return <FaBookOpen />;
  if (icon === "gavel") return <FaGavel />;
  if (icon === "hammer") return <FaHammer />;
  if (icon === "graduation-cap") return <FaGraduationCap />;
  if (icon === "chart-line") return <FaChartLine />;
  if (icon === "home") return <FaHome />;
  if (icon === "motorcycle") return <FaMotorcycle />;
  if (icon === "running") return <FaRunning />;

  return <FaCircle />;
}

export default async function CategoryGrid() {
  // 데이터베이스에서 1단계 카테고리 가져오기
  const topLevelCategories = await getTopLevelCategories();

  const initialVisibleCount = 11;
  const categoriesInFirstRow = topLevelCategories.slice(0, initialVisibleCount);
  const remainingCategories = topLevelCategories.slice(initialVisibleCount);
  const hasMoreCategories = topLevelCategories.length > initialVisibleCount;

  const brightColors = [
    "text-red-500",
    "text-blue-500",
    "text-green-500",
    "text-yellow-500",
    "text-purple-500",
    "text-pink-500",
    "text-indigo-500",
    "text-teal-500",
    "text-orange-500",
    "text-cyan-500",
    "text-lime-500",
    "text-fuchsia-500",
  ];

  return (
    <section className="py-8 bg-white">
      <div className="container-1200">
        <div className="flex items-center justify-between mb-4">
          {/* Removed h2 title */}
        </div>

        {/* 모바일: 2줄 가로 스크롤 */}
        <div className="lg:hidden">
          <div className="flex flex-col gap-0">
            {/* 첫 번째 줄 */}
            <div className="flex gap-0 overflow-x-auto pb-2 scrollbar-hide">
              {topLevelCategories.slice(0, 11).map((category, index) => (
                <Link
                  key={category.id}
                  href={`/categories/${category.slug}`}
                  className="flex flex-col items-center group cursor-pointer flex-shrink-0 w-[76px]"
                >
                  <div
                    className={`text-[27px] mb-1 h-11 w-11 flex items-center justify-center rounded-full transition-all duration-200 ${brightColors[index % brightColors.length]} group-hover:text-brand-primary`}
                  >
                    <CategoryIcon icon={category.icon} />
                  </div>
                  <div className="text-gray-700 group-hover:text-brand-primary transition-colors duration-200 font-bold text-mobile-sm text-center w-[76px] whitespace-nowrap px-0">
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
                  href={`/categories/${category.slug}`}
                  className="flex flex-col items-center group cursor-pointer flex-shrink-0 w-[76px]"
                >
                  <div
                    className={`text-[27px] mb-1 h-11 w-11 flex items-center justify-center rounded-full transition-all duration-200 ${brightColors[(index + 11) % brightColors.length]} group-hover:text-brand-primary`}
                  >
                    <CategoryIcon icon={category.icon} />
                  </div>
                  <div className="text-gray-700 group-hover:text-brand-primary transition-colors duration-200 font-bold text-mobile-sm text-center w-[76px] whitespace-nowrap px-0">
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
          initialVisibleCount={initialVisibleCount}
        />
      </div>
    </section>
  );
}
