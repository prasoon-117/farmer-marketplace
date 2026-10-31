# 📊 PowerPoint Presentation Outline — HACK-P309: Farmer Marketplace

**Subject:** Backend Web Development  
**Problem Statement ID:** HACK-P309  
**Project Title:** Farmer Marketplace (KisanSetu)  
**Recommended Length:** 12 Professional Slides

---

## Slide 1: Title Slide
- **Project Title:** KisanSetu — Direct-to-Consumer Farmer Marketplace
- **Problem Statement ID:** HACK-P309 (Agriculture)
- **Subject:** Backend Web Development
- **Team Name:** AgriInnovators
- **Team Details (4 Members):**
  - Member 1 (Lead): D Prasoon | Roll: 25MVCAIR0032
  - Member 2: B Ashwith Reddy | Roll: 25MVCAIR0018
  - Member 3: A Snehith | Roll: 25MVCAIR0007
  - Member 4: G Vinay | Roll: 25MVCAIR0040
- **Faculty Mentor:** Department of Computer Science & Engineering

---

## Slide 2: Problem Statement
- **The Challenge:** Smallholder and progressive farmers face significant friction accessing fair consumer markets, losing 30-45% of crop value to commission middlemen and arbitrary APMC deductions.
- **Buyer Pain Points:** Urban households, restaurants, and grocers pay inflated retail grocery prices without transparency into harvest dates, chemical usage, or origin authenticity.
- **Core Need:** A direct, transparent online marketplace connecting verified regional farmers with consumers, featuring real-time inventory, batch traceability, and a structured order lifecycle without requiring immediate multi-tier logistics overhead.

---

## Slide 3: Objectives & Proposed Solution
- **Empower Farmers:** Simple self-serve produce publishing (name, unit, price, harvest date, photos, delivery/pickup options).
- **Consumer Transparency:** Search, compare, and filter produce by region, category, price, and organic certification.
- **Fair Economic Discovery:** Real-time benchmark comparing direct farmer prices against APMC mandis and retail supermarket rates.
- **Reliable Order Lifecycle:** Automated order status tracking (`requested` ➔ `accepted` ➔ `ready` ➔ `completed` or `cancelled`) with strict atomic inventory checks.

---

## Slide 4: Key Features Implemented
- **Multi-Role Authentication:** Dedicated dashboards for Farmers, Buyers, and Admin with instant 1-click evaluation persona switching.
- **Catalog & Advanced Filtering:** Search by keyword, category pills, price range, harvest date, location, and organic certification.
- **Atomic Stock Management:** Strict order ceiling preventing overselling; automated stock restoration upon cancellation.
- **Interactive Order Tracking:** Visual stepper tracking order fulfillment progress with cancellation capability.
- **Farmer Inventory & Sales Suite:** Real-time stock bar, sales revenue metrics, produce creation/edit modal, and incoming order management.
- **Admin Moderation Portal:** Platform GMV metrics, listing audit/flagging tools, and user directory.
- **Optional Advanced Modules:** Multilingual UI (English, Hindi, Spanish), Mandi price trends, and batch traceability inspect modal.

---

## Slide 5: Technology Stack
- **Frontend Architecture:**
  - React 19 + Vite (Fast compilation, modular components)
  - Tailwind CSS v4 (Modern responsive styling, mobile-optimized)
  - Lucide React (Accessible, lightweight icons)
- **Backend Architecture:**
  - Node.js (v24 LTS) + Express.js
  - RESTful API design with structured HTTP status codes
  - JWT (JSON Web Tokens) & bcryptjs password hashing
  - Morgan HTTP logger & CORS configuration
- **Database & Persistence:**
  - LibSQL / SQLite (Relational ACID database, zero-config file storage, prepared statements, foreign key integrity)

---

## Slide 6: System Architecture
*(Include Diagram from `docs/architecture.md`)*
- **Presentation Layer:** React single-page client consuming REST endpoints via async JSON requests.
- **Application Layer:** Express router with authentication and role-based access control (RBAC) middleware.
- **Controller & Service Layer:** Modular controllers encapsulating business logic (stock validation, status transition, price benchmarks).
- **Data Persistence Layer:** Relational SQLite tables with relational foreign keys (`users`, `products`, `orders`, `order_items`, `moderation_logs`).

---

## Slide 7: Backend Implementation Highlights
- **Atomic Inventory Deductions:**
  - Database queries verify available stock before creating order items.
  - Returns explicit HTTP `400 Bad Request` with itemized shortage details if requested quantity exceeds inventory.
- **Automated Stock Restoration:**
  - When an order transitions to `cancelled`, a database loop adds item quantities back to the corresponding produce row.
- **Role-Based Security Guards:**
  - `requireRole('farmer')`: Restricts produce creation and inventory adjustments.
  - `requireRole('admin')`: Restricts platform moderation and user audits.

---

## Slide 8: Database Design & Schema
- **Relational Tables:**
  - `users`: User identity, role (`farmer`, `buyer`, `admin`), farm name, bio, location.
  - `products`: Agricultural produce with unit, price, available quantity, harvest date, organic badge, batch number, moderation status.
  - `orders`: Master order record with unique `order_number`, buyer reference, fulfillment option, status, cancellation reason.
  - `order_items`: Line items capturing point-in-time price, unit, quantity, and subtotal.
  - `moderation_logs`: Audit trail of admin actions on flagged listings.
- **Indexes:** Indexed on `farmer_id`, `category`, `status`, and `buyer_id` for fast query performance.

---

## Slide 9: Application Screenshots & Workflows
- **Screenshot 1:** Home Marketplace Catalog with organic produce cards and live stock bars.
- **Screenshot 2:** Slide-over Cart with fulfillment selection and prototype safety notice.
- **Screenshot 3:** Buyer Dashboard showing visual 4-stage order tracking stepper.
- **Screenshot 4:** Farmer Dashboard with revenue KPIs, produce management modal, and incoming orders.
- **Screenshot 5:** Admin Moderation Queue and Mandi Price Benchmark Comparison.

---

## Slide 10: Testing & Validation Results
- **Automated Test Results:**
  - 6 / 6 automated test suites passed (`npm test`).
  - Stock limit rejection verified: Attempting to order `stock + 100` returns HTTP 400.
  - Stock deduction verified: Ordering 5 units decrements inventory by 5.
  - Stock restoration verified: Cancelling order refunds 5 units back to inventory.
  - Order lifecycle state transitions tested across all 4 valid states.
- **Manual & Postman Testing:**
  - Comprehensive sanitized Postman collection created and verified against all endpoints.

---

## Slide 11: Deployment & Challenges Overcome
- **Deployment Strategy:**
  - Frontend ready for Vercel / Netlify with client routing rules.
  - Backend ready for Render / Railway with environment variable configuration.
  - Database runs seamlessly via local SQLite file or Turso Cloud LibSQL.
- **Challenges Overcome:**
  - Handling concurrency and overselling: Solved via atomic database transactions.
  - Cross-platform Node 24 support without native C++ compilation: Solved using modern `@libsql/client`.
  - Realistic multi-persona demo: Solved via instant 1-click demo switcher.

---

## Slide 12: Conclusion & Future Scope
- **Project Achievements:**
  - Developed a robust, fully working Full-Stack application strictly fulfilling all requirements of HACK-P309.
  - Seeded with 6 regional farmers, 3 buyers, 1 admin, 18 products, and active orders.
- **Future Roadmap:**
  - IoT soil sensor integration for live field health telemetry.
  - Direct integration with regional electric vehicle (EV) rural logistics cooperatives.
  - Smart contract escrow settlement for bulk wholesale B2B transactions.

