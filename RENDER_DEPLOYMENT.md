# RestaurantOS - Render Deployment Guide

## 🌐 Live Deployed URLs

| Service | URL | Status |
|---------|-----|--------|
| **Frontend App** | https://restaurantos-z7u8.onrender.com | ✅ Live |
| **Node.js Backend** | https://restaurantos-nodebackend.onrender.com | ✅ Live |
| **FastAPI AI Service** | https://restaurantos-fastapi-service.onrender.com | ✅ Live |
| **Backend Health Check** | https://restaurantos-nodebackend.onrender.com/api/health | ✅ Live |
| **FastAPI Health Check** | https://restaurantos-fastapi-service.onrender.com/health | ✅ Live |

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    Render Cloud                          │
│                                                          │
│  ┌──────────────────┐      VITE_API_URL       ┌──────────┐  │
│  │  Frontend         │ ──────────────────────► │  Node.js  │  │
│  │  restaurantos-    │                         │  Backend  │  │
│  │  z7u8.onrender.com│                         │  nodebackend│
│  └──────────────────┘                         │  .onrender  │
│                                                │  .com:5000 │
│                                                └─────┬─────┘  │
│                                     FASTAPI_URL      │         │
│                                  ──────────────────► │         │
│                                                 ▼           │
│                                           ┌──────────────┐  │
│                                           │  FastAPI      │  │
│                                           │  fastapi-     │  │
│                                           │  service      │  │
│                                           │  .onrender.com│  │
│                                           │  :8000       │  │
│                                           └──────┬───────┘  │
│                                  BACKEND_URL     │           │
│                                  ◄──────────────── │         │
│                                           ┌─────┴─────┐    │
│                                           │ PostgreSQL │    │
│                                           │ (Managed)   │   │
│                                           └───────────┘    │
└─────────────────────────────────────────────────────────┘
```

## Step 1: Create Render PostgreSQL (Managed Database)

1. In Render Dashboard → **New** → **PostgreSQL**
2. Configure:
   - **Name**: `restaurant-os-db`
   - **User**: `postgres` (default)
   - **Database**: `restaurant_os`
3. After creation, copy the **Internal Database URL** (looks like: `postgresql://postgres:...@aws-0-region.render.com:5432/restaurant_os`)

## Step 2: Deploy Node.js Backend (Web Service)

1. **New** → **Web Service**
2. Connect your GitHub repo
3. Configure:
   - **Name**: `restaurant-os-backend` (Render will assign `restaurantos-nodebackend.onrender.com`)
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npx prisma generate && npx prisma db push && npm run build`
   - **Start Command**: `npm start`
   - **Health Check Path**: `/api/health`

4. **Environment Variables** (must add ALL of these):

| Variable | Value | Notes |
|----------|-------|-------|
| `PORT` | `5000` | Render assigns a port, but keep 5000 |
| `DATABASE_URL` | `postgresql://...` | From Step 1 — **Internal** URL (not external) |
| `JWT_SECRET` | `restaurant-os-enterprise-secret-key` | Or any strong secret |
| `FASTAPI_URL` | `https://restaurantos-fastapi-service.onrender.com` | Live FastAPI URL |

5. **Deploy** and note the URL: `https://restaurantos-nodebackend.onrender.com`

## Step 3: Deploy FastAPI AI Service (Web Service)

1. **New** → **Web Service**
2. Configure:
   - **Name**: `restaurant-os-fastapi` (Render will assign `restaurantos-fastapi-service.onrender.com`)
   - **Root Directory**: `fastapi-service`
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port 8000`
   - **Health Check Path**: `/health`

3. **Start Command** (⚠️ **IMPORTANT — Render defaults to `gunicorn` which is wrong**):
   ```
   uvicorn main:app --host 0.0.0.0 --port 8000
   ```
   Make sure this is set in the **Start Command** field, not the default `gunicorn your_application.wsgi`.

4. **Environment Variables**:

| Variable | Value | Notes |
|----------|-------|-------|
| `BACKEND_URL` | `https://restaurantos-nodebackend.onrender.com/api` | Full Node.js backend URL + `/api` |

