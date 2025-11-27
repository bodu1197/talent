import Link from "next/link";
import { searchAll } from "@/lib/supabase/queries/search";
import SearchResults from "@/components/search/SearchResults";
import MobileSearchContent from "@/components/search/MobileSearchContent";
import { getTopLevelCategories } from "@/lib/categories";
import { Search } from "lucide-react";

interface SearchPageProps {
  readonly searchParams: Promise<{ q?: string }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const query = params.q || "";

  // 카테고리 데이터 가져오기 (모바일 검색 페이지용)
  const categories = await getTopLevelCategories();

  if (!query) {
    return (
      <>
        {/* 모바일: 검색 페이지 UI */}
        <MobileSearchContent categories={categories} />

        {/* PC: 기존 빈 검색 UI */}
        <div className="hidden lg:block min-h-screen bg-gray-50 py-12" style={{ marginTop: '2rem' }}>
          <div className="container-1200 px-4">
            <div className="text-center py-20">
              <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                검색어를 입력해주세요
              </h1>
              <p className="text-gray-600">
                찾으시는 서비스, 전문가, 포트폴리오를 검색해보세요.
              </p>
            </div>
          </div>
        </div>
      </>
    );
  }

  const results = await searchAll(query);
  const totalResults =
    results.services.length +
    results.experts.length +
    results.portfolios.length;

  if (totalResults === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12" style={{ marginTop: '2rem' }}>
        <div className="container-1200 px-4">
          <div className="text-center py-20">
            <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              검색 결과가 없습니다
            </h2>
            <p className="text-gray-600 mb-6">
              다른 검색어로 다시 시도해보세요.
            </p>
            <Link
              href="/"
              className="inline-block px-6 py-3 bg-brand-primary text-white rounded-lg hover:bg-brand-light transition-colors"
            >
              메인으로 돌아가기
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ marginTop: '2rem' }}>
      <SearchResults
        services={results.services}
        experts={results.experts}
        portfolios={results.portfolios}
        query={query}
      />
    </div>
  );
}
