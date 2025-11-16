import Link from "next/link";
import { getRecentVisitedCategoriesServer } from "@/lib/supabase/queries/category-visits";
import { FaHistory } from "react-icons/fa";

export default async function RecentVisitedCategories() {
  // 최근 방문한 카테고리 조회 (서버에서 직접)
  const allCategories = await getRecentVisitedCategoriesServer(10);

  // 로그인하지 않았거나 방문 기록이 없으면 표시 안 함
  if (allCategories.length === 0) {
    return null;
  }

  return (
    <section className="py-6 bg-gray-50 border-b border-gray-200">
      <div className="container-1200">
        <div className="flex items-center gap-3 mb-4">
          <FaHistory className="text-brand-primary" />
          <h2 className="text-lg font-bold text-gray-900">
            최근 방문한 카테고리
          </h2>
          <span className="text-sm text-gray-500">(최근 30일)</span>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {allCategories.map((category) => (
            <Link
              key={category.category_id}
              href={`/categories/${category.category_slug}`}
              className="flex-shrink-0"
            >
              <div className="px-4 py-2 bg-white border border-gray-200 rounded-full hover:border-brand-primary hover:bg-brand-primary hover:text-white transition-all duration-200 group">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium whitespace-nowrap">
                    {category.category_name}
                  </span>
                  {category.visit_count > 1 && (
                    <span className="text-xs px-1.5 py-0.5 bg-brand-primary text-white group-hover:bg-white group-hover:text-brand-primary rounded-full">
                      {category.visit_count}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
