// Database types
export interface User {
  id: string
  email: string
  name: string
  phone?: string
  profile_image?: string
  bio?: string
  email_verified: boolean
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Buyer {
  id: string
  user_id: string
  total_orders: number
  total_spent: number
  points: number
  coupon_count: number
  last_order_at?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Seller {
  id: string
  user_id: string
  business_name?: string
  business_number?: string
  business_registration_file?: string
  bank_name?: string
  account_number?: string
  account_holder?: string
  is_verified: boolean
  verification_status: 'pending' | 'verified' | 'rejected'
  verified_at?: string
  rejection_reason?: string
  total_sales: number
  total_revenue: number
  service_count: number
  rating: number
  review_count: number
  last_sale_at?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface BankAccount {
  bank_name: string
  account_number: string
  account_holder: string
}

export interface SellerProfile {
  id: string
  user_id: string
  business_name?: string
  display_name?: string
  description?: string
  portfolio_url?: string
  rating: number
  total_sales: number
  response_time: number
  is_verified: boolean
  bank_account?: BankAccount
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  name: string
  slug: string
  description?: string
  icon?: string
  parent_id?: string
  display_order: number
  is_ai: boolean
  is_active: boolean
  created_at: string
  children?: Category[]
}

export interface ServiceCategory {
  service_id: string
  category_id: string
  category?: Category
}

export interface Service {
  id: string
  seller_id: string
  category_id: string
  title: string
  description: string
  thumbnail_url?: string
  price: number
  price_min?: number
  price_max?: number
  delivery_days: number
  revision_count: number
  is_express_available: boolean
  express_price?: number
  express_days?: number
  status: 'draft' | 'pending' | 'active' | 'inactive' | 'rejected'
  rejection_reason?: string
  view_count: number
  order_count: number
  orders_count?: number // DB alias
  rating: number
  review_count: number
  is_featured: boolean
  is_advertised?: boolean // 광고 서비스 여부 (런타임에 추가됨)
  metadata?: Record<string, unknown>
  created_at: string
  updated_at: string
  seller?: SellerProfile & {
    user?: User
  }
  category?: Category
  service_categories?: ServiceCategory[]
}

export interface OrderRequirement {
  question: string
  answer: string
}

export interface Order {
  id: string
  service_id: string
  buyer_id: string
  seller_id: string
  price: number
  quantity: number
  total_amount: number
  requirements?: OrderRequirement[]
  status: 'pending' | 'accepted' | 'in_progress' | 'delivered' | 'completed' | 'cancelled' | 'refunded'
  delivery_date?: string
  delivered_at?: string
  completed_at?: string
  cancelled_at?: string
  cancellation_reason?: string
  created_at: string
  updated_at: string
  service?: Service
  buyer?: User
  seller?: User
}

export interface Review {
  id: string
  order_id: string
  reviewer_id: string
  reviewee_id: string
  rating: number
  comment?: string
  is_ai_generated?: boolean
  created_at: string
  updated_at: string
  order?: Order
  reviewer?: User
  reviewee?: User
}

export interface Attachment {
  id: string
  url: string
  filename: string
  content_type: string
  size: number
}

export interface Message {
  id: string
  conversation_id: string
  sender_id: string
  content: string
  attachments?: Attachment[]
  is_read: boolean
  created_at: string
  sender?: User
}

export interface Conversation {
  id: string
  participants: string[]
  last_message?: string
  last_message_at?: string
  created_at: string
  messages?: Message[]
}

// UI Types
export interface NavItem {
  label: string
  href: string
  icon?: React.ReactNode
  children?: NavItem[]
}

export interface FilterOption {
  label: string
  value: string
  count?: number
}

export interface SearchFilters {
  category?: string
  priceMin?: number
  priceMax?: number
  deliveryDays?: number
  rating?: number
  isAI?: boolean
  aiTools?: string[]
  sortBy?: 'popular' | 'latest' | 'price_low' | 'price_high' | 'rating'
}