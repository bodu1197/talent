// Admin Dashboard Types
import type { Json } from './database';

export interface DashboardStats {
  // User Stats
  totalUsers: number;
  newUsersToday: number;
  newUsersThisWeek: number;
  newUsersThisMonth: number;
  activeBuyers: number;
  activeSellers: number;
  verifiedSellers: number;

  // Service Stats
  totalServices: number;
  pendingServices: number;
  activeServices: number;
  suspendedServices: number;

  // Order Stats
  totalOrders: number;
  todayOrders: number;
  thisWeekOrders: number;
  thisMonthOrders: number;
  inProgressOrders: number;
  completedOrders: number;
  cancelledOrders: number;

  // Revenue Stats
  todayRevenue: number;
  thisWeekRevenue: number;
  thisMonthRevenue: number;
  totalRevenue: number;
  platformFeeRevenue: number;

  // Issue Stats
  pendingReports: number;
  activeDisputes: number;
  pendingSettlements: number;
  pendingReviews: number;
}

export interface RecentActivity {
  id: string;
  type: 'user' | 'service' | 'order' | 'report' | 'dispute';
  action: string;
  description: string;
  timestamp: Date;
  userId?: string;
  userName?: string;
}

export interface ChartData {
  date: string;
  value: number;
  label?: string;
}

// User Management Types
export type VerifiedFilterType = 'all' | 'true' | 'false';

export interface AdminUserFilter {
  userType: 'all' | 'buyer' | 'seller' | 'both';
  status: 'all' | 'active' | 'suspended' | 'deleted';
  isVerified: VerifiedFilterType;
  searchKeyword: string;
  dateRange: {
    from: Date | null;
    to: Date | null;
  };
  sortBy: 'newest' | 'oldest' | 'most_orders' | 'most_revenue';
}

export interface UserDetail {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  userType: string;
  profileImage: string | null;
  bio: string | null;
  isActive: boolean;
  emailVerified: boolean;
  phoneVerified: boolean;
  createdAt: string;
  lastLoginAt: string | null;

  // Seller Info
  sellerProfile?: {
    businessName: string | null;
    description: string | null;
    rating: number;
    totalReviews: number;
    totalSales: number;
    isVerified: boolean;
  };

  // Stats
  totalOrders: number;
  totalSpent: number;
  totalRevenue: number;

  // Sanctions
  sanctions: UserSanction[];
}

export interface UserSanction {
  id: string;
  type: 'warning' | 'suspension' | 'permanent_ban';
  reason: string;
  issuedBy: string;
  issuedAt: Date;
  expiresAt: Date | null;
  isActive: boolean;
}

export interface UserAction {
  action: 'approve_seller' | 'warn' | 'suspend' | 'unsuspend' | 'ban' | 'delete';
  reason: string;
  duration?: number; // days for suspension
  notifyUser: boolean;
}

// Service Management Types
export interface AdminServiceFilter {
  status: 'all' | 'pending' | 'active' | 'inactive' | 'rejected' | 'suspended';
  category: string[];
  priceRange: [number, number];
  searchKeyword: string;
  sellerVerified: VerifiedFilterType;
  hasDispute: VerifiedFilterType;
  sortBy: 'newest' | 'popular' | 'highest_price' | 'most_orders';
}

export interface ServiceDetail {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  price: number;
  deliveryDays: number;
  rating: number;
  totalReviews: number;
  totalOrders: number;
  viewCount: number;
  favoriteCount: number;
  createdAt: string;

  seller: {
    id: string;
    name: string;
    email: string;
    isVerified: boolean;
    rating: number;
  };

  packages: ServicePackage[];
  reports: number;
  disputes: number;
}

export interface ServicePackage {
  id: string;
  packageType: 'BASIC' | 'STANDARD' | 'PREMIUM';
  name: string;
  price: number;
  deliveryDays: number;
  revisionCount: number;
  features: string[];
}

export interface ServiceAction {
  action: 'approve' | 'reject' | 'suspend' | 'hide' | 'delete';
  reason: string;
  notifySeller: boolean;
}

