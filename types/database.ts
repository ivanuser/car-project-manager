export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

/**
 * PostgreSQL Database Types
 * This replaces the previous Supabase type definitions
 */
export interface Database {
  // Schema definitions
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          password_hash: string
          is_admin: boolean
          created_at: Date
          updated_at: Date
        }
        Insert: {
          id?: string
          email: string
          password_hash: string
          is_admin?: boolean
          created_at?: Date
          updated_at?: Date
        }
        Update: {
          id?: string
          email?: string
          password_hash?: string
          is_admin?: boolean
          updated_at?: Date
        }
      }
      profiles: {
        Row: {
          id: string
          created_at: Date
          updated_at: Date
          full_name: string | null
          avatar_url: string | null
          bio: string | null
          location: string | null
          website: string | null
          expertise_level: string | null
          social_links: Json | null
          phone: string | null
        }
        Insert: {
          id: string
          created_at?: Date
          updated_at?: Date
          full_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          location?: string | null
          website?: string | null
          expertise_level?: string | null
          social_links?: Json | null
          phone?: string | null
        }
        Update: {
          id?: string
          created_at?: Date
          updated_at?: Date
          full_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          location?: string | null
          website?: string | null
          expertise_level?: string | null
          social_links?: Json | null
          phone?: string | null
        }
      }
      user_preferences: {
        Row: {
          id: string
          created_at: Date
          updated_at: Date
          theme: string
          color_scheme: string
          background_intensity: string
          ui_density: string
          date_format: string
          time_format: string
          measurement_unit: string
          currency: string
          notification_preferences: Json
          display_preferences: Json
        }
        Insert: {
          id: string
          created_at?: Date
          updated_at?: Date
          theme?: string
          color_scheme?: string
          background_intensity?: string
          ui_density?: string
          date_format?: string
          time_format?: string
          measurement_unit?: string
          currency?: string
          notification_preferences?: Json
          display_preferences?: Json
        }
        Update: {
          id?: string
          created_at?: Date
          updated_at?: Date
          theme?: string
          color_scheme?: string
          background_intensity?: string
          ui_density?: string
          date_format?: string
          time_format?: string
          measurement_unit?: string
          currency?: string
          notification_preferences?: Json
          display_preferences?: Json
        }
      }
      vehicle_projects: {
        Row: {
          id: string
          created_at: Date
          updated_at: Date
          title: string
          description: string | null
          make: string
          model: string
          year: number | null
          vin: string | null
          project_type: string | null
          start_date: Date | null
          end_date: Date | null
          budget: number | null
          status: string
          user_id: string
          thumbnail_url: string | null
        }
        Insert: {
          id?: string
          created_at?: Date
          updated_at?: Date
          title: string
          description?: string | null
          make: string
          model: string
          year?: number | null
          vin?: string | null
          project_type?: string | null
          start_date?: Date | null
          end_date?: Date | null
          budget?: number | null
          status?: string
          user_id: string
          thumbnail_url?: string | null
        }
        Update: {
          id?: string
          created_at?: Date
          updated_at?: Date
          title?: string
          description?: string | null
          make?: string
          model?: string
          year?: number | null
          vin?: string | null
          project_type?: string | null
          start_date?: Date | null
          end_date?: Date | null
          budget?: number | null
          status?: string
          user_id?: string
          thumbnail_url?: string | null
        }
      }
      project_tasks: {
        Row: {
          id: string
          created_at: Date
          updated_at: Date
          title: string
          description: string | null
          status: string
          due_date: Date | null
          project_id: string
          completed_at: Date | null
        }
        Insert: {
          id?: string
          created_at?: Date
          updated_at?: Date
          title: string
          description?: string | null
          status?: string
          due_date?: Date | null
          project_id: string
          completed_at?: Date | null
        }
        Update: {
          id?: string
          created_at?: Date
          updated_at?: Date
          title?: string
          description?: string | null
          status?: string
          due_date?: Date | null
          project_id?: string
          completed_at?: Date | null
        }
      }
      vendors: {
        Row: {
          id: string
          created_at: Date
          updated_at: Date
          name: string
          website: string | null
          notes: string | null
          user_id: string
        }
        Insert: {
          id?: string
          created_at?: Date
          updated_at?: Date
          name: string
          website?: string | null
          notes?: string | null
          user_id: string
        }
        Update: {
          id?: string
          created_at?: Date
          updated_at?: Date
          name?: string
          website?: string | null
          notes?: string | null
          user_id?: string
        }
      }
      project_parts: {
        Row: {
          id: string
          created_at: Date
          updated_at: Date
          name: string
          description: string | null
          part_number: string | null
          price: number | null
          quantity: number
          status: string
          condition: string | null
          location: string | null
          project_id: string
          vendor_id: string | null
          purchase_date: Date | null
          purchase_url: string | null
          image_url: string | null
          notes: string | null
        }
        Insert: {
          id?: string
          created_at?: Date
          updated_at?: Date
          name: string
          description?: string | null
          part_number?: string | null
          price?: number | null
          quantity?: number
          status?: string
          condition?: string | null
          location?: string | null
          project_id: string
          vendor_id?: string | null
          purchase_date?: Date | null
          purchase_url?: string | null
          image_url?: string | null
          notes?: string | null
        }
        Update: {
          id?: string
          created_at?: Date
          updated_at?: Date
          name?: string
          description?: string | null
          part_number?: string | null
          price?: number | null
          quantity?: number
          status?: string
          condition?: string | null
          location?: string | null
          project_id?: string
          vendor_id?: string | null
          purchase_date?: Date | null
          purchase_url?: string | null
          image_url?: string | null
          notes?: string | null
        }
      }
      sessions: {
        Row: {
          id: string
          user_id: string
          expires_at: Date
          created_at: Date
          updated_at: Date
          refresh_token: string | null
        }
        Insert: {
          id?: string
          user_id: string
          expires_at: Date
          created_at?: Date
          updated_at?: Date
          refresh_token?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          expires_at?: Date
          updated_at?: Date
          refresh_token?: string | null
        }
      }
    }
    // Additional database entities can be added as needed
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// Auth-related types
export interface AuthUser {
  id: string;
  email: string;
  isAdmin?: boolean;
}

export interface AuthSession {
  id: string;
  userId: string;
  expiresAt: Date;
}
