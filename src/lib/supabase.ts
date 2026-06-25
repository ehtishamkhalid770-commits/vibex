import { createClient } from '@supabase/supabase-js';
import { Product, Order } from '../types';

const supabaseUrl = 
  (import.meta as any).env?.VITE_SUPABASE_URL || 
  (typeof process !== 'undefined' ? process.env.VITE_SUPABASE_URL : '') || 
  '';
const supabaseAnonKey = 
  (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || 
  (typeof process !== 'undefined' ? process.env.VITE_SUPABASE_ANON_KEY : '') || 
  '';

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

// 1. Fetch products from Supabase with dynamic case normalization and safe data types
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
  if (!data) return [];
  
  return data.map((item: any) => ({
    id: item.id,
    name: item.name,
    price: Number(item.price),
    category: item.category,
    gender: item.gender,
    image: item.image,
    rating: item.rating !== undefined ? Number(item.rating) : 5.0,
    desc: item.desc !== undefined ? item.desc : (item.description || ''),
    reviews: item.reviews !== undefined ? Number(item.reviews) : 1,
    sizes: item.sizes || ['M', 'L', 'XL'],
    colors: item.colors || [],
    isNew: item.isNew !== undefined ? !!item.isNew : (item.isnew !== undefined ? !!item.isnew : true)
  })) as Product[];
}

// 2. Save products to Supabase (upsert multiple or insert)
export async function dbUpsertProduct(p: Product): Promise<{ success: boolean; error?: any }> {
  if (!supabase) return { success: false, error: 'Supabase is not configured.' };
  try {
    let payload: any = {
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
    };

    let attempts = 0;
    const maxAttempts = 12;

    while (attempts < maxAttempts) {
      const { error } = await supabase
        .from('vibex_products')
        .upsert(payload);

      if (!error) {
        return { success: true };
      }

      console.warn(`Product upsert attempt ${attempts + 1} failed:`, error);

      // Fast-path: if primary attempt failed, convert all keys to lowercase for lowercase-column tables
      if (attempts === 0) {
        console.warn('Primary product upsert failed. Retrying with all keys lowercase...');
        const lowercasePayload: any = {};
        for (const key of Object.keys(payload)) {
          lowercasePayload[key.toLowerCase()] = payload[key];
        }
        payload = lowercasePayload;
        attempts++;
        continue;
      }

      if (error.code === '42703' || (error.message && error.message.toLowerCase().includes('does not exist'))) {
        const missingCol = extractMissingColumn(error.message);
        if (missingCol) {
          const lowerCol = missingCol.toLowerCase();
          if (missingCol !== lowerCol && payload[missingCol] !== undefined) {
            console.warn(`Column "${missingCol}" does not exist. Retrying with lowercase version "${lowerCol}"...`);
            payload[lowerCol] = payload[missingCol];
            delete payload[missingCol];
          } else {
            console.warn(`Removing missing column "${missingCol}" from product payload and retrying...`);
            delete payload[missingCol];
            for (const key of Object.keys(payload)) {
              if (key.toLowerCase() === lowerCol) {
                delete payload[key];
              }
            }
          }
          attempts++;
          continue;
        }
      }

      return { success: false, error };
    }

    return { success: false, error: 'Max product upsert retry attempts reached' };
  } catch (err: any) {
    console.error('Supabase upsert product exception:', err);
    return { success: false, error: err };
  }
}

// Helper to extract missing column names from postgres error messages (quoted or unquoted)
function extractMissingColumn(message: string): string | null {
  if (!message) return null;
  // Match column "name"
  const matchQuoted = message.match(/column "([^"]+)"/i);
  if (matchQuoted && matchQuoted[1]) {
    return matchQuoted[1];
  }
  // Match column name of relation
  const matchUnquoted = message.match(/column (\w+) of relation/i);
  if (matchUnquoted && matchUnquoted[1]) {
    return matchUnquoted[1];
  }
  return null;
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
  if (!data) return [];
  
  // Normalize column case dynamically (buyername -> buyerName, etc.)
  return data.map((item: any) => ({
    id: item.id,
    date: item.date,
    status: item.status,
    buyerName: item.buyerName !== undefined ? item.buyerName : (item.buyername || ''),
    buyerEmail: item.buyerEmail !== undefined ? item.buyerEmail : (item.buyeremail || ''),
    buyerPhone: item.buyerPhone !== undefined ? item.buyerPhone : (item.buyerphone || ''),
    buyerAddress: item.buyerAddress !== undefined ? item.buyerAddress : (item.buyeraddress || ''),
    items: item.items || [],
    subtotal: Number(item.subtotal),
    shipping: Number(item.shipping),
    discount: Number(item.discount),
    total: Number(item.total)
  })) as Order[];
}

