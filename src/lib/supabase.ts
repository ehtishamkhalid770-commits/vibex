import { createClient } from '@supabase/supabase-js';
import { Product, Order } from '../types';

const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export const SQL_SCHEMA_SETUP = `-- VIBEX STREETWEAR DATABASE SETUP SCHEMA
-- Copy and paste this script into your Supabase SQL Editor and click "Run".

-- 1. Create Products Table
CREATE TABLE IF NOT EXISTS vibex_products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  price NUMERIC NOT NULL,
  category TEXT NOT NULL,
  gender TEXT NOT NULL,
  image TEXT NOT NULL,
  "desc" TEXT,
  rating NUMERIC DEFAULT 5.0,
  reviews INTEGER DEFAULT 1,
  sizes TEXT[] DEFAULT ARRAY['M', 'L', 'XL'],
  colors JSONB DEFAULT '[]'::jsonb,
  "isNew" BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create Orders Table
CREATE TABLE IF NOT EXISTS vibex_orders (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  status TEXT NOT NULL,
  "buyerName" TEXT NOT NULL,
  "buyerEmail" TEXT NOT NULL,
  "buyerPhone" TEXT NOT NULL,
  "buyerAddress" TEXT NOT NULL,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  subtotal NUMERIC NOT NULL,
  shipping NUMERIC NOT NULL,
  discount NUMERIC NOT NULL,
  total NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create Users Table
CREATE TABLE IF NOT EXISTS vibex_users (
  email TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  password TEXT NOT NULL,
  points INTEGER DEFAULT 200,
  "isAdmin" BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS) & Policies to allow operations from our React Applet
ALTER TABLE vibex_products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow All" ON vibex_products;
CREATE POLICY "Allow All" ON vibex_products FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE vibex_orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow All Orders" ON vibex_orders;
CREATE POLICY "Allow All Orders" ON vibex_orders FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE vibex_users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow All Users" ON vibex_users;
CREATE POLICY "Allow All Users" ON vibex_users FOR ALL USING (true) WITH CHECK (true);
`;

// Helper to test if tables exist and connection works
export async function testConnection(): Promise<{ success: boolean; hasTables?: boolean; message: string }> {
  if (!isSupabaseConfigured || !supabase) {
    return { success: false, message: 'Supabase keys are not set up in Settings -> Secrets.' };
  }
  try {
    const { error } = await supabase.from('vibex_products').select('id').limit(1);
    if (error) {
      if (error.code === '42P01') {
        return { 
          success: true, 
          hasTables: false, 
          message: 'Connected to Supabase! Click the button below to display the SQL Setup script to create your tables.' 
        };
      }
      return { success: false, message: `Connection error: ${error.message}` };
    }
    return { success: true, hasTables: true, message: 'Database connected! Fully synchronized with Supabase.' };
  } catch (err: any) {
    return { success: false, message: err?.message || 'Network error trying to connect to Supabase.' };
  }
}

// 1. Fetch products from Supabase
export async function dbGetProducts(): Promise<Product[] | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('vibex_products')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) {
    console.error('Supabase get products error:', error);
    return null;
  }
  return data as Product[];
}

// 2. Save products to Supabase (upsert multiple or insert)
export async function dbUpsertProduct(p: Product): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase
    .from('vibex_products')
    .upsert({
      id: p.id,
      name: p.name,
      price: p.price,
      category: p.category,
      gender: p.gender,
      image: p.image,
      desc: p.desc,
      rating: p.rating || 5.0,
      reviews: p.reviews || 1,
      sizes: p.sizes,
      colors: p.colors,
      isNew: p.isNew
    });
  if (error) {
    console.error('Supabase upsert product error:', error);
    return false;
  }
  return true;
}

// 3. Delete product from Supabase
export async function dbDeleteProduct(id: string): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase
    .from('vibex_products')
    .delete()
    .eq('id', id);
  if (error) {
    console.error('Supabase delete product error:', error);
    return false;
  }
  return true;
}

// 4. Fetch orders from Supabase
export async function dbGetOrders(): Promise<Order[] | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('vibex_orders')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) {
    console.error('Supabase get orders error:', error);
    return null;
  }
  return data as Order[];
}

// 5. Save order (upsert or insert)
export async function dbUpsertOrder(o: Order): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase
    .from('vibex_orders')
    .upsert({
      id: o.id,
      date: o.date,
      status: o.status,
      buyerName: o.buyerName,
      buyerEmail: o.buyerEmail,
      buyerPhone: o.buyerPhone,
      buyerAddress: o.buyerAddress,
      items: o.items,
      subtotal: o.subtotal,
      shipping: o.shipping,
      discount: o.discount,
      total: o.total
    });
  if (error) {
    console.error('Supabase upsert order error:', error);
    return false;
  }
  return true;
}

// 6. Delete order
export async function dbDeleteOrder(orderId: string): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase
    .from('vibex_orders')
    .delete()
    .eq('id', orderId);
  if (error) {
    console.error('Supabase delete order error:', error);
    return false;
  }
  return true;
}

// 7. Get users
export async function dbGetUsers(): Promise<any[] | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('vibex_users')
    .select('*');
  if (error) {
    console.error('Supabase get users error:', error);
    return null;
  }
  return data;
}

// 8. Upsert user
export async function dbUpsertUser(user: { email: string; name: string; password?: string; points: number; isAdmin?: boolean }): Promise<boolean> {
  if (!supabase) return false;
  const payload: any = {
    email: user.email.toLowerCase(),
    name: user.name,
    points: user.points,
    isAdmin: !!user.isAdmin
  };
  if (user.password !== undefined) {
    payload.password = user.password;
  }
  const { error } = await supabase
    .from('vibex_users')
    .upsert(payload);
  if (error) {
    console.error('Supabase upsert user error:', error);
    return false;
  }
  return true;
}
