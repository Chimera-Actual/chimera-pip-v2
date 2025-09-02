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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      user_achievements: {
        Row: {
          achievement_data: Json | null
          achievement_type: string
          id: string
          unlocked_at: string | null
          user_id: string
        }
        Insert: {
          achievement_data?: Json | null
          achievement_type: string
          id?: string
          unlocked_at?: string | null
          user_id: string
        }
        Update: {
          achievement_data?: Json | null
          achievement_type?: string
          id?: string
          unlocked_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_activities: {
        Row: {
          activity_data: Json | null
          activity_type: string
          created_at: string | null
          experience_gained: number | null
          id: string
          user_id: string
        }
        Insert: {
          activity_data?: Json | null
          activity_type: string
          created_at?: string | null
          experience_gained?: number | null
          id?: string
          user_id: string
        }
        Update: {
          activity_data?: Json | null
          activity_type?: string
          created_at?: string | null
          experience_gained?: number | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_activities_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_tabs: {
        Row: {
          color: string | null
          created_at: string
          description: string | null
          icon: string
          id: string
          is_custom: boolean
          is_default: boolean
          name: string
          position: number
          updated_at: string
          user_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          description?: string | null
          icon?: string
          id?: string
          is_custom?: boolean
          is_default?: boolean
          name: string
          position?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          color?: string | null
          created_at?: string
          description?: string | null
          icon?: string
          id?: string
          is_custom?: boolean
          is_default?: boolean
          name?: string
          position?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_widgets: {
        Row: {
          created_at: string | null
          id: string
          is_collapsed: boolean | null
          position: Json
          size: Json
          tab_assignment: string
          updated_at: string | null
          user_id: string
          widget_config: Json
          widget_type: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_collapsed?: boolean | null
          position?: Json
          size?: Json
          tab_assignment: string
          updated_at?: string | null
          user_id: string
          widget_config: Json
          widget_type: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_collapsed?: boolean | null
          position?: Json
          size?: Json
          tab_assignment?: string
          updated_at?: string | null
          user_id?: string
          widget_config?: Json
          widget_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_widgets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          character_name: string | null
          created_at: string | null
          email: string
          experience_points: number | null
          id: string
          karma: number | null
          level: number | null
          special_stats: Json | null
          theme_config: Json | null
          updated_at: string | null
          vault_number: number
        }
        Insert: {
          character_name?: string | null
          created_at?: string | null
          email: string
          experience_points?: number | null
          id?: string
          karma?: number | null
          level?: number | null
          special_stats?: Json | null
          theme_config?: Json | null
          updated_at?: string | null
          vault_number: number
        }
        Update: {
          character_name?: string | null
          created_at?: string | null
          email?: string
          experience_points?: number | null
          id?: string
          karma?: number | null
          level?: number | null
          special_stats?: Json | null
          theme_config?: Json | null
          updated_at?: string | null
          vault_number?: number
        }
        Relationships: []
      }
      widget_catalog: {
        Row: {
          category: string
          created_at: string
          default_settings: Json
          description: string
          featured: boolean
          icon: string
          id: string
          is_default: boolean
          name: string
          preview_image: string | null
          required_permissions: string[] | null
          updated_at: string
          widget_type: string
        }
        Insert: {
          category?: string
          created_at?: string
          default_settings?: Json
          description: string
          featured?: boolean
          icon: string
          id?: string
          is_default?: boolean
          name: string
          preview_image?: string | null
          required_permissions?: string[] | null
          updated_at?: string
          widget_type: string
        }
        Update: {
          category?: string
          created_at?: string
          default_settings?: Json
          description?: string
          featured?: boolean
          icon?: string
          id?: string
          is_default?: boolean
          name?: string
          preview_image?: string | null
          required_permissions?: string[] | null
          updated_at?: string
          widget_type?: string
        }
        Relationships: []
      }
      widget_tag_associations: {
        Row: {
          created_at: string
          tag_id: string
          widget_type: string
        }
        Insert: {
          created_at?: string
          tag_id: string
          widget_type: string
        }
        Update: {
          created_at?: string
          tag_id?: string
          widget_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "widget_tag_associations_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "widget_tags"
            referencedColumns: ["id"]
          },
        ]
      }
      widget_tags: {
        Row: {
          color: string
          created_at: string
          description: string | null
          icon: string | null
          id: string
          is_default: boolean
          name: string
          usage_count: number
          user_id: string | null
        }
        Insert: {
          color?: string
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_default?: boolean
          name: string
          usage_count?: number
          user_id?: string | null
        }
        Update: {
          color?: string
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_default?: boolean
          name?: string
          usage_count?: number
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_vault_number: {
        Args: Record<PropertyKey, never>
        Returns: number
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
  public: {
    Enums: {},
  },
} as const
