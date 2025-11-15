#!/bin/bash

# Fix BuyerDashboardClient.tsx
sed -i 's/sellerId, benefits)/sellerId, _benefits)/g' src/app/mypage/buyer/dashboard/BuyerDashboardClient.tsx

# Fix SellerOrdersClient.tsx
sed -i 's/} catch (err) {/} catch {/g' src/app/mypage/seller/orders/SellerOrdersClient.tsx
sed -i 's/, err)/, _err)/g' src/app/mypage/seller/orders/SellerOrdersClient.tsx
sed -i 's/, payload)/, _payload)/g' src/app/mypage/seller/orders/SellerOrdersClient.tsx

# Fix PortfolioDetailClient.tsx  
sed -i 's/serviceId, sellerId)/serviceId, _sellerId)/g' src/app/mypage/seller/portfolio/[id]/PortfolioDetailClient.tsx

# Fix seller profile edit page
sed -i 's/const { data, error }/const { error }/g' src/app/mypage/seller/profile/edit/page.tsx

# Fix SellerRegisterClient.tsx
sed -i 's/const { data: seller }/const { data: _seller }/g' src/app/mypage/seller/register/SellerRegisterClient.tsx

# Fix ServiceStatisticsClient.tsx
sed -i 's/orderId, serviceId)/orderId, _serviceId)/g' src/app/mypage/seller/services/statistics/ServiceStatisticsClient.tsx

# Fix SettingsEditClient.tsx
sed -i 's/const { data, error }/const { error }/g' src/app/mypage/settings/edit/SettingsEditClient.tsx

# Fix DirectPaymentClient.tsx - remove import
sed -i 's/^import { PortOne }/\/\/ import { PortOne }/g' src/app/payment/direct/[orderId]/DirectPaymentClient.tsx

# Fix dashboard.ts
sed -i 's/supabase, userId)/supabase, _userId)/g' src/lib/supabase/queries/dashboard.ts

# Fix advertising page console.log
sed -i "s/console\.log('입금/\/\/ console.log('입금/g" src/app/mypage/seller/advertising/page.tsx
sed -i "s/console\.log('상세/\/\/ console.log('상세/g" src/app/mypage/seller/advertising/page.tsx

# Fix PageViewTracker console.log
sed -i 's/console\.log/\/\/ console.log/g' src/components/analytics/PageViewTracker.tsx

echo "All remaining fixes applied"
