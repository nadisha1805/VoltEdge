# VOLTEDGE ELECTRONICS
> **Tagline:** Powering Your Digital World.  
> **Project Type:** Electronics Showroom Website & E-commerce Platform  
> **Milestone:** 1 of 4 – Website Design & Technical Foundation

---

## ⚡ Overview

**VOLTEDGE Electronics** is a high-performance showroom website and modern e-commerce platform dedicated to consumer electronics, premium computing workstations, audiophile headphones, next-gen gaming gear, and intelligent smart home ecosystems.

This repository contains the complete implementation of **Milestone 1: Website Design & Technical Foundation**, providing a fully working, real application with a responsive React frontend, an Express REST API backend, and a Prisma ORM database layer.

---

## 🛠 Technology Stack

### Frontend
- **Framework:** React 19 + TypeScript + Vite
- **Styling:** Tailwind CSS (Custom VOLTEDGE Design System)
- **Routing:** React Router v7
- **HTTP Client:** Axios
- **Iconography:** Lucide React
- **Fonts:** Plus Jakarta Sans & Inter

### Backend
- **Runtime:** Node.js v24
- **Framework:** Express.js + TypeScript
- **Architecture:** Modular REST API Architecture with centralized error handling & CORS
- **Execution / Tooling:** tsx & TypeScript compiler

### Database & ORM
- **ORM:** Prisma ORM v5
- **Database Engine:** SQLite (zero-configuration local development) with dual schema configuration for PostgreSQL (`schema.postgresql.prisma`)

---

## 🎨 Branding & Design System

VOLTEDGE Electronics features a premium, modern, and technology-focused visual identity:

| Brand Color | Hex Code | Purpose |
|---|---|---|
| **Deep Navy** | `#10243A` | Primary brand headers, hero sections, and footer |
| **Electric Blue** | `#2563EB` | Primary accents, interactive buttons, focus rings |
| **Light Background** | `#F7F9FC` | Clean, spacious page canvas |
| **Pure White** | `#FFFFFF` | Elevated product cards and modals |
| **Text Primary** | `#202B3C` | High-contrast readable typography |
| **Muted Grey** | `#64748B` | Secondary captions, metadata, and borders |

---

## 🚀 Customer-Facing Website (Milestone 1 Scope)

### A. Homepage Sections (18 Components Implemented)
1. **Announcement Bar:** Dismissible promotional bar highlighting showroom walk-in hours, nationwide express shipping, and manufacturer warranty.
2. **Header with VOLTEDGE Logo:** Custom electric bolt branding badge and typography.
3. **Navigation Menu:** Multi-category navigation linking directly into filtered catalog views.
4. **Search Bar:** Global live search input with query submission to catalog.
5. **Account Icon Placeholder:** Dropdown menu indicating Milestone 2 authentication roadmap.
6. **Wishlist Icon Placeholder:** Interactive badge count and slide-over Wishlist drawer with 1-click move to cart.
7. **Shopping Cart Icon Placeholder:** Interactive badge count, free shipping progress bar, subtotal calculator, item counter, and slide-out Cart drawer.
8. **Premium Hero Banner with CTA:** Headline *"Powering Your Digital World"*, showcase visual of flagship hardware, and direct action triggers.
9. **Shop by Category Section:** Interactive grid with custom icons (Laptops & Computers, Smartphones & Tablets, Audio & Headphones, Smartwatches, Gaming Gear, Smart Home).
10. **Featured Products Section:** Showroom highlight cards with pricing, ratings, and instant actions.
11. **Best Sellers Section:** Community-favorite hardware and top-rated devices.
12. **Latest Arrivals Section:** 2026 releases and flagship models.
13. **Special Offers Section:** Discount badges, original price strikethroughs, and savings indicators.
14. **Featured Brands Section:** Partner brand showcase (Apple, Sony, Samsung, Dell, ASUS ROG, Bose, Logitech, Keychron).
15. **Why Choose VOLTEDGE Section:** Key value propositions (100% Genuine Tech, White-Glove Courier, 30-Day Showroom Trial, Expert Tech Concierge).
16. **Customer Testimonials Section:** Verified customer reviews with star ratings and buyer roles.
17. **Newsletter Subscription Section:** Functional newsletter signup with client/server validation, status messages, and database storage.
18. **Complete Footer:** Showroom hours, address, contact details, quick links, category navigation, and trust badges.

