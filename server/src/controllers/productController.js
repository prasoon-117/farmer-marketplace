import { db } from '../db/index.js';

export async function getProducts(req, res) {
  try {
    const {
      search,
      category,
      minPrice,
      maxPrice,
      location,
      deliveryOption, // 'pickup', 'delivery', 'both'
      inStockOnly,
      organicOnly,
      sort = 'newest', // 'price_asc', 'price_desc', 'harvest_desc', 'newest'
    } = req.query;

    let conditions = ["p.status = 'active'"];
    let args = [];

    // Search keyword
    if (search && search.trim()) {
      conditions.push('(p.name LIKE ? OR p.description LIKE ? OR u.farm_name LIKE ? OR u.location LIKE ?)');
      const pattern = `%${search.trim()}%`;
      args.push(pattern, pattern, pattern, pattern);
    }

    // Category
    if (category && category !== 'All') {
      conditions.push('p.category = ?');
      args.push(category);
    }

    // Price range
    if (minPrice && !isNaN(Number(minPrice))) {
      conditions.push('p.price >= ?');
      args.push(Number(minPrice));
    }
    if (maxPrice && !isNaN(Number(maxPrice))) {
      conditions.push('p.price <= ?');
      args.push(Number(maxPrice));
    }

    // Location
    if (location && location !== 'All') {
      conditions.push('u.location LIKE ?');
      args.push(`%${location}%`);
    }

    // Delivery options
    if (deliveryOption === 'pickup') {
      conditions.push('p.pickup_available = 1');
    } else if (deliveryOption === 'delivery') {
      conditions.push('p.delivery_available = 1');
    }

    // Stock availability
    if (inStockOnly === 'true' || inStockOnly === true) {
      conditions.push('p.available_quantity > 0');
    }

    // Organic certified
    if (organicOnly === 'true' || organicOnly === true) {
      conditions.push('p.organic_certified = 1');
    }

    // Sorting
    let orderBy = 'p.id DESC';
    if (sort === 'price_asc') orderBy = 'p.price ASC';
    else if (sort === 'price_desc') orderBy = 'p.price DESC';
    else if (sort === 'harvest_desc') orderBy = 'p.harvest_date DESC';
    else if (sort === 'newest') orderBy = 'p.created_at DESC';

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const sql = `
      SELECT
        p.*,
        u.name AS farmer_name,
        u.farm_name,
        u.location AS farmer_location,
        u.phone AS farmer_phone,
        u.avatar_url AS farmer_avatar
      FROM products p
      JOIN users u ON p.farmer_id = u.id
      ${whereClause}
      ORDER BY ${orderBy}
    `;

    const result = await db.execute({ sql, args });

    return res.status(200).json({
      success: true,
      count: result.rows.length,
      data: result.rows,
    });
  } catch (err) {
    console.error('Error fetching products:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve products.',
      error: err.message,
    });
  }
}

export async function getProductById(req, res) {
  try {
    const { id } = req.params;

    const sql = `
      SELECT
        p.*,
        u.name AS farmer_name,
        u.email AS farmer_email,
        u.farm_name,
        u.location AS farmer_location,
        u.phone AS farmer_phone,
        u.bio AS farmer_bio,
        u.avatar_url AS farmer_avatar
      FROM products p
      JOIN users u ON p.farmer_id = u.id
      WHERE p.id = ?
    `;

    const result = await db.execute({ sql, args: [id] });

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.',
      });
    }

    return res.status(200).json({
      success: true,
      data: result.rows[0],
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch product details.',
      error: err.message,
    });
  }
}

export async function createProduct(req, res) {
  try {
    const farmer_id = req.user.id;
    const {
      name,
      category,
      description,
      unit,
      price,
      available_quantity,
      harvest_date,
      pickup_available = 1,
      delivery_available = 1,
      image_url,
      organic_certified = 0,
      batch_number,
    } = req.body;

    if (!name || !category || !unit || price == null || available_quantity == null || !harvest_date) {
      return res.status(400).json({
        success: false,
        message: 'Required fields: name, category, unit, price, available_quantity, harvest_date.',
      });
    }

    if (Number(price) <= 0 || Number(available_quantity) < 0) {
      return res.status(400).json({
        success: false,
        message: 'Price must be positive, and available quantity cannot be negative.',
      });
    }

    const generatedBatch =
      batch_number ||
      `F${farmer_id}-${category.slice(0, 3).toUpperCase()}-${Date.now().toString().slice(-6)}`;

    const fallbackImage =
      image_url ||
      'https://images.unsplash.com/photo-1610348725531-843dff563e2c?w=600&auto=format&fit=crop&q=80';

    const insertResult = await db.execute({
      sql: `
        INSERT INTO products (
          farmer_id, name, category, description, unit, price,
          available_quantity, initial_quantity, harvest_date,
          pickup_available, delivery_available, image_url,
          organic_certified, batch_number, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')
        RETURNING *
      `,
      args: [
        farmer_id,
        name.trim(),
        category.trim(),
        description || '',
        unit.trim(),
        Number(price),
        Number(available_quantity),
        Number(available_quantity),
        harvest_date,
        pickup_available ? 1 : 0,
        delivery_available ? 1 : 0,
        fallbackImage,
        organic_certified ? 1 : 0,
        generatedBatch,
      ],
    });

    return res.status(201).json({
      success: true,
      message: 'Produce listed successfully on marketplace.',
      data: insertResult.rows[0],
    });
  } catch (err) {
    console.error('Error creating product:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to create product listing.',
      error: err.message,
    });
  }
}

