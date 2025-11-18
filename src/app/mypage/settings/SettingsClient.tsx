"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import MypageLayoutWrapper from "@/components/mypage/MypageLayoutWrapper";
import { FaEdit, FaUser, FaKey, FaBell } from "react-icons/fa";

interface ProfileData {
  name: string;
  email?: string;
  profile_image?: string | null;
  phone?: string | null;
  bio?: string | null;
}

interface Props {
  profile: ProfileData;
  userEmail: string;
  isSeller: boolean;
}

export default function SettingsClient({
  profile,
  userEmail,
  isSeller,
}: Props) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("profile");

  return (
    <MypageLayoutWrapper mode={isSeller ? "seller" : "buyer"}>
      <div className="py-8 px-4">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">설정</h1>
            <p className="text-gray-600 mt-1 text-sm">
              계정 및 알림 설정을 확인하세요
            </p>
          </div>
          <button
            onClick={() => router.push("/mypage/settings/edit")}
            className="px-6 py-3 bg-brand-primary text-white rounded-lg hover:bg-[#1a4d8f] transition-colors font-medium"
          >
            <FaEdit className="mr-2 inline" />
            수정
          </button>
        </div>

        <div className="flex gap-6">
          {/* 탭 메뉴 */}
          <div className="w-64 bg-white rounded-lg border border-gray-200 p-4">
            <button
              onClick={() => setActiveTab("profile")}
              className={`w-full px-4 py-2 rounded-lg text-left transition-colors ${
                activeTab === "profile"
                  ? "bg-brand-primary text-white"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <FaUser className="mr-2 inline" />
              프로필
            </button>
            <button
              onClick={() => setActiveTab("account")}
              className={`w-full px-4 py-2 rounded-lg text-left transition-colors mt-2 ${
                activeTab === "account"
                  ? "bg-brand-primary text-white"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <FaKey className="mr-2 inline" />
              계정 보안
            </button>
            <button
              onClick={() => setActiveTab("notifications")}
              className={`w-full px-4 py-2 rounded-lg text-left transition-colors mt-2 ${
                activeTab === "notifications"
                  ? "bg-brand-primary text-white"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <FaBell className="mr-2 inline" />
              알림 설정
            </button>
          </div>

          {/* 설정 내용 */}
          <div className="flex-1">
            {activeTab === "profile" && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">
                  프로필 정보
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      프로필 이미지
                    </label>
                    <div className="flex items-center gap-4">
                      {profile?.profile_image ? (
                        <img
                          src={profile.profile_image}
                          alt={profile.name || "프로필"}
                          className="w-20 h-20 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-20 h-20 bg-brand-primary rounded-full flex items-center justify-center text-white text-2xl font-bold">
                          {profile?.name?.[0] || "U"}
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      이름
                    </label>
                    <p className="text-gray-900">{profile?.name || "-"}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      이메일
                    </label>
                    <p className="text-gray-900">{userEmail || "-"}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      자기소개
                    </label>
                    <p className="text-gray-900 whitespace-pre-wrap">
                      {profile?.bio || "자기소개가 없습니다"}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "account" && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">
                  계정 보안
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      비밀번호
                    </label>
                    <p className="text-gray-900">••••••••</p>
                    <p className="text-sm text-gray-500 mt-1">
                      비밀번호를 변경하려면 수정 버튼을 클릭하세요
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      2단계 인증
                    </label>
                    <p className="text-gray-900">설정되지 않음</p>
                    <p className="text-sm text-gray-500 mt-1">
                      추가 보안을 위해 2단계 인증을 설정하세요
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "notifications" && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">
                  알림 설정
                </h2>
                <div className="space-y-4">
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">
                          주문 알림
                        </div>
                        <div className="text-sm text-gray-600">
                          새 주문이 들어오면 알림을 받습니다
                        </div>
                      </div>
                      <span className="text-green-600 font-medium">켜짐</span>
                    </div>
                  </div>

                  <div className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">
                          메시지 알림
                        </div>
                        <div className="text-sm text-gray-600">
                          새 메시지가 오면 알림을 받습니다
                        </div>
                      </div>
                      <span className="text-green-600 font-medium">켜짐</span>
                    </div>
                  </div>

                  <div className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">
                          리뷰 알림
                        </div>
                        <div className="text-sm text-gray-600">
                          새 리뷰가 등록되면 알림을 받습니다
                        </div>
                      </div>
                      <span className="text-green-600 font-medium">켜짐</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </MypageLayoutWrapper>
  );
}