5. **Deploy** and note the URL: `https://restaurantos-fastapi-service.onrender.com`

## Step 4: Deploy Frontend (Static Site)

1. **New** → **Static Site**
2. Configure:
   - **Name**: `restaurant-os-frontend` (Render will assign `restaurantos-z7u8.onrender.com`)
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist` ❗ **(NOT `frontend/build` - this is critical)**

3. **Environment Variables**:

| Variable | Value | Notes |
|----------|-------|-------|
| `VITE_API_URL` | `https://restaurantos-nodebackend.onrender.com/api` | Full backend URL + `/api` |

4. **Deploy**

> ⚠️ **Important**: The Publish Directory must be **`dist`** (not `build`). Vite outputs to `dist/` by default. See `frontend/Dockerfile` line: `COPY --from=build /app/dist /usr/share/nginx/html`

## Step 5: Seed the Database

After the backend deploys successfully, you need to seed the database with demo data:

1. Go to **Render Dashboard** → **restaurant-os-backend** → **Shell**
2. Run:
```bash
npx prisma db push
npx ts-node src/seed.ts
```

Alternatively, you can add a post-deploy command or run it locally by connecting to the Render PostgreSQL using the **External Database URL** (not Internal).

## Step 6: Verify Deployment

After all services are deployed and healthy:

1. Check backend health: `https://restaurantos-nodebackend.onrender.com/api/health`
2. Check FastAPI health: `https://restaurantos-fastapi-service.onrender.com/health`
3. Open frontend URL: `https://restaurantos-z7u8.onrender.com`
4. Login with: `owner@restaurantos.io` / `password123`

## Troubleshooting

### "FastAPI service unreachable" warnings in backend logs
- Normal during initial deployment. Backend falls back to local AI calculations.
- Once FastAPI is deployed and `FASTAPI_URL` is updated, this resolves.

### Frontend shows blank page
- Check **Publish Directory** is `dist` (not `build` or `frontend/dist`)
- Check browser console for CORS errors
- Verify `VITE_API_URL` is set correctly in Frontend env vars

### Backend can't connect to database
- Ensure you're using the **Internal** PostgreSQL URL (not External)
- Ensure the database password is correct

### ❌ Prisma `libssl.so.1.1` / `linux-musl` Error (Fixed)
This project now includes `binaryTargets` in `prisma/schema.prisma` to support multiple platforms including `linux-musl-openssl-1.1.x`. If you still see this error:

1. **Option A**: Re-deploy with a fresh build — Render will use the updated schema
2. **Option B**: Change Render build command to:
   ```
   npm install && npx prisma generate --no-engine && npm run build
   ```
   This disables the engine binary and lets Prisma use the Data Proxy instead (requires Prisma Data Platform account).

3. **Option C**: Deploy via Docker instead. In Render, go to **Settings** → **Source** → select **Dockerfile** instead of Build Command.

### CORS errors in browser
- The backend has `app.use(cors())` with origin `*` — this should be fine
- If issues persist, ensure `VITE_API_URL` points to the correct backend URL

## 💡 Pro Tip: Deploy Backend Using Docker on Render

For the most reliable deployment, configure Render to use the backend's `Dockerfile`:

1. When creating the Web Service, choose **Deploy from Dockerfile** (instead of Build Command)
2. Set:
   - **Root Directory**: `backend`
   - **Dockerfile Path**: `./Dockerfile`
3. The Dockerfile now includes `apk add --no-cache openssl` which resolves the Prisma OpenSSL issue.

## Useful Render CLI Commands

```bash
# If you have Render CLI installed:
render services list
render logs --service restaurant-os-backend
render logs --service restaurant-os-fastapi
render logs --service restaurant-os-frontend
```

