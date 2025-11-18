require("dotenv").config({ path: ".env.local" });
const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

async function main() {
  const userEmail = "1197@gmail.com";

  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("🔍 사용자 프로필 이미지 진단");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  // 1. auth.users에서 사용자 찾기
  const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();

  if (authError) {
    console.error("❌ Auth users 조회 실패:", authError);
    return;
  }

  const authUser = authUsers.users.find(u => u.email === userEmail);

  if (!authUser) {
    console.log("❌ 사용자를 찾을 수 없습니다:", userEmail);
    return;
  }

  console.log("✅ Auth User 찾음:");
  console.log(`   User ID: ${authUser.id}`);
  console.log(`   Email: ${authUser.email}`);
  console.log(`   Created: ${authUser.created_at}`);
  console.log(`   Metadata:`, authUser.user_metadata);

  // 2. profiles 테이블에서 프로필 정보 조회
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", authUser.id)
    .single();

  if (profileError) {
    console.error("\n❌ Profile 조회 실패:", profileError);
    return;
  }

  console.log("\n📊 Profile 정보:");
  console.log(`   Name: ${profile.name}`);
  console.log(`   Profile Image: ${profile.profile_image}`);
  console.log(`   Created: ${profile.created_at}`);
  console.log(`   Updated: ${profile.updated_at}`);

  // 3. 이미지 URL 분석
  if (!profile.profile_image) {
    console.log("\n⚠️  프로필 이미지가 NULL입니다.");
  } else if (profile.profile_image.includes("api.dicebear.com")) {
    console.log("\n⚠️  외부 DiceBear URL을 사용 중:");
    console.log(`   ${profile.profile_image}`);
    console.log("\n   → Supabase Storage로 마이그레이션 필요");
  } else if (profile.profile_image.includes("supabase.co/storage")) {
    console.log("\n✅ Supabase Storage URL 사용 중:");
    console.log(`   ${profile.profile_image}`);

    // 파일 존재 여부 확인
    const urlParts = profile.profile_image.split("/storage/v1/object/public/");
    if (urlParts.length === 2) {
      const [bucket, ...pathParts] = urlParts[1].split("/");
      const filePath = pathParts.join("/");

      console.log(`\n🔍 파일 존재 여부 확인:`);
      console.log(`   Bucket: ${bucket}`);
      console.log(`   Path: ${filePath}`);

      const { data: fileData, error: fileError } = await supabase.storage
        .from(bucket)
        .download(filePath);

      if (fileError) {
        console.log(`\n❌ 파일을 찾을 수 없습니다!`);
        console.log(`   Error:`, fileError);
        console.log(`\n   → 이것이 400 에러의 원인입니다!`);
      } else {
        console.log(`\n✅ 파일 존재 확인됨 (${fileData.size} bytes)`);
      }
    }
  } else {
    console.log("\n⚠️  알 수 없는 URL 형식:");
    console.log(`   ${profile.profile_image}`);
  }

  // 4. 모든 프로필 이미지 URL 패턴 통계
  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("📊 전체 사용자 프로필 이미지 통계");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  const { data: allProfiles } = await supabase
    .from("profiles")
    .select("profile_image");

  const stats = {
    null: 0,
    dicebear: 0,
    supabase: 0,
    other: 0,
  };

  allProfiles?.forEach((p) => {
    if (!p.profile_image) {
      stats.null++;
    } else if (p.profile_image.includes("api.dicebear.com")) {
      stats.dicebear++;
    } else if (p.profile_image.includes("supabase.co/storage")) {
      stats.supabase++;
    } else {
      stats.other++;
    }
  });

  console.log(`전체 사용자: ${allProfiles?.length || 0}명`);
  console.log(`NULL: ${stats.null}명`);
  console.log(`DiceBear (외부): ${stats.dicebear}명`);
  console.log(`Supabase Storage: ${stats.supabase}명`);
  console.log(`기타: ${stats.other}명`);

  if (stats.null > 0 || stats.dicebear > 0) {
    console.log(`\n⚠️  마이그레이션 필요: ${stats.null + stats.dicebear}명`);
  }
}

main().catch(console.error);
