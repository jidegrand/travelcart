export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          created_at: string
          notification_preferences: Json | null
        }
        Insert: {
          id?: string
          email: string
          created_at?: string
          notification_preferences?: Json | null
        }
        Update: {
          id?: string
          email?: string
          created_at?: string
          notification_preferences?: Json | null
        }
      }
      cart_items: {
        Row: {
          id: string
          user_id: string
          type: 'flight' | 'hotel' | 'car'
          origin: string
          destination: string
          departure_date: string
          return_date: string | null
          travelers: number
          flexible_dates: boolean
          target_price: number
          baseline_price: number
          current_price: number
          signal: 'BUY' | 'WAIT' | 'HOLD'
          signal_reason: string | null
          confidence: 'high' | 'medium' | 'low'
          expected_price: number | null
          optimal_book_window: string | null
          fallback_date: string | null
          hold_active: boolean
          hold_price: number | null
          hold_fee: number | null
          hold_expires: string | null
          calendar_added: boolean
          created_at: string
          updated_at: string
          last_checked: string
          flight_data: Json | null
        }
        Insert: {
          id?: string
          user_id: string
          type: 'flight' | 'hotel' | 'car'
          origin: string
          destination: string
          departure_date: string
          return_date?: string | null
          travelers?: number
          flexible_dates?: boolean
          target_price: number
          baseline_price: number
          current_price: number
          signal?: 'BUY' | 'WAIT' | 'HOLD'
          signal_reason?: string | null
          confidence?: 'high' | 'medium' | 'low'
          expected_price?: number | null
          optimal_book_window?: string | null
          fallback_date?: string | null
          hold_active?: boolean
          hold_price?: number | null
          hold_fee?: number | null
          hold_expires?: string | null
          calendar_added?: boolean
          created_at?: string
          updated_at?: string
          last_checked?: string
          flight_data?: Json | null
        }
        Update: {
          id?: string
          user_id?: string
          type?: 'flight' | 'hotel' | 'car'
          origin?: string
          destination?: string
          departure_date?: string
          return_date?: string | null
          travelers?: number
          flexible_dates?: boolean
          target_price?: number
          baseline_price?: number
          current_price?: number
          signal?: 'BUY' | 'WAIT' | 'HOLD'
          signal_reason?: string | null
          confidence?: 'high' | 'medium' | 'low'
          expected_price?: number | null
          optimal_book_window?: string | null
          fallback_date?: string | null
          hold_active?: boolean
          hold_price?: number | null
          hold_fee?: number | null
          hold_expires?: string | null
          calendar_added?: boolean
          created_at?: string
          updated_at?: string
          last_checked?: string
          flight_data?: Json | null
        }
      }
      price_history: {
        Row: {
          id: string
          cart_item_id: string
          price: number
          recorded_at: string
          seats_available: number | null
        }
        Insert: {
          id?: string
          cart_item_id: string
          price: number
          recorded_at?: string
          seats_available?: number | null
        }
        Update: {
          id?: string
          cart_item_id?: string
          price?: number
          recorded_at?: string
          seats_available?: number | null
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          cart_item_id: string
          type: 'target_hit' | 'price_drop' | 'spike_warning' | 'sweet_spot' | 'fallback' | 'low_seats'
          title: string
          body: string
          urgency: 'high' | 'medium' | 'low'
          read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          cart_item_id: string
          type: 'target_hit' | 'price_drop' | 'spike_warning' | 'sweet_spot' | 'fallback' | 'low_seats'
          title: string
          body: string
          urgency?: 'high' | 'medium' | 'low'
          read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          cart_item_id?: string
          type?: 'target_hit' | 'price_drop' | 'spike_warning' | 'sweet_spot' | 'fallback' | 'low_seats'
          title?: string
          body?: string
          urgency?: 'high' | 'medium' | 'low'
          read?: boolean
          created_at?: string
        }
      }
    }
  }
}

// Convenience types
export type CartItem = Database['public']['Tables']['cart_items']['Row'];
export type CartItemInsert = Database['public']['Tables']['cart_items']['Insert'];
export type CartItemUpdate = Database['public']['Tables']['cart_items']['Update'];

export type PriceHistory = Database['public']['Tables']['price_history']['Row'];
export type Notification = Database['public']['Tables']['notifications']['Row'];
