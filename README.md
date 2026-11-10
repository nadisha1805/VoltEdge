# VOLTEDGE ELECTRONICS
> **Tagline:** Powering Your Digital World.  
> **Project Type:** Electronics Showroom Website & E-commerce Platform  
> **Milestone:** 2 of 4 – Admin Dashboard & Showroom Management System

---

## ⚡ Overview

**VOLTEDGE Electronics** is a high-performance showroom website and modern e-commerce platform dedicated to consumer electronics, premium computing workstations, audiophile headphones, next-gen gaming gear, and intelligent smart home ecosystems.

This repository contains the complete implementation of **Milestone 2: Admin Dashboard & Showroom Management System**, seamlessly extending the foundation established in Milestone 1 without breaking existing customer-facing features.

It equips showroom administrators and staff with a centralized, secure management interface to govern inventory, monitor stock movements, process orders, review customer analytics, configure promotions, oversee staff roles, manage enquiries, and generate business intelligence reports.

---

## 🛠 Technology Stack

### Frontend (`/client`)
- **Framework:** React 19 + TypeScript + Vite
- **Styling:** Tailwind CSS (Custom VOLTEDGE Design System with Deep Navy, Electric Blue, Light Backgrounds)
- **Routing:** React Router v7
- **HTTP Client:** Axios with JWT & Cookie Interceptors
- **Iconography:** Lucide React
- **Typography:** Plus Jakarta Sans & Inter
- **Data Visualization:** Interactive Custom SVG Line/Area Charts, Bar Charts, and Donut Charts

### Backend (`/server`)
- **Runtime:** Node.js v24
- **Framework:** Express.js (ESM) + TypeScript
- **Security & Auth:** `bcryptjs` (password hashing), `jsonwebtoken` (JWT sessions), `cookie-parser` (HTTP-only secure cookies)
- **Storage & Uploads:** `multer` with file validation (JPEG, PNG, WebP) and static image serving (`/uploads`)
- **Architecture:** Protected REST APIs, Role-Based Access Control (RBAC) middleware, centralized audit logger, and transaction-safe operations

### Database & ORM (`/server/prisma`)
- **ORM:** Prisma ORM v5.22
- **Database Engine:** SQLite by default (`file:./dev.db`) with zero-configuration out-of-the-box support, plus dual schema configuration for PostgreSQL (`schema.postgresql.prisma`)

---

## 🔐 Role-Based Access Control (RBAC) Matrix

The backend enforces four strict hierarchical permission tiers:

| Module / Operation | Super Admin (`SUPER_ADMIN`) | Admin / Manager (`ADMIN`) | Inventory Manager (`INVENTORY_MANAGER`) | Sales Staff (`SALES_STAFF`) |
|---|:---:|:---:|:---:|:---:|
| **Dashboard Telemetry** | Full Access | Full Access | Inventory Metrics | Permitted Stats |
| **Product Management** | CRUD & Archive | CRUD & Archive | View Only | View Only |
| **Category & Brand Management** | Full Control | Full Control | View Only | View Only |
| **Inventory & Stock Adjustments** | Full Control | Full Control | Full Control | View Stock Only |
| **Stock Movement Ledger** | Full Audit Trail | Full Audit Trail | Full Audit Trail | View Only |
| **Order Management** | Full Progression | Full Progression | View Items | Status / Sales View |
| **Customer Directory** | Full Profile & Notes | Full Profile & Notes | View Only | Permitted Ops |
| **Coupons & Promotions** | Create & Manage | Create & Manage | View Only | View Only |
| **Staff & Credential Admin** | **Exclusive Access** | Forbidden (403) | Forbidden (403) | Forbidden (403) |
| **Customer Enquiries** | Full Workflow | Full Workflow | View Only | View Only |
| **Newsletter & CSV Export** | Full Access | Full Access | View Only | View Only |
| **Business Reports & CSV** | Full Reports | Full Reports | Inventory Reports | Basic Reports |
| **Showroom Settings** | **Full Edit** | View Only | View Only | View Only |

### Demo Accounts for Testing

| Role | Staff Name | Email Address | Password |
|---|---|---|---|
| **Super Admin** | Vikram Malhotra | `admin@voltedge.com` | `AdminPassword@123` |
| **Admin / Manager** | Priya Sharma | `manager@voltedge.com` | `ManagerPassword@123` |
| **Inventory Manager** | Rahul Verma | `inventory@voltedge.com` | `InventoryPassword@123` |
| **Sales Staff** | Ananya Patel | `sales@voltedge.com` | `SalesPassword@123` |

*(Convenience demo-pill buttons on `/admin/login` allow 1-click credential population for rapid evaluation).*

---

