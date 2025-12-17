'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { MapPinIcon, ArrowRightIcon, LoadingSpinner } from '@/components/common/Icons';

export interface BannerCategoryConfig {
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  icon: React.FC<{ className?: string }>;
  gradient: string;
  href: string; // Caller determines the link
}

export interface GradientCategoryBannerProps {
  title: React.ReactNode;
  description: string;
  categories: BannerCategoryConfig[];
  /**
   * API Enpoint to fetch counts.
   * Expected response format: { categories: [{ category_slug: string, count: number }] } or { counts: [{ slug: string, count: number }] }
   * This component handles both formats for compatibility.
   */
  fetchCountsUrl?: string;
  /**
   * Function to format the badge text based on count.
   */
  getBadgeText: (count: number, hasCount: boolean) => string;
  /**
   * Function to format the CTA text based on count.
   */
  getCtaText: (hasCount: boolean) => string;
}

interface CategoryCountItem {
  slug: string;
  count: number;
}

interface ApiCategoryItem {
  category_slug: string;
  count: number;
}

type CountApiResponse = { categories: ApiCategoryItem[] } | { counts: CategoryCountItem[] };

export default function GradientCategoryBanner({
  title,
  description,
  categories,
  fetchCountsUrl,
  getBadgeText,
  getCtaText,
}: GradientCategoryBannerProps) {
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(false);

  const fetchCounts = useCallback(async () => {
    if (!fetchCountsUrl) return;

    setIsLoading(true);
    try {
      const response = await fetch(fetchCountsUrl);
      if (response.ok) {
        const data = (await response.json()) as CountApiResponse;
        // Handle both formats seen in the codebases
        // LocationHeroBanner: { categories: [{ category_slug, count }] }
        // ThirdHeroBanner: { counts: [{ slug, count }] }

        const countMap: Record<string, number> = {};

        if ('categories' in data && Array.isArray(data.categories)) {
          data.categories.forEach((c) => {
            countMap[c.category_slug] = c.count;
          });
        } else if ('counts' in data && Array.isArray(data.counts)) {
          data.counts.forEach((c) => {
            countMap[c.slug] = c.count;
          });
        }

        setCounts(countMap);
      }
    } catch (error) {
      console.error('Failed to load category counts:', error);
    } finally {
      setIsLoading(false);
    }
  }, [fetchCountsUrl]);

  useEffect(() => {
    fetchCounts();
  }, [fetchCounts]);

  // Badge background helper
  const getBadgeBackground = (loading: boolean, hasItems: boolean) => {
    if (loading) return 'bg-white/20';
    if (hasItems) return 'bg-white/25';
    return 'bg-white/15';
  };

  return (
    <section className="py-6 md:py-10">
      <div className="container-1200">
        {/* Header */}
        <div className="text-center mb-6 md:mb-8">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-gray-900 mb-2">
            {title}
          </h2>
          <p className="text-gray-500 text-sm md:text-base">{description}</p>
        </div>

        {/* Card Container */}
        <div className="flex md:grid md:grid-cols-3 lg:grid-cols-3 gap-4 md:gap-4 overflow-x-auto md:overflow-visible snap-x snap-mandatory md:snap-none pb-4 md:pb-0 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide">
          {categories.map((category) => {
            const IconComponent = category.icon;
            const count = counts[category.slug] || 0;
            const hasItems = count > 0;

            return (
              <Link
                key={category.slug}
                href={category.href}
                className="group flex-shrink-0 w-[85%] sm:w-[70%] md:w-auto snap-center"
              >
                <div
                  className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${category.gradient} p-6 md:p-8 h-full min-h-[200px] md:min-h-[220px] transition-all duration-300 group-hover:scale-[1.02] group-hover:shadow-xl`}
                >
                  {/* Background Decoration */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

                  {/* Content */}
                  <div className="relative z-10 h-full flex flex-col">
                    {/* Top: Icon + Badge */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-300">
                        <IconComponent className="w-8 h-8" />
                      </div>
                      {/* Count Badge */}
                      <div
                        className={`flex items-center gap-1 backdrop-blur-sm px-2.5 py-1 rounded-full ${getBadgeBackground(isLoading, hasItems)}`}
                      >
                        {isLoading ? (
                          <LoadingSpinner className="w-3 h-3 text-white" />
                        ) : (
                          <>
                            <MapPinIcon className="w-3 h-3 text-white" />
                            <span className="text-white text-xs font-medium">
                              {getBadgeText(count, hasItems)}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Text */}
                    <h3 className="text-xl md:text-2xl font-bold text-white mb-1">
                      {category.title}
                    </h3>
                    <p className="text-white/80 text-sm mb-2">{category.subtitle}</p>
                    <p className="text-white/60 text-xs mb-auto">{category.description}</p>

                    {/* CTA */}
                    <div className="flex items-center gap-2 text-white font-medium text-sm mt-4 group-hover:gap-3 transition-all duration-300">
                      <span>{getCtaText(hasItems)}</span>
                      <ArrowRightIcon className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
