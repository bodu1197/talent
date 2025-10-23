export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string
          phone: string | null
          user_type: 'buyer' | 'seller' | 'both' | 'admin'
          profile_image: string | null
          bio: string | null
          email_verified: boolean
          phone_verified: boolean
          is_active: boolean
          last_login_at: string | null
          deleted_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          name: string
          phone?: string | null
          user_type?: 'buyer' | 'seller' | 'both' | 'admin'
          profile_image?: string | null
          bio?: string | null
          email_verified?: boolean
          phone_verified?: boolean
          is_active?: boolean
          last_login_at?: string | null
          deleted_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          phone?: string | null
          user_type?: 'buyer' | 'seller' | 'both' | 'admin'
          profile_image?: string | null
          bio?: string | null
          email_verified?: boolean
          phone_verified?: boolean
          is_active?: boolean
          last_login_at?: string | null
          deleted_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          slug: string
          parent_id: string | null
          level: 1 | 2 | 3
          icon: string | null
          description: string | null
          meta_title: string | null
          meta_description: string | null
          keywords: string[] | null
          display_order: number
          service_count: number
          is_ai_category: boolean
          is_featured: boolean
          commission_rate: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          parent_id?: string | null
          level: 1 | 2 | 3
          icon?: string | null
          description?: string | null
          meta_title?: string | null
          meta_description?: string | null
          keywords?: string[] | null
          display_order?: number
          service_count?: number
          is_ai_category?: boolean
          is_featured?: boolean
          commission_rate?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          parent_id?: string | null
          level?: 1 | 2 | 3
          icon?: string | null
          description?: string | null
          meta_title?: string | null
          meta_description?: string | null
          keywords?: string[] | null
          display_order?: number
          service_count?: number
          is_ai_category?: boolean
          is_featured?: boolean
          commission_rate?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      services: {
        Row: {
          id: string
          seller_id: string
          title: string
          slug: string
          description: string
          requirements: string | null
          price: number
          price_unit: 'project' | 'hour' | 'revision'
          delivery_days: number
          revision_count: number
          express_delivery: boolean
          express_days: number | null
          express_price: number | null
          thumbnail_url: string | null
          portfolio_urls: string[] | null
          video_url: string | null
          views: number
          clicks: number
          orders_count: number
          in_progress_orders: number
          completed_orders: number
          rating: number
          review_count: number
          status: 'draft' | 'pending_review' | 'active' | 'suspended' | 'deleted'
          is_featured: boolean
          featured_until: string | null
          meta_title: string | null
          meta_description: string | null
          version: number
          last_modified_by: string | null
          deleted_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          seller_id: string
          title: string
          slug: string
          description: string
          requirements?: string | null
          price: number
          price_unit?: 'project' | 'hour' | 'revision'
          delivery_days: number
          revision_count?: number
          express_delivery?: boolean
          express_days?: number | null
          express_price?: number | null
          thumbnail_url?: string | null
          portfolio_urls?: string[] | null
          video_url?: string | null
          views?: number
          clicks?: number
          orders_count?: number
          in_progress_orders?: number
          completed_orders?: number
          rating?: number
          review_count?: number
          status?: 'draft' | 'pending_review' | 'active' | 'suspended' | 'deleted'
          is_featured?: boolean
          featured_until?: string | null
          meta_title?: string | null
          meta_description?: string | null
          version?: number
          last_modified_by?: string | null
          deleted_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          seller_id?: string
          title?: string
          slug?: string
          description?: string
          requirements?: string | null
          price?: number
          price_unit?: 'project' | 'hour' | 'revision'
          delivery_days?: number
          revision_count?: number
          express_delivery?: boolean
          express_days?: number | null
          express_price?: number | null
          thumbnail_url?: string | null
          portfolio_urls?: string[] | null
          video_url?: string | null
          views?: number
          clicks?: number
          orders_count?: number
          in_progress_orders?: number
          completed_orders?: number
          rating?: number
          review_count?: number
          status?: 'draft' | 'pending_review' | 'active' | 'suspended' | 'deleted'
          is_featured?: boolean
          featured_until?: string | null
          meta_title?: string | null
          meta_description?: string | null
          version?: number
          last_modified_by?: string | null
          deleted_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {}
    Functions: {
      is_admin: {
        Args: {}
        Returns: boolean
      }
      is_seller: {
        Args: {}
        Returns: boolean
      }
      owns_service: {
        Args: {
          service_id: string
        }
        Returns: boolean
      }
    }
    Enums: {}
    CompositeTypes: {}
  }
}