// Order Management Types
export interface AdminOrderFilter {
  status:
    | 'all'
    | 'pending_payment'
    | 'paid'
    | 'in_progress'
    | 'delivered'
    | 'completed'
    | 'cancelled'
    | 'refunded';
  dateRange: {
    from: Date | null;
    to: Date | null;
  };
  amountRange: [number, number];
  hasDispute: VerifiedFilterType;
  searchKeyword: string;
  sortBy: 'newest' | 'oldest' | 'highest_amount' | 'lowest_amount';
}

export interface OrderDetail {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  platformFee: number;
  sellerAmount: number;
  createdAt: string;
  updatedAt: string;

  buyer: {
    id: string;
    name: string;
    email: string;
  };

  seller: {
    id: string;
    name: string;
    email: string;
  };

  service: {
    id: string;
    title: string;
  };

  packageType: string | null;
  deliveryDays: number;

  timeline: OrderTimeline[];
  payment: PaymentInfo | null;
  dispute: DisputeInfo | null;

  adminNotes: AdminNote[];
}

export interface OrderTimeline {
  status: string;
  timestamp: Date;
  note: string | null;
}

export interface PaymentInfo {
  id: string;
  amount: number;
  method: string;
  status: string;
  paidAt: Date | null;
  refundedAt: Date | null;
}

export interface AdminNote {
  id: string;
  adminId: string;
  adminName: string;
  note: string;
  createdAt: Date;
}

// Settlement Management Types
export interface AdminSettlementFilter {
  status: 'all' | 'pending' | 'processing' | 'completed' | 'failed';
  dateRange: {
    from: Date | null;
    to: Date | null;
  };
  amountRange: [number, number];
  searchKeyword: string;
  sortBy: 'newest' | 'oldest' | 'highest_amount';
}

export interface SettlementDetail {
  id: string;
  settlementNumber: string;
  sellerId: string;
  sellerName: string;
  amount: number;
  platformFee: number;
  netAmount: number;
  status: string;
  requestedAt: Date;
  processedAt: Date | null;
  completedAt: Date | null;

  bankInfo: {
    bankName: string;
    accountNumber: string;
    accountHolder: string;
  };

  orders: {
    id: string;
    orderNumber: string;
    amount: number;
  }[];

  adminNotes: AdminNote[];
}

// Report Management Types
export interface AdminReportFilter {
  status: 'all' | 'pending' | 'reviewing' | 'resolved' | 'rejected';
  type: 'all' | 'user' | 'service' | 'review' | 'message';
  category: 'all' | 'spam' | 'abuse' | 'fraud' | 'inappropriate' | 'other';
  dateRange: {
    from: Date | null;
    to: Date | null;
  };
  searchKeyword: string;
  sortBy: 'newest' | 'oldest';
}

export interface ReportDetail {
  id: string;
  reporterId: string;
  reporterName: string;
  reportedType: string;
  reportedId: string;
  reportedName: string;
  category: string;
  reason: string;
  description: string;
  evidence: string[];
  status: string;
  createdAt: Date;
  reviewedAt: Date | null;
  resolvedAt: Date | null;

  adminDecision: string | null;
  adminNote: string | null;
  actionTaken: string | null;
}

// Dispute Management Types
export interface AdminDisputeFilter {
  status: 'all' | 'open' | 'in_review' | 'resolved' | 'closed';
  initiatedBy: 'all' | 'buyer' | 'seller';
  reason: 'all' | 'quality' | 'delivery' | 'refund' | 'other';
  dateRange: {
    from: Date | null;
    to: Date | null;
  };
  searchKeyword: string;
  sortBy: 'newest' | 'oldest' | 'urgent';
}

export interface DisputeInfo {
  id: string;
  orderId: string;
  orderNumber: string;
  initiatedBy: 'buyer' | 'seller';
  reason: string;
  description: string;
  requestedAction: string;
  status: string;
  createdAt: Date;
  resolvedAt: Date | null;

  buyer: {
    id: string;
    name: string;
  };

  seller: {
    id: string;
    name: string;
  };

  evidence: DisputeEvidence[];
  messages: DisputeMessage[];

  adminDecision: string | null;
  resolution: string | null;
}

export interface DisputeEvidence {
  id: string;
  type: 'image' | 'file' | 'link';
  url: string;
  description: string;
  uploadedBy: 'buyer' | 'seller' | 'admin';
  uploadedAt: Date;
}

