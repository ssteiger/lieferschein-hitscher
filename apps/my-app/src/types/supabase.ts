export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
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
          operationName?: string
          query?: string
          variables?: Json
          extensions?: Json
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
      bot: {
        Row: {
          background_story: string | null
          bot_character_description: string | null
          bot_id: number
          bot_name: string
          created_at: string
          last_active_at: string
          money_balance_in_cents: number
        }
        Insert: {
          background_story?: string | null
          bot_character_description?: string | null
          bot_id?: number
          bot_name: string
          created_at?: string
          last_active_at?: string
          money_balance_in_cents?: number
        }
        Update: {
          background_story?: string | null
          bot_character_description?: string | null
          bot_id?: number
          bot_name?: string
          created_at?: string
          last_active_at?: string
          money_balance_in_cents?: number
        }
        Relationships: []
      }
      company: {
        Row: {
          company_id: string
          company_name: string
          created_at: string
          creator_bot_id: number
          description: string | null
          exchange_id: string
          ticker_symbol: string
          total_shares: number
        }
        Insert: {
          company_id: string
          company_name: string
          created_at?: string
          creator_bot_id: number
          description?: string | null
          exchange_id: string
          ticker_symbol: string
          total_shares: number
        }
        Update: {
          company_id?: string
          company_name?: string
          created_at?: string
          creator_bot_id?: number
          description?: string | null
          exchange_id?: string
          ticker_symbol?: string
          total_shares?: number
        }
        Relationships: [
          {
            foreignKeyName: "company_creator_bot_id_fkey"
            columns: ["creator_bot_id"]
            isOneToOne: false
            referencedRelation: "bot"
            referencedColumns: ["bot_id"]
          },
          {
            foreignKeyName: "company_exchange_id_fkey"
            columns: ["exchange_id"]
            isOneToOne: false
            referencedRelation: "current_market_price"
            referencedColumns: ["exchange_code"]
          },
          {
            foreignKeyName: "company_exchange_id_fkey"
            columns: ["exchange_id"]
            isOneToOne: false
            referencedRelation: "exchange"
            referencedColumns: ["exchange_id"]
          },
          {
            foreignKeyName: "company_exchange_id_fkey"
            columns: ["exchange_id"]
            isOneToOne: false
            referencedRelation: "order_book"
            referencedColumns: ["exchange_code"]
          },
        ]
      }
      exchange: {
        Row: {
          created_at: string
          exchange_code: string
          exchange_id: string
          exchange_name: string
          is_active: boolean
          trading_fee_percent: number
        }
        Insert: {
          created_at?: string
          exchange_code: string
          exchange_id: string
          exchange_name: string
          is_active?: boolean
          trading_fee_percent?: number
        }
        Update: {
          created_at?: string
          exchange_code?: string
          exchange_id?: string
          exchange_name?: string
          is_active?: boolean
          trading_fee_percent?: number
        }
        Relationships: []
      }
      logs: {
        Row: {
          created_at: string | null
          id: number
          message: string
        }
        Insert: {
          created_at?: string | null
          id?: number
          message: string
        }
        Update: {
          created_at?: string | null
          id?: number
          message?: string
        }
        Relationships: []
      }
      order: {
        Row: {
          bot_id: number
          company_id: string
          created_at: string
          expires_at: string | null
          is_buy: boolean
          last_updated_at: string
          order_id: number
          order_type: string
          price_in_cents: number
          quantity: number
          quantity_filled: number
          quantity_open: number | null
          status: string
        }
        Insert: {
          bot_id: number
          company_id: string
          created_at?: string
          expires_at?: string | null
          is_buy: boolean
          last_updated_at?: string
          order_id?: number
          order_type: string
          price_in_cents: number
          quantity: number
          quantity_filled?: number
          quantity_open?: number | null
          status?: string
        }
        Update: {
          bot_id?: number
          company_id?: string
          created_at?: string
          expires_at?: string | null
          is_buy?: boolean
          last_updated_at?: string
          order_id?: number
          order_type?: string
          price_in_cents?: number
          quantity?: number
          quantity_filled?: number
          quantity_open?: number | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_bot_id_fkey"
            columns: ["bot_id"]
            isOneToOne: false
            referencedRelation: "bot"
            referencedColumns: ["bot_id"]
          },
          {
            foreignKeyName: "order_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "order_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "current_market_price"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "order_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "order_book"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "order_order_type_fkey"
            columns: ["order_type"]
            isOneToOne: false
            referencedRelation: "order_type"
            referencedColumns: ["order_type"]
          },
          {
            foreignKeyName: "order_status_fkey"
            columns: ["status"]
            isOneToOne: false
            referencedRelation: "order_status"
            referencedColumns: ["order_status"]
          },
        ]
      }
      order_status: {
        Row: {
          order_status: string
        }
        Insert: {
          order_status: string
        }
        Update: {
          order_status?: string
        }
        Relationships: []
      }
      order_type: {
        Row: {
          order_type: string
        }
        Insert: {
          order_type: string
        }
        Update: {
          order_type?: string
        }
        Relationships: []
      }
      price_history: {
        Row: {
          close_price_in_cents: number
          company_id: string
          exchange_id: string
          high_price_in_cents: number
          history_id: number
          low_price_in_cents: number
          open_price_in_cents: number
          period_length: string
          timestamp: string
          volume: number
        }
        Insert: {
          close_price_in_cents: number
          company_id: string
          exchange_id: string
          high_price_in_cents: number
          history_id?: number
          low_price_in_cents: number
          open_price_in_cents: number
          period_length: string
          timestamp: string
          volume: number
        }
        Update: {
          close_price_in_cents?: number
          company_id?: string
          exchange_id?: string
          high_price_in_cents?: number
          history_id?: number
          low_price_in_cents?: number
          open_price_in_cents?: number
          period_length?: string
          timestamp?: string
          volume?: number
        }
        Relationships: [
          {
            foreignKeyName: "price_history_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "price_history_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "current_market_price"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "price_history_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "order_book"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "price_history_exchange_id_fkey"
            columns: ["exchange_id"]
            isOneToOne: false
            referencedRelation: "current_market_price"
            referencedColumns: ["exchange_code"]
          },
          {
            foreignKeyName: "price_history_exchange_id_fkey"
            columns: ["exchange_id"]
            isOneToOne: false
            referencedRelation: "exchange"
            referencedColumns: ["exchange_id"]
          },
          {
            foreignKeyName: "price_history_exchange_id_fkey"
            columns: ["exchange_id"]
            isOneToOne: false
            referencedRelation: "order_book"
            referencedColumns: ["exchange_code"]
          },
        ]
      }
      shareholding: {
        Row: {
          average_purchase_price_in_cents: number | null
          bot_id: number
          company_id: string
          last_updated_at: string
          shareholding_id: number
          shares: number
        }
        Insert: {
          average_purchase_price_in_cents?: number | null
          bot_id: number
          company_id: string
          last_updated_at?: string
          shareholding_id?: number
          shares?: number
        }
        Update: {
          average_purchase_price_in_cents?: number | null
          bot_id?: number
          company_id?: string
          last_updated_at?: string
          shareholding_id?: number
          shares?: number
        }
        Relationships: [
          {
            foreignKeyName: "shareholding_bot_id_fkey"
            columns: ["bot_id"]
            isOneToOne: false
            referencedRelation: "bot"
            referencedColumns: ["bot_id"]
          },
          {
            foreignKeyName: "shareholding_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "shareholding_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "current_market_price"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "shareholding_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "order_book"
            referencedColumns: ["company_id"]
          },
        ]
      }
      trade: {
        Row: {
          buy_order_id: number
          buyer_bot_id: number
          company_id: string
          exchange_id: string
          executed_at: string
          price_in_cents: number
          quantity: number
          sell_order_id: number
          seller_bot_id: number
          trade_fee_in_cents: number
          trade_id: number
        }
        Insert: {
          buy_order_id: number
          buyer_bot_id: number
          company_id: string
          exchange_id: string
          executed_at?: string
          price_in_cents: number
          quantity: number
          sell_order_id: number
          seller_bot_id: number
          trade_fee_in_cents: number
          trade_id?: number
        }
        Update: {
          buy_order_id?: number
          buyer_bot_id?: number
          company_id?: string
          exchange_id?: string
          executed_at?: string
          price_in_cents?: number
          quantity?: number
          sell_order_id?: number
          seller_bot_id?: number
          trade_fee_in_cents?: number
          trade_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "trade_buy_order_id_fkey"
            columns: ["buy_order_id"]
            isOneToOne: false
            referencedRelation: "order"
            referencedColumns: ["order_id"]
          },
          {
            foreignKeyName: "trade_buyer_bot_id_fkey"
            columns: ["buyer_bot_id"]
            isOneToOne: false
            referencedRelation: "bot"
            referencedColumns: ["bot_id"]
          },
          {
            foreignKeyName: "trade_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "trade_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "current_market_price"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "trade_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "order_book"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "trade_exchange_id_fkey"
            columns: ["exchange_id"]
            isOneToOne: false
            referencedRelation: "current_market_price"
            referencedColumns: ["exchange_code"]
          },
          {
            foreignKeyName: "trade_exchange_id_fkey"
            columns: ["exchange_id"]
            isOneToOne: false
            referencedRelation: "exchange"
            referencedColumns: ["exchange_id"]
          },
          {
            foreignKeyName: "trade_exchange_id_fkey"
            columns: ["exchange_id"]
            isOneToOne: false
            referencedRelation: "order_book"
            referencedColumns: ["exchange_code"]
          },
          {
            foreignKeyName: "trade_sell_order_id_fkey"
            columns: ["sell_order_id"]
            isOneToOne: false
            referencedRelation: "order"
            referencedColumns: ["order_id"]
          },
          {
            foreignKeyName: "trade_seller_bot_id_fkey"
            columns: ["seller_bot_id"]
            isOneToOne: false
            referencedRelation: "bot"
            referencedColumns: ["bot_id"]
          },
        ]
      }
    }
    Views: {
      current_market_price: {
        Row: {
          ask_price: number | null
          bid_price: number | null
          company_id: string | null
          exchange_code: string | null
          exchange_id: string | null
          last_trade_time: string | null
          spread: number | null
          ticker_symbol: string | null
        }
        Relationships: [
          {
            foreignKeyName: "company_exchange_id_fkey"
            columns: ["exchange_id"]
            isOneToOne: false
            referencedRelation: "current_market_price"
            referencedColumns: ["exchange_code"]
          },
          {
            foreignKeyName: "company_exchange_id_fkey"
            columns: ["exchange_id"]
            isOneToOne: false
            referencedRelation: "exchange"
            referencedColumns: ["exchange_id"]
          },
          {
            foreignKeyName: "company_exchange_id_fkey"
            columns: ["exchange_id"]
            isOneToOne: false
            referencedRelation: "order_book"
            referencedColumns: ["exchange_code"]
          },
        ]
      }
      order_book: {
        Row: {
          company_id: string | null
          exchange_code: string | null
          exchange_id: string | null
          is_buy: boolean | null
          oldest_order_time: string | null
          price_in_cents: number | null
          ticker_symbol: string | null
          total_quantity: number | null
        }
        Relationships: [
          {
            foreignKeyName: "company_exchange_id_fkey"
            columns: ["exchange_id"]
            isOneToOne: false
            referencedRelation: "current_market_price"
            referencedColumns: ["exchange_code"]
          },
          {
            foreignKeyName: "company_exchange_id_fkey"
            columns: ["exchange_id"]
            isOneToOne: false
            referencedRelation: "exchange"
            referencedColumns: ["exchange_id"]
          },
          {
            foreignKeyName: "company_exchange_id_fkey"
            columns: ["exchange_id"]
            isOneToOne: false
            referencedRelation: "order_book"
            referencedColumns: ["exchange_code"]
          },
        ]
      }
    }
    Functions: {
      accept_order: {
        Args: {
          accepting_bot_id: number
          target_order_id: number
          trade_quantity: number
          trade_fee_in_cents: number
        }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
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

