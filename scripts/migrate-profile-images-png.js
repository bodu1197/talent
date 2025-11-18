require("dotenv").config({ path: ".env.local" });
const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

async function main() {
  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("🔄 프로필 이미지 마이그레이션 (PNG 변환)");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  // 1. 마이그레이션이 필요한 사용자 찾기
  const { data: profiles, error: fetchError } = await supabase
    .from("profiles")
    .select("user_id, name, profile_image")
    .or("profile_image.is.null,profile_image.like.%api.dicebear.com%");

  if (fetchError) {
    console.error("❌ 프로필 조회 실패:", fetchError);
    return;
  }

  console.log(`📊 마이그레이션 대상: ${profiles.length}명\n`);

  if (profiles.length === 0) {
    console.log("✅ 마이그레이션 할 사용자가 없습니다.");
    return;
  }

  let successCount = 0;
  let failCount = 0;

  // 2. 각 사용자에 대해 마이그레이션 실행
  for (const profile of profiles) {
    console.log(`\n처리 중: ${profile.name} (${profile.user_id})`);

    try {
      // 2.1. DiceBear PNG 이미지 생성 (SVG 대신 PNG 형식 요청)
      let dicebearUrl;
      if (profile.profile_image && profile.profile_image.includes("api.dicebear.com")) {
        // 기존 SVG URL을 PNG로 변경
        dicebearUrl = profile.profile_image.replace("/svg?", "/png?");
        console.log(`   기존 DiceBear URL을 PNG로 변경`);
      } else {
        const seed = encodeURIComponent(profile.name || "user");
        dicebearUrl = `https://api.dicebear.com/7.x/avataaars/png?seed=${seed}&backgroundColor=b6e3f4,c0aede,d1d4f9&size=200`;
        console.log(`   새 DiceBear PNG URL 생성`);
      }

      // 2.2. PNG 다운로드
      const pngResponse = await fetch(dicebearUrl);
      if (!pngResponse.ok) {
        throw new Error(`DiceBear fetch 실패: ${pngResponse.status}`);
      }
      const pngBlob = await pngResponse.blob();
      console.log(`   ✓ PNG 다운로드 완료 (${pngBlob.size} bytes)`);

      // 2.3. Supabase Storage에 업로드
      const fileName = `${profile.user_id}_${Date.now()}.png`;
      const filePath = `profiles/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("profiles")
        .upload(filePath, pngBlob, {
          contentType: "image/png",
          upsert: true,
        });

      if (uploadError) {
        throw new Error(`Storage 업로드 실패: ${uploadError.message}`);
      }
      console.log(`   ✓ Storage 업로드 완료: ${filePath}`);

      // 2.4. Public URL 생성
      const {
        data: { publicUrl },
      } = supabase.storage.from("profiles").getPublicUrl(filePath);

      console.log(`   ✓ Public URL: ${publicUrl}`);

      // 2.5. profiles 테이블 업데이트
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          profile_image: publicUrl,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", profile.user_id);

      if (updateError) {
        throw new Error(`Profile 업데이트 실패: ${updateError.message}`);
      }

      console.log(`   ✅ 마이그레이션 성공!`);
      successCount++;
    } catch (error) {
      console.error(`   ❌ 실패:`, error.message);
      failCount++;
    }
  }

  // 3. 결과 요약
  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("📊 마이그레이션 결과");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
  console.log(`전체: ${profiles.length}명`);
  console.log(`✅ 성공: ${successCount}명`);
  console.log(`❌ 실패: ${failCount}명\n`);

  if (successCount > 0) {
    console.log("✨ 마이그레이션이 완료되었습니다!");
    console.log("   이제 모든 사용자의 프로필 이미지가 Supabase Storage에");
    console.log("   PNG 형식으로 저장되어 안정적으로 표시됩니다.\n");
  }
}

main().catch(console.error);