## 🚀 Admin Dashboard Modules (Milestone 2 Scope)

1. **Dashboard Overview (`/admin`)**
   - 8 Real-time Summary Cards: Total Products, Categories, Brands, Customers, Orders, Revenue (calculated strictly from actual paid orders), Low Stock Alert, Pending Enquiries.
   - Interactive Area Line Chart: Revenue & orders overview timeline.
   - Donut Chart: Inventory status breakdown (In Stock, Low Stock, Out of Stock).
   - Bar Chart: Product category distribution.
   - Top Selling Products: High velocity hardware ranked by fulfilled units.
   - Administrative Audit Ledger: Real-time table of recent administrative activity logs.

2. **Product Management (`/admin/products`)**
   - Filterable data table with live search, category, brand, and stock status filters.
   - Multi-column sorting (name, price, stock, newest).
   - Rich Add/Edit modal: Name, SKU, category, brand, selling price, cost price (for valuation), compare-at price, stock quantity, warranty info, tags, and hardware specification key-values.
   - Image manager: Upload local files or paste image URLs, preview gallery, set primary image, delete images.
   - Safe Deletion & Archival: Soft-archives products that have historical customer order records to protect financial audit trails; safe hard-deletion only for unreferenced items.

3. **Category Management (`/admin/categories`)**
   - Visual category cards showing product counts, cover photos, and display order.
   - Full parent-child hierarchical taxonomy support.
   - Safeguard: Prevents deleting categories containing active products unless products are explicitly reassigned to an alternate category.

4. **Brand Management (`/admin/brands`)**
   - Partner brand directory with logos, descriptions, and storefront feature flags.
   - Product count indicators and relationship integrity guards.

5. **Inventory & Stock Control (`/admin/inventory`)**
   - Total stock units, in-stock count, low-stock count, out-of-stock count.
   - **Explicit Valuation Methodology:** Standard Cost Valuation basis calculated as $\sum(\text{Unit Cost Price} \times \text{On-Hand Quantity})$, alongside showroom retail valuation.
   - Stock adjustment dialog: Record atomic stock updates (`STOCK_IN`, `STOCK_OUT`, `ADJUSTMENT`, `RETURN_RESTOCK`, `CORRECTION`) with mandatory reason and reference number.

6. **Stock Movements Ledger (`/admin/inventory/movements`)**
   - Transactional audit log recording previous quantity, change amount, new balance, movement type, reason, PO/invoice reference, authorized staff member, and timestamp.
   - Filterable by movement type and product SKU.

7. **Order Management Foundation (`/admin/orders`)**
   - Filterable orders table (Pending, Confirmed, Processing, Shipped, Delivered, Cancelled).
   - Order detail drawer: Item breakdown with SKU and images, customer contact info, delivery address, financial summary (subtotal, coupon discount, GST taxes, shipping fee, grand total).
   - Chronological status timeline tracking every status progression and staff notes.

8. **Customer Directory (`/admin/customers`)**
   - Directory listing customer profiles, contact numbers, registration dates, total orders, and cumulative lifetime spend.
   - Profile drawer with address books, order purchase history, relationship notes, and status toggles (`ACTIVE`, `INACTIVE`, `BLOCKED`).

9. **Coupons & Promotions (`/admin/coupons`)**
   - Coupon configuration: Percentage discount or fixed amount off.
   - Controls for minimum order spend, maximum discount cap, total usage limit, and expiration dates.
   - Instant activation/pause toggle.

10. **Staff & Access Control (`/admin/staff`)**
    - Super Admin-protected staff directory.
    - Provision new staff accounts with bcrypt password encryption.
    - Assign departmental roles and permissions.
    - Account activation/deactivation switch.
    - Secure password reset dialog.

11. **Customer Enquiries (`/admin/enquiries`)**
    - Concierge inbox tracking contact submissions from showroom visitors.
    - Status progression: `NEW` $\to$ `IN_PROGRESS` $\to$ `RESOLVED` $\to$ `ARCHIVED`.
    - Internal concierge notes and staff assignment.

12. **Newsletter Management (`/admin/newsletter`)**
    - Subscriber list with search and subscription status toggles.
    - 1-Click CSV audience export download.

13. **Business Reports & Analytics (`/admin/reports`)**
    - 6 Comprehensive Reports: Product Report, Inventory Report, Low Stock Report, Out of Stock Report, Sales & Revenue Report, Customer Spend Report.
    - Time filters: Today, Last 7 Days, Last 30 Days, This Month, Custom Date Range.
    - Instant CSV export download for any active report.

14. **Showroom Settings (`/admin/settings`)**
    - Store name, brand tagline, support email, showroom phone, address, and operating hours.
    - Operational parameters: Low-stock threshold trigger (units) and default GST tax rate (%).
    - Self-service password change utility for the authenticated administrator.