export async function updateProduct(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Fetch existing product
    const existing = await db.execute({
      sql: 'SELECT * FROM products WHERE id = ?',
      args: [id],
    });

    if (existing.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.',
      });
    }

    const product = existing.rows[0];

    // Authorization check: Only owner farmer or admin can update
    if (userRole !== 'admin' && product.farmer_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: You can only edit your own produce listings.',
      });
    }

    const {
      name = product.name,
      category = product.category,
      description = product.description,
      unit = product.unit,
      price = product.price,
      available_quantity = product.available_quantity,
      harvest_date = product.harvest_date,
      pickup_available = product.pickup_available,
      delivery_available = product.delivery_available,
      image_url = product.image_url,
      organic_certified = product.organic_certified,
      status = product.status,
    } = req.body;

    const updateResult = await db.execute({
      sql: `
        UPDATE products SET
          name = ?,
          category = ?,
          description = ?,
          unit = ?,
          price = ?,
          available_quantity = ?,
          harvest_date = ?,
          pickup_available = ?,
          delivery_available = ?,
          image_url = ?,
          organic_certified = ?,
          status = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
        RETURNING *
      `,
      args: [
        name,
        category,
        description,
        unit,
        Number(price),
        Number(available_quantity),
        harvest_date,
        pickup_available ? 1 : 0,
        delivery_available ? 1 : 0,
        image_url,
        organic_certified ? 1 : 0,
        status,
        id,
      ],
    });

    return res.status(200).json({
      success: true,
      message: 'Produce listing updated successfully.',
      data: updateResult.rows[0],
    });
  } catch (err) {
    console.error('Error updating product:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to update product listing.',
      error: err.message,
    });
  }
}

export async function deleteProduct(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const existing = await db.execute({
      sql: 'SELECT * FROM products WHERE id = ?',
      args: [id],
    });

    if (existing.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.',
      });
    }

    const product = existing.rows[0];

    if (userRole !== 'admin' && product.farmer_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: You can only delete your own produce listings.',
      });
    }

    // Soft delete / remove status
    await db.execute({
      sql: "UPDATE products SET status = 'removed', updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      args: [id],
    });

    return res.status(200).json({
      success: true,
      message: 'Produce listing removed from marketplace.',
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to remove product listing.',
      error: err.message,
    });
  }
}

export async function getFarmerProducts(req, res) {
  try {
    const farmerId = req.user.id;

    const result = await db.execute({
      sql: `
        SELECT
          p.*,
          COALESCE((
            SELECT SUM(oi.quantity)
            FROM order_items oi
            JOIN orders o ON oi.order_id = o.id
            WHERE oi.product_id = p.id AND o.status != 'cancelled'
          ), 0) AS units_sold,
          COALESCE((
            SELECT SUM(oi.subtotal)
            FROM order_items oi
            JOIN orders o ON oi.order_id = o.id
            WHERE oi.product_id = p.id AND o.status = 'completed'
          ), 0) AS revenue_earned
        FROM products p
        WHERE p.farmer_id = ?
        ORDER BY p.id DESC
      `,
      args: [farmerId],
    });

    return res.status(200).json({
      success: true,
      count: result.rows.length,
      data: result.rows,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch farmer inventory.',
      error: err.message,
    });
  }
}

export async function getCategoriesAndLocations(req, res) {
  try {
    const categoriesResult = await db.execute({
      sql: "SELECT DISTINCT category FROM products WHERE status = 'active' ORDER BY category ASC",
      args: [],
    });

    const locationsResult = await db.execute({
      sql: "SELECT DISTINCT u.location FROM products p JOIN users u ON p.farmer_id = u.id WHERE p.status = 'active' ORDER BY u.location ASC",
      args: [],
    });

    return res.status(200).json({
      success: true,
      data: {
        categories: categoriesResult.rows.map((r) => r.category),
        locations: locationsResult.rows.map((r) => r.location).filter(Boolean),
      },
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve metadata.',
      error: err.message,
    });
  }
}
