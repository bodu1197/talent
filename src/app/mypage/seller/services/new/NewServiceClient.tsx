"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import MypageLayoutWrapper from "@/components/mypage/MypageLayoutWrapper";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { logger } from "@/lib/logger";
import TemplateSelector from "@/components/services/TemplateSelector";
import toast from "react-hot-toast";

import { FaWandMagicSparkles } from "react-icons/fa6";
import {
  type GradientTemplate,
  generateThumbnailWithText,
} from "@/lib/template-generator";
import {
  FaArrowLeft,
  FaUpload,
  FaPalette,
  FaTimes,
  FaCheck,
  FaCloudUploadAlt,
  FaSpinner,
} from "react-icons/fa";

// Dynamic import for TextOverlayEditor - only loads when template mode is selected
const TextOverlayEditor = dynamic(
  () => import("@/components/services/TextOverlayEditor"),
  {
    loading: () => (
      <div className="py-8 text-center text-gray-500">Loading editor...</div>
    ),
    ssr: false,
  },
);

interface Category {
  id: string;
  name: string;
  slug: string;
  level: number;
  parent_id: string | null;
}

interface TextStyleConfig {
  text: string;
  x: number;
  y: number;
  fontSize: number;
  color: string;
  textAlign: CanvasTextAlign;
  fontWeight: string;
  shadowBlur: number;
}

interface Props {
  sellerId: string;
  categories: Category[];
}

