/**
 * CSS 색상 하드코딩 자동 수정 스크립트
 * #0f3460 → brand-primary (Tailwind 변수)
 */

const fs = require('fs');
const path = require('path');

// 수정할 패턴들
const replacements = [
  // text-[#0f3460]
  { pattern: /text-\[#0f3460\]/g, replacement: 'text-brand-primary' },
  // bg-[#0f3460]
  { pattern: /bg-\[#0f3460\]/g, replacement: 'bg-brand-primary' },
  // border-[#0f3460]
  { pattern: /border-\[#0f3460\]/g, replacement: 'border-brand-primary' },
  // hover:text-[#0f3460]
  { pattern: /hover:text-\[#0f3460\]/g, replacement: 'hover:text-brand-primary' },
  // hover:bg-[#0f3460]
  { pattern: /hover:bg-\[#0f3460\]/g, replacement: 'hover:bg-brand-primary' },
  // hover:border-[#0f3460]
  { pattern: /hover:border-\[#0f3460\]/g, replacement: 'hover:border-brand-primary' },
  // group-hover:text-[#0f3460]
  { pattern: /group-hover:text-\[#0f3460\]/g, replacement: 'group-hover:text-brand-primary' },
  // group-hover:bg-[#0f3460]
  { pattern: /group-hover:bg-\[#0f3460\]/g, replacement: 'group-hover:bg-brand-primary' },
  // group-hover:border-[#0f3460]
  { pattern: /group-hover:border-\[#0f3460\]/g, replacement: 'group-hover:border-brand-primary' },
  // active:text-[#0f3460]
  { pattern: /active:text-\[#0f3460\]/g, replacement: 'active:text-brand-primary' },
  // ring-[#0f3460]
  { pattern: /ring-\[#0f3460\]/g, replacement: 'ring-brand-primary' },
];

// 수정할 파일 목록
const filesToFix = [
  'src/app/landing/page.tsx',
  'src/app/mypage/seller/reviews/SellerReviewsClient.tsx',
  'src/app/mypage/seller/services/SellerServicesClient.tsx',
  'src/app/mypage/seller/orders/[id]/SellerOrderDetailClient.tsx',
  'src/app/mypage/buyer/reviews/BuyerReviewsClient.tsx',
  'src/app/mypage/buyer/quotes/BuyerQuotesClient.tsx',
  'src/app/mypage/seller/orders/SellerOrdersClient.tsx',
  'src/app/admin/services/page.tsx',
  'src/app/admin/service-revisions/page.tsx',
  'src/app/mypage/seller/portfolio/SellerPortfolioClient.tsx',
  'src/app/mypage/seller/earnings/SellerEarningsClient.tsx',
  'src/components/services/ServiceCard.tsx',
  'src/components/services/PurchaseButton.tsx',
  'src/components/services/PortfolioModal.tsx',
  'src/components/services/ContactSellerButton.tsx',
  'src/components/layout/MobileBottomNav.tsx',
  'src/components/landing/AIServicesShowcase.tsx',
  'src/components/home/RecentVisitedCategories.tsx',
  'src/components/home/RecentViewedServices.tsx',
  'src/components/home/PersonalizedServices.tsx',
  'src/components/home/AITalentShowcase.tsx',
  'src/components/chat/ChatNotificationBadge.tsx',
  'src/app/services/[id]/page.tsx',
  'src/app/payment/[paymentRequestId]/PaymentClient.tsx',
  'src/app/payment/direct/[orderId]/DirectPaymentClient.tsx',
  'src/app/payment/bank-transfer/[orderId]/BankTransferClient.tsx',
  'src/app/mypage/settings/SettingsClient.tsx',
  'src/app/mypage/settings/edit/SettingsEditClient.tsx',
  'src/app/mypage/seller/statistics/SellerStatisticsClient.tsx',
  'src/app/mypage/seller/services/[id]/edit/EditServiceClient.tsx',
  'src/app/mypage/seller/services/statistics/ServiceStatisticsClient.tsx',
  'src/app/mypage/seller/services/new/steps/Step5Requirements.tsx',
  'src/app/mypage/seller/services/new/steps/Step4Images.tsx',
  'src/app/mypage/seller/services/new/steps/Step3Description.tsx',
  'src/app/mypage/seller/services/new/steps/Step2Pricing.tsx',
  'src/app/mypage/seller/services/new/NewServiceClientV2.tsx',
  'src/app/mypage/seller/services/new/NewServiceClient.tsx',
  'src/app/mypage/seller/register/SellerRegisterClient.tsx',
  'src/app/mypage/seller/profile/SellerProfileClient.tsx',
  'src/app/mypage/seller/profile/edit/SellerProfileEditClient.tsx',
  'src/app/mypage/seller/portfolio/[id]/PortfolioDetailClient.tsx',
  'src/app/mypage/seller/portfolio/[id]/edit/PortfolioEditClient.tsx',
  'src/app/mypage/seller/portfolio/new/PortfolioNewClient.tsx',
  'src/app/mypage/seller/grade/SellerGradeClient.tsx',
  'src/app/mypage/buyer/favorites/page.tsx',
  'src/app/mypage/buyer/dashboard/BuyerDashboardClient.tsx',
  'src/app/mypage/buyer/coupons/charge/CashChargeClient.tsx',
  'src/app/chat/[roomId]/DirectChatClient.tsx',
  'src/app/chat/ChatListClient.tsx',
  'src/app/admin/withdrawals/page.tsx',
];

let totalChanges = 0;
let filesModified = 0;

console.log('🔧 CSS 색상 하드코딩 자동 수정 시작...\n');

filesToFix.forEach(relativeFilePath => {
  const filePath = path.join(process.cwd(), relativeFilePath);

  try {
    // 파일 읽기
    let content = fs.readFileSync(filePath, 'utf8');
    let fileChanged = false;
    let fileChanges = 0;

    // 모든 패턴 적용
    replacements.forEach(({ pattern, replacement }) => {
      const matches = content.match(pattern);
      if (matches) {
        content = content.replace(pattern, replacement);
        fileChanges += matches.length;
        fileChanged = true;
      }
    });

    // 파일 저장
    if (fileChanged) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ ${relativeFilePath} - ${fileChanges}개 수정`);
      filesModified++;
      totalChanges += fileChanges;
    }
  } catch (error) {
    console.error(`❌ ${relativeFilePath} - 오류: ${error.message}`);
  }
});

console.log(`\n🎉 완료! ${filesModified}개 파일에서 총 ${totalChanges}개 수정됨`);
