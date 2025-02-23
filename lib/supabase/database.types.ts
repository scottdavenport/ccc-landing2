export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  api: {
    Tables: {
      sponsors: {
        Row: {
          id: string
          name: string
          level: string | null
          year: number
          cloudinary_public_id: string | null
          image_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          level?: string | null
          year: number
          cloudinary_public_id?: string | null
          image_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          level?: string | null
          year?: number
          cloudinary_public_id?: string | null
          image_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      sponsor_levels: {
        Row: {
          id: string
          name: string
          // Add other columns as needed
        }
        Insert: {
          id?: string
          name: string
        }
        Update: {
          id?: string
          name?: string
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
