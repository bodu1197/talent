const fs = require("fs");

// S3358 남은 파일 리스트 및 패턴 분석
const remainingFiles = [
  // Status badge pattern (similar to what we already fixed)
  {
    file: "src/app/mypage/seller/advertising/page.tsx",
    pattern: "status-badge",
    lines: [188, 467, 533],
  },
  {
    file: "src/app/admin/advertising/payments/page.tsx",
    pattern: "status-badge",
    lines: [103, 665],
  },

  // Chat patterns
  {
    file: "src/app/chat/ChatListClient.tsx",
    pattern: "custom",
    lines: [665, 958],
  },

  // Auth pattern
  {
    file: "src/app/auth/register/page.tsx",
    pattern: "custom",
    lines: [529, 543],
  },

  // Order pattern
  {
    file: "src/app/mypage/buyer/orders/[id]/page.tsx",
    pattern: "custom",
    lines: [516, 518],
  },

  // Single issue files
  {
    file: "src/app/admin/advertising/credits/page.tsx",
    pattern: "status-badge",
    lines: [265],
  },
  {
    file: "src/app/admin/advertising/page.tsx",
    pattern: "status-badge",
    lines: [296],
  },
  {
    file: "src/app/admin/advertising/statistics/page.tsx",
    pattern: "custom",
    lines: [470],
  },
  {
    file: "src/app/mypage/seller/portfolio/[id]/edit/PortfolioEditClient.tsx",
    pattern: "custom",
    lines: [644],
  },
  {
    file: "src/app/mypage/seller/portfolio/new/PortfolioNewClient.tsx",
    pattern: "custom",
    lines: [544],
  },
  {
    file: "src/components/mypage/MobileSidebar.tsx",
    pattern: "custom",
    lines: [156],
  },
  {
    file: "src/components/layout/ConditionalLayout.tsx",
    pattern: "custom",
    lines: [63],
  },
];

console.log("남은 S3358 Nested Ternary 파일:");
console.log("=================================\n");

let totalStatusBadge = 0;
let totalCustom = 0;

remainingFiles.forEach((item) => {
  console.log(`${item.file}`);
  console.log(`  Pattern: ${item.pattern}`);
  console.log(`  Lines: ${item.lines.join(", ")}`);
  console.log(`  Count: ${item.lines.length}개\n`);

  if (item.pattern === "status-badge") {
    totalStatusBadge += item.lines.length;
  } else {
    totalCustom += item.lines.length;
  }
});

console.log("\n요약:");
console.log(`Status Badge 패턴: ${totalStatusBadge}개 (자동 처리 가능)`);
console.log(`Custom 패턴: ${totalCustom}개 (개별 검토 필요)`);
console.log(`전체: ${totalStatusBadge + totalCustom}개`);

console.log("\n\n다음 처리 순서:");
console.log("1. advertising/page.tsx (3개 - status badge)");
console.log("2. payments/page.tsx (2개 - status badge)");
console.log("3. ChatListClient.tsx (2개 - custom)");
console.log("4. register/page.tsx (2개 - custom)");
console.log("5. 나머지 단일 파일들");