### B. Shop / All Products Catalog Page
- **Product Search:** Live text search filtering across product titles, descriptions, and tags.
- **Category Filtering:** Department selection with dynamic count badges.
- **Brand Filtering:** Multi-brand filter list.
- **Price Range Filter:** Min and max price filters with instant application.
- **Stock Availability Filter:** In-stock only toggle switch.
- **Special Deal Filters:** Instant toggles for Special Offers, Best Sellers, and Latest Models.
- **Sorting Options:** Featured First, Price: Low to High, Price: High to Low, Highest Rated, Biggest Discount, Newest Arrivals, Alphabetical.
- **Pagination & Counter:** Results indicator (*"Showing 1–12 of 16 products"*) with pagination controls.
- **Mobile Filter Drawer:** Slide-out filter panel on small screens.
- **Quick View Modal:** Product preview modal displaying high-res gallery, key technical specs, stock availability, and quantity picker.
- **Product Detail Page:** Deep-dive page (`/product/:slug`) with full technical specifications grid, high-resolution zoom gallery, warranty details, and related product recommendations.

---

## 📁 Project Structure

```
VoltEdge/M1/
├── package.json               # Root scripts (dev, build, test, seed)
├── README.md                  # Project documentation
│
├── server/                    # Backend REST API
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env                   # Environment configuration
│   ├── .env.example
│   ├── test-api.js            # Automated API endpoint verification suite
│   ├── prisma/
│   │   ├── schema.prisma      # Active SQLite schema (zero-config local)
│   │   ├── schema.postgresql.prisma # PostgreSQL production schema
│   │   ├── seed.ts            # Realistic electronics showroom database seeder
│   │   └── dev.db             # Local SQLite database
│   └── src/
│       ├── index.ts           # Express application, CORS, error handling
│       ├── prisma.ts          # Prisma client singleton
│       └── routes/
│           ├── products.ts    # GET /api/products, GET /api/products/:identifier
│           ├── categories.ts  # GET /api/categories, GET /api/categories/:slug
│           ├── brands.ts      # GET /api/brands
│           ├── banners.ts     # GET /api/banners
│           ├── testimonials.ts# GET /api/testimonials
│           └── newsletter.ts  # POST /api/newsletter/subscribe
│
└── client/                    # Frontend React Application
    ├── package.json
    ├── tsconfig.json
    ├── vite.config.ts         # Vite configuration with API proxy to port 5000
    ├── tailwind.config.js     # VOLTEDGE branding color system
    ├── index.html
    └── src/
        ├── App.tsx            # Main application layout & routes
        ├── main.tsx
        ├── index.css          # Tailwind CSS directives & typography
        ├── types/             # TypeScript interfaces (Product, Category, Brand, etc.)
        ├── context/
        │   ├── CartContext.tsx    # Cart state & localStorage sync
        │   ├── WishlistContext.tsx# Wishlist state & localStorage sync
        │   └── ToastContext.tsx   # Modern toast notification system
        ├── services/
        │   └── api.ts         # Axios REST API client
        ├── components/
        │   ├── AnnouncementBar.tsx
        │   ├── Header.tsx
        │   ├── HeroBanner.tsx
        │   ├── CategorySection.tsx
        │   ├── ProductSection.tsx
        │   ├── ProductCard.tsx
        │   ├── QuickViewModal.tsx
        │   ├── CartDrawer.tsx
        │   ├── WishlistDrawer.tsx
        │   ├── FeaturedBrandsSection.tsx
        │   ├── WhyChooseUsSection.tsx
        │   ├── TestimonialsSection.tsx
        │   ├── NewsletterSection.tsx
        │   └── Footer.tsx
        └── pages/
            ├── HomePage.tsx
            ├── ShopPage.tsx
            └── ProductDetailPage.tsx
```

