# 🧪 Testing Evidence & Validation Report — HACK-P309

This document records test cases, execution commands, and output logs validating all functional and business rules of **HACK-P309: Farmer Marketplace**.

---

## 1. Automated Test Suite Summary

- **Test Framework**: Node.js Native Test Runner (`node:test`, `node:assert/strict`)
- **Execution Command**: `npm test`
- **Result**: `6 / 6 Passed (100% Success Rate)`
- **Duration**: `~1.87 seconds`

```bash
> farmer-marketplace@1.0.0 test
> node --test tests/marketplace.test.js

--- Initializing database schema ---
--- Seeding Users (Farmers, Buyers, Admin) ---
--- Seeding Products (18 Sample Products Across All Categories) ---
--- Seeding Sample Orders Across All Statuses ---
✅ Database seeded successfully:
- 1 Admin: admin@farmermarket.org
- 6 Farmers (Rajesh Patel, Gurpreet Singh, Ananya Sundaram, Devendra Sharma, Sunita Yadav, Rameshwar Verma)
- 3 Buyers (Priya Sharma, Vikram Sethi, Chef Marco Rossi)
- 18 Products seeded across all agricultural categories
- 5 Sample Orders in states: requested, accepted, ready, completed, cancelled

✔ 1. Database seed verification: at least 5 farmers, 15 products exist (1290ms)
✔ 2. Stock Limit Enforcement: Attempting to order more than available stock is rejected (2.1ms)
✔ 3. Order Placement & Inventory Deduction: Valid order atomically decrements stock (17.7ms)
✔ 4. Order Cancellation: Cancelling order atomically restores product inventory (29.5ms)
✔ 5. Order Status Lifecycle: Transitions through requested -> accepted -> ready -> completed (85.6ms)
✔ 6. Admin Moderation: Ability to flag and restore produce listings (72.6ms)

ℹ tests 6
ℹ pass 6
ℹ fail 0
ℹ duration_ms 1872.18
```

---

## 2. Detailed Test Cases & Evidence

### Test Case TC-01: Seed Verification
- **Objective**: Verify that the application initializes with at least 5 farmer profiles and at least 15 sample products across categories.
- **Result**: `PASS` — 6 distinct farmers seeded (Maharashtra, Punjab, Tamil Nadu, Himachal Pradesh, Gujarat, UP), 3 buyers, 1 admin, 18 distinct produce items seeded.

### Test Case TC-02: Strict Stock Limit Enforcement
- **Objective**: Ensure that a buyer cannot order a quantity exceeding currently available stock.
- **Input**: Requested quantity = `available_quantity + 100`.
- **Expected Outcome**: HTTP `400 Bad Request` with message `Insufficient stock for product...`; stock in database remains completely unmodified.
- **Result**: `PASS` — The atomic validation logic successfully aborted order creation and preserved database consistency.

### Test Case TC-03: Atomic Inventory Deduction
- **Objective**: Confirm that placing an order for `N` units atomically decrements `available_quantity` by exactly `N`.
- **Input**: Ordered `5 kg` of produce (initial stock: `800 kg`).
- **Expected Outcome**: Stock after order = `795 kg`.
- **Result**: `PASS` — Real-time query verified stock decreased to `795 kg`.

### Test Case TC-04: Order Cancellation & Inventory Restoration
- **Objective**: Ensure that when an order is cancelled (by buyer or farmer), all item quantities are atomically refunded back to the farmer's available stock.
- **Input**: Order containing `5 kg` cancelled with reason `"Buyer cancelled before packing"`.
- **Expected Outcome**: Stock restored by `+5 kg` back to `800 kg`; order status set to `'cancelled'`.
- **Result**: `PASS` — Stock returned to `800 kg`, cancellation reason logged in database.

### Test Case TC-05: Order Lifecycle State Machine
- **Objective**: Transition an order sequentially through the full lifecycle:
  `requested` ➔ `accepted` ➔ `ready` ➔ `completed`.
- **Expected Outcome**: Valid state transitions succeed; terminal state `completed` sets `payment_status = 'completed'`.
- **Result**: `PASS` — All 4 status stages verified with database asserts.

### Test Case TC-06: Administrator Listing Moderation
- **Objective**: Validate admin ability to flag duplicate/inappropriate produce listings and approve them after verification.
- **Input**: Flagged product ID 18 with note `"Quality review check"`.
- **Expected Outcome**: Product status transitions to `flagged`; audit log created in `moderation_logs`; re-approval transitions status back to `active`.
- **Result**: `PASS` — Moderation log inserted and verified.

---

## 3. End-to-End API Integration Evidence

Tested via live REST HTTP calls against `http://localhost:5000`:

| Endpoint | Method | Payload / Action | Response Code | Verified Behavior |
|---|---|---|---|---|
| `/api/health` | GET | None | `200 OK` | Server reports `"status": "online"` |
| `/api/products` | GET | `?category=Vegetables` | `200 OK` | Returned 6 vegetable listings with farmer details |
| `/api/auth/demo-login` | POST | `{"role": "buyer"}` | `200 OK` | Returned valid JWT & Priya Sharma profile |
| `/api/orders` | POST | `{"items": [{"productId": 58, "quantity": 2}]}` | `201 Created` | Order `ORD-2026-85574` created, stock decremented 800 ➔ 798 |
| `/api/orders/:id/status`| PATCH | `{"status": "cancelled"}` | `200 OK` | Order marked cancelled, stock restored 798 ➔ 800 |
| `/api/admin/stats` | GET | Admin Auth Bearer | `200 OK` | Total GMV, product counts, and user metrics returned |
| `/api/trends` | GET | None | `200 OK` | Mandi benchmarks, buyer savings %, farmer gains % |