export interface DisputeMessage {
  id: string;
  from: 'buyer' | 'seller' | 'admin';
  message: string;
  timestamp: Date;
}

// Review Management Types
export interface AdminReviewFilter {
  rating: number[];
  hasReport: 'all' | 'true' | 'false';
  isVisible: 'all' | 'true' | 'false';
  dateRange: {
    from: Date | null;
    to: Date | null;
  };
  searchKeyword: string;
  sortBy: 'newest' | 'oldest' | 'highest_rating' | 'lowest_rating';
}

export interface ReviewDetail {
  id: string;
  orderId: string;
  serviceId: string;
  serviceName: string;
  buyerId: string;
  buyerName: string;
  sellerId: string;
  sellerName: string;
  rating: number;
  comment: string;
  images: string[];
  isVisible: boolean;
  createdAt: Date;

  reports: number;
  sellerResponse: string | null;
  adminNote: string | null;
}

// Category Management Types
export interface CategoryNode {
  id: string;
  name: string;
  slug: string;
  level: number;
  parentId: string | null;
  isActive: boolean;
  displayOrder: number;
  icon: string | null;

  servicesCount: number;
  ordersCount: number;
  revenue: number;

  children?: CategoryNode[];
}

// Statistics Types
export interface RevenueAnalytics {
  daily: ChartData[];
  weekly: ChartData[];
  monthly: ChartData[];
  byCategory: {
    category: string;
    revenue: number;
    percentage: number;
  }[];
  topSellers: {
    sellerId: string;
    sellerName: string;
    revenue: number;
    orders: number;
  }[];
}

export interface UserAnalytics {
  registrationTrend: ChartData[];
  userTypeDistribution: {
    buyer: number;
    seller: number;
    both: number;
  };
  activityRate: {
    dau: number;
    mau: number;
    retention: number;
  };
  churnRate: number;
}

export interface ServiceAnalytics {
  popularServices: {
    serviceId: string;
    serviceName: string;
    orders: number;
    revenue: number;
    rating: number;
  }[];
  categoryDistribution: {
    category: string;
    count: number;
    percentage: number;
  }[];
  averagePrice: number;
  newServicesTrend: ChartData[];
}

// System Settings Types
export interface SystemSettings {
  fees: {
    platformFeeRate: number;
    paymentGatewayFee: number;
    minServicePrice: number;
    maxServicePrice: number;
  };

  settlement: {
    cycle: 'weekly' | 'biweekly' | 'monthly';
    minAmount: number;
    processingDays: number;
  };

  policies: {
    serviceApproval: 'auto' | 'manual';
    refundPolicy: {
      allowedDays: number;
      refundFeeRate: number;
    };
    reviewPolicy: {
      editableDays: number;
      allowEdit: boolean;
    };
  };

  notifications: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    pushNotifications: boolean;
  };
}

export interface AdminRole {
  id: string;
  name: string;
  permissions: {
    superAdmin: boolean;
    userManagement: boolean;
    serviceManagement: boolean;
    orderManagement: boolean;
    settlementManagement: boolean;
    reportManagement: boolean;
    disputeManagement: boolean;
    statisticsView: boolean;
    systemSettings: boolean;
    activityLogs: boolean;
  };
}

export interface AdminUser {
  id: string;
  userId: string;
  name: string;
  email: string;
  role: AdminRole;
  isActive: boolean;
  createdAt: Date;
  lastLoginAt: Date | null;
}

// Activity Log Types
export interface ActivityLog {
  id: string;
  adminId: string;
  adminName: string;
  action: string;
  entityType: string;
  entityId: string;
  oldValue: Json | null;
  newValue: Json | null;
  ipAddress: string;
  userAgent: string;
  createdAt: Date;
}

// Notification Types
export interface AdminNotification {
  id: string;
  type: 'urgent' | 'important' | 'normal';
  category: 'report' | 'dispute' | 'payment' | 'system' | 'other';
  title: string;
  message: string;
  link: string | null;
  isRead: boolean;
  createdAt: Date;
}

// Common Types
export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  pagination?: PaginationInfo;
}
