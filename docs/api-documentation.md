# 📡 API Documentation — HACK-P309: Farmer Marketplace

**Base URL**: `http://localhost:5000/api`  
**Authentication**: Bearer Token (`Authorization: Bearer <JWT_TOKEN>`)  
**Response Format**: `application/json`

---

## 1. System Health

### `GET /health`
Returns system status, server uptime, and timestamp.

- **Access**: Public
- **Response `200 OK`**:
```json
{
  "status": "online",
  "project": "HACK-P309 Farmer Marketplace API",
  "uptime": 124.5,
  "timestamp": "2026-10-31T07:35:18.541Z"
}
```

---

## 2. Authentication & User Management

### `POST /auth/register`
Creates a new user account (Farmer or Buyer).

- **Access**: Public
- **Request Body**:
```json
{
  "name": "Ramesh Kumar",
  "email": "ramesh@example.com",
  "password": "Password123!",
  "role": "farmer",
  "phone": "+91 98765 43210",
  "location": "Nashik, Maharashtra",
  "farm_name": "Surya Organic Orchards",
  "bio": "Specializing in fresh organic pomegranates and grapes."
}
```
- **Response `201 Created`**:
```json
{
  "success": true,
  "message": "Account registered successfully.",
  "data": {
    "token": "eyJhbGciOi...",
    "user": {
      "id": 10,
      "name": "Ramesh Kumar",
      "email": "ramesh@example.com",
      "role": "farmer",
      "phone": "+91 98765 43210",
      "location": "Nashik, Maharashtra",
      "farm_name": "Surya Organic Orchards"
    }
  }
}
```

### `POST /auth/login`
Authenticates existing user with email and password.

- **Access**: Public
- **Request Body**:
```json
{
  "email": "rajesh.patel@farmermarket.org",
  "password": "FarmerMarket123!"
}
```
- **Response `200 OK`**:
```json
{
  "success": true,
  "message": "Login successful.",
  "data": {
    "token": "eyJhbGciOi...",
    "user": { ... }
  }
}
```

### `GET /auth/me`
Retrieves currently authenticated user's profile.

