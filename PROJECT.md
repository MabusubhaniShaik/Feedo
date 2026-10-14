# Feedo — Complete Project Guide

> Product Feedback & Review Management Platform — one-file reference for how the
> project works, every feature, and every page. Verified against the codebase
> (app/, components/, lib/, helpers/, middleware/, models/) on 2026-10-14.

---

## 1. What Feedo Is

A full-stack monolith where **product owners** create products with custom rating
questions, share a **QR code / link**, and **anonymous customers** submit star
ratings without an account. Owners then analyze results in a dashboard.

- **Frontend:** Next.js 16 App Router + React 19 + TypeScript + Tailwind CSS 4 + shadcn/ui (Radix) — nearly every page is a `"use client"` component.
- **Backend:** Next.js API routes. A generic **catch-all REST layer** (`app/api/[...slug]/route.ts`) auto-exposes CRUD for any registered Mongoose model.
- **Database:** MongoDB via Mongoose 9, cached global connection (`lib/db.ts`).
- **Auth:** JWT (access **1h**, refresh **7d**), bcrypt password hashing, token ledger in MongoDB.
- **Extras:** Scalar OpenAPI UI, `qrcode.react`, CSV export (client-side), sonner toasts.

---

## 2. How It Works (End-to-End Flows)

### 2.1 Request flow (backend)

```
Browser page
  → helpers/api.service.ts  (ApiService singleton: adds
      Authorization: Bearer <session access_token>, x-user-id,
      x-user-role; builds query string; 30s timeout; on 401 clears
      sessionStorage and throws "Authentication expired")
  → /api/<collection>[/id][/subresource]     (catch-all route)
  → AuthMiddleware.authenticateRequest()
      • collection in PUBLIC_COLLECTIONS env → skip auth (public)
      • else require valid Bearer JWT (JWT_SECRET), inject
        x-user-id / x-user-role headers
  → controllers map (lib/controllers/index.ts)
      role · user · product · product-review  → RESTController
  → Mongoose model → MongoDB
  → ResponseFormatter envelope:
      { status, status_code, message, data, pagination? }
      errors: { status:"FAIL", status_code, error, data:[] }
```

Catch-all routing rules (`app/api/[...slug]/route.ts`):

| Slug shape | Dispatch |
|---|---|
| `GET /api/product` | `controller.getAll(req)` — list + pagination |
| `GET /api/product/:id` | `controller.getById(req, id)` |
| `POST /api/product` | `controller.create(req)` (POST with id → 405) |
| `PUT/PATCH /api/product/:id` | `controller.updateById` |
| `DELETE /api/product/:id` | `controller.deleteById` |
| `…/:id/:subresource` | looks for `controller.handle<Subresource>()` |
| plural name with no match | auto-tried singular (`products` → `product`) |
| unknown collection | 404 `Collection not found` |

`RESTController` (`helpers/rest.controller.ts`) provides: query parsing
(`page`, `limit`, `sort` default `-createdAt`, `search`, `id`, `fields`,
field filters with operators `__gte __lte __gt __lt __ne __in __nin __regex`),
hooks (`preSave`, `postSave`, `applyUserFilter`), and `hasPermission`
(**defined but never called anywhere — see §8**).

### 2.2 Login flow

1. `POST /api/auth/token` with `user_id` (or `email`) + `password`.
2. Server: find user → `bcrypt.compare` → sign access (1h) + refresh (7d) JWTs
   with the full user object inside the access token → write a row to
   `user_auth_token` (login_time, expired_time ledger) → return
   `{ access_token, refresh_token, token_type, expires_in: 3600 }`.
3. Client (`/signin`): `jwtDecode(access_token)` → writes 13 keys into
   `sessionStorage` (`access_token`, `refresh_token`, `expires_at`,
   `user_info` JSON with `id`/`role`/…, etc.) → redirect `/dashboard`.
4. Logout (`Header`/`Menu`): `POST /api/auth/revoke` (stamps `logout_time`
   on the ledger row) → clear sessionStorage → `/signin`.

### 2.3 Page protection (client-side only)

`components/AuthGuard.tsx`:

