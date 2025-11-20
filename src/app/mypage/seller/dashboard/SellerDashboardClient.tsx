"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { prefetchSellerData } from "@/lib/prefetch/buyerPrefetch";
import MypageLayoutWrapper from "@/components/mypage/MypageLayoutWrapper";
import Link from "next/link";
import {
  FaStore,
  FaChartLine,
  FaUsers,
  FaCertificate,
  FaRocket,
  FaShoppingCart,
  FaSpinner,
  FaCheckCircle,
  FaWonSign,
} from "react-icons/fa";

type Stats = {
  newOrders: number;
  inProgressOrders: number;
  deliveredOrders: number;
  completedOrders: number;
  monthlyRevenue: number;
} | null;

type Order = {
  id: string;
  order_number?: string;
  title?: string;
  status: string;
  total_amount?: number;
  service?: {
    title: string;
  };
  buyer?: {
    name: string;
  };
};

type Props = {
  stats: Stats;
  recentOrders: Order[];
  profileData: {
    name: string;
    profile_image?: string | null;
  } | null;
};

export default function SellerDashboardClient({
  stats,
  recentOrders,
  profileData,
}: Props) {
  const queryClient = useQueryClient();

  // 백그라운드에서 모든 판매자 페이지 데이터 프리페치
  useEffect(() => {
    // 판매자 등록이 완료된 경우에만 프리페치
    if (stats) {
      const timer = setTimeout(() => {
        prefetchSellerData(queryClient).catch((err) =>
          console.error(
            "Operation error:",
            JSON.stringify(err, Object.getOwnPropertyNames(err), 2),
          ),
        );
      }, 500); // 대시보드 로딩 후 0.5초 뒤에 실행

      return () => clearTimeout(timer);
    }
  }, [queryClient, stats]);

  // 판매자 미등록 상태 - 등록 유도 UI 표시
  if (!stats) {
    return (
      <MypageLayoutWrapper mode="seller" profileData={profileData}>
        <div className="py-8 px-4">
          <div className="max-w-3xl mx-auto">
            {/* 판매자 등록 안내 카드 */}
            <div className="bg-white rounded-lg shadow-lg p-8 text-center">
              <div className="mb-6">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-4">
                  <FaStore className="text-4xl text-brand-primary" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  판매자로 등록하고 서비스를 판매하세요
                </h1>
                <p className="text-gray-600">
                  전문가로 등록하여 여러분의 재능을 공유하고 수익을 창출할 수
                  있습니다
                </p>
              </div>

              {/* 혜택 리스트 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-gray-50 rounded-lg p-4">
                  <FaChartLine className="text-2xl text-green-500 mb-2" />
                  <h3 className="font-semibold text-gray-900 mb-1">
                    수익 창출
                  </h3>
                  <p className="text-sm text-gray-600">
                    전문 서비스로 안정적인 수입
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <FaUsers className="text-2xl text-blue-500 mb-2" />
                  <h3 className="font-semibold text-gray-900 mb-1">
                    고객 관리
                  </h3>
                  <p className="text-sm text-gray-600">
                    체계적인 주문 및 고객 관리
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <FaCertificate className="text-2xl text-purple-500 mb-2" />
                  <h3 className="font-semibold text-gray-900 mb-1">
                    신뢰도 향상
                  </h3>
                  <p className="text-sm text-gray-600">
                    리뷰와 평점으로 브랜드 구축
                  </p>
                </div>
              </div>

              {/* 등록 버튼 */}
              <Link
                href="/mypage/seller/register"
                className="inline-flex items-center px-8 py-4 bg-brand-primary text-white rounded-lg hover:bg-[#1a4d8f] transition-colors text-lg font-semibold shadow-md hover:shadow-lg"
              >
                <FaRocket className="inline mr-3" />
                판매자 등록하기
              </Link>

              {/* 추가 정보 */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-500">
                  등록은 무료이며, 간단한 정보 입력만으로 바로 시작할 수
                  있습니다
                </p>
              </div>
            </div>
          </div>
        </div>
      </MypageLayoutWrapper>
    );
  }

  // 판매자 등록 완료 - 정상 대시보드 표시
  return (
    <MypageLayoutWrapper mode="seller" profileData={profileData}>
      <div className="py-8 px-4">
        {/* 페이지 헤더 */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">판매 대시보드</h1>
          <p className="text-gray-600 mt-2 text-base">
            판매 현황을 한눈에 확인하세요
          </p>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">신규 주문</p>
                <p className="text-lg font-bold text-gray-900">
                  {stats?.newOrders || 0}건
                </p>
              </div>
              <FaShoppingCart className="text-2xl text-blue-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">진행중</p>
                <p className="text-lg font-bold text-gray-900">
                  {stats?.inProgressOrders || 0}건
                </p>
              </div>
              <FaSpinner className="text-2xl text-yellow-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">완료된 주문</p>
                <p className="text-lg font-bold text-gray-900">
                  {stats?.completedOrders || 0}건
                </p>
              </div>
              <FaCheckCircle className="text-2xl text-green-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">이번달 수익</p>
                <p className="text-lg font-bold text-gray-900">
                  {(stats?.monthlyRevenue || 0).toLocaleString()}원
                </p>
              </div>
              <FaWonSign className="text-2xl text-purple-500" />
            </div>
          </div>
        </div>

        {/* 최근 주문 */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-900">최근 주문</h2>
          </div>
          <div className="p-6">
            {recentOrders.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        주문번호
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        서비스
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        구매자
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        상태
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        금액
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {recentOrders.map((order) => (
                      <tr key={order.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          #{order.order_number || order.id.slice(0, 8)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {order.service?.title || order.title || "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {order.buyer?.name || "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${order.status === "completed"
                              ? "bg-green-100 text-green-800"
                              : order.status === "in_progress"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-gray-100 text-gray-800"
                              }`}
                          >
                            {order.status === "in_progress"
                              ? "진행중"
                              : order.status === "completed"
                                ? "완료"
                                : order.status === "paid"
                                  ? "결제완료"
                                  : order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {(order.total_amount || 0).toLocaleString()}원
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">
                최근 주문이 없습니다
              </p>
            )}
          </div>
        </div>
      </div>
    </MypageLayoutWrapper>
  );
}
