#!/bin/bash

# Fix remaining API routes with unused request parameter
for file in src/app/api/chat/messages/mark-all-read/route.ts \
            src/app/api/chat/rooms/route.ts \
            src/app/api/chat/unread-count/route.ts \
            src/app/api/nice/verify/route.ts \
            src/app/api/notifications/count/route.ts \
            src/app/api/notifications/read-all/route.ts \
            src/app/api/orders/buyer/count/route.ts \
            src/app/api/orders/seller/count/route.ts \
            src/app/api/seller/advertising/dashboard/route.ts \
            src/app/api/user/service-favorites/route.ts; do
  if [ -f "$file" ]; then
    sed -i 's/(request/(\_request/g' "$file"
  fi
done

# Fix specific files
sed -i 's/request)/_request)/g' src/app/api/user/category-visits/route.ts
sed -i 's/isExisting/_isExisting/g' src/app/api/payments/direct-purchase/route.ts
sed -i 's/uploadData/_uploadData/g' src/app/api/seller/advertising/bank-transfer/route.ts
sed -i 's/NextResponse/_NextResponse/g' src/app/api/sentry-test/route.ts
sed -i 's/const { data, error }/const { error }/g' src/app/api/upload/route.ts
sed -i 's/todayStr/_todayStr/g' src/app/api/user/category-visits/route.ts
sed -i 's/, benefits)/, _benefits)/g' src/app/mypage/buyer/dashboard/BuyerDashboardClient.tsx
sed -i 's/, err)/, _err)/g' src/app/mypage/seller/orders/SellerOrdersClient.tsx
sed -i 's/, payload)/, _payload)/g' src/app/mypage/seller/orders/SellerOrdersClient.tsx
sed -i 's/, sellerId)/, _sellerId)/g' src/app/mypage/seller/portfolio/[id]/PortfolioDetailClient.tsx
sed -i 's/const { data, error }/const { error }/g' src/app/mypage/seller/profile/edit/page.tsx
sed -i 's/const { data: seller }/const { data: _seller }/g' src/app/mypage/seller/register/SellerRegisterClient.tsx
sed -i 's/, serviceId)/, _serviceId)/g' src/app/mypage/seller/services/statistics/ServiceStatisticsClient.tsx
sed -i 's/const { data, error }/const { error }/g' src/app/mypage/settings/edit/SettingsEditClient.tsx
sed -i 's/userId)/_userId)/g' src/lib/supabase/queries/dashboard.ts

# Remove unused imports
sed -i "s/import { PortOne }/\/\/ import { PortOne }/g" src/app/payment/direct/[orderId]/DirectPaymentClient.tsx

echo "Fixed all remaining issues"
