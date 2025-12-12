/* eslint-disable sonarjs/cognitive-complexity, sonarjs/os-command, sonarjs/no-os-command-from-path, sonarjs/no-hardcoded-passwords, sonarjs/sql-queries, sonarjs/slow-regex */
require("dotenv").config({ path: ".env.local" });
const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

async function main() {
  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("📊 서비스 상태 확인");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  // 전체 서비스 수
  const { count: totalCount } = await supabase
    .from("services")
    .select("*", { count: "exact", head: true });

  const { count: activeCount } = await supabase
    .from("services")
    .select("*", { count: "exact", head: true })
    .eq("status", "active");

  console.log(`전체 서비스: ${totalCount}개`);
  console.log(`활성 서비스: ${activeCount}개\n`);

  // 활성 서비스 목록 (최대 20개)
  const { data: services } = await supabase
    .from("services")
    .select(
      `
      id,
      title,
      status,
      seller:sellers(id, business_name)
    `,
    )
    .eq("status", "active")
    .limit(20);

  console.log("활성 서비스 목록:\n");
  services?.forEach((s, i) => {
    console.log(`${i + 1}. ${s.title}`);
    console.log(`   ID: ${s.id}`);
    console.log(`   판매자: ${s.seller?.business_name || "N/A"}`);
    console.log(`   URL: https://dolpagu.com/services/${s.id}\n`);
  });

  // 카테고리 연결 확인
  const { count: categoryLinksCount } = await supabase
    .from("service_categories")
    .select("*", { count: "exact", head: true });

  console.log(`\n서비스-카테고리 연결: ${categoryLinksCount}개\n`);
}

main();
