"use client";

import { useRouter } from "next/navigation";
import {
  approveServiceRevision,
  rejectServiceRevision,
  type ServiceRevisionWithCategories,
  type ServiceDetailWithCategories,
} from "@/lib/supabase/queries/admin";
import { logger } from "@/lib/logger";
import { FaArrowLeft, FaTimes, FaCheck } from "react-icons/fa";
import toast from "react-hot-toast";

interface Props {
  readonly revision: ServiceRevisionWithCategories & {
    service: ServiceDetailWithCategories;
  };
}

export default function RevisionDetailClient({ revision }: Props) {
  const router = useRouter();

  async function handleApprove() {
    if (!confirm("이 수정 요청을 승인하시겠습니까?")) return;

    try {
      await approveServiceRevision(revision.id);
      toast.error("수정 요청이 승인되었습니다.");
      router.push("/admin/services?status=revisions");
    } catch (err: unknown) {
      logger.error("수정 승인 실패:", err);
      toast.error(
        "수정 승인에 실패했습니다: " +
          (err instanceof Error ? err.message : "알 수 없는 오류"),
      );
    }
  }

  async function handleReject() {
    const reason = prompt("반려 사유를 입력해주세요:");
    if (!reason) return;

    try {
      await rejectServiceRevision(revision.id, reason);
      toast.error("수정 요청이 반려되었습니다.");
      router.push("/admin/services?status=revisions");
    } catch (err: unknown) {
      logger.error("수정 반려 실패:", err);
      toast.error(
        "수정 반려에 실패했습니다: " +
          (err instanceof Error ? err.message : "알 수 없는 오류"),
      );
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              서비스 수정 요청 상세
            </h1>
            <p className="text-gray-600">
              수정 내용을 검토하고 승인 또는 반려하세요
            </p>
          </div>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            <FaArrowLeft className="inline mr-2" />
            돌아가기
          </button>
        </div>

        {/* 수정 요청 정보 */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">수정 요청 정보</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-sm text-gray-600">판매자</span>
              <p className="font-medium">
                {revision.seller?.display_name ||
                  revision.seller?.business_name ||
                  revision.seller?.user?.name}
              </p>
            </div>
            <div>
              <span className="text-sm text-gray-600">요청일</span>
              <p className="font-medium">
                {new Date(revision.created_at).toLocaleDateString("ko-KR")}
              </p>
            </div>
            <div className="col-span-2">
              <span className="text-sm text-gray-600">수정 사유</span>
              <p className="font-medium">{revision.revision_note || "-"}</p>
            </div>
          </div>
        </div>

        {/* 비교 테이블 */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          {/* 원본 서비스 */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm">
                원본
              </span>
              현재 서비스
            </h2>

            {/* 썸네일 */}
            {revision.service?.thumbnail_url && (
              <div className="mb-4">
                <span className="text-sm text-gray-600 block mb-2">썸네일</span>
                <img
                  src={revision.service.thumbnail_url}
                  alt="원본 썸네일"
                  className="w-full h-48 object-cover rounded-lg"
                />
              </div>
            )}

            {/* 제목 */}
            <div className="mb-4">
              <span className="text-sm text-gray-600 block mb-1">제목</span>
              <p className="font-medium">{revision.service?.title}</p>
            </div>

            {/* 설명 */}
            <div className="mb-4">
              <span className="text-sm text-gray-600 block mb-1">설명</span>
              <p className="text-sm whitespace-pre-wrap">
                {revision.service?.description}
              </p>
            </div>

            {/* 카테고리 */}
            <div className="mb-4">
              <span className="text-sm text-gray-600 block mb-1">카테고리</span>
              <div className="flex flex-wrap gap-2">
                {revision.service?.service_categories?.map(
                  (
                    sc: { category: { id: string; name: string } },
                    idx: number,
                  ) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-sm"
                    >
                      {sc.category?.name}
                    </span>
                  ),
                )}
              </div>
            </div>

            {/* 가격 및 작업 정보 */}
            <div className="space-y-3">
              <div className="border border-gray-200 rounded-lg p-3">
                <div className="text-sm space-y-1">
                  <div>
                    <span className="text-gray-600">가격:</span>{" "}
                    {revision.service?.price?.toLocaleString()}원
                  </div>
                  <div>
                    <span className="text-gray-600">작업 기간:</span>{" "}
                    {revision.service?.delivery_days}일
                  </div>
                  <div>
                    <span className="text-gray-600">수정 횟수:</span>{" "}
                    {revision.service?.revision_count === 999
                      ? "무제한"
                      : `${revision.service?.revision_count}회`}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 수정된 서비스 */}
          <div className="bg-white rounded-lg border-2 border-orange-200 p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-sm">
                수정
              </span>
              수정 요청 내용
            </h2>

            {/* 썸네일 */}
            {revision.thumbnail_url && (
              <div className="mb-4">
                <span className="text-sm text-gray-600 block mb-2">썸네일</span>
                <img
                  src={revision.thumbnail_url}
                  alt="수정 썸네일"
                  className="w-full h-48 object-cover rounded-lg"
                />
              </div>
            )}

            {/* 제목 */}
            <div className="mb-4">
              <span className="text-sm text-gray-600 block mb-1">제목</span>
              <p className="font-medium text-orange-700">{revision.title}</p>
            </div>

            {/* 설명 */}
            <div className="mb-4">
              <span className="text-sm text-gray-600 block mb-1">설명</span>
              <p className="text-sm whitespace-pre-wrap text-orange-700">
                {revision.description}
              </p>
            </div>

            {/* 카테고리 */}
            <div className="mb-4">
              <span className="text-sm text-gray-600 block mb-1">카테고리</span>
              <div className="flex flex-wrap gap-2">
                {revision.revision_categories?.map(
                  (
                    rc: { category: { id: string; name: string } },
                    idx: number,
                  ) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-orange-50 text-orange-700 rounded text-sm font-medium"
                    >
                      {rc.category?.name}
                    </span>
                  ),
                )}
              </div>
            </div>

            {/* 가격 및 작업 정보 */}
            <div className="space-y-3">
              <div className="border-2 border-orange-200 rounded-lg p-3 bg-orange-50">
                <div className="text-sm space-y-1 text-orange-700">
                  <div>
                    <span className="text-gray-600">가격:</span>{" "}
                    {revision.price?.toLocaleString()}원
                  </div>
                  <div>
                    <span className="text-gray-600">작업 기간:</span>{" "}
                    {revision.delivery_days}일
                  </div>
                  <div>
                    <span className="text-gray-600">수정 횟수:</span>{" "}
                    {revision.revision_count === 999
                      ? "무제한"
                      : `${revision.revision_count}회`}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 액션 버튼 */}
        <div className="flex gap-4 justify-center">
          <button
            onClick={handleReject}
            className="px-8 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
          >
            <FaTimes className="inline mr-2" />
            반려
          </button>
          <button
            onClick={handleApprove}
            className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            <FaCheck className="inline mr-2" />
            승인
          </button>
        </div>
      </div>
    </div>
  );
}
