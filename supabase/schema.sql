-- TravelCart Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (supplements Supabase Auth)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  notification_preferences JSONB DEFAULT '{"push": true, "email": true, "quietHours": null}'::jsonb
);

-- Cart items (flights, hotels, cars being watched)
CREATE TABLE IF NOT EXISTS cart_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Trip details
  type TEXT NOT NULL CHECK (type IN ('flight', 'hotel', 'car')),
  origin TEXT NOT NULL,
  destination TEXT NOT NULL,
  departure_date DATE NOT NULL,
  return_date DATE,
  travelers INTEGER DEFAULT 1,
  flexible_dates BOOLEAN DEFAULT FALSE,
  
  -- Pricing
  target_price DECIMAL(10,2) NOT NULL,
  baseline_price DECIMAL(10,2) NOT NULL,
  current_price DECIMAL(10,2) NOT NULL,
  
  -- AI Signal
  signal TEXT NOT NULL DEFAULT 'WAIT' CHECK (signal IN ('BUY', 'WAIT', 'HOLD')),
  signal_reason TEXT,
  confidence TEXT DEFAULT 'low' CHECK (confidence IN ('high', 'medium', 'low')),
  expected_price DECIMAL(10,2),
  optimal_book_window TEXT,
  fallback_date DATE,
  
  -- Hold feature
  hold_active BOOLEAN DEFAULT FALSE,
  hold_price DECIMAL(10,2),
  hold_fee DECIMAL(10,2),
  hold_expires DATE,
  
  -- Calendar
  calendar_added BOOLEAN DEFAULT FALSE,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_checked TIMESTAMPTZ DEFAULT NOW(),
  
  -- Raw flight data from Amadeus
  flight_data JSONB
);

-- Price history (for trend analysis)
CREATE TABLE IF NOT EXISTS price_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cart_item_id UUID NOT NULL REFERENCES cart_items(id) ON DELETE CASCADE,
  price DECIMAL(10,2) NOT NULL,
  recorded_at TIMESTAMPTZ DEFAULT NOW(),
  seats_available INTEGER
);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  cart_item_id UUID NOT NULL REFERENCES cart_items(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('target_hit', 'price_drop', 'spike_warning', 'sweet_spot', 'fallback', 'low_seats')),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  urgency TEXT DEFAULT 'medium' CHECK (urgency IN ('high', 'medium', 'low')),
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_departure_date ON cart_items(departure_date);
CREATE INDEX IF NOT EXISTS idx_price_history_cart_item_id ON price_history(cart_item_id);
CREATE INDEX IF NOT EXISTS idx_price_history_recorded_at ON price_history(recorded_at);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);

-- Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can only see their own data
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Cart items policies
CREATE POLICY "Users can view own cart items" ON cart_items
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own cart items" ON cart_items
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cart items" ON cart_items
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own cart items" ON cart_items
  FOR DELETE USING (auth.uid() = user_id);

-- Price history policies (read-only for users, write via service role)
CREATE POLICY "Users can view price history for own items" ON price_history
  FOR SELECT USING (
    cart_item_id IN (SELECT id FROM cart_items WHERE user_id = auth.uid())
  );

-- Notifications policies
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- Functions
-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_cart_items_updated_at
  BEFORE UPDATE ON cart_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert demo user for testing (remove in production)
INSERT INTO users (id, email) 
VALUES ('00000000-0000-0000-0000-000000000001', 'demo@travelcart.app')
ON CONFLICT (id) DO NOTHING;
