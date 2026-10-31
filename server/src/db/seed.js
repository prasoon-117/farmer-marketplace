import bcrypt from 'bcryptjs';
import { db, initDatabase } from './index.js';

export async function seedDatabase() {
  console.log('--- Initializing database schema ---');
  await initDatabase();

  // Clear existing data for fresh seed
  await db.execute('DELETE FROM moderation_logs;');
  await db.execute('DELETE FROM order_items;');
  await db.execute('DELETE FROM orders;');
  await db.execute('DELETE FROM products;');
  await db.execute('DELETE FROM users;');

  console.log('--- Seeding Users (Farmers, Buyers, Admin) ---');
  const salt = await bcrypt.genSalt(10);
  const defaultPasswordHash = await bcrypt.hash('FarmerMarket123!', salt);
  const adminPasswordHash = await bcrypt.hash('AdminSecure2026!', salt);

  // 1. Admin
  await db.execute({
    sql: `INSERT INTO users (name, email, password_hash, role, phone, location, bio, avatar_url)
          VALUES (?, ?, ?, 'admin', ?, ?, ?, ?)`,
    args: [
      'Marketplace Administrator',
      'admin@farmermarket.org',
      adminPasswordHash,
      '+91 98000 00001',
      'National Agri-Hub, New Delhi',
      'Overseeing platform integrity, fair pricing, and farmer verification.',
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    ],
  });

  // 2. Farmers (6 realistic farmer profiles)
  const farmers = [
    {
      name: 'Rajesh Patel',
      email: 'rajesh.patel@farmermarket.org',
      role: 'farmer',
      phone: '+91 98234 11223',
      location: 'Nashik, Maharashtra',
      farm_name: 'Green Valley Organic Farm',
      bio: 'Third-generation progressive farmer specializing in pesticide-free onions, vine tomatoes, and export-grade table grapes.',
      avatar_url: 'https://images.unsplash.com/photo-1595273670150-bd0c3c392e46?w=150&auto=format&fit=crop&q=80',
    },
    {
      name: 'Gurpreet Singh',
      email: 'gurpreet.singh@farmermarket.org',
      role: 'farmer',
      phone: '+91 98140 33445',
      location: 'Ludhiana, Punjab',
      farm_name: 'Punjab Golden Harvests',
      bio: 'Cultivating heritage traditional Basmati paddy and naturally dried durum wheat grains with canal irrigation.',
      avatar_url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=150&auto=format&fit=crop&q=80',
    },
    {
      name: 'Ananya Sundaram',
      email: 'ananya.sundaram@farmermarket.org',
      role: 'farmer',
      phone: '+91 94432 55667',
      location: 'Madurai, Tamil Nadu',
      farm_name: 'Deccan Heritage Spices & Millets',
      bio: 'Women-led collective preserving indigenous drought-resistant millets, golden turmeric root, and sun-dried whole spices.',
      avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    },
    {
      name: 'Devendra Sharma',
      email: 'devendra.sharma@farmermarket.org',
      role: 'farmer',
      phone: '+91 98160 77889',
      location: 'Shimla, Himachal Pradesh',
      farm_name: 'Himalayan Orchard Groves',
      bio: 'High-altitude organic apple orchards and raw forest multi-flora honey apiaries in the pristine Sutlej valley.',
      avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    },
    {
      name: 'Sunita Yadav',
      email: 'sunita.yadav@farmermarket.org',
      role: 'farmer',
      phone: '+91 98250 88990',
      location: 'Anand, Gujarat',
      farm_name: 'Highland Dairy & Natural Agro',
      bio: 'Ethical cruelty-free dairy producing grass-fed A2 Gir cow milk, hand-churned Vedic Bilona Ghee, and pasture-raised eggs.',
      avatar_url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    },
    {
      name: 'Rameshwar Verma',
      email: 'rameshwar.verma@farmermarket.org',
      role: 'farmer',
      phone: '+91 94150 99001',
      location: 'Varanasi, Uttar Pradesh',
      farm_name: 'Ganga Valley Fresh Produce',
      bio: 'Riverbank fertile alluvial soil cultivating seasonal leafy greens, tender cauliflower, and organic baby potatoes.',
      avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    },
  ];

  const farmerIds = [];
  for (const farmer of farmers) {
    const res = await db.execute({
      sql: `INSERT INTO users (name, email, password_hash, role, phone, location, farm_name, bio, avatar_url)
            VALUES (?, ?, ?, 'farmer', ?, ?, ?, ?, ?) RETURNING id`,
      args: [
        farmer.name,
        farmer.email,
        defaultPasswordHash,
        farmer.phone,
        farmer.location,
        farmer.farm_name,
        farmer.bio,
        farmer.avatar_url,
      ],
    });
    farmerIds.push(res.rows[0].id);
  }

  // 3. Buyers (3 realistic buyer accounts: Household, Retailer, Restaurant)
  const buyers = [
    {
      name: 'Priya Sharma',
      email: 'priya.buyer@example.com',
      role: 'buyer',
      phone: '+91 98200 44556',
      location: 'Andheri West, Mumbai, Maharashtra',
      bio: 'Health-conscious home chef ordering weekly farm-fresh vegetables and organic staples for my family.',
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    },
    {
      name: 'Vikram Sethi',
      email: 'vikram.retail@example.com',
      role: 'buyer',
      phone: '+91 98110 55667',
      location: 'Lajpat Nagar, New Delhi',
      bio: 'Owner of "Urban Green Groceries" buying quality produce directly from certified regional farmers.',
      avatar_url: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
    },
    {
      name: 'Chef Marco Rossi',
      email: 'chef.marco@example.com',
      role: 'buyer',
      phone: '+91 98450 66778',
      location: 'Indiranagar, Bangalore, Karnataka',
      bio: 'Executive Chef at Botanica Farm-To-Table Bistro sourcing seasonal fruits, herbs, and A2 dairy.',
      avatar_url: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80',
    },
  ];

  const buyerIds = [];
  for (const buyer of buyers) {
    const res = await db.execute({
      sql: `INSERT INTO users (name, email, password_hash, role, phone, location, bio, avatar_url)
            VALUES (?, ?, ?, 'buyer', ?, ?, ?, ?) RETURNING id`,
      args: [buyer.name, buyer.email, defaultPasswordHash, buyer.phone, buyer.location, buyer.bio, buyer.avatar_url],
    });
    buyerIds.push(res.rows[0].id);
  }

  console.log('--- Seeding Products (18 Sample Products Across All Categories) ---');
  const products = [
    // Farmer 1: Rajesh Patel (farmerIds[0]) - Nashik
    {
      farmer_id: farmerIds[0],
      name: 'Nashik Red Quality Onions',
      category: 'Vegetables',
      description: 'Pungent, firm, sun-cured Nashik red onions with long storage life. Direct from farm drying yards.',
      unit: 'kg',
      price: 32.0,
      available_quantity: 450.0,
      initial_quantity: 500.0,
      harvest_date: '2026-10-24',
      pickup_available: 1,
      delivery_available: 1,
      image_url: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=600&auto=format&fit=crop&q=80',
      organic_certified: 1,
      batch_number: 'NSK-ON-2026-B1',
      status: 'active',
    },
    {
      farmer_id: farmerIds[0],
      name: 'Vine-Ripened Hybrid Tomatoes',
      category: 'Vegetables',
      description: 'Juicy, naturally ripened red tomatoes. Ideal for curries, salads, and puree. Picked at optimal firmness.',
      unit: 'kg',
      price: 28.0,
      available_quantity: 280.0,
      initial_quantity: 350.0,
      harvest_date: '2026-10-29',
      pickup_available: 1,
      delivery_available: 1,
      image_url: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&auto=format&fit=crop&q=80',
      organic_certified: 1,
      batch_number: 'NSK-TM-2026-B2',
      status: 'active',
    },
    {
      farmer_id: farmerIds[0],
      name: 'Thompson Seedless Green Grapes',
      category: 'Fruits',
      description: 'Crisp, sweet, GI-tagged Nashik valley table grapes with thin skin and refreshing burst of natural sugars.',
      unit: 'kg',
      price: 95.0,
      available_quantity: 120.0,
      initial_quantity: 150.0,
      harvest_date: '2026-10-27',
      pickup_available: 1,
      delivery_available: 1,
      image_url: 'https://images.unsplash.com/photo-1537640538966-79f369143f8f?w=600&auto=format&fit=crop&q=80',
      organic_certified: 0,
      batch_number: 'NSK-GRP-2026-C1',
      status: 'active',
    },

    // Farmer 2: Gurpreet Singh (farmerIds[1]) - Ludhiana
    {
      farmer_id: farmerIds[1],
      name: 'Traditional 1121 Aged Basmati Rice',
      category: 'Grains & Cereals',
      description: 'Extra-long grain authentic fragrant Basmati rice, aged for 18 months for non-sticky fluffy cooking.',
      unit: 'kg',
      price: 110.0,
      available_quantity: 800.0,
      initial_quantity: 1000.0,
      harvest_date: '2026-10-15',
      pickup_available: 1,
      delivery_available: 1,
      image_url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&auto=format&fit=crop&q=80',
      organic_certified: 1,
      batch_number: 'LDH-BSM-2026-A1',
      status: 'active',
    },
    {
      farmer_id: farmerIds[1],
      name: 'Sharbati Whole Wheat Grain',
      category: 'Grains & Cereals',
      description: 'Golden, heavy grains naturally harvested. Makes soft rotis rich in fiber and micronutrients.',
      unit: 'quintal',
      price: 2950.0,
      available_quantity: 25.0,
      initial_quantity: 30.0,
      harvest_date: '2026-10-10',
      pickup_available: 1,
      delivery_available: 0,
      image_url: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600&auto=format&fit=crop&q=80',
      organic_certified: 1,
      batch_number: 'LDH-WHT-2026-B1',
      status: 'active',
    },
    {
      farmer_id: farmerIds[1],
      name: 'Winter Mustard Greens (Sarson Ke Saag)',
      category: 'Vegetables',
      description: 'Tender, peppery winter mustard leaves grown with organic farm compost and morning dew.',
      unit: 'bunch',
      price: 20.0,
      available_quantity: 150.0,
      initial_quantity: 200.0,
      harvest_date: '2026-10-30',
      pickup_available: 1,
      delivery_available: 1,
      image_url: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=600&auto=format&fit=crop&q=80',
      organic_certified: 1,
      batch_number: 'LDH-SRS-2026-C2',
      status: 'active',
    },

    // Farmer 3: Ananya Sundaram (farmerIds[2]) - Madurai
    {
      farmer_id: farmerIds[2],
      name: 'Organic Salem Turmeric Root (Raw)',
      category: 'Herbs & Spices',
      description: 'High-curcumin (5.2%) fragrant fresh turmeric fingers. Ideal for traditional cooking, herbal teas, and extraction.',
      unit: 'kg',
      price: 75.0,
      available_quantity: 300.0,
      initial_quantity: 350.0,
      harvest_date: '2026-10-22',
      pickup_available: 1,
      delivery_available: 1,
      image_url: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=600&auto=format&fit=crop&q=80',
      organic_certified: 1,
      batch_number: 'MDU-TRM-2026-D1',
      status: 'active',
    },
    {
      farmer_id: farmerIds[2],
      name: 'Heritage Foxtail Millet (Kangni)',
      category: 'Grains & Cereals',
      description: 'Gluten-free, diabetic-friendly ancient unpolished foxtail millet. High fiber and low glycemic index.',
      unit: 'kg',
      price: 85.0,
      available_quantity: 400.0,
      initial_quantity: 450.0,
      harvest_date: '2026-10-18',
      pickup_available: 1,
      delivery_available: 1,
      image_url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&auto=format&fit=crop&q=80',
      organic_certified: 1,
      batch_number: 'MDU-MLT-2026-E1',
      status: 'active',
    },
    {
      farmer_id: farmerIds[2],
      name: 'Sun-Dried Malabar Black Peppercorns',
      category: 'Herbs & Spices',
      description: 'Bold, pungent black pepper harvested from bio-diverse shade-grown agroforestry vines.',
      unit: 'kg',
      price: 520.0,
      available_quantity: 85.0,
      initial_quantity: 100.0,
      harvest_date: '2026-10-12',
      pickup_available: 1,
      delivery_available: 1,
      image_url: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=600&auto=format&fit=crop&q=80',
      organic_certified: 1,
      batch_number: 'MDU-PEP-2026-F1',
      status: 'active',
    },

    // Farmer 4: Devendra Sharma (farmerIds[3]) - Shimla
    {
      farmer_id: farmerIds[3],
      name: 'Shimla Royal Delicious Organic Apples',
      category: 'Fruits',
      description: 'Crisp mountain apples with a sweet aromatic crunch. Hand-plucked at 7,500 feet elevation.',
      unit: 'crate',
      price: 1850.0,
      available_quantity: 45.0,
      initial_quantity: 50.0,
      harvest_date: '2026-10-25',
      pickup_available: 1,
      delivery_available: 1,
      image_url: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=600&auto=format&fit=crop&q=80',
      organic_certified: 1,
      batch_number: 'SML-APL-2026-G1',
      status: 'active',
    },
    {
      farmer_id: farmerIds[3],
      name: 'Raw Himalayan Wild Forest Honey',
      category: 'Organic Produce',
      description: 'Unprocessed, unfiltered multi-flora raw honey extracted ethically from mountain blossom bee apiaries.',
      unit: 'litre',
      price: 650.0,
      available_quantity: 60.0,
      initial_quantity: 75.0,
      harvest_date: '2026-10-20',
      pickup_available: 1,
      delivery_available: 1,
      image_url: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=600&auto=format&fit=crop&q=80',
      organic_certified: 1,
      batch_number: 'SML-HNY-2026-H1',
      status: 'active',
    },
    {
      farmer_id: farmerIds[3],
      name: 'Fresh Mountain Walnuts (Soft Shell)',
      category: 'Fruits',
      description: 'Kashmiri variety light-amber walnut kernels with natural buttery richness and high Omega-3 fats.',
      unit: 'kg',
      price: 780.0,
      available_quantity: 40.0,
      initial_quantity: 50.0,
      harvest_date: '2026-10-14',
      pickup_available: 1,
      delivery_available: 1,
      image_url: 'https://images.unsplash.com/photo-1557053910-d9eadeed1c58?w=600&auto=format&fit=crop&q=80',
      organic_certified: 1,
      batch_number: 'SML-WLN-2026-J1',
      status: 'active',
    },

    // Farmer 5: Sunita Yadav (farmerIds[4]) - Anand
    {
      farmer_id: farmerIds[4],
      name: 'Farm Fresh A2 Desi Gir Cow Milk',
      category: 'Dairy & Eggs',
      description: 'Pure, raw unadulterated whole A2 milk delivered within 3 hours of morning milking.',
      unit: 'litre',
      price: 70.0,
      available_quantity: 90.0,
      initial_quantity: 120.0,
      harvest_date: '2026-10-31',
      pickup_available: 1,
      delivery_available: 1,
      image_url: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=600&auto=format&fit=crop&q=80',
      organic_certified: 1,
      batch_number: 'AND-MLK-2026-K1',
      status: 'active',
    },
    {
      farmer_id: farmerIds[4],
      name: 'Vedic Bilona Pure Desi Cow Ghee',
      category: 'Dairy & Eggs',
      description: 'Slow-cooked golden ghee prepared from cultured curd of grass-fed indigenous cows. Danedar texture.',
      unit: 'litre',
      price: 1450.0,
      available_quantity: 35.0,
      initial_quantity: 40.0,
      harvest_date: '2026-10-21',
      pickup_available: 1,
      delivery_available: 1,
      image_url: 'https://images.unsplash.com/photo-1631451095765-2c91616fc9e6?w=600&auto=format&fit=crop&q=80',
      organic_certified: 1,
      batch_number: 'AND-GHE-2026-L1',
      status: 'active',
    },
    {
      farmer_id: farmerIds[4],
      name: 'Pasture-Raised Country Eggs (Desi)',
      category: 'Dairy & Eggs',
      description: 'Rich amber yolks from free-range hens foraging on natural seeds, grains, and green pasture.',
      unit: 'dozen',
      price: 130.0,
      available_quantity: 70.0,
      initial_quantity: 100.0,
      harvest_date: '2026-10-30',
      pickup_available: 1,
      delivery_available: 1,
      image_url: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=600&auto=format&fit=crop&q=80',
      organic_certified: 1,
      batch_number: 'AND-EGG-2026-M1',
      status: 'active',
    },

    // Farmer 6: Rameshwar Verma (farmerIds[5]) - Varanasi
    {
      farmer_id: farmerIds[5],
      name: 'Ganga Basin Crisp Cauliflower',
      category: 'Vegetables',
      description: 'Snow-white compact heads grown with zero synthetic sprays on rich Gangetic fertile silt.',
      unit: 'kg',
      price: 35.0,
      available_quantity: 160.0,
      initial_quantity: 200.0,
      harvest_date: '2026-10-28',
      pickup_available: 1,
      delivery_available: 1,
      image_url: 'https://images.unsplash.com/photo-1568584711075-3d021a7c3ca3?w=600&auto=format&fit=crop&q=80',
      organic_certified: 1,
      batch_number: 'VNS-CLF-2026-N1',
      status: 'active',
    },
    {
      farmer_id: farmerIds[5],
      name: 'Hydroponic Sweet Italian Basil',
      category: 'Herbs & Spices',
      description: 'Intense aroma and peppery-sweet flavor. Harvested live with roots for restaurant freshness.',
      unit: 'bunch',
      price: 45.0,
      available_quantity: 80.0,
      initial_quantity: 100.0,
      harvest_date: '2026-10-31',
      pickup_available: 1,
      delivery_available: 1,
      image_url: 'https://images.unsplash.com/photo-1608686207856-001b95cf60ca?w=600&auto=format&fit=crop&q=80',
      organic_certified: 1,
      batch_number: 'VNS-BSL-2026-P1',
      status: 'active',
    },
    {
      farmer_id: farmerIds[5],
      name: 'Baby Pahadi New Potatoes',
      category: 'Vegetables',
      description: 'Thin-skinned tender baby potatoes that absorb gravy flavors wonderfully. Naturally washed.',
      unit: 'kg',
      price: 38.0,
      available_quantity: 220.0,
      initial_quantity: 250.0,
      harvest_date: '2026-10-26',
      pickup_available: 1,
      delivery_available: 1,
      image_url: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=600&auto=format&fit=crop&q=80',
      organic_certified: 0,
      batch_number: 'VNS-POT-2026-Q1',
      status: 'active',
    },
  ];

  const productIds = [];
  for (const p of products) {
    const res = await db.execute({
      sql: `INSERT INTO products (
        farmer_id, name, category, description, unit, price,
        available_quantity, initial_quantity, harvest_date,
        pickup_available, delivery_available, image_url,
        organic_certified, batch_number, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING id`,
      args: [
        p.farmer_id,
        p.name,
        p.category,
        p.description,
        p.unit,
        p.price,
        p.available_quantity,
        p.initial_quantity,
        p.harvest_date,
        p.pickup_available,
        p.delivery_available,
        p.image_url,
        p.organic_certified,
        p.batch_number,
        p.status,
      ],
    });
    productIds.push(res.rows[0].id);
  }

  console.log('--- Seeding Sample Orders Across All Statuses ---');
  // Order 1: 'requested' (Buyer 1 -> Farmer 1)
  const o1 = await db.execute({
    sql: `INSERT INTO orders (
      order_number, buyer_id, total_amount, delivery_option,
      delivery_address, payment_method, payment_status, status
    ) VALUES (?, ?, ?, 'delivery', ?, 'simulated_escrow', 'pending', 'requested') RETURNING id`,
    args: [
      'ORD-2026-00101',
      buyerIds[0],
      640.0,
      'Flat 402, Sea Breeze Apts, Bandra West, Mumbai 400050',
    ],
  });
  await db.execute({
    sql: `INSERT INTO order_items (order_id, product_id, farmer_id, product_name, unit_price, unit, quantity, subtotal)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [o1.rows[0].id, productIds[0], farmerIds[0], 'Nashik Red Quality Onions', 32.0, 'kg', 10.0, 320.0],
  });
  await db.execute({
    sql: `INSERT INTO order_items (order_id, product_id, farmer_id, product_name, unit_price, unit, quantity, subtotal)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [o1.rows[0].id, productIds[1], farmerIds[0], 'Vine-Ripened Hybrid Tomatoes', 28.0, 'kg', 10.0, 280.0],
  });

  // Order 2: 'accepted' (Buyer 2 -> Farmer 2)
  const o2 = await db.execute({
    sql: `INSERT INTO orders (
      order_number, buyer_id, total_amount, delivery_option,
      delivery_address, payment_method, payment_status, status
    ) VALUES (?, ?, ?, 'delivery', ?, 'cash_on_delivery', 'pending', 'accepted') RETURNING id`,
    args: [
      'ORD-2026-00102',
      buyerIds[1],
      5500.0,
      'Warehouse 12, Okhla Industrial Area Phase III, New Delhi 110020',
    ],
  });
  await db.execute({
    sql: `INSERT INTO order_items (order_id, product_id, farmer_id, product_name, unit_price, unit, quantity, subtotal)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [o2.rows[0].id, productIds[3], farmerIds[1], 'Traditional 1121 Aged Basmati Rice', 110.0, 'kg', 50.0, 5500.0],
  });

  // Order 3: 'ready' (Buyer 3 -> Farmer 4)
  const o3 = await db.execute({
    sql: `INSERT INTO orders (
      order_number, buyer_id, total_amount, delivery_option,
      delivery_address, payment_method, payment_status, status
    ) VALUES (?, ?, ?, 'pickup', ?, 'cash_on_pickup', 'pending', 'ready') RETURNING id`,
    args: [
      'ORD-2026-00103',
      buyerIds[2],
      3700.0,
      'Self Farm-Pickup at Himalayan Orchard Gates, Shimla',
    ],
  });
  await db.execute({
    sql: `INSERT INTO order_items (order_id, product_id, farmer_id, product_name, unit_price, unit, quantity, subtotal)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [o3.rows[0].id, productIds[9], farmerIds[3], 'Shimla Royal Delicious Organic Apples', 1850.0, 'crate', 2.0, 3700.0],
  });

  // Order 4: 'completed' (Buyer 1 -> Farmer 5)
  const o4 = await db.execute({
    sql: `INSERT INTO orders (
      order_number, buyer_id, total_amount, delivery_option,
      delivery_address, payment_method, payment_status, status
    ) VALUES (?, ?, ?, 'delivery', ?, 'simulated_escrow', 'completed', 'completed') RETURNING id`,
    args: [
      'ORD-2026-00104',
      buyerIds[0],
      1710.0,
      'Flat 402, Sea Breeze Apts, Bandra West, Mumbai 400050',
    ],
  });
  await db.execute({
    sql: `INSERT INTO order_items (order_id, product_id, farmer_id, product_name, unit_price, unit, quantity, subtotal)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [o4.rows[0].id, productIds[13], farmerIds[4], 'Vedic Bilona Pure Desi Cow Ghee', 1450.0, 'litre', 1.0, 1450.0],
  });
  await db.execute({
    sql: `INSERT INTO order_items (order_id, product_id, farmer_id, product_name, unit_price, unit, quantity, subtotal)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [o4.rows[0].id, productIds[14], farmerIds[4], 'Pasture-Raised Country Eggs (Desi)', 130.0, 'dozen', 2.0, 260.0],
  });

  // Order 5: 'cancelled' (Buyer 2 -> Farmer 1, with reason)
  const o5 = await db.execute({
    sql: `INSERT INTO orders (
      order_number, buyer_id, total_amount, delivery_option,
      delivery_address, payment_method, payment_status, status, cancellation_reason
    ) VALUES (?, ?, ?, 'pickup', ?, 'cash_on_pickup', 'pending', 'cancelled', ?) RETURNING id`,
    args: [
      'ORD-2026-00105',
      buyerIds[1],
      950.0,
      'Self Pickup at Nashik Farm Depot',
      'Buyer changed pickup schedule and requested cancellation before packing.',
    ],
  });
  await db.execute({
    sql: `INSERT INTO order_items (order_id, product_id, farmer_id, product_name, unit_price, unit, quantity, subtotal)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [o5.rows[0].id, productIds[2], farmerIds[0], 'Thompson Seedless Green Grapes', 95.0, 'kg', 10.0, 950.0],
  });

  console.log('✅ Database seeded successfully:');
  console.log(`- 1 Admin: admin@farmermarket.org`);
  console.log(`- ${farmers.length} Farmers (${farmers.map(f => f.name).join(', ')})`);
  console.log(`- ${buyers.length} Buyers (${buyers.map(b => b.name).join(', ')})`);
  console.log(`- ${products.length} Products seeded across all agricultural categories`);
  console.log(`- 5 Sample Orders in states: requested, accepted, ready, completed, cancelled`);
}

// Run directly if invoked from command line
if (process.argv[1]?.endsWith('seed.js')) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Error seeding database:', err);
      process.exit(1);
    });
}

