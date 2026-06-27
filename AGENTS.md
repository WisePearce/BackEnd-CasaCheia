# AGENTS.md — Casa Cheia Backend

## Quick start
```bash
npm install
# start local MongoDB via Docker (optional):
docker compose up -d
# copy .env.example if exists, otherwise use .env as-is
npm run dev        # nodemon server.js
npm start          # node server.js
```

## Architecture

- **Entry:** `server.js` → `app/app.js` (Express 5, ESM via `"type": "module"`)
- **DB:** MongoDB + Mongoose 8; connection at `app/infra/db.js` using `MONGODB_URL` env
- **Validation:** Joi schemas in `app/config/validation.js`
- **Docs:** Swagger at `/api-docs` (from `swegger.js` scanning `app/routes/*.js`)
- **No tests, no linter, no formatter configured**

## Routes (all mounted under `/api`)

| Prefix | File | Auth needed |
|--------|------|-------------|
| `/register`, `/login`, `/profile`, `/profile/password` | `authRoutes.js` | profile routes use `authenticateTokenProfile` |
| `/products`, `/products/search`, `/products/:id` | `productsRoutes.js` | POST/PATCH/DELETE require admin |
| `/cart` | `cartRoutes.js` | user |
| `/categories` | `categorieRoutes.js` | POST/PATCH/DELETE require admin |
| `/partners` | `partnerRoutes.js` | all routes require admin |
| `/banners` | `bannerRoutes.js` | POST/PUT/DELETE require admin |
| `/orders/my-orders`, `/orders/all`, `/orders/:id/status` | `orderRouter.js` | user for my-orders, admin for rest |
| `/checkout` | `checkOutRouter.js` | user |
| `/delivery` | `deliveryFreeRoutes.js` | none |
| `/coornindates` | `storeCoordinatsRouter.js` | all require admin |
| `/users`, `/users/all` | `userRoutes.js` | admin |
| `/auth/forgot-password`, `/auth/reset-password` | `forgotPasswordRoutes.js` | none |

## Auth gotchas

- **Two middleware files with different checks:**
  - `app/middlewares/authMiddleware.js` — verifies JWT **AND** requires `role === 'admin'` (returns 403 otherwise). Used for admin-only routes.
  - `app/middlewares/authProfileMiddleware.js` — verifies JWT, no role check. Used for user-profile, cart, and my-orders routes.
- Signup flow: `POST /register` sends 6-digit SMS code (via Ombala API), stores hash in Redis (10 min TTL, 3 attempt max), then `POST /register/verify` creates the user.
- Login returns JWT (4h expiry) + refresh token (7d, stored in MongoDB `Token` collection).
- `refreshToken` function exists in controller but **no route mounts it** – the endpoint is missing.

## Image upload quirks

- **Multer config** (`app/config/multer/productUploads.js`):
  - Dev (`NODE_ENV=development`): saves to `uploads/products/` as `{timestamp}-{random}{ext}`, returns filename.
  - Prod: uses `memoryStorage`, buffers uploaded to ImgBB via `uploadToImgBB()`, returns URL.
  - Accepted formats: `.png`, `.jpg`, `.jpeg`, `.webp`; max 5MB per file, max 4 files per request.
- `getImages()` helper duplicated in both `productController.js` and `partnerController.js` — same logic.
- `asyncUpload` middleware wrapper validates at least 1 file present (used on **POST** for products and banners). PATCH routes skip this check.
- Nested JSON fields in multipart (e.g., `address`) must be sent as JSON-stringified strings — parsed via `parseBodyFields()`.
- Cloudinary and Firebase configs exist but are **not wired into any route**.

## Key env vars

| Var | Purpose |
|-----|---------|
| `MONGODB_URL` | MongoDB connection string |
| `JWT_KEY` | JWT signing secret |
| `JWT_REFRESH_SECRET` | Refresh token secret |
| `NODE_ENV` | `development` or `production` — changes image storage behavior |
| `IMGBB_API_KEY` / `URL_IMGBB` | ImgBB upload (prod) |
| `TOKEN_OMBALA` / `URL_OMBALA` | SMS service |
| `DELIVERY_*` | 4 vars for delivery fee formula |
| `SUPABASE_URL` / `SUPABASE_KEY` / `SUPABASE_BUCKET` | Supabase (configured but unused in controllers) |

## External deps you'll notice
- Redis (`app/config/services/redis.js`) — used only for signup code storage
- Socket.io (in deps, no server setup visible) — may be partially configured
- Argon2 — actual password hasher (not bcrypt, despite bcrypt in package.json)
- Axios — used for ImgBB and Ombala API calls
