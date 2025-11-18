import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import SellerProfileClient from "./SellerProfileClient";

export default async function SellerProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // sellers 테이블에서 판매자 정보 조회
  const { data: seller, error: sellerError } = await supabase
    .from("sellers")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (sellerError) {
    console.error("Seller fetch error:", sellerError);
  }

  if (!seller) {
    redirect("/mypage/seller/register");
  }

  // profiles 테이블에서 profile_image와 name(display_name) 조회
  const { data: profileData } = await supabase
    .from("profiles")
    .select("profile_image, name")
    .eq("user_id", user.id)
    .single();

  // profiles 데이터를 seller에 추가
  // - profile_image: sellers 테이블에는 없음
  // - name → display_name: sellers 테이블에서 display_name 컬럼이 제거되어 profiles.name 사용
  const profileWithData = {
    ...seller,
    profile_image: profileData?.profile_image || null,
    display_name: profileData?.name || seller.name || "",
  };

  return <SellerProfileClient profile={profileWithData} />;
}
