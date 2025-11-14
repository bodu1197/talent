import { QueryClient } from '@tanstack/react-query'

// 구매자 페이지 데이터 프리페칭 함수
export async function prefetchBuyerData(queryClient: QueryClient) {
  // 모든 API를 병렬로 프리페치
  await Promise.allSettled([
    // 주문 목록 (전체)
    queryClient.prefetchQuery({
      queryKey: ['buyer', 'orders', 'all'],
      queryFn: () => fetch('/api/orders/buyer').then(res => res.json()),
    }),

    // 주문 상태별 카운트
    queryClient.prefetchQuery({
      queryKey: ['buyer', 'orders', 'count'],
      queryFn: () => fetch('/api/orders/buyer/count').then(res => res.json()),
    }),

    // TODO: Uncomment when these API routes are implemented
    // // 견적 요청 목록
    // queryClient.prefetchQuery({
    //   queryKey: ['buyer', 'quotes'],
    //   queryFn: () => fetch('/api/quotes/buyer').then(res => res.json()),
    // }),

    // 찜한 서비스 목록
    queryClient.prefetchQuery({
      queryKey: ['buyer', 'favorites'],
      queryFn: () => fetch('/api/favorites').then(res => res.json()),
    }),

    // TODO: Uncomment when API route is implemented
    // // 리뷰 목록
    // queryClient.prefetchQuery({
    //   queryKey: ['buyer', 'reviews'],
    //   queryFn: () => fetch('/api/reviews/buyer').then(res => res.json()),
    // }),
  ])
}

// 판매자 페이지 데이터 프리페칭 함수
export async function prefetchSellerData(queryClient: QueryClient) {
  await Promise.allSettled([
    // 주문 목록 (전체)
    queryClient.prefetchQuery({
      queryKey: ['seller', 'orders', 'all'],
      queryFn: () => fetch('/api/orders/seller').then(res => res.json()),
    }),

    // 주문 상태별 카운트
    queryClient.prefetchQuery({
      queryKey: ['seller', 'orders', 'count'],
      queryFn: () => fetch('/api/orders/seller/count').then(res => res.json()),
    }),

    // TODO: Uncomment when these API routes are implemented
    // // 서비스 목록
    // queryClient.prefetchQuery({
    //   queryKey: ['seller', 'services'],
    //   queryFn: () => fetch('/api/services/seller').then(res => res.json()),
    // }),

    // // 리뷰 목록
    // queryClient.prefetchQuery({
    //   queryKey: ['seller', 'reviews'],
    //   queryFn: () => fetch('/api/reviews/seller').then(res => res.json()),
    // }),

    // // 수익 정보
    // queryClient.prefetchQuery({
    //   queryKey: ['seller', 'earnings'],
    //   queryFn: () => fetch('/api/earnings').then(res => res.json()),
    // }),
  ])
}
