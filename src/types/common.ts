// Common types used across the application

export interface User {
  id: string;
  email: string;
  name: string;
  profile_image: string | null;
  created_at: string;
  updated_at: string;
}

export interface Seller {
  id: string;
  user_id: string;
  name?: string;
  business_name: string | null;
  business_number: string | null;
  business_registration_file: string | null;
  bank_name: string | null;
  account_number: string | null;
  account_holder: string | null;
  is_verified: boolean;
  verification_status: string | null;
  verified_at: string | null;
  rejection_reason: string | null;
  total_sales: number | null;
  total_revenue: number | null;
  service_count: number | null;
  rating: number | null;
  review_count: number | null;
  last_sale_at: string | null;
  is_active: boolean | null;
  bio: string | null;
  phone: string | null;
  show_phone: boolean | null;
  kakao_id: string | null;
  kakao_openchat: string | null;
  whatsapp: string | null;
  website: string | null;
  preferred_contact: string[] | null;
  certificates: string | null;
  experience: string | null;
  is_business: boolean | null;
  status: string | null;
  real_name: string | null;
  contact_hours: string | null;
  tax_invoice_available: boolean | null;
  verified: boolean | null;
  verified_name: string | null;
  verified_phone: string | null;
  created_at: string;
  updated_at: string;
  user?: User;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ServiceCategory {
  id: string;
  service_id: string;
  category_id: string;
  category?: Category;
}

export interface Service {
  id: string;
  seller_id: string;
  title: string;
  description: string;
  thumbnail_url: string | null;
  min_price: number;
  max_price: number;
  price?: number;
  delivery_days?: number;
  revision_count?: number;
  status: 'draft' | 'pending' | 'active' | 'inactive' | 'rejected' | 'suspended';
  rejection_reason: string | null;
  views: number;
  wishlist_count: number;
  orders_count: number;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
  seller?: Seller;
  service_categories?: ServiceCategory[];
}

export interface ServicePackage {
  id: string;
  service_id: string;
  package_type: 'basic' | 'standard' | 'premium';
  name: string;
  description: string;
  price: number;
  delivery_days: number;
  revision_count: number;
  features: string[];
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

// Order status type for filters (includes 'all')
export type OrderStatus =
  | 'all'
  | 'paid'
  | 'in_progress'
  | 'revision'
  | 'delivered'
  | 'completed'
  | 'cancelled';

export interface Order {
  id: string;
  buyer_id: string;
  seller_id: string;
  service_id: string;
  package_id: string | null;
  title?: string;
  order_number?: string;
  order_id?: string;
  status:
    | 'pending_payment'
    | 'payment_completed'
    | 'in_progress'
    | 'in_review'
    | 'completed'
    | 'cancelled'
    | 'refunded'
    | 'paid'
    | 'delivered'
    | 'revision';
  total_amount: number;
  platform_fee: number;
  seller_amount: number;
  payment_method: string | null;
  payment_id: string | null;
  paid_at: string | null;
  started_at: string | null;
  completed_at: string | null;
  cancelled_at: string | null;
  cancel_reason: string | null;
  deliverables: Deliverable[];
  created_at: string;
  updated_at: string;
  buyer?: User;
  seller?: Seller;
  service?: Service;
  package?: ServicePackage;
  review?: Review | null;
  // Review data embedded in order for buyer reviews page
  rating?: number;
  comment?: string;
  seller_reply?: string | null;
  order?: {
    order_number?: string;
  };
}

export interface Deliverable {
  id?: string;
  file_url: string;
  file_name: string;
  file_size: number;
  uploaded_at: string;
}

export interface Review {
  id: string;
  order_id: string;
  buyer_id: string;
  seller_id: string;
  service_id: string;
  rating: number;
  content: string;
  is_visible: boolean;
  moderated: boolean;
  seller_reply?: string | null;
  seller_reply_at?: string | null;
  created_at: string;
  updated_at: string;
  buyer?: User;
  seller?: Seller;
  service?: Service;
  order?: {
    order_number?: string;
  };
}

export interface Quote {
  id: string;
  buyer_id: string;
  seller_id: string | null;
  service_id: string | null;
  title: string;
  description: string;
  budget: number;
  delivery_deadline: string;
  status: 'pending' | 'quoted' | 'accepted' | 'rejected' | 'expired';
  response_count?: number;
  category?: Category;
  created_at: string;
  updated_at: string;
  buyer?: User;
  seller?: Seller;
  service?: Service;
}

export interface Coupon {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  discount_value: number;
  min_purchase_amount: number;
  max_discount_amount: number | null;
  usage_limit: number | null;
  used_count: number;
  valid_from: string;
  valid_until: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ServiceRevision {
  id: string;
  service_id: string;
  seller_id: string;
  title: string;
  description: string;
  thumbnail_url: string | null;
  revision_type: 'create' | 'update';
  status: 'pending' | 'approved' | 'rejected';
  rejection_reason: string | null;
  submitted_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
  created_at: string;
  updated_at: string;
  service?: Service;
  seller?: Seller;
  revision_categories?: RevisionCategory[];
}

export interface RevisionCategory {
  id: string;
  revision_id: string;
  category_id: string;
  category?: Category;
}

// Withdrawal types
export interface WithdrawalRequest {
  id: string;
  seller_id: string;
  amount: number;
  status: 'pending' | 'processing' | 'completed' | 'rejected' | 'cancelled';
  bank_name: string;
  account_number: string;
  account_holder: string;
  requested_at: string;
  processed_at: string | null;
  rejected_reason: string | null;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  seller_id: string;
  order_id: string;
  type: 'earning' | 'withdrawal' | 'refund';
  amount: number;
  balance: number;
  description: string;
  created_at: string;
}

export interface Portfolio {
  id: string;
  seller_id: string;
  title: string;
  description: string;
  image_url: string;
  thumbnail_url?: string | null;
  project_url: string | null;
  display_order: number;
  view_count?: number;
  created_at: string;
  updated_at: string;
}

// Payment type (matching database schema)
export interface Payment {
  id: string;
  order_id: string;
  amount: number;
  payment_method: string;
  payment_id: string | null;
  status: string;
  pg_provider: string | null;
  pg_tid: string | null;
  receipt_url: string | null;
  paid_at: string | null;
  failed_at: string | null;
  cancelled_at: string | null;
  created_at: string;
  updated_at: string;
}

// API Response types
export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
