"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import MypageLayoutWrapper from "@/components/mypage/MypageLayoutWrapper";
import { createClient } from "@/lib/supabase/client";
import { FaTimes, FaUser, FaKey, FaBell } from "react-icons/fa";
import toast from "react-hot-toast";

interface ProfileData {
  name?: string;
  email?: string;
  profile_image?: string | null;
  phone?: string | null;
  bio?: string | null;
}

interface Props {
  profile: ProfileData | null;
  userEmail: string;
  isSeller: boolean;
}

export default function SettingsEditClient({
  profile,
  userEmail,
  isSeller,
}: Props) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("profile");
  const [isLoading, setIsLoading] = useState(false);

  // 프로필 정보
  const [name, setName] = useState(profile?.name || "");
  const [bio, setBio] = useState("");
  const [profileImage, setProfileImage] = useState(
    profile?.profile_image || "",
  );
  const [uploading, setUploading] = useState(false);

  // 비밀번호 변경
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // 알림 설정
  const [orderNotification, setOrderNotification] = useState(true);
  const [messageNotification, setMessageNotification] = useState(true);
  const [reviewNotification, setReviewNotification] = useState(true);

  const supabase = createClient();

  // 프로필 이미지 업로드
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 파일 크기 체크 (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("파일 크기는 5MB 이하만 가능합니다.");
      return;
    }

    // 이미지 파일 체크
    if (!file.type.startsWith("image/")) {
      toast.error("이미지 파일만 업로드 가능합니다.");
      return;
    }

    try {
      setUploading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        toast.error("로그인이 필요합니다.");
        return;
      }

      // 파일 확장자 추출
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}_${Date.now()}.${fileExt}`;
      const filePath = `profiles/${fileName}`;

      // Supabase Storage에 업로드
      const { error: uploadError } = await supabase.storage
        .from("profiles")
        .upload(filePath, file, {
          upsert: true,
        });

      if (uploadError) {
        console.error("Upload error:", uploadError);
        throw uploadError;
      }

      // Public URL 가져오기
      const {
        data: { publicUrl },
      } = supabase.storage.from("profiles").getPublicUrl(filePath);

      setProfileImage(publicUrl);
      toast.success("프로필 이미지가 업로드되었습니다.");
    } catch (error) {
      console.error(
        "Image upload error:",
        JSON.stringify(error, Object.getOwnPropertyNames(error), 2),
      );
      toast.error("이미지 업로드 중 오류가 발생했습니다.");
    } finally {
      setUploading(false);
    }
  };

  // 프로필 저장
  const handleSaveProfile = async () => {
    try {
      setIsLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        toast.error("로그인이 필요합니다.");
        return;
      }

      // API를 통해 프로필 업데이트 (RLS 우회)
      const response = await fetch("/api/users/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          profile_image: profileImage,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error("=== PROFILE UPDATE ERROR ===");
        console.error("Status:", response.status);
        console.error("Response:", result);
        console.error(
          "Error Message:",
          result.error instanceof Error
            ? result.error.message
            : String(result.error),
        );
        console.error("Error Details:", result.details);

        // 더 자세한 오류 메시지
        let errorMessage = "프로필 저장 중 오류가 발생했습니다.\n\n";

        if (
          response.status === 500 &&
          result.details?.includes("SUPABASE_SERVICE_ROLE_KEY")
        ) {
          errorMessage += "서버 설정 오류: 관리자에게 문의해주세요.\n";
          errorMessage += "(환경 변수가 설정되지 않았습니다)";
        } else {
          errorMessage += `오류: ${result.error || "알 수 없는 오류"}\n`;
          errorMessage += `코드: ${result.code || "N/A"}\n`;
          if (result.details) {
            errorMessage += `상세: ${result.details}`;
          }
        }

        toast.error(errorMessage);
        return;
      }

      toast.success("프로필이 저장되었습니다.");
      router.push("/mypage/settings");
    } catch (error: unknown) {
      console.error(
        "Profile save error:",
        JSON.stringify(error, Object.getOwnPropertyNames(error), 2),
      );
      if (!(error instanceof Error) || !error.message) {
        toast.error("프로필 저장 중 알 수 없는 오류가 발생했습니다.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 비밀번호 변경
  const handleChangePassword = async () => {
    try {
      if (!currentPassword || !newPassword || !confirmPassword) {
        toast.error("모든 필드를 입력해주세요.");
        return;
      }

      if (newPassword !== confirmPassword) {
        toast.error("새 비밀번호가 일치하지 않습니다.");
        return;
      }

      if (newPassword.length < 6) {
        toast.error("비밀번호는 최소 6자 이상이어야 합니다.");
        return;
      }

      setIsLoading(true);

      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      toast.success("비밀번호가 변경되었습니다.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      router.push("/mypage/settings");
    } catch (error) {
      console.error(
        "Password change error:",
        JSON.stringify(error, Object.getOwnPropertyNames(error), 2),
      );
      toast.error("비밀번호 변경 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  // 알림 설정 저장
  const handleSaveNotifications = async () => {
    try {
      setIsLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        toast.error("로그인이 필요합니다.");
        return;
      }

      // 알림 설정을 users 테이블이나 별도 notification_settings 테이블에 저장
      const { error } = await supabase
        .from("users")
        .update({
          notification_settings: {
            order: orderNotification,
            message: messageNotification,
            review: reviewNotification,
          },
        })
        .eq("id", user.id);

      if (error) throw error;

      toast.success("알림 설정이 저장되었습니다.");
      router.push("/mypage/settings");
    } catch (error) {
      console.error(
        "Notification settings save error:",
        JSON.stringify(error, Object.getOwnPropertyNames(error), 2),
      );
      toast.error("알림 설정 저장 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MypageLayoutWrapper mode={isSeller ? "seller" : "buyer"}>
      <div className="py-8 px-4">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">설정 수정</h1>
            <p className="text-gray-600 mt-1 text-sm">
              계정 및 알림 설정을 수정하세요
            </p>
          </div>
          <button
            onClick={() => router.push("/mypage/settings")}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <FaTimes className="mr-2 inline" />
            취소
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
                  프로필 설정
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      프로필 이미지
                    </label>
                    <div className="flex items-center gap-4">
                      {profileImage ? (
                        <img
                          src={profileImage}
                          alt="프로필 이미지"
                          className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
                        />
                      ) : (
                        <div className="w-20 h-20 bg-brand-primary rounded-full flex items-center justify-center text-white text-2xl font-bold">
                          {name?.[0] || profile?.name?.[0] || "U"}
                        </div>
                      )}
                      <div>
                        <input
                          type="file"
                          id="profile-image-upload"
                          accept="image/*"
                          onChange={handleImageUpload}
                          disabled={uploading}
                          className="hidden"
                        />
                        <label
                          htmlFor="profile-image-upload"
                          className={`inline-block px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm cursor-pointer ${
                            uploading ? "opacity-50 cursor-not-allowed" : ""
                          }`}
                        >
                          {uploading ? "업로드 중..." : "변경"}
                        </label>
                        <p className="text-xs text-gray-500 mt-1">
                          JPG, PNG (최대 5MB)
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      이름
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      이메일
                    </label>
                    <input
                      type="email"
                      value={userEmail}
                      disabled
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      이메일 주소는 변경할 수 없습니다
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      자기소개
                    </label>
                    <textarea
                      rows={4}
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                      placeholder="자기소개를 입력하세요"
                    ></textarea>
                  </div>

                  <button
                    onClick={handleSaveProfile}
                    disabled={isLoading}
                    className="px-6 py-2 bg-brand-primary text-white rounded-lg hover:bg-[#1a4d8f] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? "저장 중..." : "저장"}
                  </button>
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
                      현재 비밀번호
                    </label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      새 비밀번호
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      비밀번호 확인
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                    />
                  </div>

                  <button
                    onClick={handleChangePassword}
                    disabled={isLoading}
                    className="px-6 py-2 bg-brand-primary text-white rounded-lg hover:bg-[#1a4d8f] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? "변경 중..." : "비밀번호 변경"}
                  </button>
                </div>
              </div>
            )}

            {activeTab === "notifications" && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">
                  알림 설정
                </h2>
                <div className="space-y-4">
                  <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900">주문 알림</div>
                      <div className="text-sm text-gray-600">
                        새 주문이 들어오면 알림을 받습니다
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={orderNotification}
                      onChange={(e) => setOrderNotification(e.target.checked)}
                      className="w-5 h-5 text-brand-primary"
                    />
                  </label>

                  <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900">
                        메시지 알림
                      </div>
                      <div className="text-sm text-gray-600">
                        새 메시지가 오면 알림을 받습니다
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={messageNotification}
                      onChange={(e) => setMessageNotification(e.target.checked)}
                      className="w-5 h-5 text-brand-primary"
                    />
                  </label>

                  <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900">리뷰 알림</div>
                      <div className="text-sm text-gray-600">
                        새 리뷰가 등록되면 알림을 받습니다
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={reviewNotification}
                      onChange={(e) => setReviewNotification(e.target.checked)}
                      className="w-5 h-5 text-brand-primary"
                    />
                  </label>

                  <button
                    onClick={handleSaveNotifications}
                    disabled={isLoading}
                    className="px-6 py-2 bg-brand-primary text-white rounded-lg hover:bg-[#1a4d8f] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? "저장 중..." : "저장"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </MypageLayoutWrapper>
  );
}
