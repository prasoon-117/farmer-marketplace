import { db } from '../db/index.js';

export async function getDashboardStats(req, res) {
  try {
    const userStats = await db.execute(`
      SELECT
        COUNT(CASE WHEN role = 'farmer' THEN 1 END) AS total_farmers,
        COUNT(CASE WHEN role = 'buyer' THEN 1 END) AS total_buyers,
        COUNT(*) AS total_users
      FROM users;
    `);

    const productStats = await db.execute(`
      SELECT
        COUNT(*) AS total_products,
        COUNT(CASE WHEN status = 'active' THEN 1 END) AS active_products,
        COUNT(CASE WHEN status = 'flagged' THEN 1 END) AS flagged_products,
        COUNT(CASE WHEN status = 'removed' THEN 1 END) AS removed_products,
        COUNT(CASE WHEN organic_certified = 1 THEN 1 END) AS organic_products
      FROM products;
    `);

    const orderStats = await db.execute(`
      SELECT
        COUNT(*) AS total_orders,
        COUNT(CASE WHEN status = 'requested' THEN 1 END) AS requested_orders,
        COUNT(CASE WHEN status = 'accepted' THEN 1 END) AS accepted_orders,
        COUNT(CASE WHEN status = 'ready' THEN 1 END) AS ready_orders,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) AS completed_orders,
        COUNT(CASE WHEN status = 'cancelled' THEN 1 END) AS cancelled_orders,
        COALESCE(SUM(CASE WHEN status != 'cancelled' THEN total_amount END), 0) AS gross_merchandise_value,
        COALESCE(SUM(CASE WHEN status = 'completed' THEN total_amount END), 0) AS completed_volume
      FROM orders;
    `);

    return res.status(200).json({
      success: true,
      data: {
        users: userStats.rows[0],
        products: productStats.rows[0],
        orders: orderStats.rows[0],
      },
    });
  } catch (err) {
    console.error('Error fetching admin stats:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve admin dashboard stats.',
      error: err.message,
    });
  }
}

export async function getAllProducts(req, res) {
  try {
    const { status } = req.query;

    let sql = `
      SELECT
        p.*,
        u.name AS farmer_name,
        u.farm_name,
        u.location AS farmer_location,
        u.email AS farmer_email
      FROM products p
      JOIN users u ON p.farmer_id = u.id
    `;
    let args = [];

    if (status && status !== 'all') {
      sql += ' WHERE p.status = ?';
      args.push(status);
    }

    sql += ' ORDER BY p.id DESC';

    const result = await db.execute({ sql, args });

    return res.status(200).json({
      success: true,
      count: result.rows.length,
      data: result.rows,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch products for moderation.',
      error: err.message,
    });
  }
}

export async function moderateProduct(req, res) {
  try {
    const { id } = req.params;
    const { status, reason } = req.body;
    const adminId = req.user.id;

    if (!['active', 'flagged', 'removed'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be 'active', 'flagged', or 'removed'.",
      });
    }

    const prodRes = await db.execute({
      sql: 'SELECT * FROM products WHERE id = ?',
      args: [id],
    });

    if (prodRes.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.',
      });
    }

    await db.execute({
      sql: 'UPDATE products SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      args: [status, id],
    });

    // Record in moderation log
    await db.execute({
      sql: 'INSERT INTO moderation_logs (product_id, admin_id, action, notes) VALUES (?, ?, ?, ?)',
      args: [id, adminId, `Set status to ${status}`, reason || 'Admin moderation action'],
    });

    return res.status(200).json({
      success: true,
      message: `Product #${id} status changed to "${status}".`,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to moderate product.',
      error: err.message,
    });
  }
}

export async function getAllUsers(req, res) {
  try {
    const result = await db.execute(`
      SELECT
        u.id, u.name, u.email, u.role, u.phone, u.location, u.farm_name, u.avatar_url, u.created_at,
        COUNT(DISTINCT p.id) AS products_count,
        COUNT(DISTINCT o.id) AS orders_count
      FROM users u
      LEFT JOIN products p ON u.id = p.farmer_id
      LEFT JOIN orders o ON u.id = o.buyer_id
      GROUP BY u.id
      ORDER BY u.id ASC
    `);

    return res.status(200).json({
      success: true,
      data: result.rows,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch users.',
      error: err.message,
    });
  }
}
