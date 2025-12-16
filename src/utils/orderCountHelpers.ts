/**
 * Helper functions for counting orders by status
 */

interface OrderStatus {
  status: string;
}

interface OrderCounts {
  paid: number;
  in_progress: number;
  delivered: number;
  completed: number;
  cancelled: number;
  all: number;
}

/**
 * Count orders by status using JavaScript (faster than multiple DB queries)
 * @param orders - Array of orders with status property
 * @returns Object with counts for each status
 */
export function countOrdersByStatus(orders: OrderStatus[] | null): OrderCounts {
  const counts: OrderCounts = {
    paid: 0,
    in_progress: 0,
    delivered: 0,
    completed: 0,
    cancelled: 0,
    all: orders?.length || 0,
  };

  if (orders) {
    for (const order of orders) {
      if (order.status === 'paid') counts.paid++;
      else if (order.status === 'in_progress') counts.in_progress++;
      else if (order.status === 'delivered') counts.delivered++;
      else if (order.status === 'completed') counts.completed++;
      else if (order.status === 'cancelled') counts.cancelled++;
    }
  }

  return counts;
}
