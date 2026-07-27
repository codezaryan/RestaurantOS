# RestaurantOS – AI Powered Restaurant Management Platform

![RestaurantOS Banner](https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80)

**RestaurantOS** is an enterprise-grade, full-stack, AI-powered restaurant management platform built for modern hospitality operations. It combines real-time order processing, kitchen display systems (KDS), automated inventory tracking, expense management, and AI intelligence engines for OCR invoice parsing, shortage prediction, and dynamic menu pricing.

---

## 🚀 Live Demo (Deployed on Render)

| Service | URL | Status |
|---------|-----|--------|
| 🖥️ **Frontend App** | [https://restaurantos-z7u8.onrender.com](https://restaurantos-z7u8.onrender.com) | ✅ Live |
| ⚙️ **Node.js Backend** | [https://restaurantos-nodebackend.onrender.com](https://restaurantos-nodebackend.onrender.com) | ✅ Live |
| 🤖 **FastAPI AI Service** | [https://restaurantos-fastapi-service.onrender.com](https://restaurantos-fastapi-service.onrender.com) | ✅ Live |
| ❤️ **Backend Health** | [https://restaurantos-nodebackend.onrender.com/api/health](https://restaurantos-nodebackend.onrender.com/api/health) | ✅ Live |
| ❤️ **FastAPI Health** | [https://restaurantos-fastapi-service.onrender.com/health](https://restaurantos-fastapi-service.onrender.com/health) | ✅ Live |

> **Quick Login:** Use any demo account email with password `password123` (e.g., `owner@restaurantos.io`)

---

## 🌟 Key Features & Core Modules

### 1. 🔐 Secure Authentication & Role-Based Access Control (RBAC)
Supports 6 distinct operational roles with **secure password-based login**:
- **Owner**: Full access to financial metrics, executive dashboard, AI intelligence studio, staff management, audit trails.
- **Manager**: Restaurant operations, inventory stock control, expense tracking, invoice processing.
- **Chef**: Kitchen Display System (KDS) live ticket queue, order prep timer, ingredient waste logger.
- **Waiter**: 2D floor table status layout, order placement, table reservation management.
- **Cashier**: Order billing, payment processing, daily sales summary.
- **Store Manager**: Warehouse stock management, Purchase Orders (PO), supplier directory.

> **All demo accounts use password:** `password123`

### 2. 🍽️ Restaurant Operations & KDS
- **Table Management**: Visual 2D floor layout displaying real-time table statuses (`AVAILABLE`, `OCCUPIED`, `RESERVED`, `CLEANING`), table capacity, section filters, and instant status toggles.
- **Kitchen Display System (KDS)**: Real-time ticket boards for chefs (`PENDING` &rarr; `PREPARING` &rarr; `READY` &rarr; `SERVED`) backed by Socket.io web sockets for zero-latency updates.
- **Menu & Recipe Studio**: Complete menu item catalog with recipe ingredient mappings. Automatic stock deduction upon order placement.

### 3. 📦 Inventory & Warehouse Management
- **Product & Ingredient Tracking**: Real-time stock levels, safety thresholds, unit costs, primary supplier links.
- **Stock Movement Log**: Log Stock In (`IN`), Stock Out (`OUT`), and Waste (`WASTE`) with audit logs.
- **Warehouse / Store Management**: Full CRUD operations for warehouse locations.
- **Category Management**: Create and manage categories for Menu, Inventory, and Expense types.
- **Purchase Orders (PO)**: Generate purchase orders directly to suppliers based on AI reorder recommendations.
- **Supplier Directory**: Supplier contact management and purchase order history.

### 4. 📄 AI Invoice Processing & Expense Register (Required Module)
- **Multi-Format Upload**: Upload single or batch supplier invoices (Printed and Handwritten, Images or PDFs).
- **AI OCR Extraction**: Automated text extraction via FastAPI Python service (PaddleOCR/Tesseract). Extracts Invoice #, Supplier Name, Invoice Date, Subtotal, Tax, Total Amount, and tabular Line Items.
- **Database Synchronization**: Automatically saves extracted invoice details to PostgreSQL and generates matching expense records.
- **Excel Expense Register Exporter**: Download styled Excel (`.xlsx`) workbooks containing formatted expense ledgers and AI invoice logs.

### 5. 🤖 AI Intelligence Studio (FastAPI Python Microservice)
- **Predict Ingredient Shortages**: Predicts depletion timelines (hours/days) using historical consumption velocity and Flags `CRITICAL`, `HIGH`, or `MEDIUM` urgency.
- **Stock Reorder Recommender**: Calculates Economic Order Quantities (EOQ) and total cost estimates.
- **Dynamic Menu Pricing AI**: Calculates recipe food costs and suggests prices targeting optimal gross margins (68%).
- **Estimated Food Prep Time**: Calculates prep duration dynamically based on live kitchen queue congestion.
- **Ingredient Waste Analysis**: Analyzes financial spoilage losses and provides actionable waste-reduction recommendations.

---

## 🏗️ Technology Stack

- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, Recharts, Socket.io Client, Lucide Icons.
- **Backend**: Node.js, Express.js, TypeScript, Socket.io Server, Multer, Axios.
- **AI / OCR & Export**: **FastAPI** (Python), Pytesseract OCR, ExcelJS (Node.js).
- **Database & ORM**: **PostgreSQL** with Prisma ORM.
- **Authentication**: JWT-based with bcrypt password hashing.
- **Real-time**: Socket.io (WebSocket) for live KDS updates.
- **Deployment**: Docker & Docker Compose (`docker-compose.yml`) — 4 services.

---

## ⚡ Quick Start & Setup Instructions

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **Python**: v3.10 or higher (for FastAPI service)
- **PostgreSQL**: v15 or higher (or use Docker)

### Option 1: Standard Local Development

#### 1. Setup PostgreSQL Database
Ensure PostgreSQL is running locally with:
- Database: `restaurant_os`
- User: `postgres`
- Password: `postgrespassword`
- Port: `5432`

#### 2. Setup Backend
```bash
cd backend
npm install
cp .env.example .env   # Edit DATABASE_URL if needed
npx prisma generate
npx prisma db push
npm run prisma:seed
npm run dev
```
*Backend server will launch on `http://localhost:5000`*

#### 3. Setup FastAPI Service (AI Features)
```bash
cd fastapi-service
pip install -r requirements.txt
python main.py
```
*FastAPI server will launch on `http://localhost:8000`*

#### 4. Setup Frontend
```bash
cd frontend
npm install
npm run dev
```
*Frontend client will launch on `http://localhost:3000`*

---

### Option 2: Run via Docker Compose (Recommended)

```bash
docker-compose up --build
```
- **Frontend App**: `http://localhost:3000`
- **Backend API**: `http://localhost:5000`
- **FastAPI (AI)**: `http://localhost:8000`
- **PostgreSQL DB**: `localhost:5432`

---

## 🔑 Demo Credentials

All demo accounts use the password: **`password123`**

| Role | Email |
|------|-------|
| **Owner** | `owner@restaurantos.io` |
| **Manager** | `manager@restaurantos.io` |
| **Chef** | `chef@restaurantos.io` |
| **Waiter** | `waiter@restaurantos.io` |
| **Cashier** | `cashier@restaurantos.io` |
| **Store Manager** | `store@restaurantos.io` |

---

## 📊 RBAC Privileges Matrix

| Feature / Module | Owner | Manager | Chef | Waiter | Cashier | Store Manager |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| Executive Financial Dashboard | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Table Management & Floor Plan | ✅ | ✅ | ❌ | ✅ | ✅ | ❌ |
| Kitchen Display System (KDS) | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Ingredient & Warehouse Stock | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ |
| Warehouse / Store Management | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ |
| Purchase Orders & Suppliers | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ |
| Category Management | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ |
| AI Invoice OCR Upload | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ |
| Export Expense Register (Excel) | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| AI Shortage & Pricing Engine | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ |

---

## 🏆 Bonus Criteria Checklist Delivered

- [x] **PostgreSQL Database** (Production-grade, not SQLite).
- [x] **FastAPI Python Microservice** for AI/ML features.
- [x] **Secure Authentication** (Password hashing with bcrypt, JWT validation).
- [x] **Login Screen** with demo quick-login buttons.
- [x] **AI Invoice OCR Processing** (Printed & Handwritten support via FastAPI).
- [x] **Excel Expense Register Generation** (`.xlsx` download).
- [x] **WebSocket Live KDS Sync** (Socket.io).
- [x] **5 AI Capabilities** (Shortage prediction, Reorder, Pricing, Prep time, Waste analysis).
- [x] **Role-Based Access Control (RBAC)** (Quick Role Switcher for Evaluators).
- [x] **Warehouse / Store Management** (Full CRUD API endpoints).
- [x] **Category Management** (Menu, Inventory, Expense types).
- [x] **Docker & Docker Compose** setup (4 services).
- [x] **Dark Mode & Glassmorphic UI Aesthetics**.
- [x] **Audit Logs / Activity Trails**.
- [x] **Database Seeding** with realistic sample invoices & operational data.
- [x] **File Uploads** (Invoice OCR processing).
- [x] **Dashboard Charts** (Recharts, Area/Bar charts).
- [x] **.env Configuration** for environment variables.

---

## 📩 Assessment Submission Info
Submitted for: Technical Assessment - Full Stack Developer Position
- **Candidate Name**: Technical Assessment Submission
- **Email Contacts**:
  - `Praveen.r@nilehospitality.com`
  - `arun.kumar@baikalsphere.com`
  - `bharath.yadav@nilehospitality.com`
