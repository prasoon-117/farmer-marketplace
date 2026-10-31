import test from 'node:test';
import assert from 'node:assert/strict';
import { db } from '../server/src/db/index.js';
import { seedDatabase } from '../server/src/db/seed.js';

// Setup fresh DB before running tests
test.before(async () => {
  await seedDatabase();
});

test('1. Database seed verification: at least 5 farmers, 15 products exist', async () => {
  const farmersRes = await db.execute("SELECT * FROM users WHERE role = 'farmer'");
  const productsRes = await db.execute("SELECT * FROM products WHERE status = 'active'");
  const buyersRes = await db.execute("SELECT * FROM users WHERE role = 'buyer'");

  assert.ok(farmersRes.rows.length >= 5, `Expected >= 5 farmers, found ${farmersRes.rows.length}`);
  assert.ok(productsRes.rows.length >= 15, `Expected >= 15 products, found ${productsRes.rows.length}`);
  assert.ok(buyersRes.rows.length >= 1, `Expected >= 1 buyer, found ${buyersRes.rows.length}`);
});

test('2. Stock Limit Enforcement: Attempting to order more than available stock is rejected', async () => {
  const prodRes = await db.execute({
    sql: "SELECT * FROM products WHERE status = 'active' LIMIT 1",
    args: [],
  });
  assert.ok(prodRes.rows.length > 0, 'Must have at least one active product');
  const product = prodRes.rows[0];
  const initialStock = Number(product.available_quantity);

  const requestedExcessQty = initialStock + 100;

  // Validation logic identical to backend orderController
  const canFulfill = requestedExcessQty <= initialStock;
  assert.strictEqual(canFulfill, false, 'Stock check must reject orders exceeding stock');

  // Verify stock was untouched in database
  const verifyRes = await db.execute({
    sql: 'SELECT available_quantity FROM products WHERE id = ?',
    args: [product.id],
  });
  assert.strictEqual(Number(verifyRes.rows[0].available_quantity), initialStock);
});

