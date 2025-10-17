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
  public: {
    Tables: {
      achievements: {
        Row: {
          created_at: string
          description: string
          id: string
          points: number
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          points?: number
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          points?: number
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      badges: {
        Row: {
          category: string
          created_at: string
          description: string
          icon: string
          id: string
          name: string
          requirement_value: number
        }
        Insert: {
          category: string
          created_at?: string
          description: string
          icon: string
          id?: string
          name: string
          requirement_value: number
        }
        Update: {
          category?: string
          created_at?: string
          description?: string
          icon?: string
          id?: string
          name?: string
          requirement_value?: number
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          created_at: string
          id: string
          is_read: boolean | null
          message: string
          receiver_id: string
          sender_id: string
          task_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean | null
          message: string
          receiver_id: string
          sender_id: string
          task_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean | null
          message?: string
          receiver_id?: string
          sender_id?: string
          task_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "volunteer_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      donations: {
        Row: {
          created_at: string
          description: string | null
          donor_id: string
          estimated_meals: number | null
          expiry_time: string
          food_type: string
          id: string
          images: string[] | null
          is_recurring: boolean | null
          pickup_address: string
          pickup_instructions: string | null
          pickup_latitude: number
          pickup_longitude: number
          quantity: string
          recurring_schedule: Json | null
          requested_by: string | null
          status: Database["public"]["Enums"]["donation_status"]
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          donor_id: string
          estimated_meals?: number | null
          expiry_time: string
          food_type: string
          id?: string
          images?: string[] | null
          is_recurring?: boolean | null
          pickup_address: string
          pickup_instructions?: string | null
          pickup_latitude: number
          pickup_longitude: number
          quantity: string
          recurring_schedule?: Json | null
          requested_by?: string | null
          status?: Database["public"]["Enums"]["donation_status"]
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          donor_id?: string
          estimated_meals?: number | null
          expiry_time?: string
          food_type?: string
          id?: string
          images?: string[] | null
          is_recurring?: boolean | null
          pickup_address?: string
          pickup_instructions?: string | null
          pickup_latitude?: number
          pickup_longitude?: number
          quantity?: string
          recurring_schedule?: Json | null
          requested_by?: string | null
          status?: Database["public"]["Enums"]["donation_status"]
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      food_requests: {
        Row: {
          created_at: string
          delivery_address: string
          delivery_latitude: number
          delivery_longitude: number
          description: string
          food_type: string
          id: string
          is_urgent: boolean | null
          meals_needed: number | null
          needed_by: string
          ngo_id: string
          pledges: Json | null
          quantity_needed: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          delivery_address: string
          delivery_latitude: number
          delivery_longitude: number
          description: string
          food_type: string
          id?: string
          is_urgent?: boolean | null
          meals_needed?: number | null
          needed_by: string
          ngo_id: string
          pledges?: Json | null
          quantity_needed: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          delivery_address?: string
          delivery_latitude?: number
          delivery_longitude?: number
          description?: string
          food_type?: string
          id?: string
          is_urgent?: boolean | null
          meals_needed?: number | null
          needed_by?: string
          ngo_id?: string
          pledges?: Json | null
          quantity_needed?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      ngo_verifications: {
        Row: {
          contact_email: string | null
          contact_person: string | null
          contact_phone: string | null
          created_at: string
          description: string | null
          id: string
          organization_name: string
          organization_type: string | null
          registration_id: string
          rejection_reason: string | null
          status: Database["public"]["Enums"]["verification_status"]
          updated_at: string
          user_id: string
          verification_documents: string[] | null
          verified_at: string | null
          verified_by: string | null
          website: string | null
        }
        Insert: {
          contact_email?: string | null
          contact_person?: string | null
          contact_phone?: string | null
          created_at?: string
          description?: string | null
          id?: string
          organization_name: string
          organization_type?: string | null
          registration_id: string
          rejection_reason?: string | null
          status?: Database["public"]["Enums"]["verification_status"]
          updated_at?: string
          user_id: string
          verification_documents?: string[] | null
          verified_at?: string | null
          verified_by?: string | null
          website?: string | null
        }
        Update: {
          contact_email?: string | null
          contact_person?: string | null
          contact_phone?: string | null
          created_at?: string
          description?: string | null
          id?: string
          organization_name?: string
          organization_type?: string | null
          registration_id?: string
          rejection_reason?: string | null
          status?: Database["public"]["Enums"]["verification_status"]
          updated_at?: string
          user_id?: string
          verification_documents?: string[] | null
          verified_at?: string | null
          verified_by?: string | null
          website?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean | null
          message: string
          related_id: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean | null
          message: string
          related_id?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean | null
          message?: string
          related_id?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          address: string | null
          avatar_url: string | null
          average_rating: number | null
          bio: string | null
          co2_saved_kg: number | null
          created_at: string
          full_name: string
          id: string
          latitude: number | null
          longitude: number | null
          phone: string | null
          total_deliveries: number | null
          total_donations: number | null
          total_meals_donated: number | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          average_rating?: number | null
          bio?: string | null
          co2_saved_kg?: number | null
          created_at?: string
          full_name: string
          id: string
          latitude?: number | null
          longitude?: number | null
          phone?: string | null
          total_deliveries?: number | null
          total_donations?: number | null
          total_meals_donated?: number | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          average_rating?: number | null
          bio?: string | null
          co2_saved_kg?: number | null
          created_at?: string
          full_name?: string
          id?: string
          latitude?: number | null
          longitude?: number | null
          phone?: string | null
          total_deliveries?: number | null
          total_donations?: number | null
          total_meals_donated?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      ratings: {
        Row: {
          category: string
          comment: string | null
          created_at: string
          id: string
          rated_user_id: string
          rater_id: string
          rating: number
          task_id: string
        }
        Insert: {
          category: string
          comment?: string | null
          created_at?: string
          id?: string
          rated_user_id: string
          rater_id: string
          rating: number
          task_id: string
        }
        Update: {
          category?: string
          comment?: string | null
          created_at?: string
          id?: string
          rated_user_id?: string
          rater_id?: string
          rating?: number
          task_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ratings_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "volunteer_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      user_badges: {
        Row: {
          badge_id: string
          earned_at: string
          id: string
          user_id: string
        }
        Insert: {
          badge_id: string
          earned_at?: string
          id?: string
          user_id: string
        }
        Update: {
          badge_id?: string
          earned_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_badges_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "badges"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      volunteer_tasks: {
        Row: {
          accepted_at: string | null
          bundled_tasks: string[] | null
          created_at: string
          delivered_at: string | null
          donation_id: string
          donor_id: string
          dropoff_address: string
          dropoff_latitude: number
          dropoff_longitude: number
          estimated_distance_km: number | null
          id: string
          ngo_id: string
          picked_up_at: string | null
          pickup_address: string
          pickup_latitude: number
          pickup_longitude: number
          status: Database["public"]["Enums"]["task_status"]
          updated_at: string
          volunteer_id: string | null
        }
        Insert: {
          accepted_at?: string | null
          bundled_tasks?: string[] | null
          created_at?: string
          delivered_at?: string | null
          donation_id: string
          donor_id: string
          dropoff_address: string
          dropoff_latitude: number
          dropoff_longitude: number
          estimated_distance_km?: number | null
          id?: string
          ngo_id: string
          picked_up_at?: string | null
          pickup_address: string
          pickup_latitude: number
          pickup_longitude: number
          status?: Database["public"]["Enums"]["task_status"]
          updated_at?: string
          volunteer_id?: string | null
        }
        Update: {
          accepted_at?: string | null
          bundled_tasks?: string[] | null
          created_at?: string
          delivered_at?: string | null
          donation_id?: string
          donor_id?: string
          dropoff_address?: string
          dropoff_latitude?: number
          dropoff_longitude?: number
          estimated_distance_km?: number | null
          id?: string
          ngo_id?: string
          picked_up_at?: string | null
          pickup_address?: string
          pickup_latitude?: number
          pickup_longitude?: number
          status?: Database["public"]["Enums"]["task_status"]
          updated_at?: string
          volunteer_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "volunteer_tasks_donation_id_fkey"
            columns: ["donation_id"]
            isOneToOne: false
            referencedRelation: "donations"
            referencedColumns: ["id"]
          },
        ]
      }
      wishlists: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          fulfilled_quantity: number | null
          id: string
          item_name: string
          ngo_id: string
          priority: string
          quantity_needed: string
          status: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          fulfilled_quantity?: number | null
          id?: string
          item_name: string
          ngo_id: string
          priority?: string
          quantity_needed: string
          status?: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          fulfilled_quantity?: number | null
          id?: string
          item_name?: string
          ngo_id?: string
          priority?: string
          quantity_needed?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "donor" | "ngo" | "volunteer"
      donation_status:
        | "available"
        | "requested"
        | "pickup_scheduled"
        | "in_transit"
        | "delivered"
        | "cancelled"
      task_status:
        | "available"
        | "assigned"
        | "in_progress"
        | "completed"
        | "cancelled"
      verification_status: "pending" | "approved" | "rejected"
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
      app_role: ["admin", "donor", "ngo", "volunteer"],
      donation_status: [
        "available",
        "requested",
        "pickup_scheduled",
        "in_transit",
        "delivered",
        "cancelled",
      ],
      task_status: [
        "available",
        "assigned",
        "in_progress",
        "completed",
        "cancelled",
      ],
      verification_status: ["pending", "approved", "rejected"],
    },
  },
} as const
