# RestaurantOS – AI Powered Restaurant Management Platform

![RestaurantOS Banner](https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80)

**RestaurantOS** is an enterprise-grade, full-stack, AI-powered restaurant management platform built for modern hospitality operations. It combines real-time order processing, kitchen display systems (KDS), automated inventory tracking, expense management, and AI intelligence engines for OCR invoice parsing, shortage prediction, and dynamic menu pricing.

---

## 🌟 Key Features & Core Modules

### 1. 🔐 Authentication & Role-Based Access Control (RBAC)
Supports 6 distinct operational roles with customized UI views & permissions:
- **Owner**: Full access to financial metrics, executive dashboard, AI intelligence studio, staff management, audit trails.
- **Manager**: Restaurant operations, inventory stock control, expense tracking, invoice processing.
- **Chef**: Kitchen Display System (KDS) live ticket queue, order prep timer, ingredient waste logger.
- **Waiter**: 2D floor table status layout, order placement, table reservation management.
- **Cashier**: Order billing, payment processing, daily sales summary.
- **Store Manager**: Warehouse stock management, Purchase Orders (PO), supplier directory.

### 2. 🍽️ Restaurant Operations & KDS
- **Table Management**: Visual 2D floor layout displaying real-time table statuses (`AVAILABLE`, `OCCUPIED`, `RESERVED`, `CLEANING`), table capacity, section filters, and instant status toggles.
- **Kitchen Display System (KDS)**: Real-time ticket boards for chefs (`PENDING` &rarr; `PREPARING` &rarr; `READY` &rarr; `SERVED`) backed by Socket.io web sockets for zero-latency updates.
- **Menu & Recipe Studio**: Complete menu item catalog with recipe ingredient mappings. Automatic stock deduction upon order placement.

### 3. 📦 Inventory & Warehouse Management
- **Product & Ingredient Tracking**: Real-time stock levels, safety thresholds, unit costs, primary supplier links.
- **Stock Movement Log**: Log Stock In (`IN`), Stock Out (`OUT`), and Waste (`WASTE`) with audit logs.
- **Purchase Orders (PO)**: Generate purchase orders directly to suppliers based on AI reorder recommendations.
- **Supplier Directory**: Supplier contact management and purchase order history.

### 4. 📄 AI Invoice Processing & Expense Register (Required Module)
- **Multi-Format Upload**: Upload single or batch supplier invoices (Printed and Handwritten, Images or PDFs).
- **AI OCR Extraction**: Automated text extraction powered by Tesseract.js / Vision AI. Extracts Invoice #, Supplier Name, Invoice Date, Subtotal, Tax, Total Amount, and tabular Line Items.
- **Database Synchronization**: Automatically saves extracted invoice details to the database and generates matching expense records.
- **Excel Expense Register Exporter**: Download styled Excel (`.xlsx`) workbooks containing formatted expense ledgers and AI invoice logs.

### 5. 🤖 AI Intelligence Studio
- **Predict Ingredient Shortages**: Predicts depletion timelines (hours/days) using historical consumption velocity and Flags `CRITICAL`, `HIGH`, or `MEDIUM` urgency.
- **Stock Reorder Recommender**: Calculates Economic Order Quantities (EOQ) and total cost estimates.
- **Dynamic Menu Pricing AI**: Calculates recipe food costs and suggests prices targeting optimal gross margins (68%).
- **Estimated Food Prep Time**: Calculates prep duration dynamically based on live kitchen queue congestion.
- **Ingredient Waste Analysis**: Analyzes financial spoilage losses and provides actionable waste-reduction recommendations.

---

## 🏗️ Technology Stack

- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, Recharts, Socket.io Client, Lucide Icons.
- **Backend**: Node.js, Express.js, TypeScript, Socket.io Server, Multer.
- **AI / OCR & Export**: Tesseract.js OCR, ExcelJS.
- **Database & ORM**: Prisma ORM with SQLite (default zero-config) / PostgreSQL compatibility.
- **Deployment**: Docker & Docker Compose (`docker-compose.yml`).

---

## ⚡ Quick Start & Setup Instructions

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher

### Option 1: Standard Local Development

#### 1. Setup Backend
```bash
cd backend
npm install
npx prisma db push
npm run prisma:seed
npm run dev
```
*Backend server will launch on `http://localhost:5000`*

#### 2. Setup Frontend
```bash
cd frontend
npm install
npm run dev
```
*Frontend client will launch on `http://localhost:3000`*

---

### Option 2: Run via Docker Compose

```bash
docker-compose up --build
```
- **Frontend App**: `http://localhost:3000`
- **Backend API**: `http://localhost:5000`
- **PostgreSQL DB**: `localhost:5432`

---

## 📊 RBAC Privileges Matrix

| Feature / Module | Owner | Manager | Chef | Waiter | Cashier | Store Manager |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| Executive Financial Dashboard | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Table Management & Floor Plan | ✅ | ✅ | ❌ | ✅ | ✅ | ❌ |
| Kitchen Display System (KDS) | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Stock Inventory Control | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ |
| Purchase Orders & Suppliers | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ |
| AI Invoice OCR Upload | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ |
| Export Expense Register (Excel) | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| AI Shortage & Pricing Engine | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ |

---

## 🏆 Bonus Criteria Checklist Delivered

- [x] **AI Invoice OCR Processing** (Printed & Handwritten support).
- [x] **Excel Expense Register Generation** (`.xlsx` download).
- [x] **WebSocket Live KDS Sync** (Socket.io).
- [x] **5 AI Capabilities** (Shortage prediction, Reorder, Pricing, Prep time, Waste analysis).
- [x] **Role-Based Access Control (RBAC)** (Quick Role Switcher for Evaluators).
- [x] **Docker & Docker Compose** setup.
- [x] **Dark Mode & Glassmorphic UI Aesthetics**.
- [x] **Database Seeding** with realistic sample invoices & operational data.

---

## 📩 Assessment Submission Info
Submitted for: Technical Assessment - Full Stack Developer Position
- **Candidate Name**: Technical Assessment Submission
- **Email Contacts**:
  - `Praveen.r@nilehospitality.com`
  - `arun.kumar@baikalsphere.com`
  - `bharath.yadav@nilehospitality.com`
