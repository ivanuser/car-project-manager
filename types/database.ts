/**
 * database-types.ts - PostgreSQL database type definitions
 * For Caj-pro car project build tracking application
 * Created on: May 17, 2025
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface DatabaseSchema {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          created_at: string
          updated_at: string
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
          created_at?: string
          updated_at?: string
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
          created_at?: string
          updated_at?: string
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
          created_at: string
          updated_at: string
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
          created_at?: string
          updated_at?: string
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
          created_at?: string
          updated_at?: string
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
          created_at: string
          updated_at: string
          title: string
          description: string | null
          make: string
          model: string
          year: number | null
          vin: string | null
          project_type: string | null
          start_date: string | null
          end_date: string | null
          budget: number | null
          status: string
          user_id: string
          thumbnail_url: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          title: string
          description?: string | null
          make: string
          model: string
          year?: number | null
          vin?: string | null
          project_type?: string | null
          start_date?: string | null
          end_date?: string | null
          budget?: number | null
          status?: string
          user_id: string
          thumbnail_url?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          title?: string
          description?: string | null
          make?: string
          model?: string
          year?: number | null
          vin?: string | null
          project_type?: string | null
          start_date?: string | null
          end_date?: string | null
          budget?: number | null
          status?: string
          user_id?: string
          thumbnail_url?: string | null
        }
      }
      project_tasks: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          title: string
          description: string | null
          status: string
          due_date: string | null
          project_id: string
          completed_at: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          title: string
          description?: string | null
          status?: string
          due_date?: string | null
          project_id: string
          completed_at?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          title?: string
          description?: string | null
          status?: string
          due_date?: string | null
          project_id?: string
          completed_at?: string | null
        }
      }
      vendors: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          name: string
          website: string | null
          notes: string | null
          user_id: string
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          name: string
          website?: string | null
          notes?: string | null
          user_id: string
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          name?: string
          website?: string | null
          notes?: string | null
          user_id?: string
        }
      }
      project_parts: {
        Row: {
          id: string
          created_at: string
          updated_at: string
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
          purchase_date: string | null
          purchase_url: string | null
          image_url: string | null
          notes: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
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
          purchase_date?: string | null
          purchase_url?: string | null
          image_url?: string | null
          notes?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
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
          purchase_date?: string | null
          purchase_url?: string | null
          image_url?: string | null
          notes?: string | null
        }
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
  }
  auth: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          password_hash: string
          salt: string
          created_at: string
          updated_at: string
          email_confirmed_at: string | null
          last_sign_in_at: string | null
          is_admin: boolean
          is_active: boolean
        }
        Insert: {
          id?: string
          email: string
          password_hash: string
          salt: string
          created_at?: string
          updated_at?: string
          email_confirmed_at?: string | null
          last_sign_in_at?: string | null
          is_admin?: boolean
          is_active?: boolean
        }
        Update: {
          id?: string
          email?: string
          password_hash?: string
          salt?: string
          created_at?: string
          updated_at?: string
          email_confirmed_at?: string | null
          last_sign_in_at?: string | null
          is_admin?: boolean
          is_active?: boolean
        }
      }
      sessions: {
        Row: {
          id: string
          user_id: string
          token: string
          created_at: string
          expires_at: string
          ip_address: string | null
          user_agent: string | null
        }
        Insert: {
          id?: string
          user_id: string
          token: string
          created_at?: string
          expires_at: string
          ip_address?: string | null
          user_agent?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          token?: string
          created_at?: string
          expires_at?: string
          ip_address?: string | null
          user_agent?: string | null
        }
      }
    }
  }
}

// Export common types
export type Profile = DatabaseSchema['public']['Tables']['profiles']['Row']
export type ProfileInsert = DatabaseSchema['public']['Tables']['profiles']['Insert']
export type ProfileUpdate = DatabaseSchema['public']['Tables']['profiles']['Update']

export type UserPreferences = DatabaseSchema['public']['Tables']['user_preferences']['Row']
export type UserPreferencesInsert = DatabaseSchema['public']['Tables']['user_preferences']['Insert']
export type UserPreferencesUpdate = DatabaseSchema['public']['Tables']['user_preferences']['Update']

export type VehicleProject = DatabaseSchema['public']['Tables']['vehicle_projects']['Row']
export type VehicleProjectInsert = DatabaseSchema['public']['Tables']['vehicle_projects']['Insert']
export type VehicleProjectUpdate = DatabaseSchema['public']['Tables']['vehicle_projects']['Update']

export type ProjectTask = DatabaseSchema['public']['Tables']['project_tasks']['Row']
export type ProjectTaskInsert = DatabaseSchema['public']['Tables']['project_tasks']['Insert']
export type ProjectTaskUpdate = DatabaseSchema['public']['Tables']['project_tasks']['Update']

export type Vendor = DatabaseSchema['public']['Tables']['vendors']['Row']
export type VendorInsert = DatabaseSchema['public']['Tables']['vendors']['Insert']
export type VendorUpdate = DatabaseSchema['public']['Tables']['vendors']['Update']

export type ProjectPart = DatabaseSchema['public']['Tables']['project_parts']['Row']
export type ProjectPartInsert = DatabaseSchema['public']['Tables']['project_parts']['Insert']
export type ProjectPartUpdate = DatabaseSchema['public']['Tables']['project_parts']['Update']

export type User = DatabaseSchema['auth']['Tables']['users']['Row']
export type UserInsert = DatabaseSchema['auth']['Tables']['users']['Insert']
export type UserUpdate = DatabaseSchema['auth']['Tables']['users']['Update']

export type Session = DatabaseSchema['auth']['Tables']['sessions']['Row']
export type SessionInsert = DatabaseSchema['auth']['Tables']['sessions']['Insert']
export type SessionUpdate = DatabaseSchema['auth']['Tables']['sessions']['Update']
