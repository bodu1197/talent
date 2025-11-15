#!/bin/bash

# Fix unused variables in multiple files

# ChatListClient.tsx
sed -i 's/const { data, error } = await supabase/const { error } = await supabase/g' src/app/chat/ChatListClient.tsx
sed -i 's/const isSeller = /const _isSeller = /g' src/app/chat/ChatListClient.tsx

# BuyerDashboardClient.tsx
sed -i 's/, benefits)/, _benefits)/g' src/app/mypage/buyer/dashboard/BuyerDashboardClient.tsx

# BuyerReviewsClient.tsx
sed -i 's/setPendingReviews/_setPendingReviews/g' src/app/mypage/buyer/reviews/BuyerReviewsClient.tsx
sed -i 's/setWrittenReviews/_setWrittenReviews/g' src/app/mypage/buyer/reviews/BuyerReviewsClient.tsx

# BecomeSellerForm.tsx
sed -i 's/(err)/()/g' src/app/mypage/seller/BecomeSellerForm.tsx

# SellerOrdersClient.tsx
sed -i 's/console\.log(/\/\/ console.log(/g' src/app/mypage/seller/orders/SellerOrdersClient.tsx
sed -i 's/, payload)/, _payload)/g' src/app/mypage/seller/orders/SellerOrdersClient.tsx

# SellerOrderDetailClient.tsx
sed -i 's/const router = /const _router = /g' src/app/mypage/seller/orders/[id]/SellerOrderDetailClient.tsx

# PortfolioDetailClient.tsx
sed -i 's/, sellerId)/, _sellerId)/g' src/app/mypage/seller/portfolio/[id]/PortfolioDetailClient.tsx

# PortfolioEditClient.tsx
sed -i 's/const categoryTree = /const _categoryTree = /g' src/app/mypage/seller/portfolio/[id]/edit/PortfolioEditClient.tsx

# PortfolioNewClient.tsx
sed -i 's/const categoryTree = /const _categoryTree = /g' src/app/mypage/seller/portfolio/new/PortfolioNewClient.tsx

# SellerProfileEditClient.tsx
sed -i 's/display_name, bio, profile_image/_display_name, _bio, _profile_image/g' src/app/mypage/seller/profile/edit/SellerProfileEditClient.tsx

# page.tsx (seller profile edit)
sed -i 's/const { data, error } =/const { error } =/g' src/app/mypage/seller/profile/edit/page.tsx

# SellerRegisterClient.tsx
sed -i 's/birthDate, gender/_birthDate, _gender/g' src/app/mypage/seller/register/SellerRegisterClient.tsx
sed -i 's/const { data: seller }/const { data: _seller }/g' src/app/mypage/seller/register/SellerRegisterClient.tsx

# SellerServicesClient.tsx
sed -i 's/rejectedRevision/_rejectedRevision/g' src/app/mypage/seller/services/SellerServicesClient.tsx

# ServiceStatisticsClient.tsx
sed -i 's/, serviceId)/, _serviceId)/g' src/app/mypage/seller/services/statistics/ServiceStatisticsClient.tsx
sed -i 's/, index)/, _index)/g' src/app/mypage/seller/services/statistics/ServiceStatisticsClient.tsx

# SettingsEditClient.tsx
sed -i 's/const { data, error }/const { error }/g' src/app/mypage/settings/edit/SettingsEditClient.tsx

# DirectPaymentClient.tsx
sed -i "s/import { PortOne }/\/\/ import { PortOne }/g" src/app/payment/direct/[orderId]/DirectPaymentClient.tsx

# services/[id]/page.tsx
sed -i 's/function getYoutubeVideoId/function _getYoutubeVideoId/g' src/app/services/[id]/page.tsx

# CategoryFilter.tsx
sed -i 's/categoryId, isAI/_categoryId, _isAI/g' src/components/categories/CategoryFilter.tsx
sed -i 's/const currentSort = /const _currentSort = /g' src/components/categories/CategoryFilter.tsx

# PortfolioGrid.tsx
sed -i 's/const getYoutubeVideoId = /const _getYoutubeVideoId = /g' src/components/services/PortfolioGrid.tsx

# TextOverlayEditor.tsx
sed -i 's/displayWidth/_displayWidth/g' src/components/services/TextOverlayEditor.tsx
sed -i 's/displayHeight/_displayHeight/g' src/components/services/TextOverlayEditor.tsx

# useYoutubeThumbnail.ts
sed -i 's/(err)/()/g' src/hooks/useYoutubeThumbnail.ts

# dashboard.ts
sed -i 's/, userId)/, _userId)/g' src/lib/supabase/queries/dashboard.ts

# Fix console.log in advertising page
sed -i "s/console\.log('입금 확인 클릭'/\/\/ console.log('입금 확인 클릭'/g" src/app/mypage/seller/advertising/page.tsx
sed -i "s/console\.log('상세보기 클릭'/\/\/ console.log('상세보기 클릭'/g" src/app/mypage/seller/advertising/page.tsx

# PageViewTracker.tsx
sed -i 's/console\.log(/\/\/ console.log(/g' src/components/analytics/PageViewTracker.tsx

echo "Fixed all remaining unused variables and console statements"