- `mode="protected"` (dashboard layout): no `user_info`/`access_token` → `/signin`; route starts with `/manage` and role ≠ `Admin` → `/not-found`.
- `mode="auth"` (auth layout): already logged in → `/dashboard`.
- Shows skeleton while checking; renders `null` until authorized.

There is **no server-side role enforcement** on writes (see §8).

### 2.4 Feedback collection flow (public)

```
Owner: /product/:id → ProductForm QR block (SVG id "feedback-qr-code")
  → download PNG / copy image / Copy URL → /feedback/<productId>
Customer (no login): opens /feedback/<productId>
  → GET /api/product/:id (product + questions)
  → star picker per question (1..max_rating), optional comment each
  → POST /api/product-review
  → server preSave: recomputes average_rating, backfills
    product_owner_id/name from the product, timestamps
  → client redirects to ?isFeedBackSubmited=true → Thank-You screen
    (auto-resets after 5s)
  → owner sees it on /dashboard and /review
```

> ⚠️ This flow needs `PUBLIC_COLLECTIONS=product,product-review` in the
> environment, otherwise anonymous calls 401. The repo's `.env.local`
> currently only has `JWT_SECRET`, `MONGODB_URI`, `NODE_ENV` — see §8.

### 2.5 Analytics flow

Dashboard fires in parallel: `GET /statistics/owner-stats?product_owner_id=` +
`GET /statistics/review-analytics?product_owner_id=`; then loads
`GET /statistics/product-stats?product_id=` for the top product (re-fetched
when another product is clicked). These three are **dedicated route files**
under `app/api/statistics/*` using raw Mongoose aggregations
(`$group`, `$unwind`, `$bucket`, date bucketing) — not the catch-all.

---

## 3. Commands, Env, Seeders

