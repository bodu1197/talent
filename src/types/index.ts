// Database types
export interface User {
  id: string
  email: string
  name: string
  user_type: 'buyer' | 'seller'
  phone?: string
  created_at: string
  updated_at: string
}

export interface SellerProfile {
  id: string
  user_id: string
  business_name?: string
  description?: string
  portfolio_url?: string
  rating: number
  total_sales: number
  response_time: number
  is_verified: boolean
  bank_account?: any
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

export interface Service {
  id: string
  seller_id: string
  category_id: string
  title: string
  description: string
  thumbnail_url?: string
  price_min: number
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
  rating: number
  is_featured: boolean
  metadata?: any
  created_at: string
  updated_at: string
  seller?: SellerProfile
  category?: Category
  ai_services?: AIService[]
}

export interface AIService {
  id: string
  service_id: string
  ai_tool: string
  version?: string
  features?: string[]
  sample_prompts?: string[]
  created_at: string
}

export interface Order {
  id: string
  service_id: string
  buyer_id: string
  seller_id: string
  package_type: 'basic' | 'standard' | 'premium' | 'custom'
  price: number
  quantity: number
  total_amount: number
  requirements?: any
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

export interface Message {
  id: string
  conversation_id: string
  sender_id: string
  content: string
  attachments?: any[]
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