- **Access**: Private (`Bearer <token>`)
- **Response `200 OK`**:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 2,
      "name": "Rajesh Patel",
      "email": "rajesh.patel@farmermarket.org",
      "role": "farmer",
      "farm_name": "Green Valley Organic Farm",
      "location": "Nashik, Maharashtra"
    }
  }
}
```

### `POST /auth/demo-login`
Fast 1-click persona switcher for evaluation and demo workflows.

- **Access**: Public
- **Request Body**:
```json
{
  "role": "farmer" // or "buyer", "admin", or "email": "priya.buyer@example.com"
}
```
- **Response `200 OK`**: Returns JWT and persona user object.

### `GET /auth/demo-accounts`
Returns all seeded demo profiles for quick testing.

---

## 3. Produce Catalog & Inventory

### `GET /products`
Queries produce listings with flexible filtering and sorting.

- **Access**: Public
- **Query Parameters**:
  - `search` (string): keyword matching produce name, description, farm, or location
  - `category` (string): e.g. `Vegetables`, `Fruits`, `Grains & Cereals`, `Dairy & Eggs`, `Herbs & Spices`, `Organic Produce`
  - `minPrice` (number) & `maxPrice` (number)
  - `location` (string): farm region filter
  - `deliveryOption` (string): `pickup` or `delivery`
  - `inStockOnly` (boolean): `true` to filter out 0-stock items
  - `organicOnly` (boolean): `true` to show only 100% certified organic items
  - `sort` (string): `newest`, `price_asc`, `price_desc`, `harvest_desc`
- **Response `200 OK`**:
```json
{
  "success": true,
  "count": 18,
  "data": [
    {
      "id": 1,
      "farmer_id": 2,
      "name": "Nashik Red Quality Onions",
      "category": "Vegetables",
      "unit": "kg",
      "price": 32.0,
      "available_quantity": 450.0,
      "initial_quantity": 500.0,
      "harvest_date": "2026-10-24",
      "pickup_available": 1,
      "delivery_available": 1,
      "organic_certified": 1,
      "batch_number": "NSK-ON-2026-B1",
      "status": "active",
      "farmer_name": "Rajesh Patel",
      "farm_name": "Green Valley Organic Farm",
      "farmer_location": "Nashik, Maharashtra",
      "farmer_phone": "+91 98234 11223"
    }
  ]
}
```

### `GET /products/:id`
Retrieves single product details with farmer contact information and bio.

- **Access**: Public
- **Response `200 OK`**

### `POST /products`
Publishes a new produce listing on the marketplace.

- **Access**: Private (Role: `farmer` only)
- **Request Body**:
```json
{
  "name": "Fresh Organic Carrots",
  "category": "Vegetables",
  "description": "Sweet, crunchy orange carrots grown in sandy loam soil.",
  "unit": "kg",
  "price": 40.0,
  "available_quantity": 200.0,
  "harvest_date": "2026-10-31",
  "pickup_available": 1,
  "delivery_available": 1,
  "organic_certified": 1,
  "image_url": "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=600"
}
```
- **Response `201 Created`**

### `PUT /products/:id`
Updates an existing produce listing (name, price, stock, harvest date).

- **Access**: Private (Owner `farmer` or `admin`)
- **Response `200 OK`**

### `DELETE /products/:id`
Removes or archives a produce listing.

- **Access**: Private (Owner `farmer` or `admin`)
- **Response `200 OK`**

### `GET /products/farmer/my-products`
Fetches all produce belonging to authenticated farmer with units sold & revenue.

- **Access**: Private (Role: `farmer`)
- **Response `200 OK`**

---

## 4. Orders & Fulfillment Lifecycle

### `POST /orders`
Creates a new order request with strict stock verification and atomic stock deduction.

- **Access**: Private (Role: `buyer` only)
- **Request Body**:
```json
{
  "items": [
    { "productId": 1, "quantity": 10 },
    { "productId": 2, "quantity": 5 }
  ],
  "deliveryOption": "delivery", // "pickup" | "delivery"
  "deliveryAddress": "Flat 402, Sea Breeze Apts, Bandra West, Mumbai 400050",
  "paymentMethod": "cash_on_delivery" // "cash_on_pickup" | "cash_on_delivery" | "simulated_escrow"
}
```
- **Response `201 Created`**:
```json
{
  "success": true,
  "message": "Order placed successfully. Awaiting farmer confirmation.",
  "data": {
    "order": {
      "id": 6,
      "order_number": "ORD-2026-85574",
      "buyer_id": 8,
      "total_amount": 460.0,
      "delivery_option": "delivery",
      "delivery_address": "Flat 402, Sea Breeze Apts, Bandra West, Mumbai 400050",
      "payment_method": "cash_on_delivery",
      "payment_status": "pending",
      "status": "requested"
    },
    "items": [ ... ]
  }
}
```
- **Error Response `400 Bad Request` (Stock Exceeded)**:
```json
{
  "success": false,
  "message": "Insufficient stock for \"Nashik Red Quality Onions\". Available: 4, Requested: 10.",
  "product": { "id": 1, "name": "Nashik Red Quality Onions", "available": 4, "requested": 10 }
}
```

### `GET /orders/my-orders`
Returns active and past orders placed by the authenticated buyer.

- **Access**: Private (Role: `buyer`)
- **Response `200 OK`**

### `GET /orders/farmer-orders`
Returns incoming orders for produce supplied by the authenticated farmer.

- **Access**: Private (Role: `farmer`)
- **Response `200 OK`**

### `PATCH /orders/:id/status`
Updates order status across the lifecycle:
`requested` ➔ `accepted` ➔ `ready` ➔ `completed` OR `cancelled`.

- **Access**: Private (Participating Farmer, Buyer for cancellation, or Admin)
- **Request Body**:
```json
{
  "status": "accepted" // "accepted" | "ready" | "completed" | "cancelled"
}
```
- **Cancellation Request**:
```json
{
  "status": "cancelled",
  "cancellationReason": "Buyer rescheduled travel plans"
}
```
- **Response `200 OK`**:
```json
{
  "success": true,
  "message": "Order status updated to \"cancelled\". Inventory stock has been restored.",
  "data": { "id": 6, "status": "cancelled", "cancellation_reason": "..." }
}
```

---

## 5. Admin Moderation & Platform Audits

### `GET /admin/stats`
Aggregated marketplace statistics (total GMV, order volume, active products).

- **Access**: Private (Role: `admin`)
- **Response `200 OK`**

### `GET /admin/products`
Lists all products with moderation status (`active`, `flagged`, `removed`).

- **Access**: Private (Role: `admin`)

### `PATCH /admin/products/:id/moderate`
Flags or removes duplicate/inappropriate produce listings.

- **Access**: Private (Role: `admin`)
- **Request Body**:
```json
{
  "status": "flagged", // "active" | "flagged" | "removed"
  "reason": "Duplicate listing under investigation"
}
```

### `GET /admin/users`
Returns all registered platform users with activity counts.

- **Access**: Private (Role: `admin`)

---

## 6. Market Trends & Benchmarks

### `GET /trends`
Provides comparative pricing data between Direct Farm Gate, Mandi APMC rates, and Supermarket retail prices.

- **Access**: Public
- **Response `200 OK`**
