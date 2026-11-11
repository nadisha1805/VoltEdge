# VOLTEDGE ELECTRONICS
> **Tagline:** Powering Your Digital World.  
> **Project Type:** Electronics Showroom Website & E-commerce Platform  
> **Milestone:** 3 of 4 – Customer Portal, Shopping Cart, Checkout & Payment Integration

---

## ⚡ Overview

**VOLTEDGE Electronics** is a high-performance showroom website and modern e-commerce platform dedicated to consumer electronics, premium computing workstations, audiophile headphones, next-gen gaming gear, and intelligent smart home ecosystems.

This repository represents the complete implementation of **Milestone 3: Customer Portal, Shopping Cart, Checkout & Payment Integration**, extending Milestone 1 (Storefront Catalog) and Milestone 2 (Admin Dashboard & Inventory Management) into a complete, end-to-end e-commerce application.

Customers can register, log in securely with HTTP-only cookies, manage profile details and multiple delivery addresses, save items to their persistent wishlist, add items to a synchronized shopping cart, compare technical specifications side-by-side, apply promotional discount coupons, checkout with real-time stock reservation, make secure online payments via Razorpay (test mode) or Cash on Delivery (COD), track live order status timelines, submit verified-purchase product reviews, and view or download tax invoices.

All customer transactions seamlessly integrate into the **Milestone 2 Admin Dashboard**, automatically logging inventory stock movements, updating customer total spend statistics, and enabling showroom staff to fulfill orders.

---

## 🛠 Technology Stack

### Frontend (`/client`)
- **Framework:** React 19 + TypeScript + Vite
- **Styling:** Tailwind CSS (VOLTEDGE Design System: Deep Slate/Navy `#0f172a`, Electric Cyan `#38bdf8`, Electric Blue `#2563eb`)
- **Routing:** React Router v7
- **HTTP Client:** Axios with JWT, Cookie, and Guest-Token interceptors
- **State & Contexts:** `CustomerAuthContext`, `CartContext`, `WishlistContext`, `CompareContext`, `ToastContext`, `AdminAuthContext`
- **Iconography:** Lucide React
- **Payments:** Official Razorpay Checkout integration with client-side modal and server-side HMAC-SHA256 signature verification

### Backend (`/server`)
- **Runtime:** Node.js v24
- **Framework:** Express.js (ESM) + TypeScript
- **Security & Auth:** `bcryptjs` (password hashing), `jsonwebtoken` (JWT customer & admin sessions), `cookie-parser` (HTTP-only secure cookies)
- **Payment Gateway:** Official `razorpay` Node.js SDK with test mode, cryptographic HMAC-SHA256 verification, and idempotent webhook listeners
- **Transactional Consistency:** Prisma `$transaction` operations for checkout, stock deduction, and inventory movement audit logs
- **Notifications:** Reusable branded HTML email templates with `nodemailer` and graceful fallback logging in development

### Database & ORM (`/server/prisma`)
- **ORM:** Prisma ORM v5.22
- **Database Engine:** SQLite by default (`file:./dev.db`) for zero-configuration testing, and PostgreSQL schema support (`schema.postgresql.prisma`)

---

## 🔐 Customer Portal & E-Commerce Features (Milestone 3)

### 1. Customer Authentication System
- **Registration (`/register`):** Full name, email, phone, password strength checks, confirm password, terms acceptance, duplicate email rejection.
- **Login (`/login`):** Email & password validation, remember me, secure HTTP-only cookie + JWT token generation.
- **Guest-to-Customer Cart Merge:** Unauthenticated guest cart items automatically merge into the customer's account upon login without duplicate items or stock over-allocation.
- **Password Reset (`/forgot-password`, `/reset-password`):** Time-limited, single-use cryptographic reset tokens with email notifications.
- **Customer Isolation:** Ownership verification enforced on all customer routes; customers can never access or modify other customers' carts, addresses, orders, or invoices.

### 2. Customer Account Dashboard (`/account`)
- **Overview:** Total orders, saved wishlist items, total showroom expenditure, and recent order history.
- **My Profile:** View profile, update name and phone number, change account password.
- **My Addresses:** Multi-address management (Home, Work, Other), set default shipping address, inline editing and deletion.
- **My Orders:** View order progression, payment status, tracking reference, and one-click tax invoice access.
- **My Wishlist:** Persistent saved products, view live availability, move products directly to cart.

