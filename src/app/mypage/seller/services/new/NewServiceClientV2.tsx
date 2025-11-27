'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import MypageLayoutWrapper from '@/components/mypage/MypageLayoutWrapper';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { logger } from '@/lib/logger';
import toast from 'react-hot-toast';
import { ArrowLeft, Loader2, Check } from 'lucide-react';

// 단계별 컴포넌트
import Step1BasicInfo from './steps/Step1BasicInfo';
import Step2Pricing from './steps/Step2Pricing';
import Step3Description from './steps/Step3Description';
import Step4Images from './steps/Step4Images';
import Step5Requirements from './steps/Step5Requirements';

interface Props {
  readonly sellerId: string;
  readonly profileData?: {
    name: string;
    profile_image?: string | null;
  } | null;
}

export default function NewServiceClientV2({ sellerId, profileData }: Props) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // 전체 폼 데이터
  const [formData, setFormData] = useState({
    // Step 1: 기본정보
    title: '',
    category_ids: [] as string[],

    // Step 2: 가격설정
    price: '',
    delivery_days: '',
    revision_count: '0',

    // Step 3: 서비스 설명
    description: '',

    // Step 4: 이미지
    thumbnail_url: '',
    thumbnail_file: null as File | null,

    // Step 5: 요청사항
    requirements: [] as { question: string; required: boolean }[],

    // 포트폴리오 (선택사항)
    create_portfolio: false,
    portfolio_data: {
      title: '',
      description: '',
      youtube_url: '',
      project_url: '',
      tags: [] as string[],
      images: [] as File[],
    },
  });

  const steps = [
    { number: 1, title: '기본정보' },
    { number: 2, title: '가격설정' },
    { number: 3, title: '포트폴리오' },
  ];

  const handleNext = () => {
    // Step 1 validation: 카테고리, 제목, 설명, 썸네일 필수
    if (currentStep === 1) {
      logger.info('[NewService] handleNext: Checking category_ids', {
        categoryIds: formData.category_ids,
      });

      if (!formData.category_ids || formData.category_ids.length < 3) {
        toast.error('3차 카테고리까지 모두 선택해주세요.');
        return;
      }
      if (!formData.title || formData.title.trim() === '') {
        toast.error('서비스 제목을 입력해주세요.');
        return;
      }
      if (!formData.description || formData.description.trim() === '') {
        toast.error('서비스 설명을 입력해주세요.');
        return;
      }
      if (!formData.thumbnail_file) {
        toast.error('서비스 썸네일을 업로드하거나 생성해주세요.');
        return;
      }
    }

    //Step 2 validation: 가격, 작업기간 필수
    if (currentStep === 2) {
      if (!formData.price || Number.parseInt(formData.price) < 5000) {
        toast.error('서비스 가격을 5,000원 이상으로 입력해주세요.');
        return;
      }
      if (!formData.delivery_days || Number.parseInt(formData.delivery_days) < 1) {
        toast.error('작업 기간을 1일 이상으로 입력해주세요.');
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

  // 썸네일 업로드 헬퍼 함수
  const uploadThumbnail = async (file: File): Promise<string> => {
    const supabase = createClient();
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${crypto.randomUUID().slice(0, 8)}.${fileExt}`;
    const filePath = `services/${fileName}`;

    const { error: uploadError } = await supabase.storage.from('services').upload(filePath, file);

    if (uploadError) throw uploadError;

    const {
      data: { publicUrl },
    } = supabase.storage.from('services').getPublicUrl(filePath);

    return publicUrl;
  };

  // 서비스 생성 헬퍼 함수
  const createService = async (thumbnailUrl: string) => {
    const supabase = createClient();
    const { data: service, error: serviceError } = await supabase
      .from('services')
      .insert({
        seller_id: sellerId,
        title: formData.title,
        description: formData.description,
        thumbnail_url: thumbnailUrl,
        price: Number.parseInt(formData.price),
        delivery_days: Number.parseInt(formData.delivery_days),
        status: 'pending',
      })
      .select()
      .single();

    if (serviceError) throw serviceError;
    return service;
  };

  // 카테고리 저장 헬퍼 함수
  const saveServiceCategories = async (serviceId: string) => {
    logger.info('[NewService] handleSubmit: About to save category_ids', {
      categoryIds: formData.category_ids,
    });

    if (formData.category_ids.length === 0) {
      logger.warn('[NewService] No categories to save - category_ids is empty');
      return;
    }

    const supabase = createClient();
    const categoryInserts = formData.category_ids.map((cat_id) => ({
      service_id: serviceId,
      category_id: cat_id,
    }));

    logger.info('[NewService] handleSubmit: Category inserts', { categoryInserts });

    const { error: categoryError } = await supabase
      .from('service_categories')
      .insert(categoryInserts);

    if (categoryError) {
      logger.error('Category insertion error:', categoryError);
      throw new Error('카테고리 저장에 실패했습니다.');
    }

    logger.info('[NewService] Categories saved successfully');
  };

  // 포트폴리오 이미지 업로드 헬퍼 함수
  const uploadPortfolioImages = async (images: File[]): Promise<string[]> => {
    const supabase = createClient();
    const imageUrls: string[] = [];

    for (const file of images) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${crypto.randomUUID().slice(0, 8)}.${fileExt}`;
      const filePath = `portfolio/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('portfolio')
        .upload(filePath, file);

      if (!uploadError) {
        const {
          data: { publicUrl },
        } = supabase.storage.from('portfolio').getPublicUrl(filePath);
        imageUrls.push(publicUrl);
      }
    }

    return imageUrls;
  };

  // 포트폴리오 생성 헬퍼 함수
  const createPortfolio = async (serviceId: string, thumbnailUrl: string) => {
    if (!formData.create_portfolio || !formData.portfolio_data.title) {
      return;
    }

    const portfolioImageUrls = await uploadPortfolioImages(formData.portfolio_data.images);
    const supabase = createClient();

    await supabase.from('seller_portfolio').insert({
      seller_id: sellerId,
      service_id: serviceId,
      title: formData.portfolio_data.title,
      description: formData.portfolio_data.description,
      thumbnail_url: portfolioImageUrls[0] || thumbnailUrl,
      image_urls: portfolioImageUrls.slice(1),
      youtube_url: formData.portfolio_data.youtube_url || null,
      project_url: formData.portfolio_data.project_url || null,
      tags: formData.portfolio_data.tags,
    });
  };

  const handleSubmit = async () => {
    if (loading) return;
    try {
      setLoading(true);

      // 1. 썸네일 업로드
      const thumbnailUrl = formData.thumbnail_file
        ? await uploadThumbnail(formData.thumbnail_file)
        : '';

      // 2. 서비스 생성
      const service = await createService(thumbnailUrl);

      // 3. 카테고리 연결
      await saveServiceCategories(service.id);

      // 4. 포트폴리오 생성 (선택사항)
      await createPortfolio(service.id, thumbnailUrl);

      toast.success('서비스가 등록되었습니다. 승인 후 공개됩니다.');
      router.push('/mypage/seller/services');
      router.refresh();
    } catch (error) {
      logger.error('Service creation error:', error);
      toast.error('서비스 등록에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <MypageLayoutWrapper mode="seller" profileData={profileData}>
      <div className="pt-2 pb-4 px-4 lg:py-8 lg:px-6">
        {/* 상단 네비게이션 */}
        <div className="mb-4 lg:mb-6">
          <Link
            href="/mypage/seller/services"
            className="text-gray-600 hover:text-gray-900 flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm lg:text-base">서비스 관리로</span>
          </Link>
        </div>

        {/* 페이지 헤더 */}
        <div className="mb-4 lg:mb-6">
          <h1 className="text-base lg:text-lg font-semibold text-gray-900">서비스 등록</h1>
          <p className="text-gray-600 mt-1 text-sm">새로운 서비스를 등록하세요</p>
        </div>

        {/* 진행 단계 표시 */}
        <div className="max-w-4xl mb-4 lg:mb-6">
          <div className="flex items-start">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div
                    className={`flex items-center justify-center w-8 h-8 lg:w-10 lg:h-10 rounded-full font-semibold text-sm lg:text-base ${
                      currentStep >= step.number
                        ? 'bg-brand-primary text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {step.number}
                  </div>
                  <span
                    className={`mt-1 text-xs lg:text-sm whitespace-nowrap ${
                      currentStep === step.number
                        ? 'text-brand-primary font-medium'
                        : 'text-gray-500'
                    }`}
                  >
                    {step.title}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 lg:h-1 mx-1 lg:mx-2 mt-4 lg:mt-5 ${
                      currentStep > step.number ? 'bg-brand-primary' : 'bg-gray-200'
                    }`}
                  ></div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 단계별 컨텐츠 */}
        <div className="max-w-4xl">
          <div className="bg-white rounded-lg border border-gray-200 p-3 lg:p-6 mb-4 lg:mb-6">
            {currentStep === 1 && (
              <div className="space-y-4 lg:space-y-6">
                <Step1BasicInfo formData={formData} setFormData={setFormData} />
                <div className="border-t border-gray-200 pt-4 lg:pt-6">
                  <Step3Description formData={formData} setFormData={setFormData} />
                </div>
                <div className="border-t border-gray-200 pt-4 lg:pt-6">
                  <Step4Images formData={formData} setFormData={setFormData} />
                </div>
              </div>
            )}
            {currentStep === 2 && <Step2Pricing formData={formData} setFormData={setFormData} />}
            {currentStep === 3 && (
              <Step5Requirements formData={formData} setFormData={setFormData} />
            )}
          </div>

          {/* 네비게이션 버튼 */}
          <div className="flex gap-2 lg:gap-3">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={handlePrev}
                className="flex-1 px-4 py-2 lg:px-6 lg:py-3 text-sm lg:text-base border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                <ArrowLeft className="w-4 h-4 mr-2 inline" />
                이전
              </button>
            )}
            {currentStep < 3 ? (
              <button
                type="button"
                onClick={handleNext}
                className="flex-1 px-4 py-2 lg:px-6 lg:py-3 text-sm lg:text-base bg-brand-primary text-white rounded-lg hover:bg-[#1a4d8f] transition-colors font-medium"
              >
                다음
                <ArrowLeft className="w-4 h-4 ml-2 inline transform rotate-180" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 px-4 py-2 lg:px-6 lg:py-3 text-sm lg:text-base bg-brand-primary text-white rounded-lg hover:bg-[#1a4d8f] transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2 inline" />
                    등록 중...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-2 inline" />
                    서비스 등록
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </MypageLayoutWrapper>
  );
}
