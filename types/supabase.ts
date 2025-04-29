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
        }
        Insert: {
          id: string
          created_at?: string
          updated_at?: string
          full_name?: string | null
          avatar_url?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          full_name?: string | null
          avatar_url?: string | null
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
      project_parts: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          name: string
          description: string | null
          price: number | null
          quantity: number
          status: string
          project_id: string
          purchase_date: string | null
          purchase_url: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          name: string
          description?: string | null
          price?: number | null
          quantity?: number
          status?: string
          project_id: string
          purchase_date?: string | null
          purchase_url?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          name?: string
          description?: string | null
          price?: number | null
          quantity?: number
          status?: string
          project_id?: string
          purchase_date?: string | null
          purchase_url?: string | null
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
