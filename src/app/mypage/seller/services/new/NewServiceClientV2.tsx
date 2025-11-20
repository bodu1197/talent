"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/mypage/Sidebar";
import MobileSidebar from "@/components/mypage/MobileSidebar";
import { createClient } from "@/lib/supabase/client";
import { logger } from "@/lib/logger";
import toast from "react-hot-toast";

// 단계별 컴포넌트
import Step1BasicInfo from "./steps/Step1BasicInfo";
import Step2Pricing from "./steps/Step2Pricing";
import Step3Description from "./steps/Step3Description";
import Step4Images from "./steps/Step4Images";
import Step5Requirements from "./steps/Step5Requirements";

interface Category {
  id: string;
  name: string;
  slug: string;
  level: number;
  parent_id: string | null;
}

interface Props {
  readonly sellerId: string;
  readonly categories: Category[];
  readonly profileData?: {
    name: string;
    profile_image?: string | null;
  } | null;
}

export default function NewServiceClientV2({
  sellerId,
  categories,
  profileData,
}: Props) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // 전체 폼 데이터
  const [formData, setFormData] = useState({
    // Step 1: 기본정보
    title: "",
    category_ids: [] as string[],

    // Step 2: 가격설정
    price: "",
    delivery_days: "",
    revision_count: "0",

    // Step 3: 서비스 설명
    description: "",

    // Step 4: 이미지
    thumbnail_url: "",
    thumbnail_file: null as File | null,

    // Step 5: 요청사항
    requirements: [] as { question: string; required: boolean }[],

    // 포트폴리오 (선택사항)
    create_portfolio: false,
    portfolio_data: {
      title: "",
      description: "",
      youtube_url: "",
      project_url: "",
      tags: [] as string[],
      images: [] as File[],
    },
  });

  const steps = [
    { number: 1, title: "기본정보" },
    { number: 2, title: "가격설정" },
    { number: 3, title: "포트폴리오" },
  ];

  const handleNext = () => {
    // Step 1 validation: 카테고리, 제목, 설명, 썸네일 필수
    if (currentStep === 1) {
      if (!formData.category_ids || formData.category_ids.length < 3) {
        toast.error("3차 카테고리까지 모두 선택해주세요.");
        return;
      }
      if (!formData.title || formData.title.trim() === "") {
        toast.error("서비스 제목을 입력해주세요.");
        return;
      }
      if (!formData.description || formData.description.trim() === "") {
        toast.error("서비스 설명을 입력해주세요.");
        return;
      }
      if (!formData.thumbnail_file) {
        toast.error("서비스 썸네일을 업로드하거나 생성해주세요.");
        return;
      }
    }

    // Step 2 validation: 가격, 작업기간 필수
    if (currentStep === 2) {
      if (!formData.price || Number.parseInt(formData.price) < 5000) {
        toast.error("서비스 가격을 5,000원 이상으로 입력해주세요.");
        return;
      }
      if (!formData.delivery_days || Number.parseInt(formData.delivery_days) < 1) {
        toast.error("작업 기간을 1일 이상으로 입력해주세요.");
        return;
      }
    }

    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (loading) return;
    try {
      setLoading(true);

      const supabase = createClient();

      // 1. 썸네일 업로드
      let thumbnail_url = "";
      if (formData.thumbnail_file) {
        const fileExt = formData.thumbnail_file.name.split(".").pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `services/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("services")
          .upload(filePath, formData.thumbnail_file);

        if (uploadError) throw uploadError;

        const {
          data: { publicUrl },
        } = supabase.storage.from("services").getPublicUrl(filePath);

        thumbnail_url = publicUrl;
      }

      // 2. 서비스 생성
      const { data: service, error: serviceError } = await supabase
        .from("services")
        .insert({
          seller_id: sellerId,
          title: formData.title,
          description: formData.description,
          thumbnail_url,
          price: parseInt(formData.price),
          delivery_days: parseInt(formData.delivery_days),
          status: "pending",
        })
        .select()
        .single();

      if (serviceError) throw serviceError;

      // 3. 카테고리 연결
      if (formData.category_ids.length > 0) {
        const categoryInserts = formData.category_ids.map((cat_id) => ({
          service_id: service.id,
          category_id: cat_id,
        }));

        await supabase.from("service_categories").insert(categoryInserts);
      }

      // 4. 포트폴리오 생성 (선택사항)
      if (formData.create_portfolio && formData.portfolio_data.title) {
        // 포트폴리오 이미지 업로드
        const portfolioImageUrls: string[] = [];
        for (const file of formData.portfolio_data.images) {
          const fileExt = file.name.split(".").pop();
          const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
          const filePath = `portfolio/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from("portfolio")
            .upload(filePath, file);

          if (!uploadError) {
            const {
              data: { publicUrl },
            } = supabase.storage.from("portfolio").getPublicUrl(filePath);
            portfolioImageUrls.push(publicUrl);
          }
        }

        await supabase.from("seller_portfolio").insert({
          seller_id: sellerId,
          service_id: service.id,
          title: formData.portfolio_data.title,
          description: formData.portfolio_data.description,
          thumbnail_url: portfolioImageUrls[0] || thumbnail_url,
          image_urls: portfolioImageUrls.slice(1),
          youtube_url: formData.portfolio_data.youtube_url || null,
          project_url: formData.portfolio_data.project_url || null,
          tags: formData.portfolio_data.tags,
        });
      }

      toast.success("서비스가 등록되었습니다. 승인 후 공개됩니다.");
      router.push("/mypage/seller/services");
      router.refresh();
    } catch (error) {
      logger.error("Service creation error:", error);
      toast.error("서비스 등록에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-start pt-16 lg:pt-[86px] absolute inset-0 top-[86px]">
      <div className="flex w-full max-w-[1200px]">
        <MobileSidebar mode="seller" />
        <Sidebar mode="seller" profileData={profileData} />
        <main className="flex-1 overflow-y-auto">
          <div className="py-8 px-4">
            {/* 헤더 */}
            <div className="mb-6">
              <h1 className="text-base md:text-lg font-bold text-gray-900">서비스 등록</h1>
              <p className="text-gray-600 mt-1 text-sm">
                새로운 서비스를 등록하세요
              </p>
            </div>

            {/* 진행 단계 표시 */}
            <div className="mb-6">
              <div className="flex items-center justify-between">
                {steps.map((step, index) => (
                  <div key={step.number} className="flex items-center flex-1">
                    <div className="flex flex-col items-center flex-1">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors ${currentStep >= step.number
                          ? "bg-brand-primary text-white"
                          : "bg-gray-200 text-gray-600"
                          }`}
                      >
                        {step.number}
                      </div>
                      <span
                        className={`text-sm mt-2 font-medium ${currentStep >= step.number
                          ? "text-brand-primary"
                          : "text-gray-500"
                          }`}
                      >
                        {step.title}
                      </span>
                    </div>
                    {index < steps.length - 1 && (
                      <div
                        className={`h-1 flex-1 mx-2 transition-colors ${currentStep > step.number
                          ? "bg-brand-primary"
                          : "bg-gray-200"
                          }`}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* 단계별 컨텐츠 */}
            <div className="bg-white rounded-lg shadow p-6">
              {currentStep === 1 && (
                <div className="space-y-6">
                  <Step1BasicInfo
                    formData={formData}
                    setFormData={setFormData}
                    categories={categories}
                  />
                  <div className="border-t border-gray-200 pt-6">
                    <Step3Description
                      formData={formData}
                      setFormData={setFormData}
                    />
                  </div>
                  <div className="border-t border-gray-200 pt-6">
                    <Step4Images
                      formData={formData}
                      setFormData={setFormData}
                    />
                  </div>
                </div>
              )}
              {currentStep === 2 && (
                <Step2Pricing formData={formData} setFormData={setFormData} />
              )}
              {currentStep === 3 && (
                <Step5Requirements
                  formData={formData}
                  setFormData={setFormData}
                />
              )}
            </div>

            {/* 네비게이션 버튼 */}
            <div className="flex justify-between mt-6">
              <button
                onClick={handlePrev}
                disabled={currentStep === 1}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                이전
              </button>
              {currentStep < 3 ? (
                <button
                  onClick={handleNext}
                  className="px-6 py-3 bg-brand-primary text-white rounded-lg hover:bg-[#1a4d8f] transition-colors font-medium"
                >
                  다음
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="px-6 py-3 bg-brand-primary text-white rounded-lg hover:bg-[#1a4d8f] transition-colors font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {loading ? "등록 중..." : "서비스 등록"}
                </button>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