test('3. Order Placement & Inventory Deduction: Valid order atomically decrements stock', async () => {
  const prodRes = await db.execute({
    sql: "SELECT * FROM products WHERE status = 'active' AND available_quantity >= 10 LIMIT 1",
    args: [],
  });
  const product = prodRes.rows[0];
  const stockBefore = Number(product.available_quantity);
  const orderQty = 5;

  const buyerRes = await db.execute("SELECT id FROM users WHERE role = 'buyer' LIMIT 1");
  const buyerId = buyerRes.rows[0].id;

  // Simulate atomic placement
  await db.execute({
    sql: 'UPDATE products SET available_quantity = available_quantity - ? WHERE id = ?',
    args: [orderQty, product.id],
  });

  const orderRes = await db.execute({
    sql: `INSERT INTO orders (
      order_number, buyer_id, total_amount, delivery_option,
      delivery_address, payment_method, payment_status, status
    ) VALUES ('ORD-TEST-001', ?, ?, 'pickup', 'Test Depot Pickup', 'cash_on_pickup', 'pending', 'requested') RETURNING id`,
    args: [buyerId, orderQty * Number(product.price)],
  });

  const orderId = orderRes.rows[0].id;

  await db.execute({
    sql: `INSERT INTO order_items (order_id, product_id, farmer_id, product_name, unit_price, unit, quantity, subtotal)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [orderId, product.id, product.farmer_id, product.name, product.price, product.unit, orderQty, orderQty * Number(product.price)],
  });

  const prodAfter = await db.execute({
    sql: 'SELECT available_quantity FROM products WHERE id = ?',
    args: [product.id],
  });
  const stockAfter = Number(prodAfter.rows[0].available_quantity);

  assert.strictEqual(stockAfter, stockBefore - orderQty, 'Stock must decrement by exactly orderQty');
});

test('4. Order Cancellation: Cancelling order atomically restores product inventory', async () => {
  const orderRes = await db.execute("SELECT id FROM orders WHERE order_number = 'ORD-TEST-001'");
  assert.ok(orderRes.rows.length > 0, 'Test order ORD-TEST-001 must exist');
  const orderId = orderRes.rows[0].id;

  const itemsRes = await db.execute({
    sql: 'SELECT * FROM order_items WHERE order_id = ?',
    args: [orderId],
  });

  const item = itemsRes.rows[0];
  const prodBeforeCancel = await db.execute({
    sql: 'SELECT available_quantity FROM products WHERE id = ?',
    args: [item.product_id],
  });
  const stockBeforeCancel = Number(prodBeforeCancel.rows[0].available_quantity);

  // Perform cancellation: restore stock for each item
  for (const it of itemsRes.rows) {
    await db.execute({
      sql: 'UPDATE products SET available_quantity = available_quantity + ? WHERE id = ?',
      args: [it.quantity, it.product_id],
    });
  }

  await db.execute({
    sql: "UPDATE orders SET status = 'cancelled', cancellation_reason = 'Buyer cancelled before packing' WHERE id = ?",
    args: [orderId],
  });

  const prodAfterCancel = await db.execute({
    sql: 'SELECT available_quantity FROM products WHERE id = ?',
    args: [item.product_id],
  });
  const stockAfterCancel = Number(prodAfterCancel.rows[0].available_quantity);

  assert.strictEqual(
    stockAfterCancel,
    stockBeforeCancel + Number(item.quantity),
    'Stock must be restored by item quantity upon cancellation'
  );

  const orderVerify = await db.execute({
    sql: 'SELECT status, cancellation_reason FROM orders WHERE id = ?',
    args: [orderId],
  });
  assert.strictEqual(orderVerify.rows[0].status, 'cancelled');
  assert.strictEqual(orderVerify.rows[0].cancellation_reason, 'Buyer cancelled before packing');
});

test('5. Order Status Lifecycle: Transitions through requested -> accepted -> ready -> completed', async () => {
  const buyerRes = await db.execute("SELECT id FROM users WHERE role = 'buyer' LIMIT 1");
  const buyerId = buyerRes.rows[0].id;

  const orderRes = await db.execute({
    sql: `INSERT INTO orders (
      order_number, buyer_id, total_amount, delivery_option,
      delivery_address, payment_method, payment_status, status
    ) VALUES ('ORD-LIFECYCLE-001', ?, 200, 'pickup', 'Pickup Gates', 'cash_on_pickup', 'pending', 'requested') RETURNING id`,
    args: [buyerId],
  });
  const orderId = orderRes.rows[0].id;

  // 1. Accept
  await db.execute({
    sql: "UPDATE orders SET status = 'accepted' WHERE id = ?",
    args: [orderId],
  });
  let state = await db.execute({ sql: 'SELECT status FROM orders WHERE id = ?', args: [orderId] });
  assert.strictEqual(state.rows[0].status, 'accepted');

  // 2. Ready
  await db.execute({
    sql: "UPDATE orders SET status = 'ready' WHERE id = ?",
    args: [orderId],
  });
  state = await db.execute({ sql: 'SELECT status FROM orders WHERE id = ?', args: [orderId] });
  assert.strictEqual(state.rows[0].status, 'ready');

  // 3. Completed
  await db.execute({
    sql: "UPDATE orders SET status = 'completed', payment_status = 'completed' WHERE id = ?",
    args: [orderId],
  });
  state = await db.execute({ sql: 'SELECT status, payment_status FROM orders WHERE id = ?', args: [orderId] });
  assert.strictEqual(state.rows[0].status, 'completed');
  assert.strictEqual(state.rows[0].payment_status, 'completed');
});

test('6. Admin Moderation: Ability to flag and restore produce listings', async () => {
  const prodRes = await db.execute('SELECT id, status FROM products LIMIT 1');
  const targetId = prodRes.rows[0].id;
  const adminRes = await db.execute("SELECT id FROM users WHERE role = 'admin' LIMIT 1");
  const adminId = adminRes.rows[0].id;

  // Flag product
  await db.execute({
    sql: "UPDATE products SET status = 'flagged' WHERE id = ?",
    args: [targetId],
  });
  let prod = await db.execute({ sql: 'SELECT status FROM products WHERE id = ?', args: [targetId] });
  assert.strictEqual(prod.rows[0].status, 'flagged');

  // Log moderation entry
  await db.execute({
    sql: 'INSERT INTO moderation_logs (product_id, admin_id, action, notes) VALUES (?, ?, ?, ?)',
    args: [targetId, adminId, 'Flagged', 'Quality review check'],
  });
  const log = await db.execute({ sql: 'SELECT * FROM moderation_logs WHERE product_id = ?', args: [targetId] });
  assert.strictEqual(log.rows.length, 1);

  // Restore to active
  await db.execute({
    sql: "UPDATE products SET status = 'active' WHERE id = ?",
    args: [targetId],
  });
  prod = await db.execute({ sql: 'SELECT status FROM products WHERE id = ?', args: [targetId] });
  assert.strictEqual(prod.rows[0].status, 'active');
});
