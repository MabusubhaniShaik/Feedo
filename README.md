<div align="center">

# 🍽️ Feedo

**Product Feedback & Review Management Platform**

A full-stack, end-to-end (e2e) product feedback system that lets business owners create products with custom rating questions, collect anonymous customer feedback via shareable QR codes, and analyze results through rich analytics dashboards.

![Next.js](https://img.shields.io/badge/Next.js-16-black) ![React](https://img.shields.io/badge/React-19-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue) ![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose_9-green) ![Tailwind](https://img.shields.io/badge/TailwindCSS-4-38bdf8)

</div>

---

## Table of Contents

- [Project Description](#project-description)
- [Overview](#overview)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [System Architecture](#system-architecture)
- [Project Structure](#project-structure)
- [Installation & Setup](#installation--setup)
- [Environment Variables](#environment-variables)
- [Usage / How It Works](#usage--how-it-works)
- [API Documentation](#api-documentation)
- [Database / Data Model](#database--data-model)
- [Authentication & Authorization](#authentication--authorization)
- [Screenshots / Demo](#screenshots--demo)
- [Performance & Scalability](#performance--scalability)
- [Security](#security)
- [Testing](#testing)
- [Deployment](#deployment)
- [Future Enhancements](#future-enhancements)
- [Known Limitations](#known-limitations)
- [Contributing](#contributing)
- [License](#license)
- [Author / Contact](#author--contact)

---

## Project Title

**Feedo** — a feedback platform that connects **product owners** with their **customers**. Owners register products, define up to five custom rating questions per product, and share a QR code or link that customers scan to submit instant feedback — no login required. Owners then monitor performance through summary cards, rating distributions, trend charts, and per-question analytics.

## Project Description

Feedo is a complete end-to-end web application (backend API + admin dashboard + public-facing feedback flow) built with the **Next.js App Router**. It provides:

- A **dynamic, config-driven REST API** (`/api/[...slug]`) that automatically exposes CRUD endpoints for any registered Mongoose model/controller — barely any boilerplate per resource.
- A **role-based admin dashboard** (Owner / Admin / User) for managing products, users, and reviewing collected feedback.
- A **public, QR-code-driven feedback form** customers use to rate products without creating accounts.
- **Real-time analytics** (owner-level overview, product-level stats, review analytics with daily trends and rating distribution) with CSV export.

## Overview

- **Type:** Full-stack monolith (Next.js 16 App Router)
- **Status:** Active development (`v0.1.0`)
- **Backend:** Server-side API routes (`app/api/**`) + catch-all dynamic REST layer
- **Frontend:** React 19 client components with shadcn/ui + Tailwind CSS 4
- **Persistence:** MongoDB (Atlas-ready) via Mongoose 9 with cached connections for serverless
- **Auth:** JWT (access `1h` + refresh `7d`) with token auditing in MongoDB

## Key Features

- **Dynamic REST API** — a single catch-all route (`/api/[...slug]`) dispatches to registered controllers for `role`, `user`, `product`, and `product-review`, including ID-routed lookups and sub-resources.
- **Rich query support** — filtering (`field=value`, nested fields), comparison operators (`__gte`, `__lte`, `__gt`, `__lt`, `__ne`, `__in`, `__nin`, `__regex`), pagination, sorting, search across searchable fields, field selection (`fields`), and Mongoose `populate`.
- **Custom product questionnaires** — each product can define up to **5 questions**, each with a configurable max rating (1–10), description/info, and active toggle.
- **Public feedback collection** — customers submit reviews by product ID/code with name, mobile number, email, per-question star ratings, optional comments, and image URLs.
- **QR code generation** — owners can generate, download, and copy a QR code that points directly to the public feedback URL for a product (using `qrcode.react`).
- **Analytics dashboards** — owner overview (total products, reviews, average rating, top products, recent reviews), product-level stats (min/max rating, question-wise stats, monthly trend), and review analytics (daily trend, rating distribution). CSV export toggle.
- **Role-based access control** — `Owner`, `Admin`, `User`, and `Public` roles; admin-only pages (e.g., `/manage`) are guarded both on the client (`AuthGuard`) and server (JWT).
- **User management** — admin-only manage screen with reusable `DataTable` + `DataDialog` for listing, creating, editing, viewing, and deactivating users.
- **Seeders** — pre-installation role seeding (`npm run seed`) and Faker-driven user seeding (1 Owner, 1 Admin, 18 Users).
- **API docs** — auto-generated OpenAPI spec (via `next-openapi-gen`) rendered with the Scalar UI at `/api-docs`, plus Postman collection generation.
- **Standardized responses** — every endpoint returns a consistent `{ status, status_code, message, data, pagination? }` envelope via `ResponseFormatter`.
- **Health check** — `/api/health` reports DB connectivity and collection names safely (no secrets).

## Tech Stack

| Layer       | Technology                                                              |
| ----------- | ---------------------------------------------------------------------- |
| Framework   | Next.js 16.1.0 (App Router, React Server + Client Components)           |
| UI          | React 19.2, TypeScript 5.9, Tailwind CSS 4, shadcn/ui (Radix UI), lucide-react |
| Styling/UX  | tailwind-merge, clsx, class-variance-authority, tw-animate-css, sonner (toasts) |
| Database    | MongoDB + Mongoose 9 (indexed, cached connections)                     |
| Auth        | jsonwebtoken (JWT), bcryptjs (password hashing), jwt-decode            |
| Validation  | zod 4, ajv                                                            |
| Docs        | @scalar/api-reference-react, next-openapi-gen, next-swagger-doc        |
| Utilities   | qrcode.react (QR feedback links), @faker-js/faker (seed data), dotenv, tsx |

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Next.js 16 Application                       │
│                                                                     │
│  ┌───────────────┐   ┌───────────────────────────────┐              │
│  │  Public Flow  │   │       Admin Dashboard         │              │
│  │  /feedback/.. │   │  /dashboard /product /review  │              │
│  │  (no auth)    │   │  /manage /profile /settings   │              │
│  └──────┬────────┘   └───────────────┬───────────────┘              │
│         │                            │                               │
│         │       ApiService (helpers/api.service.ts)                  │
│         │        adds Bearer token + user headers                    │
│         └──────────────┬─────────────────────────────┘              │
│                        ▼                                           │
│              ┌─────────────────────┐                                │
│              │   Catch-all Route   │ /api/[...slug]/route.ts        │
│              │   AuthMiddleware    │ JWT verify + public collections │
│              └─────────┬───────────┘                                │
│                        ▼                                           │
│   ┌──────────────────────────────────────────────┐                  │
│   │  Controllers (lib/controllers/index.ts)      │                  │
│   │   role · user · product · product-review     │                  │
│   │   extend RESTController (CRUD + hooks)       │                  │
│   └──────────────────────┬───────────────────────┘                  │
│                          ▼                                        │
│   ┌──────────────────────────────────────────────┐                  │
│   │  Mongoose Models  (models/*.ts)              │                  │
│   │  user · role · product · product_review      │                  │
│   │  user_auth_token (JWT ledger)                │                  │
│   └──────────────────────┬───────────────────────┘                  │
│                          ▼                                        │
│                    ┌────────────┐                                  │
│                    │  MongoDB   │ (connectDB w/ global cache)      │
│                    └────────────┘                                  │
└─────────────────────────────────────────────────────────────────────┘
```

The API surface is generated from the `controllers` map. Adding a new resource is a matter of creating a Mongoose model, a controller extending `RESTController`, and registering it in `lib/controllers/index.ts` — the catch-all route, auth, validation, formatting, pagination, and OpenAPI generation pick it up automatically.

## Project Structure

```
Feedo/
├── app/
│   ├── (auth)/                     # Auth pages group
│   │   ├── signin/page.tsx         # Login w/ demo account support
│   │   └── signup/page.tsx         # Registration
│   ├── (mainlayout)/               # Protected dashboard area
│   │   ├── layout.tsx              # Sidebar + header + AuthGuard
│   │   ├── dashboard/page.tsx      # Statistics overview
│   │   ├── product/                # Product list / create / detail (QR tab)
│   │   ├── review/page.tsx         # Review explorer w/ filters + export
│   │   ├── reports/…                # Reports (stub)
│   │   ├── profile/ · settings/ · manage/ · notifications/
│   ├── feedback/[productId]/page.tsx   # Public feedback form
│   ├── api/
│   │   ├── [...slug]/route.ts      # Dynamic REST catch-all
│   │   ├── auth/token · auth/revoke
│   │   ├── health
│   │   └── statistics/owner-stats · product-stats · review-analytics
│   └── api-docs/page.tsx           # Scalar UI (OpenAPI)
├── components/
│   ├── AuthGuard.tsx · HeaderComponent · MenuComponent
│   ├── SummaryCards · StatisticsTabs · ProductAnalytics
│   ├── RatingDistribution · RecentActivity · ReviewAnalytics · TopProducts
│   ├── common/DataTable · common/DataDialog         # Reusable admin UI
│   ├── forms/ProductForm · UserForm · UserProfileForm
│   └── ui/                          # shadcn/ui primitives
├── config/
│   ├── menu.config.ts               # Sidebar menu + role visibility
│   └── preInstallation/            # Seeders (roles + faker users)
├── constants/ui.ts                  # Design tokens
├── helpers/
│   ├── rest.controller.ts           # Generic CRUD base controller
│   ├── api.service.ts               # Client-side API wrapper (auth, retry, timeout)
│   └── response.formatter.ts        # Standard success/error envelope
├── lib/
│   ├── controllers/                 # Resource controllers
│   ├── db.ts                        # Cached Mongoose connection
│   └── swagger.ts                   # OpenAPI spec generator
├── middleware/auth.ts               # JWT verification + public-collection bypass
├── models/                           # Mongoose schemas
├── utils/                            # auth + sessionStorage helpers
└── next.openapi.json                # OpenAPI build config
```

## Installation & Setup

Prerequisites: **Node.js ≥ 20**, **npm**, and a **MongoDB** instance (local or Atlas).

```bash
# 1. Clone the repository
git clone https://github.com/MabusubhaniShaik/Feedo.git
cd Feedo

# 2. Install dependencies
npm install

# 3. Configure environment variables
#    Create a .env.local at the project root with the values in the table below

# 4. Seed base data (roles, then optional users/demo data)
npm run seed                         # pre-installation role seeding
node --import tsx config/preInstallation/user.seed.ts   # demo users (1 Owner, 1 Admin, 18 Users)

# 5. Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

Create a `.env.local` file at the project root:

| Variable         | Required | Description                                          | Example                                                   |
| ---------------- | -------- | ---------------------------------------------------- | --------------------------------------------------------- |
| `MONGODB_URI`    | Yes      | MongoDB connection string                            | `mongodb+srv://user:pass@cluster.mongodb.net/feedo`       |
| `JWT_SECRET`     | Yes      | Secret used to sign/verify JWT access & refresh tokens| `change-this-to-a-long-random-secret`                     |
| `NODE_ENV`       | No       | `development` enables the global Mongoose cache       | `development`                                             |
| `PUBLIC_COLLECTIONS` | No   | Comma-separated collections that skip auth (e.g. `product,product-review`) | `product,product-review` |

> ⚠️ **Never commit real credentials.** Consider adding `.env.local` to `.gitignore` (it is not currently listed) and replace the hard-coded URIs/demo credentials used by the seed scripts before deploying.

## Usage / How It Works

**1. Sign in**
- Visit `/signin` and log in with a `user_id` + password (or the auto-filled demo account, e.g. `USE25-002` / `Password@123`).
- Tokens are stored in `sessionStorage` and automatically attached to API requests by `ApiService`.

**2. Create a product**
- Go to **Products** → **Create Product**. Enter name, description, category, price, and up to **5 custom rating questions** (with max rating 1–10).
- Open the product detail view → **QR Code tab** to download or copy a QR that links to the public feedback form.

**3. Collect feedback**
- Share the QR code or the URL `http://localhost:3000/feedback/<productId>`.
- Customers enter a mobile number (required), optional name/email, rate each question (star picker), add optional comments, and submit — **no account required**.

**4. Analyze results**
- **Dashboard** shows owner-level summary cards, top products, recent reviews, product-level stats, and review analytics (trends + rating distribution).
- **Review** page lists all reviews with filters, pagination, and CSV/export options.
- **Manage** (Admin only) lets you create/edit users.

**5. Inspect the API**
- Browse live OpenAPI docs at `/api-docs` and the health check at `/api/health`.

## API Documentation

Interactive docs (Scalar) are served at **`/api-docs`**. They can be regenerated and exported:

```bash
npm run generate-openapi    # writes public/openapi.json
npm run generate-postman    # also generates public/postman-collection.json
```

### Dynamic REST endpoints

Base URL: `http://localhost:3000/api`

| Endpoint                      | Method(s)      | Auth      | Description                                   |
| ----------------------------- | -------------- | --------- | --------------------------------------------- |
| `/health`                     | GET            | Public    | DB connectivity + collection list             |
| `/auth/token`                 | POST           | Public    | Login with `email` or `user_id` + `password`, returns access + refresh tokens |
| `/auth/revoke`                | POST           | Public    | Revoke an access token (logout)               |
| `/role`                       | GET/POST, {id}: GET/PUT/PATCH/DELETE | JWT | Manage roles |
| `/user`                       | GET/POST, {id}: GET/PUT/PATCH/DELETE | JWT | Manage users (passwords bcrypt-hashed) |
| `/product`                    | GET/POST, {id}: … | JWT (public collection optional) | Products + questions |
| `/product-review`             | GET/POST, {id}: … | JWT (public collection optional) | Raw reviews |
| `/statistics/owner-stats`     | GET           | Client uses own id | `?product_owner_id=` summary, recent reviews, top products |
| `/statistics/product-stats`   | GET           | —           | `?product_id=` review stats, question stats, monthly trend |
| `/statistics/review-analytics`| GET           | —           | `?product_owner_id=` + optional `start_date`/`end_date`, overview, daily trend, rating distribution |

Endpoints accept these query params: `page`, `limit`, `sort` (e.g. `-created_at`), `search`, `fields`, `populate`, plus field filters and operators like `price__gte=100`, `category__in=a,b`, `name__regex=^Se`.

### Example request

```http
POST /api/auth/token
Content-Type: application/json

{ "user_id": "USE25-002", "password": "Password@123" }
```

```http
GET /api/product?sort=-created_at&limit=10
Authorization: Bearer <access_token>
```

### Standard response envelope

```json
{
  "status": "SUCCESS",
  "status_code": 200,
  "message": "Product fetched successfully",
  "data": [ { ... } ],
  "pagination": { "current_page": 1, "page_count": 2, "total_record_count": 15, "limit": 10 }
}
```

Errors use `{ "status": "FAIL", "status_code": 4xx/5xx, "error": "...", "data": [] }`.

## Database / Data Model

Database: **MongoDB**, accessed through Mongoose via a cached connection (`lib/db.ts`).

| Collection          | Purpose                                                            | Key fields                                                                                             |
| ------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------ |
| `role`              | Role definitions (Owner, Admin, User, Public)                      | `id`, `name`, `description`                                                                            |
| `user`              | Application users                                                  | `user_id` (unique, e.g. `USE25-002`), `name`, `email`, `password` (bcrypt), `role_id`, `role_name`, `is_active`, `is_default_password` |
| `product`           | Products + review questionnaires (indexed `product_code` unique)   | `name`, `category[]`, `product_code`, `price`, `product_owner_id/name`, `questions[]` (≤5, each w/ `question_text`, `max_rating` 1–10, `info`), `total_reviews`, `average_rating` |
| `product_review`    | Customer feedback submissions                                      | `product_id`, `product_code`, `product_owner_id/name`, `mobile_number`, `email`, `review_info[]` (question id/text/comment/rating ≤10/images), `average_rating`, `is_status` |
| `user_auth_token`   | JWT ledger — every login/refresh recorded for auditing/revocation   | `user_id`, `user_name`, `access_token` (unique), `refresh_token` (unique), `expired_time`, `login_time`, `logout_time` |

**Indexes (products):** `product_code` (unique), `product_owner_id`, `category`, `is_active`, `average_rating` (desc), `total_reviews` (desc), `created_date` (desc).

**Aggregations** power the analytics endpoints (`$group`, `$bucket`, `$avg`, `$unwind`, date grouping).

## Authentication & Authorization

- **Login flow:** `POST /api/auth/token` verifies `user_id`/`email` + bcrypt password, then signs a JWT. Access token expires in **1 hour**, refresh in **7 days**. Tokens are persisted in `user_auth_token` for the session ledger.
- **API protection:** the catch-all route runs `AuthMiddleware.authenticateRequest`, which:
  1. Skips auth for collections listed in `PUBLIC_COLLECTIONS` (e.g. public feedback submission).
  2. Requires a `Bearer` JWT otherwise, verifies signature + expiry against `JWT_SECRET`.
  3. Injects `x-user-id` / `x-user-role` headers consumed by `RESTController` for audit/user context.
- **Client-side guards:** `AuthGuard` (`protected` / `auth` modes) redirects unauthenticated users to `/signin` and enforces admin-only routes (e.g. `/manage`) for `Admin` role only.
- **Token revocation:** `POST /api/auth/revoke` stamps `logout_time` on the token record.
- **Passwords:** hashed with `bcryptjs` (salt rounds 10) on user create/update; hashing is skipped if the value is already a bcrypt hash.

## Screenshots / Demo

No screenshots are included in this repository at this time. A demo flow is available:

- **Demo sign-in:** visit `/signin?isDemoAccount=true` and auto-fill the sample User account.
- **Public feedback:** open any product detail page in the admin area, use the **QR Code** tab, scan it (or open the feedback URL) to submit a review without logging in.
- Live docs: `/api-docs`.

Add screenshots to the `public/` folder and reference them here as they become available.

## Performance & Scalability

- **Cached DB connections** in `lib/db.ts` avoid connection churn in serverless (Next.js) environments; `maxPoolSize: 10`, short server-selection timeout.
- **Pagination + `limit`/`skip`** on list endpoints prevent unbounded payloads; the client `DataTable` pages through results.
- **MongoDB indexes** on hot fields (`product_owner_id`, `category`, `is_active`, rating/review sort fields) keep aggregations and lookups fast.
- **Field projection** (`fields`) and `populate` are supported to limit transferred data.
- **Pre-aggregated counters** (`total_reviews`, `average_rating`) on `product` reduce repeated counting for common reads.
- **Promise-parallelized stats** in the dashboard (`Promise.all`) cut page load latency.
- **Deployable on Vercel** (Next.js native), with the database externalized to MongoDB Atlas to scale independently.

## Security

- **JWT auth** for all non-public API access; tokens expiry-checked and revocable.
- **Bcrypt password hashing** (no plaintext storage) with re-hash detection.
- **Role-based access control** enforced client-side and honored server-side via authenticated user context.
- **Input validation** on models (length limits, rating 1–10, ≤5 questions, email regex) and index constrains (unique `product_code`, `email`, token strings).
- **Standardized error handling** that never leaks secrets or stack traces.
- **Health endpoint** exposes only safe metadata (collection names, no credentials).
- **Session data in `sessionStorage`** (cleared on logout / 401) reduces token leakage surface vs `localStorage`.

> ⚠️ **Known hardening TODO:** the settings page and several `PUBLIC_COLLECTIONS` decisions are still in active development; review the `middleware/auth.ts` public-collection list carefully before production, and enforce role checks (not just client guards) inside controllers for write operations.

## Testing

Currently **no automated test suites** are configured (`lint` is the only code-quality command). Recommended to add:

```bash
npm run lint        # ESLint on the whole project
npm run build       # Type-check + production build (catches TS errors)
```

Suggested roadmap: Vitest/Jest unit tests for `RESTController` and `ResponseFormatter`; integration tests with an in-memory MongoDB for the catch-all routes; Playwright e2e covering sign-in → product creation → QR → anonymous feedback → dashboard stats.

## Deployment

Deploy the Next.js app to a platform of your choice. This repo is configured for Vercel-style deployment:

1. Push the project to a Git provider (e.g. GitHub).
2. On the hosting platform, add the environment variables (`MONGODB_URI`, `JWT_SECRET`, `NODE_ENV`, `PUBLIC_COLLECTIONS`).
3. Build command: `npm run build`; start command: `npm start`.
4. Ensure the MongoDB **network access** allows the hosting platform's IPs.

```bash
npm run build
npm run start
```

## Future Enhancements

- Add automated unit + e2e test suites (Vitest, Playwright).
- Email OTP / email verification on signup.
- Review moderation queue (approve/reject via `is_status`).
- Image upload support for products and review attachments.
- Refresh-token rotation endpoint and automatic silent re-login.
- Multi-language feedback forms and themes.
- Web analytics, PDF report generation, and scheduled email digests.
- Role-based permissions enforced server-side in every controller method.
- Replace hard-coded seed credentials with an env-driven bootstrap flow.

## Known Limitations

- Public feedback form assumes correctly pre-configured public collections; a misconfigured `PUBLIC_COLLECTIONS` can expose write access.
- `reports/*`, `notifications`, and several settings/menu items are **stubs** awaiting implementation.
- Session-based auth relies on `sessionStorage` (lost on tab close) and there is no automatic token-refresh flow yet.
- Seed scripts contain hard-coded connection strings and demo credentials — acceptable for development only.
- No automated test coverage and no CI pipeline yet.
- Ratings are capped at 10; star picker and aggregates follow that scale.

## Contributing

Contributions are welcome!

1. Fork the repository.
2. Create a feature branch: `git checkout -b feat/my-feature`.
3. Make your changes and verify with `npm run lint` and `npm run build`.
4. Commit with a clear message describing the change.
5. Open a Pull Request with a summary of your changes and screenshots if UI-related.

Please follow existing code conventions (controllers, `ResponseFormatter`, shadcn/ui components) and keep additions modular and reusable.

## License

This project is currently **unlicensed** (private development). Add a license file (e.g. MIT) before public release.

## Author / Contact

- **Repository:** [github.com/MabusubhaniShaik/Feedo](https://github.com/MabusubhaniShaik/Feedo)
- **Maintainer:** MabusubhaniShaik
- **Issues & feedback:** open an issue on the GitHub repository above.