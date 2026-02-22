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
      user: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          email: string
          name: string
          email_verified: boolean
          image: string | null
          locale: string
          role: string | null
          banned: boolean | null
          ban_reason: string | null
          ban_expires: string | null
          last_seen_at: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          email: string
          name: string
          email_verified?: boolean
          image?: string | null
          locale?: string
          role?: string | null
          banned?: boolean | null
          ban_reason?: string | null
          ban_expires?: string | null
          last_seen_at?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          email?: string
          name?: string
          email_verified?: boolean
          image?: string | null
          locale?: string
          role?: string | null
          banned?: boolean | null
          ban_reason?: string | null
          ban_expires?: string | null
          last_seen_at?: string | null
        }
        Relationships: []
      }
      account: {
        Row: {
          id: string
          account_id: string
          provider_id: string
          user_id: string
          access_token: string | null
          refresh_token: string | null
          id_token: string | null
          access_token_expires_at: string | null
          refresh_token_expires_at: string | null
          scope: string | null
          password: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          account_id: string
          provider_id: string
          user_id: string
          access_token?: string | null
          refresh_token?: string | null
          id_token?: string | null
          access_token_expires_at?: string | null
          refresh_token_expires_at?: string | null
          scope?: string | null
          password?: string | null
          created_at: string
          updated_at: string
        }
        Update: {
          id?: string
          account_id?: string
          provider_id?: string
          user_id?: string
          access_token?: string | null
          refresh_token?: string | null
          id_token?: string | null
          access_token_expires_at?: string | null
          refresh_token_expires_at?: string | null
          scope?: string | null
          password?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "account_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
      session: {
        Row: {
          id: string
          expires_at: string
          token: string
          created_at: string
          updated_at: string
          ip_address: string | null
          user_agent: string | null
          user_id: string
          active_organization_id: string | null
          impersonated_by: string | null
        }
        Insert: {
          id?: string
          expires_at: string
          token: string
          created_at: string
          updated_at: string
          ip_address?: string | null
          user_agent?: string | null
          user_id: string
          active_organization_id?: string | null
          impersonated_by?: string | null
        }
        Update: {
          id?: string
          expires_at?: string
          token?: string
          created_at?: string
          updated_at?: string
          ip_address?: string | null
          user_agent?: string | null
          user_id?: string
          active_organization_id?: string | null
          impersonated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "session_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
      verification: {
        Row: {
          id: string
          identifier: string
          value: string
          expires_at: string
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          identifier: string
          value: string
          expires_at: string
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          identifier?: string
          value?: string
          expires_at?: string
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      delivery_notes: {
        Row: {
          id: string
          lieferschein_nr: string | null
          delivery_date: string
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          lieferschein_nr?: string | null
          delivery_date?: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          lieferschein_nr?: string | null
          delivery_date?: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      delivery_note_items: {
        Row: {
          id: string
          delivery_note_id: string
          article_name: string
          quantity_35: number
          quantity_65: number
          quantity_85: number
          unit_price_cents: number
          sort_order: number
        }
        Insert: {
          id?: string
          delivery_note_id: string
          article_name: string
          quantity_35?: number
          quantity_65?: number
          quantity_85?: number
          unit_price_cents?: number
          sort_order?: number
        }
        Update: {
          id?: string
          delivery_note_id?: string
          article_name?: string
          quantity_35?: number
          quantity_65?: number
          quantity_85?: number
          unit_price_cents?: number
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "delivery_note_items_delivery_note_id_fkey"
            columns: ["delivery_note_id"]
            isOneToOne: false
            referencedRelation: "delivery_notes"
            referencedColumns: ["id"]
          },
        ]
      }
      app_settings: {
        Row: {
          id: string
          setting_key: string
          setting_value: Json
          updated_at: string
        }
        Insert: {
          id?: string
          setting_key: string
          setting_value?: Json
          updated_at?: string
        }
        Update: {
          id?: string
          setting_key?: string
          setting_value?: Json
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