### 3. Shopping Cart System (`/cart`)
- Add to cart, adjust quantities, remove items, clear cart.
- Authoritative backend recalculation of unit prices, 18% GST estimate, and delivery charges.
- Real-time stock limitations: prevents adding out-of-stock items or exceeding on-hand inventory.
- Cart persistence across browser sessions for authenticated customers and guests.

### 4. Product Comparison Matrix (`/compare`)
- Compare up to 4 products side-by-side.
- Compares brand, category, unit price, stock availability, star ratings, and technical specifications dynamically.
- Category compatibility validation to keep comparisons meaningful.

### 5. Multi-Step Checkout System (`/checkout`)
- **Step 1 (Delivery Address):** Select saved address or add a new delivery address with phone and PIN code.
- **Step 2 (Shipping Method):** Standard Delivery (Free over ₹50,000, else ₹499) or Express Priority Delivery (₹999).
- **Step 3 (Payment Method):** Razorpay Online Checkout (UPI, Cards, Net Banking) or Cash on Delivery (COD).
- **Step 4 (Coupon & Review):** Apply coupon codes with backend validation of start/end dates, minimum order spend, maximum discount caps, and per-customer usage limits.
- **Atomic Order Creation:** Order creation and inventory stock deduction run inside an ACID Prisma database transaction, recording inventory movement audit records (`STOCK_OUT`) linked to the customer order number.

### 6. Payment Gateway Integration (Razorpay)
- **Official Supported Flow:**
  1. Frontend submits checkout request; backend validates stock and creates pending order.
  2. Backend generates Razorpay order using Key ID and Key Secret.
  3. Frontend opens Razorpay Checkout modal.
  4. Backend verifies HMAC-SHA256 signature (`order_id|payment_id`) against `RAZORPAY_KEY_SECRET`.
  5. Order and Payment status transition to `PAID` / `CONFIRMED` only after successful backend verification.
  6. Idempotent webhook endpoint (`/api/payments/razorpay/webhook`) validates `X-Razorpay-Signature` and prevents duplicate event processing.

### 7. Tax Invoice Generation (`/account/orders/:id`)
- Professional invoice generated strictly from saved order snapshots.
- Includes VOLTEDGE branding, showroom address, GSTIN, customer details, itemized breakdown, tax breakdown, and printable PDF styling.

### 8. Verified Product Reviews & Ratings
- 1 to 5 star ratings, review title, and written feedback on product detail pages.
- Verified Purchase badge awarded only if the customer has a confirmed/delivered order for that product.
- Automatic recalculation of product average rating and review counts.

---

## 📡 Milestone 3 REST API Endpoints

### Customer Authentication
- `POST /api/auth/register` - Create customer account
- `POST /api/auth/login` - Authenticate customer & merge guest cart
- `POST /api/auth/logout` - Clear customer session cookie
- `GET /api/auth/me` - Get authenticated customer profile
- `POST /api/auth/forgot-password` - Request password reset token & email
- `POST /api/auth/reset-password` - Reset password using time-limited token

### Customer Profile & Addresses
- `GET /api/customer/profile` - Retrieve customer profile
- `PUT /api/customer/profile` - Update customer name & phone
- `PUT /api/customer/change-password` - Change account password
- `GET /api/customer/addresses` - List customer addresses
- `POST /api/customer/addresses` - Add new delivery address
- `PUT /api/customer/addresses/:id` - Update delivery address
- `DELETE /api/customer/addresses/:id` - Delete delivery address

### Shopping Cart & Wishlist
- `GET /api/cart` - Authoritative cart with subtotal & tax
- `POST /api/cart/items` - Add item to cart (with stock limit verification)
- `PUT /api/cart/items/:id` - Update quantity
- `DELETE /api/cart/items/:id` - Remove item from cart
- `DELETE /api/cart` - Clear entire cart
- `GET /api/wishlist` - View customer wishlist
- `POST /api/wishlist` - Add item to wishlist (deduplicated)
- `DELETE /api/wishlist/:productId` - Remove item from wishlist
- `POST /api/wishlist/move-to-cart` - Move item from wishlist to cart

