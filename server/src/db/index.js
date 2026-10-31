import { createClient } from '@libsql/client';
import { config } from '../config/env.js';

export const db = createClient({
  url: config.DB_URL,
});

export async function initDatabase() {
  // Create users table
  await db.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('farmer', 'buyer', 'admin')),
      phone TEXT,
      location TEXT,
      farm_name TEXT,
      bio TEXT,
      avatar_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Create products table
  await db.execute(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      farmer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      description TEXT,
      unit TEXT NOT NULL,
      price REAL NOT NULL,
      available_quantity REAL NOT NULL,
      initial_quantity REAL NOT NULL,
      harvest_date TEXT NOT NULL,
      pickup_available INTEGER DEFAULT 1,
      delivery_available INTEGER DEFAULT 1,
      image_url TEXT,
      organic_certified INTEGER DEFAULT 0,
      batch_number TEXT,
      status TEXT DEFAULT 'active' CHECK(status IN ('active', 'flagged', 'removed')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Create orders table
  await db.execute(`
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_number TEXT UNIQUE NOT NULL,
      buyer_id INTEGER NOT NULL REFERENCES users(id),
      total_amount REAL NOT NULL,
      delivery_option TEXT NOT NULL CHECK(delivery_option IN ('pickup', 'delivery')),
      delivery_address TEXT,
      payment_method TEXT NOT NULL CHECK(payment_method IN ('cash_on_pickup', 'cash_on_delivery', 'simulated_escrow')),
      payment_status TEXT DEFAULT 'pending' CHECK(payment_status IN ('pending', 'completed')),
      status TEXT DEFAULT 'requested' CHECK(status IN ('requested', 'accepted', 'ready', 'completed', 'cancelled')),
      cancellation_reason TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Create order_items table
  await db.execute(`
    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      product_id INTEGER NOT NULL REFERENCES products(id),
      farmer_id INTEGER NOT NULL REFERENCES users(id),
      product_name TEXT NOT NULL,
      unit_price REAL NOT NULL,
      unit TEXT NOT NULL,
      quantity REAL NOT NULL,
      subtotal REAL NOT NULL
    );
  `);

  // Create moderation_logs table
  await db.execute(`
    CREATE TABLE IF NOT EXISTS moderation_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      admin_id INTEGER NOT NULL REFERENCES users(id),
      action TEXT NOT NULL,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Create indexes for fast search and relations
  await db.execute(`CREATE INDEX IF NOT EXISTS idx_products_farmer ON products(farmer_id);`);
  await db.execute(`CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);`);
  await db.execute(`CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);`);
  await db.execute(`CREATE INDEX IF NOT EXISTS idx_orders_buyer ON orders(buyer_id);`);
  await db.execute(`CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);`);
  await db.execute(`CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);`);
  await db.execute(`CREATE INDEX IF NOT EXISTS idx_order_items_farmer ON order_items(farmer_id);`);
}

