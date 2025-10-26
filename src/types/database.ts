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
      seller_profiles: {
        Row: {
          id: string
          user_id: string
          business_name: string | null
          business_number: string | null
          business_verified: boolean
          bank_name: string | null
          bank_account: string | null
          account_holder: string | null
          introduction: string | null
          skills: string[] | null
          portfolio_urls: string[] | null
          response_time_hours: number
          auto_accept_order: boolean
          vacation_mode: boolean
          vacation_message: string | null
          total_earnings: number
          available_balance: number
          is_verified: boolean
          verified_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          business_name?: string | null
          business_number?: string | null
          business_verified?: boolean
          bank_name?: string | null
          bank_account?: string | null
          account_holder?: string | null
          introduction?: string | null
          skills?: string[] | null
          portfolio_urls?: string[] | null
          response_time_hours?: number
          auto_accept_order?: boolean
          vacation_mode?: boolean
          vacation_message?: string | null
          total_earnings?: number
          available_balance?: number
          is_verified?: boolean
          verified_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          business_name?: string | null
          business_number?: string | null
          business_verified?: boolean
          bank_name?: string | null
          bank_account?: string | null
          account_holder?: string | null
          introduction?: string | null
          skills?: string[] | null
          portfolio_urls?: string[] | null
          response_time_hours?: number
          auto_accept_order?: boolean
          vacation_mode?: boolean
          vacation_message?: string | null
          total_earnings?: number
          available_balance?: number
          is_verified?: boolean
          verified_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      ai_services: {
        Row: {
          service_id: string
          ai_tool: string
          version: string | null
          features: string[]
          sample_prompts: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          service_id: string
          ai_tool: string
          version?: string | null
          features?: string[]
          sample_prompts?: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          service_id?: string
          ai_tool?: string
          version?: string | null
          features?: string[]
          sample_prompts?: string[]
          created_at?: string
          updated_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          order_number: string
          buyer_id: string
          seller_id: string
          service_id: string
          title: string
          description: string | null
          requirements: string | null
          attachments: string[] | null
          base_amount: number
          express_amount: number
          additional_amount: number
          discount_amount: number
          total_amount: number
          commission_rate: number
          commission_fee: number
          seller_amount: number
          delivery_date: string
          revision_count: number
          used_revisions: number
          status: string
          payment_status: string
          work_status: string
          paid_at: string | null
          started_at: string | null
          delivered_at: string | null
          completed_at: string | null
          cancelled_at: string | null
          cancellation_reason: string | null
          auto_complete_at: string | null
          buyer_satisfied: boolean | null
          seller_rating: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          order_number: string
          buyer_id: string
          seller_id: string
          service_id: string
          title: string
          description?: string | null
          requirements?: string | null
          attachments?: string[] | null
          base_amount: number
          express_amount?: number
          additional_amount?: number
          discount_amount?: number
          total_amount: number
          commission_rate: number
          commission_fee: number
          seller_amount: number
          delivery_date: string
          revision_count?: number
          used_revisions?: number
          status?: string
          payment_status?: string
          work_status?: string
          paid_at?: string | null
          started_at?: string | null
          delivered_at?: string | null
          completed_at?: string | null
          cancelled_at?: string | null
          cancellation_reason?: string | null
          auto_complete_at?: string | null
          buyer_satisfied?: boolean | null
          seller_rating?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          order_number?: string
          buyer_id?: string
          seller_id?: string
          service_id?: string
          title?: string
          description?: string | null
          requirements?: string | null
          attachments?: string[] | null
          base_amount?: number
          express_amount?: number
          additional_amount?: number
          discount_amount?: number
          total_amount?: number
          commission_rate?: number
          commission_fee?: number
          seller_amount?: number
          delivery_date?: string
          revision_count?: number
          used_revisions?: number
          status?: string
          payment_status?: string
          work_status?: string
          paid_at?: string | null
          started_at?: string | null
          delivered_at?: string | null
          completed_at?: string | null
          cancelled_at?: string | null
          cancellation_reason?: string | null
          auto_complete_at?: string | null
          buyer_satisfied?: boolean | null
          seller_rating?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      favorites: {
        Row: {
          id: string
          user_id: string
          service_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          service_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          service_id?: string
          created_at?: string
        }
      }
      reviews: {
        Row: {
          id: string
          order_id: string
          buyer_id: string
          seller_id: string
          service_id: string
          rating: number
          communication_rating: number | null
          quality_rating: number | null
          delivery_rating: number | null
          comment: string | null
          tags: string[] | null
          images: string[] | null
          seller_reply: string | null
          seller_reply_at: string | null
          helpful_count: number
          not_helpful_count: number
          is_visible: boolean
          is_featured: boolean
          moderated: boolean
          moderation_reason: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          order_id: string
          buyer_id: string
          seller_id: string
          service_id: string
          rating: number
          communication_rating?: number | null
          quality_rating?: number | null
          delivery_rating?: number | null
          comment?: string | null
          tags?: string[] | null
          images?: string[] | null
          seller_reply?: string | null
          seller_reply_at?: string | null
          helpful_count?: number
          not_helpful_count?: number
          is_visible?: boolean
          is_featured?: boolean
          moderated?: boolean
          moderation_reason?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          buyer_id?: string
          seller_id?: string
          service_id?: string
          rating?: number
          communication_rating?: number | null
          quality_rating?: number | null
          delivery_rating?: number | null
          comment?: string | null
          tags?: string[] | null
          images?: string[] | null
          seller_reply?: string | null
          seller_reply_at?: string | null
          helpful_count?: number
          not_helpful_count?: number
          is_visible?: boolean
          is_featured?: boolean
          moderated?: boolean
          moderation_reason?: string | null
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