---

## 🌐 Complete REST API Endpoints

### Public Storefront Routes
- `GET /api/health` – API status & DB connectivity
- `GET /api/products` – Catalog query with filters & pagination
- `GET /api/products/:identifier` – Product detail by ID or slug
- `GET /api/categories` – Category list with product counts
- `GET /api/brands` – Brand list with product counts
- `GET /api/banners` – Homepage banners
- `GET /api/testimonials` – Customer testimonials
- `POST /api/newsletter/subscribe` – Newsletter opt-in
- `POST /api/enquiries` – Public customer contact form submission

### Protected Admin Routes (`/api/admin/*`)
- `POST /api/admin/auth/login` – Staff authentication (sets HTTP-only cookie + returns JWT)
- `POST /api/admin/auth/logout` – Invalidate session
- `GET /api/admin/auth/me` – Current authenticated staff profile
- `PUT /api/admin/auth/password` – Update current staff password
- `GET /api/admin/dashboard/overview` – 8 Core KPI summary metrics
- `GET /api/admin/dashboard/analytics` – Chart telemetry & top-moving items
- `GET /api/admin/dashboard/recent-activity` – Administrative audit log feed
- `GET /api/admin/products` – Paginated catalog with advanced filters
- `POST /api/admin/products` – Create new product & log initial stock movement
- `GET /api/admin/products/:id` – Product detail with inventory history
- `PUT /api/admin/products/:id` – Update product fields & adjust stock
- `DELETE /api/admin/products/:id` – Safe deletion / soft archival
- `POST /api/admin/products/upload-images` – Multipart image file upload (Multer)
- `GET /api/admin/categories` – Categories tree & counts
- `POST /api/admin/categories` – Create category
- `PUT /api/admin/categories/:id` – Update category & hierarchy
- `DELETE /api/admin/categories/:id` – Safe deletion with product reassignment
- `GET /api/admin/brands` – Brands list
- `POST /api/admin/brands` – Create brand
- `PUT /api/admin/brands/:id` – Update brand
- `DELETE /api/admin/brands/:id` – Safe brand deletion
- `GET /api/admin/inventory/overview` – Stock units, valuation & thresholds
- `GET /api/admin/inventory` – Inventory list with cost valuations
- `POST /api/admin/inventory/adjust` – Transactional stock adjustment & movement log
- `GET /api/admin/inventory/movements` – Stock movement audit ledger
- `GET /api/admin/orders` – Paginated order listing with status filters
- `GET /api/admin/orders/:id` – Full order details, items & timeline
- `PATCH /api/admin/orders/:id/status` – Update order/payment status with staff comment
- `GET /api/admin/customers` – Customer directory & spend ranking
- `GET /api/admin/customers/:id` – Customer profile, address book & order history
- `PUT /api/admin/customers/:id` – Update customer status & concierge notes
- `GET /api/admin/coupons` – Active and archived promotions
- `POST /api/admin/coupons` – Create promotional coupon
- `PUT /api/admin/coupons/:id` – Update coupon parameters
- `DELETE /api/admin/coupons/:id` – Delete or archive coupon
- `GET /api/admin/staff` – Staff directory *(Super Admin only)*
- `POST /api/admin/staff` – Add staff member *(Super Admin only)*
- `PUT /api/admin/staff/:id` – Update staff details *(Super Admin only)*
- `PATCH /api/admin/staff/:id/status` – Toggle staff activation *(Super Admin only)*
- `POST /api/admin/staff/:id/reset-password` – Reset staff credentials *(Super Admin only)*
- `GET /api/admin/enquiries` – Concierge customer enquiries
- `PATCH /api/admin/enquiries/:id/status` – Update enquiry status & staff notes
- `DELETE /api/admin/enquiries/:id` – Remove enquiry
- `GET /api/admin/newsletter` – Newsletter audience list
- `GET /api/admin/newsletter/export` – Export subscriber emails to CSV
- `PATCH /api/admin/newsletter/:id/status` – Toggle subscriber active status
- `DELETE /api/admin/newsletter/:id` – Remove subscriber
- `GET /api/admin/reports/summary` – Summary metrics for selected time window
- `GET /api/admin/reports/products` – Product inventory report (JSON / CSV)
- `GET /api/admin/reports/inventory` – Inventory health report (JSON / CSV)
- `GET /api/admin/reports/sales` – Orders & sales ledger report (JSON / CSV)
- `GET /api/admin/reports/customers` – Customer spend report (JSON / CSV)
- `GET /api/admin/settings` – Showroom operational parameters
- `PUT /api/admin/settings` – Update showroom configuration *(Super Admin only)*