| Command | What it does |
|---|---|
| `npm run dev` | Next dev server (http://localhost:3000) |
| `npm run build` / `npm start` | Production build / serve (also the type-check gate) |
| `npm run lint` | ESLint (only code-quality command; **no tests exist**) |
| `npm run seed` | Seeds roles from `config/preInstallation/seed/role.seed.json` (Admin=1, User=2, Public=3) |
| `node --import tsx config/preInstallation/user.seed.ts` | Faker demo users (IDs like `USE25-002`, default password `Password@123`) |
| `npm run generate-openapi` | Writes `public/openapi.json` (served at `/openapi.json`) |
| `npm run generate-postman` | Also builds `public/postman-collection.json` |

**Environment (`.env.local`):**

| Key | Required | Purpose |
|---|---|---|
| `MONGODB_URI` | yes | Mongo connection string |
| `JWT_SECRET` | yes | Signs/verifies tokens (`auth/token` falls back to literal `"your-secret-key"` if unset — get it right) |
| `NODE_ENV` | no | `development` enables the global Mongoose cache |
| `PUBLIC_COLLECTIONS` | yes for public feedback | Comma list of collections that skip auth, e.g. `product,product-review` — **currently absent** |

---

## 4. Data Model (MongoDB / Mongoose)

| Collection | Purpose | Key fields |
|---|---|---|
| `role` | Role definitions | `id`, `name` (Admin/User/Public), `description` |
| `user` | App users | `user_id` unique (`USE25-002`), `name`, `email`, `password` (bcrypt, auto-hashed in `UserController.preSave`, re-hash skipped if already `$2a$/$2b$/$2y$`), `role_id`, `role_name`, `is_active`, `is_default_password`, `isEmailVerified` |
| `product` | Products + questionnaires | `product_code` (unique), `name`, `description`, `price`, `category[]`, `image_urls[]`, `product_owner_id/name`, `questions[]` (**≤5**, each `question_text`, `max_rating` 1–10, `info`, `is_active`), `total_reviews`, `average_rating`, `is_active` |
| `product_review` | Customer feedback | `product_id`, `product_code`, `product_owner_id/name`, `user_name`, `mobile_number`, `email`, `review_info[]` (`response_question_id`, `response_question_text`, `response_question_comment`, `response_rating` 1–10, `image_urls[]`), `average_rating`, `is_status` |
| `user_auth_token` | JWT ledger (audit/revoke) | `user_id`, `user_name`, `access_token` (unique), `refresh_token` (unique), `expired_time`, `login_time`, `logout_time` |

Validation highlights: `ProductReviewController.validateData` requires ≥1
`review_info`, each rating 1–10, plus `product_id` and `mobile_number`.

---

## 5. API Reference

### Auth & infra (dedicated routes)

| Endpoint | Method | Auth | Notes |
|---|---|---|---|
| `/api/auth/token` | POST | public | `{email|user_id, password}` → tokens; wrong creds → 401 `{error:"Invalid credentials"}` |
| `/api/auth/revoke` | POST | public | `{access_token, user_id}` → stamps `logout_time`; already revoked → 404 |
| `/api/health` | GET | public | `{connected, db:{name, host, port, collections}}` — no secrets |
| `/api-docs` | GET | public | Scalar UI reading `/openapi.json` |

### Statistics (dedicated routes)

| Endpoint | Params | Returns |
|---|---|---|
| `/api/statistics/owner-stats` | `product_owner_id` | `summary{total_products, total_reviews, average_rating, products_with_reviews}`, `recent_reviews[]`, `top_products[]` |
| `/api/statistics/product-stats` | `product_id` | `product{…}`, `review_statistics{total, avg, min, max, total_questions_answered}`, `question_statistics[]` (per-question avg/responses/comments), `monthly_trend[]` |
| `/api/statistics/review-analytics` | `product_owner_id`, `start_date?`, `end_date?` | `overview{…}`, `daily_trend[]`, `rating_distribution[]` — wrapped in the standard `ResponseFormatter` envelope |

### Generic CRUD (catch-all; JWT unless in `PUBLIC_COLLECTIONS`)

`/api/role`, `/api/user`, `/api/product`, `/api/product-review` —
each supports `GET/POST/PUT/PATCH/DELETE` with query params:
`page`, `limit`, `sort` (e.g. `-created_date`), `search`, `fields`,
`populate`, plain field equality, and operators
`price__gte=100`, `category__in=a,b`, `name__regex=^Se`, `__ne`, `__nin`, `__lte`, `__gt`, `__lt`.

Example success envelope:

```json
{ "status": "SUCCESS", "status_code": 200,
  "message": "Product fetched successfully",
  "data": [ ... ],
  "pagination": { "current_page": 1, "page_count": 2,
                  "total_record_count": 15, "limit": 10 } }
```

---

## 6. Pages — Detailed Reference

Route groups: `(auth)` = split-screen auth layout (AuthGuard `auth`),
`(mainlayout)` = sidebar + header shell (AuthGuard `protected`, admin-only
`/manage`), plus public pages outside both groups.

### 6.1 `/` — Root redirect
Client-side only. Reads `sessionStorage.access_token`: present → `/dashboard`,
else `/signin`. Renders nothing (no flash).

### 6.2 `/signin` — Login
- Left black panel (logo + tagline) via `(auth)/layout`; right = card form.
- Fields: **User ID**, **Password** (show/hide eye toggle).
- Submit → `POST /auth/token` (`requiresAuth:false`) → decode JWT → persist 13 `sessionStorage` keys → toast `Welcome back, <name>` → `/dashboard`.
- **Demo panel only when URL is `/signin?isDemoAccount=true`**: shows role/User ID/Password (`USE25-002` / `Password@123`) with copy buttons + **Auto-fill**.
- Links to `/signup`; shows a "Signing in as: X" line while typing.
- Errors → sonner toast.

### 6.3 `/signup` — **stub** (`<div>Sign-Up page</div>`)

### 6.4 `/dashboard` — Analytics overview (Admin + User)
- Data: parallel `owner-stats` + `review-analytics` for the logged-in owner
  (id from `sessionStorage.user_info.id`), then `product-stats` for the first
  top product.
- **SummaryCards** (4): Total Products · Total Reviews · Average Rating · Products with Reviews.
- **StatisticsTabs** (4 tabs):
  - **Overview** — `RatingDistribution` (rating buckets + %) and `RecentActivity` (latest reviews).
  - **Top Products** — ranked list; clicking one refetches `product-stats` for it.
  - **Product Analytics** — selected product's summary, min/max/avg rating, per-question stats, monthly trend.
  - **Review Analytics** — overview totals, daily trend chart, rating distribution.
- Actions: **Refresh All** (re-runs all fetches) and **Export CSV**
  (handler builds a CSV of summary + daily trend, **but the button is
  `disabled`** — see §8).
- States: `LoadingState` skeleton, `ErrorState` with retry.

### 6.5 `/product` — Product list
- `GET /product?product_owner_id=&page=&limit=` (owner id from session).
- **DataTable** columns: Product Code · Name (15-char truncate) · Description (25-char) · Price (`$x.xx`) · Category badges (first 2 + `+n`) · Status (Active/Inactive) · Actions (**Delete** → red `AlertDialog` confirm → `DELETE /product/:id`, optimistic row removal + count decrement).
- Row click → `/product/:id`. Header buttons: **Add** → `/product/create`, **Refresh**.
- Custom pagination: 5-page window with `…` ellipses; prev/next disabled at ends.

### 6.6 `/product/create` — Create product
- Loads owner options via `GET /user`; renders shared `ProductForm` in `create` mode inside a card.
- **ProductForm fields:** name, product_code (editable in create, disabled in edit; fallback generator `PROD-<timestamp>-<rand>`), description, price (≥0), category chips (add/remove via Enter), owner select, image URLs, and the **question builder: max 5 questions**, each with text, `max_rating` (default 5, allowed 1–10), info tooltip text; add/remove per row; validation requires ≥1 question with valid text.
- Save → validate → `POST /product` (`created_by`/`updated_by:"USER"`) → navigate to `/product/<newId>`.
- Cancel → `router.back()`; Back → `/product`. Skeleton while loading owners; alert + retry on error.

### 6.7 `/product/[id]` — Product detail (view / edit, QR)
- Loads `GET /product/:id` (tolerates array or object response shapes) + `GET /user` for owners.
- **View mode (default):** read-only `ProductForm` (includes the **QR code block** — SVG `id="feedback-qr-code"` with **download PNG** and **copy image** actions pointing at `<origin>/feedback/<id>`).
  Buttons: **Edit** (→ `?isEdit=true`), **Feedback** (opens `/feedback/:id` in new tab), **Copy URL** (clipboard), *(Reports button is commented out)*.
- **Edit mode (`?isEdit=true`):** editable form; **Save** → validate → `PUT /product/:id` (`updated_by:"USER"`) → back to view; **Cancel** → view.
- States: skeleton loading, destructive Alert + **Try Again**, Back to Products.

### 6.8 `/review` — Review explorer
- `GET /product-review` with `{product_owner_id, page, limit, sort}`; sort map: Newest → `-created_date`, Highest → `-average_rating`, Lowest → `average_rating`.
- Header micro-stats (computed on the **current page only**): Overall avg · Reviews · Responses (sum of `review_info` lengths).
- Toolbar: sort Select, **Refresh**, **Export CSV** (current page → columns Product Code, Email, Date, Average Rating, Questions, Comments), record count.
- Each review = **Accordion row**: 5-star render + numeric avg, `product_code` badge, email, date, ✓ **Verified** badge when `is_status`. Expanded: per-question text, star rating shown as `x/5`, optional comment block.
- 5-window pagination; skeleton (3 cards), empty state ("No reviews yet"), error Alert + Retry.

### 6.9 `/profile` — Own profile
- `GET /user?id=<session id>`; view mode by default, edit when `?edit=true`.
- **Basic Information card:** User ID (always read-only), Name, Email (editable in edit), Role (read-only).
- **Change Password card (edit only):** current / new / confirm; client validation (min 6 chars, match). ⚠️ Sent as `currentPassword`/`newPassword` in `PUT /user/:id` but **no backend handler consumes them** — see §8.
- **Verification & Status card:** checkboxes `isEmailVerified`, `is_default_password`, `is_active` (disabled in view), plus Created / Last Updated dates.
- Save → `PUT /user/:id` (`updated_by:"USER_SELF"`) → back to view + alert. **Demo account `USE25-002` cannot be edited** (button disabled + amber "Demo Account" badge).

### 6.10 `/manage` — User management (**Admin only**, guard → `/not-found` for others)
- `GET /user` (single fetch, no pagination).
- **DataTable** columns: User ID · Name · Email · Role badge (Admin = primary) · Status · Created Date · Actions (**Edit**, **Delete** via `confirm()` → `DELETE /user/:id` → refetch).
- Row click → **view dialog**; **Add User** → create dialog; edit dialog → `POST /user` (`created_by:"SYSTEM"`) or `PUT /user/:id`. All use `DataDialog` + `UserForm` (password hashing server-side in `UserController.preSave`).
- Header: **Add User**, **Refresh**.

### 6.11 `/settings`, `/notifications`, `/reports`, `/reports/[id]`, `/feedback` (index), `/signup` — **stubs**
Static placeholder text only. Note `/product/[id]`'s "Reports" button (commented out) would have linked to `/reports?product=<id>`.

### 6.12 `/feedback/[productId]` — Public feedback form (no login)
- `GET /product/:id` → three sections:
  1. **Product Information** — name, description, price, seller, product code, category badges.
  2. **Your Information** — Name (optional), **Mobile Number (required, exactly 10 digits)**, Email (optional, format-checked if filled).
  3. **Feedback Questions** — one block per question: text + ⓘ info tooltip, `Max: <n>`, star picker rendering **`max_rating` stars**, live `x/n` counter, optional comment textarea.
- Submit: drops unrated (0) questions, requires ≥1 rating, computes `average_rating` client-side, `POST /product-review` → `?isFeedBackSubmited=true`.
- **Thank-You screen**: green check, auto-redirect back after 5s, "Go Back to Product" button. **Clear Form** resets everything.
- ⚠️ Anonymous by design → depends on `PUBLIC_COLLECTIONS` (see §8).

### 6.13 `/api-docs` — Scalar API reference (reads `/openapi.json`)

### 6.14 `/not-found` — "Access Denied" page
Styled 403-style screen ("restricted to Admin users only") with **Go to Dashboard** and **Switch Account** (→ `/signin?action=logout`). This is where non-admins landing on `/manage` are sent — so it doubles as the role-block page, not a true 404.

### 6.15 App shell (mainlayout)
- **Sidebar** `MenuComponent` (desktop only, `hidden md:block w-64`; no mobile nav): Dashboard · Product · Review · Profile (Admin+User) · Settings · Manage (Admin only) — role filtering from `config/menu.config.ts`; active-link highlighting by `pathname`; **Logout** (revoke + clear + `/signin`).
- **Header** `HeaderComponent`: user identity + dropdown **Profile / Settings / Billing / Logout**. `/billing` has **no route** → lands on `/not-found`.
- Root layout metadata: title "Feedo - Feedback Management System".

---

## 7. Feature Inventory

**Working**
- JWT login/logout with token ledger, sessionStorage session, auth guards
- Product CRUD + custom questionnaires (≤5 questions, max rating 1–10) + category chips
- QR code generation/download/copy + feedback URL copy on product detail
- Public anonymous feedback form with validation, thank-you state
- Review listing with sort/pagination/CSV export, per-question breakdowns
- 3 analytics endpoints + dashboard cards, 4 tabs, charts (distribution, trends, top products)
- User management (Admin) with dialog-based create/view/edit/delete
- Self-profile view/edit, status flags
- Generic REST API with rich query operators, standard envelope, health check, OpenAPI/Scalar docs, Postman generation
- Seeders for roles and Faker users

**Not implemented / degraded**
- Signup, Settings, Notifications, Reports (+`/reports/[id]`), `/feedback` index, Billing → stubs/missing
- Dashboard **Export CSV button disabled** (handler exists)
- No automated tests, no CI, no refresh-token rotation flow
- No mobile sidebar (menu hidden below `md`)
- Review page displays ratings on a fixed **/5 scale** even when `max_rating` is up to 10

---

## 8. Known Gaps & Gotchas (verified in code)

1. **Public feedback likely 401s locally** — `AuthMiddleware` only skips auth for `PUBLIC_COLLECTIONS`, and `.env.local` doesn't define it. Anonymous `GET /api/product/:id` + `POST /api/product-review` from `/feedback/[productId]` need `PUBLIC_COLLECTIONS=product,product-review` (else `ApiService` throws "Authentication expired"). **Confirm before demoing.**
2. **Password change is client-only** — `/profile` sends `currentPassword`/`newPassword` to `PUT /api/user/:id`, but no controller/model consumes them and the current password is never verified server-side; only `password` would be hashed if present. Changing password from the UI does nothing server-side.
3. **No server-side role enforcement** — `RESTController.hasPermission()` is never invoked, `applyUserFilter` is a no-op, and admin-only access to `/manage` is enforced purely by the client `AuthGuard`. Any authenticated JWT can call write endpoints on any collection.
4. **`JWT_SECRET` fallback** — `app/api/auth/token/route.ts` defaults to `"your-secret-key"` if the env var is missing (middleware does *not* fallback and errors instead) — an unset secret produces a working login signed with a guessable key.
5. **Dashboard Export CSV is `disabled`** — `handleExport` is implemented but the button can't be clicked.
6. **Rating display mismatch** — review page renders `x/5` and 5 stars regardless of each question's `max_rating` (up to 10); the feedback form correctly renders `max_rating` stars.
7. **Dead links** — header "Billing" → `/billing` (no route → `/not-found`); commented-out "Reports" button; `/not-found` is a generic "Admin only" page used for both 404 and role blocks.
8. **Micro-stats scope** — `/review` header stats (Overall/Reviews/Responses) are computed from the current page only, not the whole dataset.
9. **No tests** — only `lint` + `build`. Seed scripts hard-code demo credentials (dev-only).
10. **`.env.local` is NOT in `.gitignore`** — it can be committed with real credentials; add it before pushing.
11. **Dead code** — `components/forms/UserProfileForm.tsx` is never imported; `/profile` builds its form inline. `RESTController` also has `handle…` sub-resource support but no controller defines any.

---

## 9. Project Structure (map)

```
app/
├── page.tsx                    # root redirect (token → dashboard)
├── not-found.tsx               # Access Denied screen
├── layout.tsx · globals.css
├── (auth)/                     # AuthGuard "auth" + split layout
│   ├── layout.tsx · signin/ · signup/ (stub)
├── (mainlayout)/               # AuthGuard "protected" + sidebar/header
│   ├── layout.tsx
│   ├── dashboard/  product/{page,create,[id]}  review/
│   ├── profile/  manage/  settings/  notifications/  reports/{page,[id]} (stubs)
├── feedback/
│   ├── page.tsx (stub)  [productId]/page.tsx  ← public form
├── api/
│   ├── [...slug]/route.ts      # generic REST + auth dispatch
│   ├── auth/{token,revoke}/  health/
│   └── statistics/{owner-stats,product-stats,review-analytics}/
└── api-docs/                   # Scalar OpenAPI UI
components/
├── AuthGuard · HeaderComponent · MenuComponent
├── SummaryCards · StatisticsTabs · RatingDistribution · RecentActivity
├── TopProducts · ProductAnalytics · ReviewAnalytics · LoadingState · ErrorState
├── common/{DataTable,DataDialog}   forms/{ProductForm,UserForm,UserProfileForm}
└── ui/                          # shadcn primitives
config/   menu.config.ts · preInstallation/ (role + faker seeders)
helpers/  rest.controller.ts · api.service.ts · response.formatter.ts
lib/      controllers/ · db.ts · swagger.ts · utils.ts
middleware/  auth.ts (JWT + PUBLIC_COLLECTIONS bypass)
models/   role · user · product · product_review · auth (token ledger)
utils/    auth.ts · session.utils.ts
```

---

## 10. Typical End-to-End Demo Path

1. `npm run seed` → `node --import tsx config/preInstallation/user.seed.ts` → `npm run dev`.
2. Add `PUBLIC_COLLECTIONS=product,product-review` to `.env.local` (needed for step 5).
3. `/signin?isDemoAccount=true` → Auto-fill (`USE25-002` / `Password@123`) → Sign In.
4. `/product/create` → add name/code/price/category + questions → Create → open detail → **QR tab** → Download QR / Copy URL.
5. Open `/feedback/<productId>` in a private window → rate + submit → thank-you screen.
6. Back at `/dashboard`: Refresh All → summary cards, Overview, Top Products (click to switch), Product/Review Analytics; `/review` → sort, expand, Export CSV.
7. Admin account → `/manage` for user CRUD; `/api-docs` for the API browser; `/api/health` for DB status.
