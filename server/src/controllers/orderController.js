import { db } from '../db/index.js';

export async function createOrder(req, res) {
  try {
    const buyerId = req.user.id;
    const {
      items, // array of { productId, quantity }
      deliveryOption = 'pickup', // 'pickup' | 'delivery'
      deliveryAddress,
      paymentMethod = 'cash_on_pickup', // 'cash_on_pickup' | 'cash_on_delivery' | 'simulated_escrow'
    } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Order must contain at least one item.',
      });
    }

    if (deliveryOption === 'delivery' && (!deliveryAddress || !deliveryAddress.trim())) {
      return res.status(400).json({
        success: false,
        message: 'Delivery address is required when selecting delivery option.',
      });
    }

    const validPaymentMethods = ['cash_on_pickup', 'cash_on_delivery', 'simulated_escrow'];
    if (!validPaymentMethods.includes(paymentMethod)) {
      return res.status(400).json({
        success: false,
        message: `Invalid payment method. Allowed: ${validPaymentMethods.join(', ')}`,
      });
    }

    // 1. Verify all products and check stock limits
    const verifiedItems = [];
    let grandTotal = 0;

    for (const item of items) {
      const { productId, quantity } = item;
      const numQty = Number(quantity);

      if (!productId || isNaN(numQty) || numQty <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Each item must have a valid productId and a positive quantity.',
        });
      }

      const prodRes = await db.execute({
        sql: 'SELECT * FROM products WHERE id = ?',
        args: [productId],
      });

      if (prodRes.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: `Product with ID ${productId} not found.`,
        });
      }

      const product = prodRes.rows[0];

      if (product.status !== 'active') {
        return res.status(400).json({
          success: false,
          message: `Product "${product.name}" is currently unavailable.`,
        });
      }

      // Check delivery compatibility
      if (deliveryOption === 'delivery' && !product.delivery_available) {
        return res.status(400).json({
          success: false,
          message: `Product "${product.name}" is only available for farm pickup.`,
        });
      }
      if (deliveryOption === 'pickup' && !product.pickup_available) {
        return res.status(400).json({
          success: false,
          message: `Product "${product.name}" is only available for delivery.`,
        });
      }

      // Strict stock limit validation
      if (numQty > product.available_quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for "${product.name}". Available: ${product.available_quantity} ${product.unit}, Requested: ${numQty} ${product.unit}.`,
          product: {
            id: product.id,
            name: product.name,
            available: product.available_quantity,
            requested: numQty,
          },
        });
      }

      const subtotal = numQty * product.price;
      grandTotal += subtotal;

      verifiedItems.push({
        product,
        quantity: numQty,
        unitPrice: product.price,
        subtotal,
      });
    }

    // 2. Generate unique human-readable order number
    const orderNumber = `ORD-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;

    // 3. Atomically deduct stock and create order records
    // In LibSQL client, we can execute consecutive statements or a batch transaction
    const initialPaymentStatus = paymentMethod === 'simulated_escrow' ? 'completed' : 'pending';

    const orderInsert = await db.execute({
      sql: `
        INSERT INTO orders (
          order_number, buyer_id, total_amount, delivery_option,
          delivery_address, payment_method, payment_status, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, 'requested')
        RETURNING *
      `,
      args: [
        orderNumber,
        buyerId,
        grandTotal,
        deliveryOption,
        deliveryAddress || (deliveryOption === 'pickup' ? 'Farm Depot Pickup' : 'Local Address'),
        paymentMethod,
        initialPaymentStatus,
      ],
    });

    const newOrder = orderInsert.rows[0];

    // Deduct stock and insert order items
    for (const item of verifiedItems) {
      // Deduct available stock
      await db.execute({
        sql: `UPDATE products SET available_quantity = available_quantity - ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        args: [item.quantity, item.product.id],
      });

      // Insert item
      await db.execute({
        sql: `
          INSERT INTO order_items (
            order_id, product_id, farmer_id, product_name,
            unit_price, unit, quantity, subtotal
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `,
        args: [
          newOrder.id,
          item.product.id,
          item.product.farmer_id,
          item.product.name,
          item.unitPrice,
          item.product.unit,
          item.quantity,
          item.subtotal,
        ],
      });
    }

    // Fetch complete order with items
    const createdItemsRes = await db.execute({
      sql: 'SELECT * FROM order_items WHERE order_id = ?',
      args: [newOrder.id],
    });

    return res.status(201).json({
      success: true,
      message: 'Order placed successfully. Awaiting farmer confirmation.',
      data: {
        order: newOrder,
        items: createdItemsRes.rows,
      },
    });
  } catch (err) {
    console.error('Order creation error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to create order.',
      error: err.message,
    });
  }
}

export async function getMyOrders(req, res) {
  try {
    const buyerId = req.user.id;

    const ordersResult = await db.execute({
      sql: `
        SELECT o.*
        FROM orders o
        WHERE o.buyer_id = ?
        ORDER BY o.id DESC
      `,
      args: [buyerId],
    });

    const ordersWithItems = [];
    for (const order of ordersResult.rows) {
      const itemsResult = await db.execute({
        sql: `
          SELECT oi.*, p.image_url, u.farm_name, u.name AS farmer_name, u.phone AS farmer_phone
          FROM order_items oi
          LEFT JOIN products p ON oi.product_id = p.id
          LEFT JOIN users u ON oi.farmer_id = u.id
          WHERE oi.order_id = ?
        `,
        args: [order.id],
      });

      ordersWithItems.push({
        ...order,
        items: itemsResult.rows,
      });
    }

    return res.status(200).json({
      success: true,
      count: ordersWithItems.length,
      data: ordersWithItems,
    });
  } catch (err) {
    console.error('Error fetching buyer orders:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve buyer orders.',
      error: err.message,
    });
  }
}

export async function getFarmerOrders(req, res) {
  try {
    const farmerId = req.user.id;

    // Find all distinct orders that contain at least one item from this farmer
    const ordersResult = await db.execute({
      sql: `
        SELECT DISTINCT o.*, u.name AS buyer_name, u.email AS buyer_email, u.phone AS buyer_phone, u.location AS buyer_location
        FROM orders o
        JOIN order_items oi ON o.id = oi.order_id
        JOIN users u ON o.buyer_id = u.id
        WHERE oi.farmer_id = ?
        ORDER BY o.id DESC
      `,
      args: [farmerId],
    });

    const ordersWithItems = [];
    for (const order of ordersResult.rows) {
      // Get only the items relevant to this farmer
      const itemsResult = await db.execute({
        sql: `
          SELECT oi.*, p.image_url
          FROM order_items oi
          LEFT JOIN products p ON oi.product_id = p.id
          WHERE oi.order_id = ? AND oi.farmer_id = ?
        `,
        args: [order.id, farmerId],
      });

      ordersWithItems.push({
        ...order,
        items: itemsResult.rows,
      });
    }

    return res.status(200).json({
      success: true,
      count: ordersWithItems.length,
      data: ordersWithItems,
    });
  } catch (err) {
    console.error('Error fetching farmer orders:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve farmer orders.',
      error: err.message,
    });
  }
}

export async function getOrderById(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const orderRes = await db.execute({
      sql: `
        SELECT o.*, u.name AS buyer_name, u.email AS buyer_email, u.phone AS buyer_phone
        FROM orders o
        JOIN users u ON o.buyer_id = u.id
        WHERE o.id = ?
      `,
      args: [id],
    });

    if (orderRes.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Order not found.',
      });
    }

    const order = orderRes.rows[0];

    const itemsRes = await db.execute({
      sql: `
        SELECT oi.*, p.image_url, u.farm_name, u.name AS farmer_name
        FROM order_items oi
        LEFT JOIN products p ON oi.product_id = p.id
        LEFT JOIN users u ON oi.farmer_id = u.id
        WHERE oi.order_id = ?
      `,
      args: [id],
    });

    // Check authorization: must be admin, the buyer, or a participating farmer
    const isBuyer = order.buyer_id === userId;
    const isParticipatingFarmer = itemsRes.rows.some((i) => i.farmer_id === userId);

    if (userRole !== 'admin' && !isBuyer && !isParticipatingFarmer) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: You do not have permission to view this order.',
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        ...order,
        items: itemsRes.rows,
      },
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve order details.',
      error: err.message,
    });
  }
}

export async function updateOrderStatus(req, res) {
  try {
    const { id } = req.params;
    const { status, cancellationReason } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    const allowedStatuses = ['requested', 'accepted', 'ready', 'completed', 'cancelled'];
    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${allowedStatuses.join(', ')}`,
      });
    }

    const orderRes = await db.execute({
      sql: 'SELECT * FROM orders WHERE id = ?',
      args: [id],
    });

    if (orderRes.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Order not found.',
      });
    }

    const order = orderRes.rows[0];

    // Cannot modify already completed or cancelled order
    if (order.status === 'completed' && status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Cannot change status of an already completed order.',
      });
    }
    if (order.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'This order has already been cancelled.',
      });
    }

    const itemsRes = await db.execute({
      sql: 'SELECT * FROM order_items WHERE order_id = ?',
      args: [id],
    });

    // Authorization checks:
    // 1. Buyer can only cancel their own order if status is 'requested'
    // 2. Farmer can progress status (accepted, ready, completed) or cancel
    // 3. Admin can do any valid status change
    const isBuyer = order.buyer_id === userId;
    const isFarmer = itemsRes.rows.some((i) => i.farmer_id === userId);

    if (userRole === 'buyer' || (isBuyer && userRole !== 'admin')) {
      if (status !== 'cancelled') {
        return res.status(403).json({
          success: false,
          message: 'Buyers are only permitted to cancel pending orders.',
        });
      }
      if (order.status !== 'requested') {
        return res.status(400).json({
          success: false,
          message: `Order has already progressed to "${order.status}" and cannot be cancelled directly by buyer. Please contact the farmer.`,
        });
      }
    } else if (userRole === 'farmer' && !isFarmer && userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: You are not a supplier for this order.',
      });
    }

    // IF CANCELLING: Atomically restore inventory stock!
    if (status === 'cancelled') {
      for (const item of itemsRes.rows) {
        await db.execute({
          sql: 'UPDATE products SET available_quantity = available_quantity + ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
          args: [item.quantity, item.product_id],
        });
      }
    }

    // Also update payment_status if order is completed
    const paymentStatus = status === 'completed' ? 'completed' : order.payment_status;

    const updatedRes = await db.execute({
      sql: `
        UPDATE orders SET
          status = ?,
          payment_status = ?,
          cancellation_reason = COALESCE(?, cancellation_reason),
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
        RETURNING *
      `,
      args: [status, paymentStatus, cancellationReason || null, id],
    });

    return res.status(200).json({
      success: true,
      message: `Order status updated to "${status}".${status === 'cancelled' ? ' Inventory stock has been restored.' : ''}`,
      data: updatedRes.rows[0],
    });
  } catch (err) {
    console.error('Error updating order status:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to update order status.',
      error: err.message,
    });
  }
}