export default function NewServiceClient({ sellerId }: Props) {
  const [level1Categories, setLevel1Categories] = useState<Category[]>([]);
  const [level2Categories, setLevel2Categories] = useState<Category[]>([]);
  const [level3Categories, setLevel3Categories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLevel1, setSelectedLevel1] = useState("");
  const [selectedLevel2, setSelectedLevel2] = useState("");
  const [selectedLevel3, setSelectedLevel3] = useState("");
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);

  // 템플릿 관련 상태
  const [uploadMode, setUploadMode] = useState<"file" | "template">("file");
  const [selectedTemplate, setSelectedTemplate] =
    useState<GradientTemplate | null>(null);
  const [textStyle, setTextStyle] = useState<TextStyleConfig | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    category: "",
    description: "",
    price: "",
    deliveryDays: "",
    revisionCount: "0",
    taxInvoiceAvailable: false,
    searchKeywords: "",
  });

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("파일 크기는 5MB를 초과할 수 없습니다.");
        return;
      }
      if (!file.type.startsWith("image/")) {
        toast.error("이미지 파일만 업로드 가능합니다.");
        return;
      }
      setThumbnailFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeThumbnail = () => {
    setThumbnailFile(null);
    setThumbnailPreview(null);
    setSelectedTemplate(null);
    setTextStyle(null);
  };

  // 템플릿 기반 썸네일 생성
  const generateTemplateThumbnail = async () => {
    if (!selectedTemplate || !textStyle || !textStyle.text.trim()) {
      toast.error("템플릿과 텍스트를 입력해주세요.");
      return;
    }

    try {
      const blob = await generateThumbnailWithText(
        selectedTemplate,
        {
          text: textStyle.text,
          x: textStyle.x,
          y: textStyle.y,
          fontSize: textStyle.fontSize,
          fontFamily: "Noto Sans KR, sans-serif",
          color: textStyle.color,
          textAlign: textStyle.textAlign,
          fontWeight: textStyle.fontWeight,
          shadowBlur: textStyle.shadowBlur,
          shadowColor: "rgba(0,0,0,0.5)",
        },
        652,
        488,
      );

      // Blob을 File로 변환
      const file = new File([blob], `thumbnail-${Date.now()}.jpg`, {
        type: "image/jpeg",
      });
      setThumbnailFile(file);

      // 미리보기 URL 생성
      const previewUrl = URL.createObjectURL(blob);
      setThumbnailPreview(previewUrl);

      toast.error("썸네일이 생성되었습니다!");
    } catch (error) {
      logger.error("썸네일 생성 오류:", error);
      toast.error("썸네일 생성에 실패했습니다.");
    }
  };

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
    if (selectedLevel3) {
      setFormData((prev) => ({ ...prev, category: selectedLevel3 }));
    } else if (selectedLevel2 && level3Categories.length === 0) {
      // If level 2 selected but no level 3 exists, use level 2
      setFormData((prev) => ({ ...prev, category: selectedLevel2 }));
    }
  }, [selectedLevel3, selectedLevel2, level3Categories]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 템플릿 모드에서 썸네일을 생성하지 않은 경우 체크
    if (uploadMode === "template" && selectedTemplate && !thumbnailFile) {
      toast.error(
        '템플릿을 선택하셨습니다.\n"썸네일 생성하기" 버튼을 눌러 썸네일을 먼저 생성해주세요.',
      );
      return;
    }

    if (!thumbnailFile) {
      toast.error("썸네일 이미지를 선택해주세요.");
      return;
    }

    if (!formData.category) {
      toast.error("카테고리를 선택해주세요.");
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();

      // 1. Get current user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) {
        toast.error("로그인이 필요합니다.");
        return;
      }

      // 2. Upload thumbnail
      const fileExt = thumbnailFile.name.split(".").pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `service-thumbnails/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("services")
        .upload(filePath, thumbnailFile);

      if (uploadError) {
        logger.error("Thumbnail upload error:", uploadError);
        toast.error("썸네일 업로드에 실패했습니다.");
        return;
      }

      // 3. Get thumbnail public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("services").getPublicUrl(filePath);

      // 4. Create slug from title
      const slug = formData.title
        .toLowerCase()
        .replace(/[^a-z0-9가-힣]/g, "-")
        .replace(/-+/g, "-")
        .substring(0, 100);

      // 5. Insert service
      const { data: service, error: serviceError } = await supabase
        .from("services")
        .insert({
          seller_id: sellerId,
          title: formData.title,
          slug: `${slug}-${Date.now()}`,
          description: formData.description,
          price: Math.max(1000, parseInt(formData.price) || 1000),
          delivery_days: Math.max(1, parseInt(formData.deliveryDays) || 7),
          revision_count:
            formData.revisionCount === "unlimited"
              ? 999
              : Math.max(0, parseInt(formData.revisionCount) || 0),
          thumbnail_url: publicUrl,
          search_keywords: formData.searchKeywords || null,
          status: "pending",
        })
        .select()
        .single();

      if (serviceError) {
        logger.error("Service insert error:", serviceError);
        toast.error("서비스 등록에 실패했습니다: " + serviceError.message);
        return;
      }

      // 6. Insert service category
      const { error: categoryError } = await supabase
        .from("service_categories")
        .insert({
          service_id: service.id,
          category_id: formData.category,
          is_primary: true,
        });

      if (categoryError) {
        logger.error("Category insert error:", categoryError);
      }

      toast.error(
        "서비스가 성공적으로 등록되었습니다!\n관리자 승인 후 판매가 시작됩니다.",
      );
      globalThis.location.href = "/mypage/seller/services";
    } catch (error) {
      logger.error("Service registration error:", error);
      toast.error("서비스 등록 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <MypageLayoutWrapper mode="seller">
      <div className="py-8 px-4">
        {/* 상단 네비게이션 */}
        <div className="mb-6">
          <Link
            href="/mypage/seller/services"
            className="text-gray-600 hover:text-gray-900 flex items-center gap-2"
          >
            <FaArrowLeft />
            <span>서비스 관리로</span>
          </Link>
        </div>

        {/* 페이지 헤더 */}
        <div className="mb-8">
          <h1 className="text-xl font-bold text-gray-900">서비스 등록</h1>
          <p className="text-gray-600 mt-1 text-sm">
            새로운 서비스를 등록하세요
          </p>
        </div>

        <form onSubmit={handleSubmit} className="max-w-4xl">
          {/* 기본 정보 */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">기본 정보</h2>

            <div className="space-y-4">
              {/* 썸네일 이미지 - 최상단 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  썸네일 이미지 *{" "}
                  <span className="text-xs text-gray-500">
                    (권장: 652×488px)
                  </span>
                </label>

                {/* 업로드 방식 선택 */}
                <div className="flex gap-2 mb-4">
                  <button
                    type="button"
                    onClick={() => {
                      setUploadMode("file");
                      removeThumbnail();
                    }}
                    className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
                      uploadMode === "file"
                        ? "bg-brand-primary text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    <FaUpload className="mr-2 inline" />
                    파일 업로드
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setUploadMode("template");
                      removeThumbnail();
                    }}
                    className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
                      uploadMode === "template"
                        ? "bg-brand-primary text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    <FaPalette className="mr-2 inline" />
                    템플릿 사용
                  </button>
                </div>

                {/* 파일 업로드 모드 */}
                {uploadMode === "file" && (
                  <div className="space-y-3">
                    {thumbnailPreview ? (
                      <div className="relative">
                        <img
                          src={thumbnailPreview}
                          alt="썸네일 미리보기"
                          className="w-full h-64 object-cover rounded-lg border border-gray-300"
                        />
                        <button
                          type="button"
                          onClick={removeThumbnail}
                          className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 transition-colors text-sm"
                        >
                          <FaTimes className="mr-1 inline" />
                          삭제
                        </button>
                      </div>
                    ) : (
                      <label className="block border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-brand-primary transition-colors cursor-pointer">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleThumbnailChange}
                          className="hidden"
                        />
                        <FaCloudUploadAlt className="text-gray-400 text-4xl mb-3 inline-block" />
                        <p className="text-gray-600 font-medium">
                          클릭하여 이미지 선택
                        </p>
                        <p className="text-sm text-gray-500 mt-2">
                          권장 크기: 652×488px (최대 5MB)
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          JPG, PNG, GIF 형식 지원
                        </p>
                      </label>
                    )}
                  </div>
                )}

                {/* 템플릿 모드 */}
                {uploadMode === "template" && (
                  <div className="space-y-6">
                    {thumbnailPreview ? (
                      <div className="relative">
                        <img
                          src={thumbnailPreview}
                          alt="생성된 썸네일"
                          className="w-full rounded-lg border-2 border-green-500"
                          style={{ aspectRatio: "652/488" }}
                        />
                        <button
                          type="button"
                          onClick={removeThumbnail}
                          className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 transition-colors text-sm"
                        >
                          <FaTimes className="mr-1 inline" />
                          다시 만들기
                        </button>
                        <div className="absolute top-2 left-2 bg-green-500 text-white px-3 py-1 rounded-lg text-sm">
                          <FaCheck className="mr-1 inline" />
                          생성 완료
                        </div>
                      </div>
                    ) : (
                      <>
                        {/* 템플릿 선택 */}
                        <TemplateSelector
                          onSelect={setSelectedTemplate}
                          selectedTemplateId={selectedTemplate?.id}
                        />

                        {/* 텍스트 편집 */}
                        {selectedTemplate && (
                          <div className="border-t pt-6">
                            <TextOverlayEditor
                              template={selectedTemplate}
                              onTextChange={setTextStyle}
                            />

                            {/* 생성 버튼 */}
                            <div className="mt-6">
                              <button
                                type="button"
                                onClick={generateTemplateThumbnail}
                                disabled={!textStyle?.text?.trim()}
                                className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
                              >
                                <FaWandMagicSparkles className="mr-2 inline" />
                                썸네일 생성하기 (652×488px)
                              </button>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* 서비스 제목 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  서비스 제목 *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="예: 전문 로고 디자인 작업"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  카테고리 *
                </label>
                <div className="space-y-3">
                  {/* 1차 카테고리 */}
                  <select
                    value={selectedLevel1}
                    onChange={(e) => setSelectedLevel1(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                    required
                    disabled={loading}
                    aria-label="1차 카테고리"
                  >
                    <option value="">
                      {loading
                        ? "1차 카테고리 로딩 중..."
                        : "1차 카테고리 선택"}
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
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
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
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
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
                      <span className="font-medium">선택된 카테고리:</span>{" "}
                      {
                        level1Categories.find((c) => c.id === selectedLevel1)
                          ?.name
                      }
                      {selectedLevel2 &&
                        ` > ${level2Categories.find((c) => c.id === selectedLevel2)?.name}`}
                      {selectedLevel3 &&
                        ` > ${level3Categories.find((c) => c.id === selectedLevel3)?.name}`}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  서비스 설명 *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={6}
                  placeholder="서비스에 대해 자세히 설명해주세요"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                  required
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  검색 키워드
                </label>
                <input
                  type="text"
                  maxLength={100}
                  value={formData.searchKeywords}
                  onChange={(e) => {
                    // 한글, 영문, 숫자, 띄어쓰기만 허용 (특수문자, 이모지 제거)
                    const value = e.target.value.replace(/[^\w가-힣\s]/g, "");
                    setFormData({ ...formData, searchKeywords: value });
                  }}
                  placeholder="로고 디자인 브랜딩 CI 기업"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                />
                <div className="mt-2 text-sm text-gray-600 space-y-1">
                  <p>
                    • 검색 키워드는 서비스 설명에 노출되지 않지만, 서비스 제목,
                    서비스 타입과 함께 검색 대상 단어로 사용됩니다.
                  </p>
                  <p>
                    • 띄어쓰기로 구분하여 여러 키워드를 입력할 수 있으며, 최대
                    100글자까지 입력 가능합니다. 특수문자 및 이모지는 입력할 수
                    없습니다.
                  </p>
                  <p>
                    • 서비스와 연관된 짧은 단어를 여러 개 입력하는 것이 검색
                    노출 향상에 도움이 됩니다. (다만, 동일 키워드 중복 입력은
                    검색 결과와 무관합니다.)
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 가격 및 작업 조건 */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              가격 및 작업 조건
            </h2>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    가격 (원) *
                  </label>
                  <input
                    type="number"
                    min="1000"
                    max="10000000"
                    value={formData.price}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9]/g, "");
                      setFormData({ ...formData, price: value });
                    }}
                    onKeyDown={(e) => {
                      if (
                        e.key === "-" ||
                        e.key === "+" ||
                        e.key === "e" ||
                        e.key === "E"
                      ) {
                        e.preventDefault();
                      }
                    }}
                    placeholder="50000"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    작업 기간 (일) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="365"
                    value={formData.deliveryDays}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9]/g, "");
                      setFormData({ ...formData, deliveryDays: value });
                    }}
                    onKeyDown={(e) => {
                      if (
                        e.key === "-" ||
                        e.key === "+" ||
                        e.key === "e" ||
                        e.key === "E"
                      ) {
                        e.preventDefault();
                      }
                    }}
                    placeholder="7"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="revisionCount"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  수정 횟수 *
                </label>
                <select
                  id="revisionCount"
                  value={formData.revisionCount}
                  onChange={(e) =>
                    setFormData({ ...formData, revisionCount: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                  required
                >
                  <option value="0">수정 불가</option>
                  <option value="1">1회</option>
                  <option value="2">2회</option>
                  <option value="3">3회</option>
                  <option value="unlimited">무제한</option>
                </select>
              </div>
            </div>
          </div>

          {/* 추가 정보 */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">추가 정보</h2>

            <div className="space-y-4">
              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-brand-primary border-gray-300 rounded focus:ring-brand-primary"
                  />
                  <span className="text-sm text-gray-700">
                    빠른 작업 가능 (24시간 이내 시작)
                  </span>
                </label>
              </div>

              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.taxInvoiceAvailable}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        taxInvoiceAvailable: e.target.checked,
                      })
                    }
                    className="w-4 h-4 text-brand-primary border-gray-300 rounded focus:ring-brand-primary"
                  />
                  <span className="text-sm text-gray-700">
                    세금계산서 발행 가능
                  </span>
                </label>
                <p className="text-xs text-gray-500 mt-1 ml-6">
                  체크 시 구매자에게 세금계산서 발행이 가능함을 표시합니다.
                </p>
              </div>

              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-brand-primary border-gray-300 rounded focus:ring-brand-primary"
                  />
                  <span className="text-sm text-gray-700">
                    상업적 이용 가능
                  </span>
                </label>
              </div>

              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-brand-primary border-gray-300 rounded focus:ring-brand-primary"
                  />
                  <span className="text-sm text-gray-700">원본 파일 제공</span>
                </label>
              </div>
            </div>
          </div>

          {/* 제출 버튼 */}
          <div className="flex gap-3">
            <Link
              href="/mypage/seller/services"
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-center"
            >
              취소
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-brand-primary text-white rounded-lg hover:bg-[#1a4d8f] transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <FaSpinner className="fa-spin mr-2 inline" />
                  등록 중...
                </>
              ) : (
                <>
                  <FaCheck className="mr-2 inline" />
                  서비스 등록
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </MypageLayoutWrapper>
  );
}
