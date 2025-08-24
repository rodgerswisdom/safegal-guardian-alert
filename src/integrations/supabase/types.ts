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
      case_actions: {
        Row: {
          action_hash: string
          action_type: Database["public"]["Enums"]["action_type"]
          actor_id: string
          case_id: string
          created_at: string
          details: Json | null
          id: string
          prev_hash: string | null
        }
        Insert: {
          action_hash: string
          action_type: Database["public"]["Enums"]["action_type"]
          actor_id: string
          case_id: string
          created_at?: string
          details?: Json | null
          id?: string
          prev_hash?: string | null
        }
        Update: {
          action_hash?: string
          action_type?: Database["public"]["Enums"]["action_type"]
          actor_id?: string
          case_id?: string
          created_at?: string
          details?: Json | null
          id?: string
          prev_hash?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "case_actions_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "case_actions_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      cases: {
        Row: {
          age_band: Database["public"]["Enums"]["age_band"]
          case_code: string
          county_id: string
          cpo_acked: boolean
          cpo_acked_at: string | null
          created_at: string
          id: string
          is_spike: boolean
          ngo_acked: boolean
          ngo_acked_at: string | null
          redacted_note: string | null
          reporter_id: string
          risk_score: number
          risk_tags: string[]
          school_id: string
          status: Database["public"]["Enums"]["case_status"]
          updated_at: string
        }
        Insert: {
          age_band: Database["public"]["Enums"]["age_band"]
          case_code: string
          county_id: string
          cpo_acked?: boolean
          cpo_acked_at?: string | null
          created_at?: string
          id?: string
          is_spike?: boolean
          ngo_acked?: boolean
          ngo_acked_at?: string | null
          redacted_note?: string | null
          reporter_id: string
          risk_score?: number
          risk_tags?: string[]
          school_id: string
          status?: Database["public"]["Enums"]["case_status"]
          updated_at?: string
        }
        Update: {
          age_band?: Database["public"]["Enums"]["age_band"]
          case_code?: string
          county_id?: string
          cpo_acked?: boolean
          cpo_acked_at?: string | null
          created_at?: string
          id?: string
          is_spike?: boolean
          ngo_acked?: boolean
          ngo_acked_at?: string | null
          redacted_note?: string | null
          reporter_id?: string
          risk_score?: number
          risk_tags?: string[]
          school_id?: string
          status?: Database["public"]["Enums"]["case_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cases_county_id_fkey"
            columns: ["county_id"]
            isOneToOne: false
            referencedRelation: "counties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cases_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cases_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      counties: {
        Row: {
          code: string
          created_at: string
          id: string
          name: string
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          approved: boolean
          county_id: string | null
          created_at: string
          id: string
          role: Database["public"]["Enums"]["user_role"]
          school_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          approved?: boolean
          county_id?: string | null
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["user_role"]
          school_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          approved?: boolean
          county_id?: string | null
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          school_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_county_id_fkey"
            columns: ["county_id"]
            isOneToOne: false
            referencedRelation: "counties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      schools: {
        Row: {
          code: string
          county_id: string
          created_at: string
          id: string
          name: string
        }
        Insert: {
          code: string
          county_id: string
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          code?: string
          county_id?: string
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "schools_county_id_fkey"
            columns: ["county_id"]
            isOneToOne: false
            referencedRelation: "counties"
            referencedColumns: ["id"]
          },
        ]
      }
      user_rate_limits: {
        Row: {
          alerts_today: number
          created_at: string
          id: string
          is_soft_blocked: boolean
          last_alert_at: string | null
          last_unfounded_at: string | null
          unfounded_count: number
          updated_at: string
          user_id: string
        }
        Insert: {
          alerts_today?: number
          created_at?: string
          id?: string
          is_soft_blocked?: boolean
          last_alert_at?: string | null
          last_unfounded_at?: string | null
          unfounded_count?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          alerts_today?: number
          created_at?: string
          id?: string
          is_soft_blocked?: boolean
          last_alert_at?: string | null
          last_unfounded_at?: string | null
          unfounded_count?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_rate_limits_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_risk_score: {
        Args: {
          p_age_band: Database["public"]["Enums"]["age_band"]
          p_redacted_note: string
          p_risk_tags: string[]
        }
        Returns: number
      }
      detect_spike: {
        Args: { p_county_id: string; p_school_id: string }
        Returns: boolean
      }
      generate_case_code: {
        Args: { county_code: string }
        Returns: string
      }
      get_user_county: {
        Args: { user_uuid: string }
        Returns: string
      }
      get_user_role: {
        Args: { user_uuid: string }
        Returns: Database["public"]["Enums"]["user_role"]
      }
      get_user_school: {
        Args: { user_uuid: string }
        Returns: string
      }
    }
    Enums: {
      action_type:
        | "created"
        | "cpo_ack"
        | "ngo_ack"
        | "call_guardian"
        | "school_visit_booked"
        | "escort_to_clinic"
        | "closed"
        | "marked_unfounded"
      age_band: "10-12" | "13-15" | "16-17"
      case_status:
        | "new"
        | "acknowledged"
        | "in_progress"
        | "closed"
        | "unfounded"
      user_role: "teacher" | "guardian" | "cpo" | "ngo" | "admin"
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
    Enums: {
      action_type: [
        "created",
        "cpo_ack",
        "ngo_ack",
        "call_guardian",
        "school_visit_booked",
        "escort_to_clinic",
        "closed",
        "marked_unfounded",
      ],
      age_band: ["10-12", "13-15", "16-17"],
      case_status: [
        "new",
        "acknowledged",
        "in_progress",
        "closed",
        "unfounded",
      ],
      user_role: ["teacher", "guardian", "cpo", "ngo", "admin"],
    },
  },
} as const
