export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
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
}