---

## 🏃 Setup & Execution Instructions

### 1. Prerequisites
- **Node.js:** v18+ (tested on Node.js v24)
- **npm:** v9+

### 2. Environment Configuration
The server `.env` file is pre-configured for zero-configuration local SQLite development:
```env
PORT=5000
DATABASE_URL="file:./dev.db"
NODE_ENV=development
JWT_SECRET=voltedge-super-secret-jwt-key-milestone-2-2026
```

### 3. Database Synchronization & Seeding
From the root directory:
```bash
# Push Prisma schema and seed Milestone 1 catalog + Milestone 2 showroom data
npm run seed
```
*(Provisions 16 catalog products, 6 categories, 8 brands, 4 staff accounts, sample orders, customers, coupons, and enquiries).*

### 4. Running the Application
```bash
# Run both Frontend (port 3000) and Backend (port 5000) concurrently:
npm run dev
```
- **Customer Storefront:** `http://localhost:3000`
- **Admin Management Console:** `http://localhost:3000/admin`
- **Admin Login:** `http://localhost:3000/admin/login`
- **Backend API & Health:** `http://localhost:5000/api/health`

### 5. Running the Automated Test Suite
Run the 28-point automated backend test suite:
```bash
npm test
```

---

## 📋 Milestone 2 Verification & Test Results

The automated test suite (`server/test-m2-api.js`) executes 28 comprehensive test scenarios:

| # | Test Scenario | Module | Result |
|---|---|---|:---:|
| 1 | Health Check endpoint & DB ping | System | **PASS** |
| 2 | Super Admin login & JWT generation | Auth | **PASS** |
| 3 | Invalid credentials rejection (401) | Security | **PASS** |
| 4 | Sales Staff login with scoped role | Auth | **PASS** |
| 5 | Session restoration via `/auth/me` | Auth | **PASS** |
| 6 | RBAC: Sales Staff blocked from Staff module (403) | Security | **PASS** |
| 7 | Dashboard Overview: 8 real database KPI counts | Dashboard | **PASS** |
| 8 | Dashboard Analytics: Category & stock breakdown | Dashboard | **PASS** |
| 9 | Audit Log: Administrative activity chronological feed | Audit | **PASS** |
| 10 | Product Creation with SKU uniqueness & initial movement | Products | **PASS** |
| 11 | Product Editing & pricing update | Products | **PASS** |
| 12 | Inventory Valuation: Standard cost basis calculation | Inventory | **PASS** |
| 13 | Stock Adjustment: Transactional update & movement entry | Inventory | **PASS** |
| 14 | Stock Movement Ledger query by product | Inventory | **PASS** |
| 15 | Order Listing with customer & total amounts | Orders | **PASS** |
| 16 | Order Status Progression to `DELIVERED` with timeline note | Orders | **PASS** |
| 17 | Customer Directory with lifetime spend aggregation | Customers | **PASS** |
| 18 | Coupon Creation with discount threshold | Coupons | **PASS** |
| 19 | Staff Creation & password encryption | Staff | **PASS** |
| 20 | Customer Enquiries retrieval & search | Enquiries | **PASS** |
| 21 | Enquiry Status Update to `IN_PROGRESS` with concierge note | Enquiries | **PASS** |
| 22 | Newsletter Subscriber listing | Newsletter | **PASS** |
| 23 | Newsletter CSV Export generation | Newsletter | **PASS** |
| 24 | Business Reports Summary with 30-day date filter | Reports | **PASS** |
| 25 | Product Report CSV generation | Reports | **PASS** |
| 26 | Showroom Settings retrieval & update | Settings | **PASS** |
| 27 | Public Customer Contact Enquiry submission | Storefront | **PASS** |
| 28 | Milestone 1 Storefront Compatibility: Catalog retrieval | Storefront | **PASS** |

---

## 🔮 Scope Boundaries & Preparation for Milestone 3

Per Milestone 2 specifications, the following advanced customer features are intentionally reserved for **Milestone 3 (Shopping Cart, Customer Checkout & Payment Gateway)** and **Milestone 4 (Customer Account Portal, Warranty Claims & Services)**:

- Customer self-registration and public login
- Customer order placement and live payment gateways (Razorpay / Stripe)
- Automated transactional SMS / email order confirmations
- Customer repair & service booking tracking
- Multi-branch physical POS synchronization

All underlying database models (`Customer`, `CustomerAddress`, `Order`, `OrderItem`, `OrderStatusHistory`, `Coupon`, `CouponUsage`) are fully defined, relational, and ready for immediate plug-and-play integration in Milestone 3.

---

**VOLTEDGE Electronics**  
*Powering Your Digital World.*  
*Milestone 2 Completed Successfully.*