// 5. Save order (upsert or insert) with dynamic case-fallback and missing-column resilient mapping
export async function dbUpsertOrder(o: Order): Promise<{ success: boolean; error?: any }> {
  if (!supabase) return { success: false, error: 'Supabase is not configured.' };
  try {
    let payload: any = {
      id: o.id,
      date: o.date,
      status: o.status,
      buyerName: o.buyerName,
      buyerEmail: o.buyerEmail,
      buyerPhone: o.buyerPhone,
      buyerAddress: o.buyerAddress,
      items: JSON.parse(JSON.stringify(o.items || [])),
      subtotal: o.subtotal,
      shipping: o.shipping,
      discount: o.discount,
      total: o.total
    };

    let attempts = 0;
    const maxAttempts = 12;

    while (attempts < maxAttempts) {
      console.log(`Attempting upsert order #${o.id} (attempt ${attempts + 1}). Payload keys:`, Object.keys(payload));
      const { error } = await supabase
        .from('vibex_orders')
        .upsert(payload);

      if (!error) {
        console.log(`Successfully upserted order #${o.id}`);
        return { success: true };
      }

      console.warn(`Upsert order attempt ${attempts + 1} failed:`, error);

      // Fast-path: if primary attempt failed, convert all keys to lowercase for lowercase-column tables
      if (attempts === 0) {
        console.warn('Primary order upsert failed. Retrying with all keys lowercase...');
        const lowercasePayload: any = {};
        for (const key of Object.keys(payload)) {
          lowercasePayload[key.toLowerCase()] = payload[key];
        }
        payload = lowercasePayload;
        attempts++;
        continue;
      }

      // Check if it's an undefined column error (42703) or generic "does not exist"
      if (error.code === '42703' || (error.message && error.message.toLowerCase().includes('does not exist'))) {
        const missingCol = extractMissingColumn(error.message);
        if (missingCol) {
          const lowerCol = missingCol.toLowerCase();
          if (missingCol !== lowerCol && payload[missingCol] !== undefined) {
            console.warn(`Column "${missingCol}" does not exist. Retrying with lowercase version "${lowerCol}"...`);
            payload[lowerCol] = payload[missingCol];
            delete payload[missingCol];
          } else {
            console.warn(`Removing missing column "${missingCol}" from order payload and retrying...`);
            delete payload[missingCol];
            for (const key of Object.keys(payload)) {
              if (key.toLowerCase() === lowerCol) {
                delete payload[key];
              }
            }
          }
          attempts++;
          continue;
        }
      }

      return { success: false, error };
    }

    return { success: false, error: 'Max order upsert retry attempts reached' };
  } catch (err: any) {
    console.error('Supabase upsert order exception:', err);
    return { success: false, error: err };
  }
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
  if (!data) return [];
  return data.map((u: any) => ({
    email: u.email,
    name: u.name,
    password: u.password,
    points: u.points,
    isAdmin: u.isAdmin !== undefined ? u.isAdmin : (u.isadmin || false)
  }));
}

// 8. Upsert user with dynamic case-fallback and missing-column resilient mapping
export async function dbUpsertUser(user: { email: string; name: string; password?: string; points: number; isAdmin?: boolean }): Promise<{ success: boolean; error?: any }> {
  if (!supabase) return { success: false, error: 'Supabase is not configured.' };
  try {
    let payload: any = {
      email: user.email.toLowerCase(),
      name: user.name,
      points: user.points,
      isAdmin: !!user.isAdmin
    };
    if (user.password !== undefined) {
      payload.password = user.password;
    }

    let attempts = 0;
    const maxAttempts = 6;

    while (attempts < maxAttempts) {
      const { error } = await supabase
        .from('vibex_users')
        .upsert(payload);

      if (!error) {
        return { success: true };
      }

      console.warn(`Upsert user attempt ${attempts + 1} failed:`, error);

      if (error.code === '42703' || (error.message && error.message.toLowerCase().includes('does not exist'))) {
        const missingCol = extractMissingColumn(error.message);
        if (missingCol) {
          const lowerCol = missingCol.toLowerCase();
          if (missingCol !== lowerCol && payload[missingCol] !== undefined) {
            console.warn(`Column "${missingCol}" does not exist. Retrying with lowercase version "${lowerCol}"...`);
            payload[lowerCol] = payload[missingCol];
            delete payload[missingCol];
          } else {
            console.warn(`Removing missing column "${missingCol}" from user payload and retrying...`);
            delete payload[missingCol];
            for (const key of Object.keys(payload)) {
              if (key.toLowerCase() === lowerCol) {
                delete payload[key];
              }
            }
          }
          attempts++;
          continue;
        }
      }

      return { success: false, error };
    }

    return { success: false, error: 'Max user upsert retry attempts reached' };
  } catch (err: any) {
    console.error('Supabase upsert user exception:', err);
    return { success: false, error: err };
  }
}