### Checkout & Payments
- `POST /api/checkout/validate` - Pre-flight calculation & stock check
- `POST /api/checkout/apply-coupon` - Multi-criteria coupon validation
- `POST /api/checkout/create-order` - Atomic order creation & inventory deduction
- `POST /api/payments/razorpay/create-order` - Generate Razorpay order
- `POST /api/payments/razorpay/verify` - HMAC-SHA256 signature verification
- `POST /api/payments/razorpay/webhook` - Idempotent Razorpay webhook listener

### Customer Orders & Invoices
- `GET /api/customer/orders` - Customer's order history
- `GET /api/customer/orders/:id` - Order details & timeline (Strict customer isolation)
- `GET /api/customer/orders/:id/invoice` - Tax invoice generation snapshot

### Product Reviews
- `GET /api/products/:productId/reviews` - Public approved product reviews
- `POST /api/products/:productId/reviews` - Submit review (verified purchase check)
- `PUT /api/reviews/:id` - Edit customer's review
- `DELETE /api/reviews/:id` - Delete customer's review

---

## 🧪 Testing & Quality Assurance

The codebase includes two independent automated verification test suites:

### 1. Milestone 3 Automated Test Suite (`server/test-m3-api.js`)
Verifies all 23 core Milestone 3 customer portal, shopping cart, checkout, and payment flows:
```bash
cd server && node test-m3-api.js
```
**Test Coverage:**
- ✅ Customer registration & duplicate email rejection
- ✅ Password hashing & customer login token issuance
- ✅ `/api/auth/me` and customer profile updates
- ✅ Customer address CRUD and default address assignment
- ✅ Password reset token creation & reset flow
- ✅ Server shopping cart operations with stock limitation enforcement
- ✅ Wishlist management and deduplication
- ✅ Checkout validation pre-flight calculations
- ✅ Atomic Cash on Delivery (COD) order placement & stock deduction
- ✅ Customer order history listing
- ✅ Structured tax invoice generation
- ✅ Razorpay order initiation via SDK
- ✅ Server-side HMAC-SHA256 payment signature verification
- ✅ Idempotent Razorpay webhook verification and duplicate rejection
- ✅ Customer product review submission with Verified Purchase badge
- ✅ Customer data isolation (unauthorized cross-customer order rejection)
- ✅ Seamless integration into Admin Orders dashboard

### 2. Milestone 2 Regression Test Suite (`server/test-m2-api.js`)
Ensures complete zero-regression across all 28 admin dashboard and showroom management features:
```bash
npm test
```
**Result:** All 28 tests pass with 100% success.

---

## 🚀 Getting Started

### 1. Clone & Install Dependencies
```bash
# In project root
npm run install:all
```

### 2. Environment Configuration (`server/.env`)
```env
PORT=5000
DATABASE_URL="file:./dev.db"
NODE_ENV=development
JWT_SECRET=your_admin_jwt_secret
CUSTOMER_JWT_SECRET=your_customer_jwt_secret
COOKIE_SECRET=your_cookie_secret

# Razorpay Test Credentials
RAZORPAY_KEY_ID=rzp_test_voltedge2026
RAZORPAY_KEY_SECRET=testSecretKeyVoltEdge2026
RAZORPAY_WEBHOOK_SECRET=testWebhookSecretVoltEdge2026

# Cash on Delivery Toggle
COD_ENABLED=true

# Email Notification Settings
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SMTP_FROM="VOLTEDGE Electronics <no-reply@voltedge-electronics.com>"
```
*(When SMTP credentials are blank, emails gracefully log structured previews to the console for development testing).*

### 3. Build & Run Application
```bash
# Build both client and server
npm run build

# Start Development Mode
npm run dev
```

- **Customer Storefront:** `http://localhost:5173`
- **Customer Portal:** `http://localhost:5173/account`
- **Admin Dashboard:** `http://localhost:5173/admin` (Demo logins provided on `/admin/login`)
- **Backend API:** `http://localhost:5000/api`
- **API Health Check:** `http://localhost:5000/api/health`

---

## 🔮 Scope Boundaries for Milestone 4
The following advanced features are cleanly isolated for Milestone 4:
- Advanced warranty claim tracking and RMA ticket workflows
- Physical showroom POS terminal integration
- Multi-branch inventory transfers
- Advanced customer loyalty points and tiered membership programs
- Automated third-party accounting software integrations (Tally / QuickBooks)
