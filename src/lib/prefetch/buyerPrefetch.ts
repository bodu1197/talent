import { QueryClient } from '@tanstack/react-query';

export async function prefetchBuyerData(queryClient: QueryClient) {
  await Promise.allSettled([
    queryClient.prefetchQuery({
      queryKey: ['buyer', 'orders', 'all'],
      queryFn: () => fetch('/api/orders/buyer').then((res) => res.json()),
    }),

    queryClient.prefetchQuery({
      queryKey: ['buyer', 'orders', 'count'],
      queryFn: () => fetch('/api/orders/buyer/count').then((res) => res.json()),
    }),
  ]);
}

export async function prefetchSellerData(queryClient: QueryClient) {
  await Promise.allSettled([
    queryClient.prefetchQuery({
      queryKey: ['seller', 'orders', 'all'],
      queryFn: () => fetch('/api/orders/seller').then((res) => res.json()),
    }),

    queryClient.prefetchQuery({
      queryKey: ['seller', 'orders', 'count'],
      queryFn: () => fetch('/api/orders/seller/count').then((res) => res.json()),
    }),
  ]);
}