---

## ⚡ Quick Start & Installation

### 1. Prerequisites
- **Node.js** v18+ (tested on Node v24)
- **npm** v9+

### 2. Install Dependencies
Run from the root directory:
```bash
npm run install:all
```
*(Or install in `server/` and `client/` individually)*

### 3. Initialize & Seed Database
```bash
npm run seed
```
This initializes the database schema and populates it with 6 showroom categories, 8 authorized partner brands, 16 electronics products with images and technical specifications, promotional banners, and verified testimonials.

### 4. Run Development Servers
To run both backend API (`http://localhost:5000`) and frontend Vite dev server (`http://localhost:3000`) concurrently:
```bash
npm run dev
```

You can also run them separately:
- **Backend:** `npm run dev:server`
- **Frontend:** `npm run dev:client`

---

## 📡 REST API Reference

| Method | Endpoint | Description | Query Parameters |
|---|---|---|---|
| `GET` | `/api/health` | Service health status & database connectivity check | - |
| `GET` | `/api/products` | Paginated product catalog | `search`, `category`, `brand`, `minPrice`, `maxPrice`, `inStock`, `featured`, `bestSeller`, `latestArrival`, `specialOffer`, `sort`, `page`, `limit` |
| `GET` | `/api/products/:identifier` | Single product by ID or slug (includes related products) | - |
| `GET` | `/api/categories` | All showroom categories with product count | - |
| `GET` | `/api/brands` | All partner brands with product count | `featured=true` |
| `GET` | `/api/banners` | Active showroom promotional banners | - |
| `GET` | `/api/testimonials` | Verified customer testimonials | - |
| `POST` | `/api/newsletter/subscribe` | Register newsletter subscriber | `{ "email": "user@example.com" }` |

### Automated API Test Suite
Run the test suite to verify all endpoints against live database queries:
```bash
npm test
```

---

## 🗄 Switching to PostgreSQL (Optional)

By default, Milestone 1 runs on SQLite for zero-configuration out-of-the-box local testing.

To connect to a PostgreSQL instance:
1. In `server/.env`, set your connection URL:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/voltedge?schema=public"
   ```
2. Replace `server/prisma/schema.prisma` with `server/prisma/schema.postgresql.prisma` (or change `provider = "postgresql"`).
3. Run:
   ```bash
   cd server
   npx prisma db push
   npx tsx prisma/seed.ts
   ```

---

## 🏆 Milestone 1 Verification Checklist

- [x] Modern, mobile-first responsive UI built with Tailwind CSS & Inter / Plus Jakarta Sans fonts.
- [x] Complete VOLTEDGE brand design system with Deep Navy `#10243A` and Electric Blue `#2563EB`.
- [x] Fully populated Homepage with all 18 specified sections and clear visual hierarchy.
- [x] Shop / All Products catalog page with real-time search, category/brand/price filtering, and sorting.
- [x] Interactive Product Cards with original/selling price, discounts, ratings, stock status, wishlist, and cart actions.
- [x] Interactive Cart & Wishlist slideout drawers with localStorage persistence and live badge counters.
- [x] Quick View modal and dedicated Product Detail page with complete technical specifications.
- [x] Scalable Express REST API backend with modular routing and centralized error handling.
- [x] Prisma ORM database models and comprehensive showroom seed dataset.
- [x] Zero TypeScript compilation or build errors across client and server.
- [x] Reserved placeholders for Milestone 2+ modules (Admin, Orders, Payment Gateway).
