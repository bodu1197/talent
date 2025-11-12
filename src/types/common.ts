// Common types used across the application

export interface User {
  id: string
  email: string
  name: string
  profile_image: string | null
  created_at: string
  updated_at: string
}

export interface Seller {
  id: string
  user_id: string
  business_name: string | null
  business_number: string | null
  account_holder: string | null
  bank_name: string | null
  account_number: string | null
  is_verified: boolean
  created_at: string
  updated_at: string
  user?: User
}

export interface Category {
  id: string
  name: string
  slug: string
  parent_id: string | null
  display_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface ServiceCategory {
  id: string
  service_id: string
  category_id: string
  category?: Category
}

export interface Service {
  id: string
  seller_id: string
  title: string
  description: string
  thumbnail_url: string | null
  min_price: number
  max_price: number
  status: 'draft' | 'pending' | 'active' | 'rejected'
  rejection_reason: string | null
  view_count: number
  favorite_count: number
  deleted_at: string | null
  created_at: string
  updated_at: string
  seller?: Seller
  service_categories?: ServiceCategory[]
}

export interface ServicePackage {
  id: string
  service_id: string
  package_type: 'basic' | 'standard' | 'premium'
  name: string
  description: string
  price: number
  delivery_days: number
  revision_count: number
  features: string[]
  is_active: boolean
  display_order: number
  created_at: string
  updated_at: string
}

export interface Order {
  id: string
  buyer_id: string
  seller_id: string
  service_id: string
  package_id: string | null
  status: 'pending_payment' | 'payment_completed' | 'in_progress' | 'in_review' | 'completed' | 'cancelled' | 'refunded'
  total_amount: number
  platform_fee: number
  seller_amount: number
  payment_method: string | null
  payment_id: string | null
  paid_at: string | null
  started_at: string | null
  completed_at: string | null
  cancelled_at: string | null
  cancel_reason: string | null
  deliverables: Deliverable[]
  created_at: string
  updated_at: string
  buyer?: User
  seller?: Seller
  service?: Service
  package?: ServicePackage
}

export interface Deliverable {
  file_url: string
  file_name: string
  file_size: number
  uploaded_at: string
}

export interface Review {
  id: string
  order_id: string
  buyer_id: string
  seller_id: string
  service_id: string
  rating: number
  content: string
  is_visible: boolean
  moderated: boolean
  created_at: string
  updated_at: string
  buyer?: User
  seller?: Seller
  service?: Service
}

export interface Quote {
  id: string
  buyer_id: string
  seller_id: string | null
  service_id: string | null
  title: string
  description: string
  budget: number
  delivery_deadline: string
  status: 'pending' | 'quoted' | 'accepted' | 'rejected' | 'expired'
  created_at: string
  updated_at: string
  buyer?: User
  seller?: Seller
  service?: Service
}

export interface Coupon {
  id: string
  code: string
  type: 'percentage' | 'fixed'
  discount_value: number
  min_purchase_amount: number
  max_discount_amount: number | null
  usage_limit: number | null
  used_count: number
  valid_from: string
  valid_until: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface ServiceRevision {
  id: string
  service_id: string
  seller_id: string
  title: string
  description: string
  thumbnail_url: string | null
  revision_type: 'create' | 'update'
  status: 'pending' | 'approved' | 'rejected'
  rejection_reason: string | null
  submitted_at: string
  reviewed_at: string | null
  reviewed_by: string | null
  created_at: string
  updated_at: string
  service?: Service
  seller?: Seller
  revision_categories?: RevisionCategory[]
}

export interface RevisionCategory {
  id: string
  revision_id: string
  category_id: string
  category?: Category
}

// Error type for catch blocks
export type CatchError = unknown

// API Response types
export interface ApiResponse<T = any> {
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}
