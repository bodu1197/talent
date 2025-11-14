export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      activity_logs: {
        Row: {
          action: string
          admin_id: string | null
          created_at: string | null
          entity_id: string | null
          entity_type: string | null
          id: string
          ip_address: unknown
          new_value: Json | null
          old_value: Json | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          admin_id?: string | null
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          ip_address?: unknown
          new_value?: Json | null
          old_value?: Json | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          admin_id?: string | null
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          ip_address?: unknown
          new_value?: Json | null
          old_value?: Json | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activity_logs_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "admins"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      admins: {
        Row: {
          created_at: string | null
          department: string | null
          id: string
          last_action_at: string | null
          notes: string | null
          permissions: Json | null
          role: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          department?: string | null
          id?: string
          last_action_at?: string | null
          notes?: string | null
          permissions?: Json | null
          role: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          department?: string | null
          id?: string
          last_action_at?: string | null
          notes?: string | null
          permissions?: Json | null
          role?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "admins_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      advertising_campaigns: {
        Row: {
          approval_status: string | null
          bid_amount: number
          bid_type: string | null
          campaign_name: string
          campaign_type: string
          clicks: number | null
          conversion_rate: number | null
          conversions: number | null
          created_at: string | null
          ctr: number | null
          daily_budget: number | null
          end_date: string
          id: string
          impressions: number | null
          rejection_reason: string | null
          roi: number | null
          seller_id: string
          spent_amount: number | null
          start_date: string
          status: string | null
          target_categories: string[] | null
          target_keywords: string[] | null
          target_user_types: string[] | null
          total_budget: number | null
          updated_at: string | null
        }
        Insert: {
          approval_status?: string | null
          bid_amount: number
          bid_type?: string | null
          campaign_name: string
          campaign_type: string
          clicks?: number | null
          conversion_rate?: number | null
          conversions?: number | null
          created_at?: string | null
          ctr?: number | null
          daily_budget?: number | null
          end_date: string
          id?: string
          impressions?: number | null
          rejection_reason?: string | null
          roi?: number | null
          seller_id: string
          spent_amount?: number | null
          start_date: string
          status?: string | null
          target_categories?: string[] | null
          target_keywords?: string[] | null
          target_user_types?: string[] | null
          total_budget?: number | null
          updated_at?: string | null
        }
        Update: {
          approval_status?: string | null
          bid_amount?: number
          bid_type?: string | null
          campaign_name?: string
          campaign_type?: string
          clicks?: number | null
          conversion_rate?: number | null
          conversions?: number | null
          created_at?: string | null
          ctr?: number | null
          daily_budget?: number | null
          end_date?: string
          id?: string
          impressions?: number | null
          rejection_reason?: string | null
          roi?: number | null
          seller_id?: string
          spent_amount?: number | null
          start_date?: string
          status?: string | null
          target_categories?: string[] | null
          target_keywords?: string[] | null
          target_user_types?: string[] | null
          total_budget?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "advertising_campaigns_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          commission_rate: number | null
          created_at: string | null
          description: string | null
          display_order: number | null
          icon: string | null
          id: string
          is_active: boolean | null
          is_ai_category: boolean | null
          is_featured: boolean | null
          keywords: string[] | null
          level: number
          meta_description: string | null
          meta_title: string | null
          name: string
          parent_id: string | null
          service_count: number | null
          slug: string
          updated_at: string | null
        }
        Insert: {
          commission_rate?: number | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          is_ai_category?: boolean | null
          is_featured?: boolean | null
          keywords?: string[] | null
          level: number
          meta_description?: string | null
          meta_title?: string | null
          name: string
          parent_id?: string | null
          service_count?: number | null
          slug: string
          updated_at?: string | null
        }
        Update: {
          commission_rate?: number | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          is_ai_category?: boolean | null
          is_featured?: boolean | null
          keywords?: string[] | null
          level?: number
          meta_description?: string | null
          meta_title?: string | null
          name?: string
          parent_id?: string | null
          service_count?: number | null
          slug?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          last_message_at: string | null
          last_message_preview: string | null
          order_id: string | null
          participant1_id: string
          participant1_last_read: string | null
          participant1_unread_count: number | null
          participant2_id: string
          participant2_last_read: string | null
          participant2_unread_count: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_message_at?: string | null
          last_message_preview?: string | null
          order_id?: string | null
          participant1_id: string
          participant1_last_read?: string | null
          participant1_unread_count?: number | null
          participant2_id: string
          participant2_last_read?: string | null
          participant2_unread_count?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_message_at?: string | null
          last_message_preview?: string | null
          order_id?: string | null
          participant1_id?: string
          participant1_last_read?: string | null
          participant1_unread_count?: number | null
          participant2_id?: string
          participant2_last_read?: string | null
          participant2_unread_count?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conversations_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_participant1_id_fkey"
            columns: ["participant1_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_participant2_id_fkey"
            columns: ["participant2_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      disputes: {
        Row: {
          closed_at: string | null
          created_at: string | null
          dispute_type: string
          evidence_description: string | null
          evidence_urls: string[] | null
          id: string
          initiated_by: string
          mediation_notes: string | null
          mediation_started_at: string | null
          mediator_id: string | null
          opened_at: string | null
          order_id: string
          reason: string
          requested_action: string | null
          resolution: string | null
          resolution_details: string | null
          resolved_at: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          closed_at?: string | null
          created_at?: string | null
          dispute_type: string
          evidence_description?: string | null
          evidence_urls?: string[] | null
          id?: string
          initiated_by: string
          mediation_notes?: string | null
          mediation_started_at?: string | null
          mediator_id?: string | null
          opened_at?: string | null
          order_id: string
          reason: string
          requested_action?: string | null
          resolution?: string | null
          resolution_details?: string | null
          resolved_at?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          closed_at?: string | null
          created_at?: string | null
          dispute_type?: string
          evidence_description?: string | null
          evidence_urls?: string[] | null
          id?: string
          initiated_by?: string
          mediation_notes?: string | null
          mediation_started_at?: string | null
          mediator_id?: string | null
          opened_at?: string | null
          order_id?: string
          reason?: string
          requested_action?: string | null
          resolution?: string | null
          resolution_details?: string | null
          resolved_at?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "disputes_initiated_by_fkey"
            columns: ["initiated_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "disputes_mediator_id_fkey"
            columns: ["mediator_id"]
            isOneToOne: false
            referencedRelation: "admins"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "disputes_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      favorites: {
        Row: {
          created_at: string | null
          id: string
          service_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          service_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          service_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "favorites_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          attachments: Json | null
          content: string | null
          conversation_id: string
          created_at: string | null
          deleted_at: string | null
          edited_at: string | null
          id: string
          is_deleted: boolean | null
          is_edited: boolean | null
          is_read: boolean | null
          message_type: string | null
          read_at: string | null
          sender_id: string
        }
        Insert: {
          attachments?: Json | null
          content?: string | null
          conversation_id: string
          created_at?: string | null
          deleted_at?: string | null
          edited_at?: string | null
          id?: string
          is_deleted?: boolean | null
          is_edited?: boolean | null
          is_read?: boolean | null
          message_type?: string | null
          read_at?: string | null
          sender_id: string
        }
        Update: {
          attachments?: Json | null
          content?: string | null
          conversation_id?: string
          created_at?: string | null
          deleted_at?: string | null
          edited_at?: string | null
          id?: string
          is_deleted?: boolean | null
          is_edited?: boolean | null
          is_read?: boolean | null
          message_type?: string | null
          read_at?: string | null
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          content: string | null
          created_at: string | null
          data: Json | null
          id: string
          is_pushed: boolean | null
          is_read: boolean | null
          link_url: string | null
          pushed_at: string | null
          read_at: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          data?: Json | null
          id?: string
          is_pushed?: boolean | null
          is_read?: boolean | null
          link_url?: string | null
          pushed_at?: string | null
          read_at?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          content?: string | null
          created_at?: string | null
          data?: Json | null
          id?: string
          is_pushed?: boolean | null
          is_read?: boolean | null
          link_url?: string | null
          pushed_at?: string | null
          read_at?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          additional_amount: number | null
          attachments: string[] | null
          auto_complete_at: string | null
          base_amount: number
          buyer_id: string
          buyer_satisfied: boolean | null
          cancellation_reason: string | null
          cancelled_at: string | null
          commission_fee: number
          commission_rate: number
          completed_at: string | null
          created_at: string | null
          delivered_at: string | null
          delivery_date: string
          description: string | null
          discount_amount: number | null
          express_amount: number | null
          id: string
          order_number: string
          package_type: string | null
          paid_at: string | null
          payment_status: string | null
          requirements: string | null
          revision_count: number | null
          seller_amount: number
          seller_id: string
          seller_rating: number | null
          service_id: string
          started_at: string | null
          status: string | null
          title: string
          total_amount: number
          updated_at: string | null
          used_revisions: number | null
          work_status: string | null
        }
        Insert: {
          additional_amount?: number | null
          attachments?: string[] | null
          auto_complete_at?: string | null
          base_amount: number
          buyer_id: string
          buyer_satisfied?: boolean | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          commission_fee: number
          commission_rate: number
          completed_at?: string | null
          created_at?: string | null
          delivered_at?: string | null
          delivery_date: string
          description?: string | null
          discount_amount?: number | null
          express_amount?: number | null
          id?: string
          order_number: string
          package_type?: string | null
          paid_at?: string | null
          payment_status?: string | null
          requirements?: string | null
          revision_count?: number | null
          seller_amount: number
          seller_id: string
          seller_rating?: number | null
          service_id: string
          started_at?: string | null
          status?: string | null
          title: string
          total_amount: number
          updated_at?: string | null
          used_revisions?: number | null
          work_status?: string | null
        }
        Update: {
          additional_amount?: number | null
          attachments?: string[] | null
          auto_complete_at?: string | null
          base_amount?: number
          buyer_id?: string
          buyer_satisfied?: boolean | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          commission_fee?: number
          commission_rate?: number
          completed_at?: string | null
          created_at?: string | null
          delivered_at?: string | null
          delivery_date?: string
          description?: string | null
          discount_amount?: number | null
          express_amount?: number | null
          id?: string
          order_number?: string
          package_type?: string | null
          paid_at?: string | null
          payment_status?: string | null
          requirements?: string | null
          revision_count?: number | null
          seller_amount?: number
          seller_id?: string
          seller_rating?: number | null
          service_id?: string
          started_at?: string | null
          status?: string | null
          title?: string
          total_amount?: number
          updated_at?: string | null
          used_revisions?: number | null
          work_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          id: string
          order_id: string
          amount: number
          payment_method: string
          payment_id: string | null
          status: string
          pg_provider: string | null
          pg_tid: string | null
          receipt_url: string | null
          paid_at: string | null
          failed_at: string | null
          cancelled_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          order_id: string
          amount: number
          payment_method: string
          payment_id?: string | null
          status?: string
          pg_provider?: string | null
          pg_tid?: string | null
          receipt_url?: string | null
          paid_at?: string | null
          failed_at?: string | null
          cancelled_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          amount?: number
          payment_method?: string
          payment_id?: string | null
          status?: string
          pg_provider?: string | null
          pg_tid?: string | null
          receipt_url?: string | null
          paid_at?: string | null
          failed_at?: string | null
          cancelled_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      premium_placements: {
        Row: {
          actual_cost: number | null
          campaign_id: string | null
          category_id: string | null
          clicks: number | null
          conversions: number | null
          created_at: string | null
          daily_cost: number | null
          display_priority: number | null
          end_date: string
          id: string
          impressions: number | null
          is_active: boolean | null
          keywords: string[] | null
          paused_at: string | null
          paused_reason: string | null
          placement_slot: number | null
          placement_type: string
          position_score: number | null
          revenue_generated: number | null
          service_id: string
          start_date: string
          total_cost: number | null
          updated_at: string | null
        }
        Insert: {
          actual_cost?: number | null
          campaign_id?: string | null
          category_id?: string | null
          clicks?: number | null
          conversions?: number | null
          created_at?: string | null
          daily_cost?: number | null
          display_priority?: number | null
          end_date: string
          id?: string
          impressions?: number | null
          is_active?: boolean | null
          keywords?: string[] | null
          paused_at?: string | null
          paused_reason?: string | null
          placement_slot?: number | null
          placement_type: string
          position_score?: number | null
          revenue_generated?: number | null
          service_id: string
          start_date: string
          total_cost?: number | null
          updated_at?: string | null
        }
        Update: {
          actual_cost?: number | null
          campaign_id?: string | null
          category_id?: string | null
          clicks?: number | null
          conversions?: number | null
          created_at?: string | null
          daily_cost?: number | null
          display_priority?: number | null
          end_date?: string
          id?: string
          impressions?: number | null
          is_active?: boolean | null
          keywords?: string[] | null
          paused_at?: string | null
          paused_reason?: string | null
          placement_slot?: number | null
          placement_type?: string
          position_score?: number | null
          revenue_generated?: number | null
          service_id?: string
          start_date?: string
          total_cost?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "premium_placements_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "advertising_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "premium_placements_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "premium_placements_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      refunds: {
        Row: {
          approval_status: string | null
          approved_at: string | null
          approved_by: string | null
          commission_refund: number | null
          completed_at: string | null
          created_at: string | null
          id: string
          order_id: string
          payment_id: string
          pg_refund_id: string | null
          pg_response: Json | null
          refund_amount: number
          refund_description: string | null
          refund_reason: string
          rejection_reason: string | null
          requested_at: string | null
          requested_by: string | null
          seller_penalty: number | null
          status: string | null
        }
        Insert: {
          approval_status?: string | null
          approved_at?: string | null
          approved_by?: string | null
          commission_refund?: number | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          order_id: string
          payment_id: string
          pg_refund_id?: string | null
          pg_response?: Json | null
          refund_amount: number
          refund_description?: string | null
          refund_reason: string
          rejection_reason?: string | null
          requested_at?: string | null
          requested_by?: string | null
          seller_penalty?: number | null
          status?: string | null
        }
        Update: {
          approval_status?: string | null
          approved_at?: string | null
          approved_by?: string | null
          commission_refund?: number | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          order_id?: string
          payment_id?: string
          pg_refund_id?: string | null
          pg_response?: Json | null
          refund_amount?: number
          refund_description?: string | null
          refund_reason?: string
          rejection_reason?: string | null
          requested_at?: string | null
          requested_by?: string | null
          seller_penalty?: number | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "refunds_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "admins"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "refunds_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "refunds_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "refunds_requested_by_fkey"
            columns: ["requested_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      reports: {
        Row: {
          action_taken: string | null
          admin_notes: string | null
          assigned_at: string | null
          assigned_to: string | null
          created_at: string | null
          description: string | null
          evidence_urls: string[] | null
          id: string
          report_reason: string
          report_type: string
          reported_order_id: string | null
          reported_review_id: string | null
          reported_service_id: string | null
          reported_user_id: string | null
          reporter_id: string
          resolved_at: string | null
          severity: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          action_taken?: string | null
          admin_notes?: string | null
          assigned_at?: string | null
          assigned_to?: string | null
          created_at?: string | null
          description?: string | null
          evidence_urls?: string[] | null
          id?: string
          report_reason: string
          report_type: string
          reported_order_id?: string | null
          reported_review_id?: string | null
          reported_service_id?: string | null
          reported_user_id?: string | null
          reporter_id: string
          resolved_at?: string | null
          severity?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          action_taken?: string | null
          admin_notes?: string | null
          assigned_at?: string | null
          assigned_to?: string | null
          created_at?: string | null
          description?: string | null
          evidence_urls?: string[] | null
          id?: string
          report_reason?: string
          report_type?: string
          reported_order_id?: string | null
          reported_review_id?: string | null
          reported_service_id?: string | null
          reported_user_id?: string | null
          reporter_id?: string
          resolved_at?: string | null
          severity?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reports_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "admins"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_reported_order_id_fkey"
            columns: ["reported_order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_reported_review_id_fkey"
            columns: ["reported_review_id"]
            isOneToOne: false
            referencedRelation: "reviews"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_reported_service_id_fkey"
            columns: ["reported_service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_reported_user_id_fkey"
            columns: ["reported_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          buyer_id: string
          comment: string | null
          communication_rating: number | null
          created_at: string | null
          delivery_rating: number | null
          helpful_count: number | null
          id: string
          images: string[] | null
          is_featured: boolean | null
          is_visible: boolean | null
          moderated: boolean | null
          moderation_reason: string | null
          not_helpful_count: number | null
          order_id: string
          quality_rating: number | null
          rating: number
          seller_id: string
          seller_reply: string | null
          seller_reply_at: string | null
          service_id: string
          tags: string[] | null
          updated_at: string | null
        }
        Insert: {
          buyer_id: string
          comment?: string | null
          communication_rating?: number | null
          created_at?: string | null
          delivery_rating?: number | null
          helpful_count?: number | null
          id?: string
          images?: string[] | null
          is_featured?: boolean | null
          is_visible?: boolean | null
          moderated?: boolean | null
          moderation_reason?: string | null
          not_helpful_count?: number | null
          order_id: string
          quality_rating?: number | null
          rating: number
          seller_id: string
          seller_reply?: string | null
          seller_reply_at?: string | null
          service_id: string
          tags?: string[] | null
          updated_at?: string | null
        }
        Update: {
          buyer_id?: string
          comment?: string | null
          communication_rating?: number | null
          created_at?: string | null
          delivery_rating?: number | null
          helpful_count?: number | null
          id?: string
          images?: string[] | null
          is_featured?: boolean | null
          is_visible?: boolean | null
          moderated?: boolean | null
          moderation_reason?: string | null
          not_helpful_count?: number | null
          order_id?: string
          quality_rating?: number | null
          rating?: number
          seller_id?: string
          seller_reply?: string | null
          seller_reply_at?: string | null
          service_id?: string
          tags?: string[] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: true
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      schema_migrations: {
        Row: {
          executed_at: string | null
          version: string
        }
        Insert: {
          executed_at?: string | null
          version: string
        }
        Update: {
          executed_at?: string | null
          version?: string
        }
        Relationships: []
      }
      search_logs: {
        Row: {
          category_id: string | null
          clicked_service_ids: string[] | null
          converted_service_id: string | null
          created_at: string | null
          filters: Json | null
          id: string
          keyword: string
          result_count: number | null
          search_duration_ms: number | null
          session_id: string | null
          user_id: string | null
        }
        Insert: {
          category_id?: string | null
          clicked_service_ids?: string[] | null
          converted_service_id?: string | null
          created_at?: string | null
          filters?: Json | null
          id?: string
          keyword: string
          result_count?: number | null
          search_duration_ms?: number | null
          session_id?: string | null
          user_id?: string | null
        }
        Update: {
          category_id?: string | null
          clicked_service_ids?: string[] | null
          converted_service_id?: string | null
          created_at?: string | null
          filters?: Json | null
          id?: string
          keyword?: string
          result_count?: number | null
          search_duration_ms?: number | null
          session_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "search_logs_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "search_logs_converted_service_id_fkey"
            columns: ["converted_service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "search_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      seller_profiles: {
        Row: {
          account_holder: string | null
          bank_account: string | null
          bank_name: string | null
          business_name: string | null
          created_at: string | null
          description: string | null
          is_verified: boolean | null
          rating: number | null
          response_time: string | null
          skills: string[] | null
          total_reviews: number | null
          total_sales: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          account_holder?: string | null
          bank_account?: string | null
          bank_name?: string | null
          business_name?: string | null
          created_at?: string | null
          description?: string | null
          is_verified?: boolean | null
          rating?: number | null
          response_time?: string | null
          skills?: string[] | null
          total_reviews?: number | null
          total_sales?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          account_holder?: string | null
          bank_account?: string | null
          bank_name?: string | null
          business_name?: string | null
          created_at?: string | null
          description?: string | null
          is_verified?: boolean | null
          rating?: number | null
          response_time?: string | null
          skills?: string[] | null
          total_reviews?: number | null
          total_sales?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "seller_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      service_categories: {
        Row: {
          category_id: string
          created_at: string | null
          is_primary: boolean | null
          service_id: string
        }
        Insert: {
          category_id: string
          created_at?: string | null
          is_primary?: boolean | null
          service_id: string
        }
        Update: {
          category_id?: string
          created_at?: string | null
          is_primary?: boolean | null
          service_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_categories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_categories_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      service_packages: {
        Row: {
          created_at: string | null
          delivery_days: number
          description: string | null
          display_order: number | null
          express_days: number | null
          express_price: number | null
          features: string[] | null
          id: string
          is_active: boolean | null
          is_express_available: boolean | null
          name: string
          package_type: string
          price: number
          revision_count: number | null
          service_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          delivery_days: number
          description?: string | null
          display_order?: number | null
          express_days?: number | null
          express_price?: number | null
          features?: string[] | null
          id?: string
          is_active?: boolean | null
          is_express_available?: boolean | null
          name: string
          package_type: string
          price: number
          revision_count?: number | null
          service_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          delivery_days?: number
          description?: string | null
          display_order?: number | null
          express_days?: number | null
          express_price?: number | null
          features?: string[] | null
          id?: string
          is_active?: boolean | null
          is_express_available?: boolean | null
          name?: string
          package_type?: string
          price?: number
          revision_count?: number | null
          service_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "service_packages_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      service_tags: {
        Row: {
          created_at: string | null
          service_id: string
          tag_id: string
        }
        Insert: {
          created_at?: string | null
          service_id: string
          tag_id: string
        }
        Update: {
          created_at?: string | null
          service_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_tags_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          clicks: number | null
          completed_orders: number | null
          created_at: string | null
          deleted_at: string | null
          delivery_days: number
          description: string
          express_days: number | null
          express_delivery: boolean | null
          express_price: number | null
          featured_until: string | null
          id: string
          in_progress_orders: number | null
          is_featured: boolean | null
          last_modified_by: string | null
          meta_description: string | null
          meta_title: string | null
          orders_count: number | null
          portfolio_urls: string[] | null
          price: number
          price_unit: string | null
          rating: number | null
          requirements: string | null
          review_count: number | null
          revision_count: number | null
          seller_id: string
          slug: string
          status: string | null
          thumbnail_url: string | null
          title: string
          updated_at: string | null
          version: number | null
          video_url: string | null
          views: number | null
        }
        Insert: {
          clicks?: number | null
          completed_orders?: number | null
          created_at?: string | null
          deleted_at?: string | null
          delivery_days: number
          description: string
          express_days?: number | null
          express_delivery?: boolean | null
          express_price?: number | null
          featured_until?: string | null
          id?: string
          in_progress_orders?: number | null
          is_featured?: boolean | null
          last_modified_by?: string | null
          meta_description?: string | null
          meta_title?: string | null
          orders_count?: number | null
          portfolio_urls?: string[] | null
          price: number
          price_unit?: string | null
          rating?: number | null
          requirements?: string | null
          review_count?: number | null
          revision_count?: number | null
          seller_id: string
          slug: string
          status?: string | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string | null
          version?: number | null
          video_url?: string | null
          views?: number | null
        }
        Update: {
          clicks?: number | null
          completed_orders?: number | null
          created_at?: string | null
          deleted_at?: string | null
          delivery_days?: number
          description?: string
          express_days?: number | null
          express_delivery?: boolean | null
          express_price?: number | null
          featured_until?: string | null
          id?: string
          in_progress_orders?: number | null
          is_featured?: boolean | null
          last_modified_by?: string | null
          meta_description?: string | null
          meta_title?: string | null
          orders_count?: number | null
          portfolio_urls?: string[] | null
          price?: number
          price_unit?: string | null
          rating?: number | null
          requirements?: string | null
          review_count?: number | null
          revision_count?: number | null
          seller_id?: string
          slug?: string
          status?: string | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string | null
          version?: number | null
          video_url?: string | null
          views?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "services_last_modified_by_fkey"
            columns: ["last_modified_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "services_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      settlement_details: {
        Row: {
          commission_amount: number
          created_at: string | null
          description: string | null
          id: string
          order_amount: number
          order_id: string
          seller_amount: number
          settlement_id: string
          type: string | null
        }
        Insert: {
          commission_amount: number
          created_at?: string | null
          description?: string | null
          id?: string
          order_amount: number
          order_id: string
          seller_amount: number
          settlement_id: string
          type?: string | null
        }
        Update: {
          commission_amount?: number
          created_at?: string | null
          description?: string | null
          id?: string
          order_amount?: number
          order_id?: string
          seller_amount?: number
          settlement_id?: string
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "settlement_details_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "settlement_details_settlement_id_fkey"
            columns: ["settlement_id"]
            isOneToOne: false
            referencedRelation: "settlements"
            referencedColumns: ["id"]
          },
        ]
      }
      settlements: {
        Row: {
          account_holder: string | null
          adjustments: number | null
          bank_account: string | null
          bank_name: string | null
          confirmed_at: string | null
          created_at: string | null
          end_date: string
          id: string
          paid_at: string | null
          payment_proof: string | null
          seller_id: string
          settlement_amount: number
          settlement_date: string
          start_date: string
          status: string | null
          total_commission: number | null
          total_refunds: number | null
          total_sales: number | null
          updated_at: string | null
        }
        Insert: {
          account_holder?: string | null
          adjustments?: number | null
          bank_account?: string | null
          bank_name?: string | null
          confirmed_at?: string | null
          created_at?: string | null
          end_date: string
          id?: string
          paid_at?: string | null
          payment_proof?: string | null
          seller_id: string
          settlement_amount: number
          settlement_date: string
          start_date: string
          status?: string | null
          total_commission?: number | null
          total_refunds?: number | null
          total_sales?: number | null
          updated_at?: string | null
        }
        Update: {
          account_holder?: string | null
          adjustments?: number | null
          bank_account?: string | null
          bank_name?: string | null
          confirmed_at?: string | null
          created_at?: string | null
          end_date?: string
          id?: string
          paid_at?: string | null
          payment_proof?: string | null
          seller_id?: string
          settlement_amount?: number
          settlement_date?: string
          start_date?: string
          status?: string | null
          total_commission?: number | null
          total_refunds?: number | null
          total_sales?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "settlements_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      tags: {
        Row: {
          created_at: string | null
          id: string
          name: string
          slug: string
          usage_count: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          slug: string
          usage_count?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          slug?: string
          usage_count?: number | null
        }
        Relationships: []
      }
      users: {
        Row: {
          bio: string | null
          created_at: string | null
          deleted_at: string | null
          email: string
          email_verified: boolean | null
          id: string
          is_active: boolean | null
          last_login_at: string | null
          name: string
          phone: string | null
          phone_verified: boolean | null
          profile_image: string | null
          updated_at: string | null
          user_type: string | null
        }
        Insert: {
          bio?: string | null
          created_at?: string | null
          deleted_at?: string | null
          email: string
          email_verified?: boolean | null
          id: string
          is_active?: boolean | null
          last_login_at?: string | null
          name: string
          phone?: string | null
          phone_verified?: boolean | null
          profile_image?: string | null
          updated_at?: string | null
          user_type?: string | null
        }
        Update: {
          bio?: string | null
          created_at?: string | null
          deleted_at?: string | null
          email?: string
          email_verified?: boolean | null
          id?: string
          is_active?: boolean | null
          last_login_at?: string | null
          name?: string
          phone?: string | null
          phone_verified?: boolean | null
          profile_image?: string | null
          updated_at?: string | null
          user_type?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: { Args: never; Returns: boolean }
      is_seller: { Args: never; Returns: boolean }
      owns_service: { Args: { service_id: string }; Returns: boolean }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const
