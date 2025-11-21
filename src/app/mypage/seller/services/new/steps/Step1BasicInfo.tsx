"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { logger } from "@/lib/logger";
import { FaFolderTree } from "react-icons/fa6";

interface Category {
  id: string;
  name: string;
  slug: string;
  level: number;
  parent_id: string | null;
}

interface ServiceFormData {
  title: string;
  category_ids: string[];
  price: string;
  delivery_days: string;
  revision_count: string;
  description: string;
  thumbnail_url: string;
  thumbnail_file: File | null;
  requirements: { question: string; required: boolean }[];
  create_portfolio: boolean;
  portfolio_data: {
    title: string;
    description: string;
    youtube_url: string;
    project_url: string;
    tags: string[];
    images: File[];
  };
  features?: {
    commercial_use?: boolean;
    source_files?: boolean;
    express_delivery?: boolean;
  };
}

interface Props {
  readonly formData: ServiceFormData;
  readonly setFormData: React.Dispatch<React.SetStateAction<ServiceFormData>>;
  readonly categories: Category[];
}

export default function Step1BasicInfo({ formData, setFormData }: Props) {
  const [level1Categories, setLevel1Categories] = useState<Category[]>([]);
  const [level2Categories, setLevel2Categories] = useState<Category[]>([]);
  const [level3Categories, setLevel3Categories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLevel1, setSelectedLevel1] = useState("");
  const [selectedLevel2, setSelectedLevel2] = useState("");
  const [selectedLevel3, setSelectedLevel3] = useState("");

  // Load level 1 categories on mount
  useEffect(() => {
    async function fetchLevel1Categories() {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("categories")
          .select("id, name, slug, level, parent_id")
          .eq("is_active", true)
          .eq("level", 1)
          .order("display_order", { ascending: true });

        if (error) {
          logger.error("1차 카테고리 로딩 오류:", error);
        } else {
          setLevel1Categories(data || []);
        }
      } catch (error) {
        logger.error("1차 카테고리 로딩 실패:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchLevel1Categories();
  }, []);

  // Load level 2 categories when level 1 is selected
  useEffect(() => {
    if (!selectedLevel1) {
      setLevel2Categories([]);
      setSelectedLevel2("");
      setLevel3Categories([]);
      setSelectedLevel3("");
      return;
    }

    async function fetchLevel2Categories() {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("categories")
          .select("id, name, slug, level, parent_id")
          .eq("is_active", true)
          .eq("parent_id", selectedLevel1)
          .order("display_order", { ascending: true });

        if (error) {
          logger.error("2차 카테고리 로딩 오류:", error);
        } else {
          setLevel2Categories(data || []);
        }
      } catch (error) {
        logger.error("2차 카테고리 로딩 실패:", error);
      }
    }

    fetchLevel2Categories();
  }, [selectedLevel1]);

  // Load level 3 categories when level 2 is selected
  useEffect(() => {
    if (!selectedLevel2) {
      setLevel3Categories([]);
      setSelectedLevel3("");
      return;
    }

    async function fetchLevel3Categories() {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("categories")
          .select("id, name, slug, level, parent_id")
          .eq("is_active", true)
          .eq("parent_id", selectedLevel2)
          .order("display_order", { ascending: true });

        if (error) {
          logger.error("3차 카테고리 로딩 오류:", error);
        } else {
          setLevel3Categories(data || []);
        }
      } catch (error) {
        logger.error("3차 카테고리 로딩 실패:", error);
      }
    }

    fetchLevel3Categories();
  }, [selectedLevel2]);

  // Update final category when level 3 is selected
  useEffect(() => {
    // Always update category_ids with all selected levels to preserve hierarchy
    const categories: string[] = [];
    if (selectedLevel1) categories.push(selectedLevel1);
    if (selectedLevel2) categories.push(selectedLevel2);
    if (selectedLevel3) categories.push(selectedLevel3);

    // Only update if different to avoid infinite loops
    setFormData((prev: ServiceFormData) => {
      const prevIds = prev.category_ids || [];
      const isSame = prevIds.length === categories.length &&
        prevIds.every((val: string, index: number) => val === categories[index]);

      if (isSame) return prev;

      console.log("📋 Step1: Updating category_ids to:", categories);
      return { ...prev, category_ids: categories };
    });
  }, [selectedLevel1, selectedLevel2, selectedLevel3, setFormData]);

  return (
    <div className="space-y-6">
      <h2 className="text-base md:text-lg font-bold text-gray-900 mb-6">기본 정보</h2>

      {/* 카테고리 선택 - 맨 처음으로 이동 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          카테고리 *
        </label>
        <div className="space-y-3">
          {/* 1차 카테고리 */}
          <select
            value={selectedLevel1}
            onChange={(e) => setSelectedLevel1(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0f3460] focus:border-transparent"
            required
            disabled={loading}
            aria-label="1차 카테고리"
          >
            <option value="">
              {loading ? "1차 카테고리 로딩 중..." : "1차 카테고리 선택"}
            </option>
            {level1Categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>

          {/* 2차 카테고리 */}
          {selectedLevel1 && level2Categories.length > 0 && (
            <select
              value={selectedLevel2}
              onChange={(e) => setSelectedLevel2(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0f3460] focus:border-transparent"
              required
              aria-label="2차 카테고리"
            >
              <option value="">2차 카테고리 선택</option>
              {level2Categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          )}

          {/* 3차 카테고리 */}
          {selectedLevel2 && level3Categories.length > 0 && (
            <select
              value={selectedLevel3}
              onChange={(e) => setSelectedLevel3(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0f3460] focus:border-transparent"
              required
              aria-label="3차 카테고리"
            >
              <option value="">3차 카테고리 선택</option>
              {level3Categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          )}

          {/* 선택된 카테고리 경로 표시 */}
          {(selectedLevel1 || selectedLevel2 || selectedLevel3) && (
            <div className="text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded">
              <FaFolderTree className="mr-2 inline" />
              선택된 경로:{" "}
              {selectedLevel1 && (
                <span className="font-medium">
                  {level1Categories.find((c) => c.id === selectedLevel1)?.name}
                </span>
              )}
              {selectedLevel2 && (
                <>
                  {" > "}
                  <span className="font-medium">
                    {
                      level2Categories.find((c) => c.id === selectedLevel2)
                        ?.name
                    }
                  </span>
                </>
              )}
              {selectedLevel3 && (
                <>
                  {" > "}
                  <span className="font-medium">
                    {
                      level3Categories.find((c) => c.id === selectedLevel3)
                        ?.name
                    }
                  </span>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 서비스 제목 */}
      <div>
        <label htmlFor="service-title" className="block text-sm font-medium text-gray-700 mb-2">
          서비스 제목 *
        </label>
        <input
          id="service-title"
          type="text"
          value={formData.title}
          onChange={(e) => setFormData((prev: ServiceFormData) => ({ ...prev, title: e.target.value }))}
          placeholder="예: 전문 로고 디자인 작업"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0f3460] focus:border-transparent"
          required
        />
      </div>
    </div>
  );
}
