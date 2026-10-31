# 🎬 Demo Video Presentation Script — HACK-P309: Farmer Marketplace

**Total Video Duration:** 4.5 – 5.0 Minutes  
**Subject:** Backend Web Development  
**Problem Statement:** HACK-P309 — Farmer Marketplace  
**Team Name:** AgriInnovators (4 Students)

---

## Part 1: Introduction (30 – 45 seconds)
**Visual on Screen:** Slide 1 / Title screen showing Problem ID HACK-P309, Team Name, and student names, then transition to live application home screen.

> **Speaker 1 (Team Lead):**  
> *"Hello respected evaluators and faculty members. Welcome to the demonstration of our Backend Web Development hackathon project: **KisanSetu — Farmer Marketplace**, addressing problem statement **HACK-P309** in the Agriculture domain.  
> Our team comprises four members: D Prasoon as Team Lead, B Aswith Reddy, A Snehith, and G Vinay.  
> The core problem we are solving is the market friction faced by regional farmers who lose significant margins to commission middlemen, while consumers pay inflated prices without knowing harvest freshness or origin authenticity. Our solution provides an online direct marketplace with transparent pricing, batch traceability, and a strict order lifecycle."*

---

## Part 2: System Overview (30 – 45 seconds)
**Visual on Screen:** Quick view of the architecture diagram from `docs/architecture.md`.

> **Speaker 2:**  
> *"Our project is architected as a complete full-stack web application:  
> - **Frontend:** Built with React 19 and Tailwind CSS, featuring responsive dashboards, multi-language support in English, Hindi, and Spanish, and a quick persona switcher for evaluation.  
> - **Backend:** A Node.js and Express RESTful API with structured routing, JWT authentication, and role-based access control guards.  
> - **Database:** A relational SQLite database powered by LibSQL with foreign key integrity, managing users, products, orders, items, and moderation logs.  
> We support three distinct user roles: **Farmers**, **Buyers**, and **Platform Administrators**."*

---

## Part 3: Working Demonstration (1.5 – 2.0 minutes)
**Visual on Screen:** Live browser screen recording of the running application (`http://localhost:5173`).

> **Speaker 3 (Buyer Workflow):**  
> *"Let's examine the live user experience. As a Buyer, we can browse produce listings from certified farmers across Maharashtra, Punjab, Himachal Pradesh, Tamil Nadu, and Gujarat.  
> Notice how every item displays the farm origin, price per unit, harvest date, and a live inventory stock bar.  
> Let's filter by 'Vegetables' and toggle 'In Stock Only'. Clicking on 'Nashik Red Quality Onions' opens the traceability modal showing the batch ID and farmer Rajesh Patel's bio.  
> Now let's add 5 kg to our cart. The slide-over cart opens. Notice our prototype safety notice stating that all payments and deliveries are simulated for hackathon safety.  
> We choose 'Farm Depot Pickup' with cash on pickup, and click 'Confirm Order Request'.  
> The order is placed instantaneously and we are redirected to our Buyer Dashboard! Look at the interactive 4-stage stepper currently in the 'Requested' stage."*

> **Speaker 4 (Farmer & Admin Workflow):**  
> *(Clicks top-right Demo Persona switcher to switch to 'Farmer - Rajesh Patel')*  
> *"Now let's switch personas to Farmer Rajesh Patel. Instantly, our Farmer Dashboard opens showing live metrics: ₹7,450 in sales, 3 active listings, and 1 pending order.  
> In the 'Incoming Orders' tab, we see the order just placed by Priya Sharma!  
> Let's click 'Accept Order & Start Packing'. The status immediately transitions to 'Accepted'. If we switch back to the buyer view, the progress bar has advanced in real time!  
> Farmers can also list new produce using this modal, where name, category, unit, harvest date, and stock are configured.  
> Finally, let's switch to the **Admin Portal**. Here the platform administrator can audit total GMV, view all registered users, and moderate listings—such as flagging suspicious duplicates or re-approving verified produce."*

---

## Part 4: Backend & Database Operations (45 – 60 seconds)
**Visual on Screen:** Terminal showing `npm test` passing, and VS Code / Postman showing API requests and database queries.

> **Speaker 1:**  
> *"Now let's verify the backend business logic and database integrity.  
> In our terminal, let's run `npm test`.  
> Notice that all 6 automated test suites pass in under 2 seconds:  
> 1. Database seed verification: 6 farmers and 18 products exist.  
> 2. Strict Stock Limit Enforcement: Ordering more than available stock is rejected with an HTTP 400 Bad Request.  
> 3. Atomic stock deduction: An order of 5 units atomically decrements stock from 800 to 795 kg.  
> 4. Order cancellation: When an order is cancelled, the 5 units are atomically restored back to 800 kg.  
> 5. Full order lifecycle states: Successfully validated through requested, accepted, ready, and completed.  
> 6. Admin moderation logging: Audited and verified.  
> All API endpoints are thoroughly documented in `docs/api-documentation.md` alongside an exportable Postman collection."*

---

## Part 5: Deployment & Conclusion (20 – 30 seconds)
**Visual on Screen:** Live deployed application URL and GitHub repository overview.

> **Speaker 2:**  
> *"In conclusion, KisanSetu delivers a production-grade, tested, and fully functional prototype solving HACK-P309. It empowers farmers with direct market access, gives buyers guaranteed harvest transparency, and enforces strict inventory safety.  
> The complete source code, test evidence, documentation, and architecture diagrams are maintained in our GitHub repository.  
> Thank you for your time and evaluation!"*

