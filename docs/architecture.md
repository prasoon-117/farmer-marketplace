# 🏗️ System Architecture & Database Design — HACK-P309

## 1. System Architecture Diagram

```mermaid
flowchart TD
    subgraph ClientLayer ["Client Layer (Frontend)"]
        UI["React 19 + Vite Application"]
        Router["Multi-View State Controller"]
        AuthCtx["Auth Context (JWT + Switcher)"]
        CartCtx["Cart Context (Stock-Aware)"]
        LangCtx["i18n Multilingual Context"]
        UI --> Router
        Router --> AuthCtx
        Router --> CartCtx
        Router --> LangCtx
    end

    subgraph APILayer ["Backend API Layer (Express.js)"]
        Server["Express.js HTTP Server (:5000)"]
        CORS["CORS & Morgan Logging Middleware"]
        AuthMW["JWT Auth & Role Guard Middleware"]
        
        AuthCtrl["Auth Controller"]
        ProdCtrl["Product Controller"]
        OrderCtrl["Order & Inventory Controller"]
        AdminCtrl["Admin Moderation Controller"]
        TrendCtrl["Mandi Benchmark Controller"]

        Server --> CORS --> AuthMW
        AuthMW --> AuthCtrl
        AuthMW --> ProdCtrl
        AuthMW --> OrderCtrl
        AuthMW --> AdminCtrl
        AuthMW --> TrendCtrl
    end

    subgraph DataLayer ["Data & Persistence Layer"]
        DBEngine["LibSQL / SQLite Database Engine"]
        Tables[("marketplace.db
-----------------------
users
products
orders
order_items
moderation_logs")]
        DBEngine --> Tables
    end

    ClientLayer <== "REST API (JSON over HTTP/HTTPS)" ==> APILayer
    APILayer <== "Async Prepared SQL & Transactions" ==> DataLayer
```

---

## 2. End-to-End Order & Stock Deduction Data Flow

```mermaid
sequenceDiagram
    autonumber
    actor Buyer as 🛒 Buyer
    participant UI as React Client
    participant API as Express API
    participant DB as SQLite DB
    actor Farmer as 👨‍🌾 Farmer

    Buyer->>UI: Adds produce to cart (Qty: 5)
    UI->>UI: Validates qty <= available_quantity
    Buyer->>UI: Selects fulfillment & Clicks "Place Order"
    UI->>API: POST /api/orders { items, deliveryOption, paymentMethod }
    
    API->>DB: BEGIN TRANSACTION
    API->>DB: SELECT available_quantity FROM products WHERE id = ?
    alt Stock Insufficient
        API-->>UI: 400 Bad Request (Insufficient Stock)
        UI-->>Buyer: Shows error message
    else Stock Available
        API->>DB: UPDATE products SET available_quantity = available_quantity - 5
        API->>DB: INSERT INTO orders (order_number, buyer_id, total, status = 'requested')
        API->>DB: INSERT INTO order_items (...)
        API->>DB: COMMIT TRANSACTION
        API-->>UI: 201 Created (Order Placed)
        UI-->>Buyer: Shows Order Confirmation & Redirects to Tracker
        
        Farmer->>API: GET /api/orders/farmer-orders
        API-->>Farmer: Shows incoming requested order
        Farmer->>API: PATCH /api/orders/:id/status { status: 'accepted' }
        API->>DB: UPDATE orders SET status = 'accepted'
        API-->>Farmer: 200 OK
        Buyer->>UI: Real-time status updates to 'Accepted'
    end
```

---

## 3. Entity-Relationship (ER) Diagram

```mermaid
erDiagram
    USERS ||--o{ PRODUCTS : "lists/owns"
    USERS ||--o{ ORDERS : "places (as buyer)"
    USERS ||--o{ ORDER_ITEMS : "supplies (as farmer)"
    USERS ||--o{ MODERATION_LOGS : "audits (as admin)"
    ORDERS ||--|{ ORDER_ITEMS : "contains"
    PRODUCTS ||--o{ ORDER_ITEMS : "ordered in"
    PRODUCTS ||--o{ MODERATION_LOGS : "moderated in"

    USERS {
        int id PK
        string name
        string email UK
        string password_hash
        string role "farmer | buyer | admin"
        string phone
        string location
        string farm_name
        string bio
        string avatar_url
        datetime created_at
    }

    PRODUCTS {
        int id PK
        int farmer_id FK
        string name
        string category
        string description
        string unit "kg | quintal | crate | dozen | litre | bunch"
        real price
        real available_quantity
        real initial_quantity
        string harvest_date
        int pickup_available
        int delivery_available
        string image_url
        int organic_certified
        string batch_number
        string status "active | flagged | removed"
        datetime created_at
        datetime updated_at
    }

    ORDERS {
        int id PK
        string order_number UK
        int buyer_id FK
        real total_amount
        string delivery_option "pickup | delivery"
        string delivery_address
        string payment_method "cash_on_pickup | cash_on_delivery | simulated_escrow"
        string payment_status "pending | completed"
        string status "requested | accepted | ready | completed | cancelled"
        string cancellation_reason
        datetime created_at
        datetime updated_at
    }

    ORDER_ITEMS {
        int id PK
        int order_id FK
        int product_id FK
        int farmer_id FK
        string product_name
        real unit_price
        string unit
        real quantity
        real subtotal
    }

    MODERATION_LOGS {
        int id PK
        int product_id FK
        int admin_id FK
        string action
        string notes
        datetime created_at
    }
```

---

## 4. Key Architectural Safeguards

1. **Atomic Inventory Control**:
   - Stock deduction occurs within transactional database logic.
   - If stock is insufficient for any item in a multi-item order, the entire request aborts cleanly without partial deductions.

2. **Automated Stock Restoration on Cancellation**:
   - When an order transitions to `cancelled`, every product item's quantity is returned to the farmer's inventory.

3. **Role-Based Access Control (RBAC)**:
   - Buyers cannot create produce listings or alter other orders.
   - Farmers can only edit their own listings and progress status of orders containing their produce.
   - Administrators have moderation privileges to flag, approve, or remove fraudulent listings.

4. **Prototype Safety & Security**:
   - Zero storage of real credit cards or bank details.
   - Realistic simulated escrow & cash-on-pickup payment workflows.
   - Passwords protected via salted bcrypt hashes.
   - Stateless JWT tokens for authentication.

