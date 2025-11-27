"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { logger } from "@/lib/logger";
import type { ServiceDetailWithCategories } from "@/lib/supabase/queries/admin";
import {
  ArrowLeft,
  AlertTriangle,
  X,
  Check,
} from "lucide-react";
import toast from "react-hot-toast";

interface Props {
  readonly service: ServiceDetailWithCategories;
}

export default function PendingServiceDetailClient({ service }: Props) {
  const router = useRouter();

  async function handleApprove() {
    if (!confirm("이 서비스를 승인하시겠습니까?")) return;

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("services")
        .update({ status: "active" })
        .eq("id", service.id);

      if (error) throw error;

      toast.success("서비스가 승인되었습니다.");
      router.push("/admin/services?status=pending");
    } catch (err: unknown) {
      logger.error("승인 실패:", err);
      toast.error(
        "승인에 실패했습니다: " +
          (err instanceof Error ? err.message : "알 수 없는 오류"),
      );
    }
  }

  async function handleReject() {
    const reason = prompt("반려 사유를 입력해주세요:");
    if (!reason) return;

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("services")
        .update({
          status: "suspended",
          // rejection_reason 필드가 있다면 추가
        })
        .eq("id", service.id);

      if (error) throw error;

      toast.error("서비스가 반려되었습니다.");
      router.push("/admin/services?status=pending");
    } catch (err: unknown) {
      logger.error("반려 실패:", err);
      toast.error(
        "반려에 실패했습니다: " +
          (err instanceof Error ? err.message : "알 수 없는 오류"),
      );
    }
  }

  const isResubmission = service.status === "suspended";

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-gray-900 mb-2">
              {isResubmission ? "재신청 서비스 검토" : "신규 서비스 검토"}
            </h1>
            <p className="text-gray-600">
              {isResubmission
                ? "반려 후 재신청된 서비스입니다. 수정 내용을 검토하고 승인 또는 반려하세요"
                : "서비스 내용을 검토하고 승인 또는 반려하세요"}
            </p>
          </div>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            <ArrowLeft className="w-4 h-4 inline mr-2" />
            돌아가기
          </button>
        </div>

        {/* 서비스 정보 */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">등록 정보</h2>

          {/* 재신청 알림 */}
          {isResubmission && (
            <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center gap-2 text-yellow-800">
                <AlertTriangle className="w-4 h-4" />
                <span className="font-medium">
                  이 서비스는 이전에 반려되어 재신청된 서비스입니다.
                </span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <span className="text-sm text-gray-600">판매자</span>
              <p className="font-medium">
                {service.seller?.display_name ||
                  service.seller?.business_name ||
                  service.seller?.user?.name}
              </p>
              <p className="text-sm text-gray-500">
                {service.seller?.user?.email}
              </p>
            </div>
            <div>
              <span className="text-sm text-gray-600">
                {isResubmission ? "최초 등록일" : "등록일"}
              </span>
              <p className="font-medium">
                {service.created_at
                  ? new Date(service.created_at).toLocaleDateString("ko-KR")
                  : ""}
              </p>
            </div>
            {isResubmission && service.updated_at && (
              <div>
                <span className="text-sm text-gray-600">수정일</span>
                <p className="font-medium">
                  {new Date(service.updated_at).toLocaleDateString("ko-KR")}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* 서비스 상세 */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">서비스 상세</h2>

          {/* 썸네일 */}
          {service.thumbnail_url && (
            <div className="mb-4">
              <span className="text-sm text-gray-600 block mb-2">썸네일</span>
              <img
                src={service.thumbnail_url}
                alt="서비스 썸네일"
                className="w-full max-w-md h-64 object-cover rounded-lg"
              />
            </div>
          )}

          {/* 제목 */}
          <div className="mb-4">
            <span className="text-sm text-gray-600 block mb-1">제목</span>
            <p className="text-lg font-medium">{service.title}</p>
          </div>

          {/* 설명 */}
          <div className="mb-4">
            <span className="text-sm text-gray-600 block mb-1">설명</span>
            <p className="text-sm whitespace-pre-wrap bg-gray-50 p-4 rounded">
              {service.description}
            </p>
          </div>

          {/* 카테고리 */}
          <div className="mb-4">
            <span className="text-sm text-gray-600 block mb-1">카테고리</span>
            <div className="flex flex-wrap gap-2">
              {service.service_categories?.map((sc) => (
                <span
                  key={sc.category?.id || sc.category?.name}
                  className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
                >
                  {sc.category?.name}
                </span>
              ))}
            </div>
          </div>

          {/* 가격 및 작업 정보 */}
          <div className="grid grid-cols-3 gap-4 mt-4">
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <span className="text-sm text-gray-600 block mb-1">가격</span>
              <p className="text-xl font-semibold">
                {service.price?.toLocaleString()}원
              </p>
            </div>
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <span className="text-sm text-gray-600 block mb-1">
                작업 기간
              </span>
              <p className="text-xl font-semibold">{service.delivery_days}일</p>
            </div>
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <span className="text-sm text-gray-600 block mb-1">
                수정 횟수
              </span>
              <p className="text-xl font-semibold">
                {service.revision_count === 999
                  ? "무제한"
                  : `${service.revision_count}회`}
              </p>
            </div>
          </div>
        </div>

        {/* 액션 버튼 */}
        <div className="flex gap-4 justify-center">
          <button
            onClick={handleReject}
            className="px-8 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
          >
            <X className="w-4 h-4 inline mr-2" />
            반려
          </button>
          <button
            onClick={handleApprove}
            className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            <Check className="w-4 h-4 inline mr-2" />
            승인
          </button>
        </div>
      </div>
    </div>
  );
}
