# Infiniqe Console — Frontend Technical Round

A small CRUD application built with the **Next.js App Router**, covering three modules — **Products**, **Users** and **Recipes** — backed by the public [DummyJSON](https://dummyjson.com) API.

---

## Tech stack

| Concern | Choice |
| --- | --- |
| Framework | Next.js 16 (App Router) + React 19 |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v4 |
| UI primitives | shadcn/ui (Base UI) |
| Font | DM Sans via `next/font/google` |
| Data layer | Next.js Route Handlers (`/api/*`) over the upstream API |
| HTTP client | Axios (one browser instance, one server instance) |
| Server state | TanStack Query (React Query) v5 |
| Forms | React Hook Form + Yup |
| Notifications | Sonner |

### Brand colours

Applied globally as design tokens in `src/app/globals.css`:

| Role | Colour | Hex |
| --- | --- | --- |
| Primary | Royal Blue | `#2563EB` |
| Secondary | Slate Gray | `#64748B` |
| Accent | Emerald Green | `#10B981` |

These three values are used **exactly as given, in both the light and the dark theme** — no tints, shades or derived variants. Everything else on screen is either neutral (white / near-black / gray for surfaces, text and borders) or the single destructive red reserved for delete actions and error messages.

Only the neutrals invert between themes; the brand tokens never change.

---

## Getting started

**Requirements:** Node.js 20.9+ and npm.

```bash
# 1. Install dependencies
npm install

# 2. (Optional) point the app at a different API host
cp .env.example .env.local

# 3. Start the dev server
npm run dev
```

Open <http://localhost:3000>.

### Available scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Create a production build |
| `npm run start` | Serve the production build |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Run the TypeScript compiler with no emit |

### Environment variables

| Variable | Required | Default | Scope | Description |
| --- | --- | --- | --- | --- |
| `NEXT_PUBLIC_API_BASE_URL` | No | `/api` | Browser | Base URL the app's own API routes are served from |
| `UPSTREAM_API_BASE_URL` | No | `https://dummyjson.com` | Server | Read-only upstream the server mirrors data from |
| `LOCAL_DATA_FILE_NAME` | No | `overlay.json` | Server | File inside `.data/` holding local changes |

All configuration is read through `src/config/env.ts`; no host or secret is hardcoded in feature code. Server-only settings live behind a separate `serverEnv` export so they can never leak into the client bundle.

---

## Folder structure

The project is organised **module-first**: everything a feature owns (types, schema, service, hooks, components) lives inside its own folder, while genuinely shared code sits at the top level.

```
src/
├── app/                          # Routes only — each page delegates to a module view
│   ├── layout.tsx                # Root layout: fonts, metadata, providers, chrome
│   ├── page.tsx                  # Dashboard
│   ├── not-found.tsx             # Custom 404
│   ├── error.tsx                 # Route-level error boundary
│   ├── products/
│   │   ├── page.tsx              # Listing
│   │   ├── new/page.tsx          # Add Product
│   │   └── [id]/
│   │       ├── page.tsx          # Product Details
│   │       └── edit/page.tsx     # Edit Product
│   ├── users/page.tsx            # Single-page user CRUD
│   ├── recipes/
│   │   ├── page.tsx              # Card listing
│   │   └── [id]/page.tsx         # Server-rendered details
│   └── api/                      # Route Handlers — the app's own data API
│       ├── products/             # GET (list) POST · [id]: GET PUT DELETE · categories
│       ├── users/                # GET (list) POST · [id]: GET PUT DELETE
│       ├── recipes/              # GET (list) · [id]: GET · tags
│       └── local-data/           # GET status · DELETE reset local changes
│
├── server/                       # Server-only data layer (never bundled for the browser)
│   ├── upstream/                 # Axios client + TTL cache for the read-only upstream API
│   ├── overlay/                  # The local write layer: store + merge logic
│   ├── shared/                   # search/sort/paginate helpers, JSON response helpers
│   ├── products/                 # product.repository.ts
│   ├── users/                    # user.repository.ts
│   └── recipes/                  # recipe.repository.ts
│
├── components/
│   ├── ui/                       # shadcn/ui primitives (button, input, table, dialog, sheet…)
│   ├── common/                   # Reusable app-level building blocks
│   │   ├── data-table.tsx        # Generic, sortable table
│   │   ├── pagination.tsx        # Server-side pagination control
│   │   ├── search-input.tsx      # Debounced search field
│   │   ├── confirm-dialog.tsx    # Destructive-action confirmation
│   │   ├── loader.tsx            # Spinner / page loader
│   │   ├── empty-state.tsx       # "No records" surface
│   │   ├── error-state.tsx       # Failure surface with retry
│   │   ├── page-header.tsx       # Title + back link + actions
│   │   └── form-field.tsx        # Label + control + validation message
│   └── layout/                   # Navbar, footer, logo
│
├── modules/
│   ├── products/
│   │   ├── components/           # product-list-view, product-form, detail, create, edit
│   │   ├── hooks/                # use-products, use-product-mutations
│   │   ├── services/             # product.service.ts (browser Axios calls)
│   │   ├── schemas/              # product.schema.ts (Yup)
│   │   └── types/                # product.types.ts
│   ├── users/                    # same shape
│   └── recipes/                  # same shape
│
├── hooks/                        # Cross-module hooks (use-list-params, use-debounce, use-is-mounted)
├── lib/                          # api-client.ts (Axios), query-keys.ts, utils.ts
├── config/                       # env.ts, site.ts
├── providers/                    # query-provider.tsx, theme-provider.tsx
└── types/                        # Shared API types
```

### Naming conventions

- **Files:** `kebab-case` everywhere (`product-list-view.tsx`, `use-list-params.ts`).
- **Components:** `PascalCase` exports; **hooks:** `useCamelCase`; **types/interfaces:** `PascalCase`.
- **Suffixes:** `*.service.ts`, `*.schema.ts`, `*.types.ts` make a file's role obvious at a glance.
- **Layering (browser):** `app/` → `modules/*/components` → `modules/*/hooks` → `modules/*/services` → `lib/api-client`. A page never calls Axios directly.
- **Layering (server):** `app/api/*/route.ts` → `server/<module>/*.repository.ts` → `server/overlay` + `server/upstream`. A route handler never talks to the upstream API directly.

---

## Features by module

### Products

- Reusable, generic `DataTable` component drives the listing.
- **Server-side search**, **sorting** (`sortBy` + `order`) and **pagination** (`page` + `limit`) — all resolved by `GET /api/products`; the client only forwards parameters.
- Search and the category filter **combine**, and sorting applies to search results too.
- Dedicated **Details**, **Add** and **Edit** pages, plus **Delete** from the listing behind a confirmation dialog.
- **State preservation:** search, sort and page live in the URL. Navigating to Details/Edit appends the listing state as `?from=…`, and the "Back to products", "Cancel" and post-save redirects rebuild the exact same view — including after a hard refresh or when the link is shared.

### Users

Full CRUD on a single route:

- Reusable table with server-side search, sorting, pagination and a gender filter.
- **Modal** for Add and Edit.
- **Drawer/Sidebar** for viewing a full profile.
- **Delete** from the listing behind a confirmation dialog.

### Recipes

- Responsive **card grid** (1 → 2 → 3 → 4 columns) with search, tag filter and pagination.
- **Details page fetched server-side** in an async Server Component, deduplicated with `React.cache` so `generateMetadata` and the render share one request. A missing recipe renders the custom 404 with a real `404` status.

---

## Making a read-only API writable

DummyJSON is a **read-only** demo API. Its `POST`/`PUT`/`DELETE` endpoints return a realistic response but change nothing, so a naive client would show a success toast and then display the old data on the next refetch. To make CRUD genuinely work, this app owns its data layer instead of proxying writes to a source that ignores them.

### How it works

```
Browser ──Axios──► /api/products ──► product.repository ──┬─► upstream (DummyJSON, read-only, cached)
                                                          └─► overlay store (.data/overlay.json, writable)
```

1. **Route Handlers** under `src/app/api/*` are the only data API the browser knows about.
2. A **repository** per module reads the full upstream collection (a few hundred records, cached in memory for 5 minutes with concurrent misses de-duplicated).
3. An **overlay store** records every local write as a diff — `created` records in full, `updated` records as patches, `deleted` as a list of hidden ids — and persists it to `.data/overlay.json`.
4. On every read the overlay is **replayed over** the upstream data: deleted ids are dropped, patches are merged, and locally created records are appended.
5. Only then does the server apply **search → sort → paginate**, so local records behave exactly like upstream ones in every listing, filter and page.

### What this gives you

- Create, update and delete **persist across refreshes and server restarts**.
- Upstream records can be **edited and deleted**, not just local ones.
- New records take part in search, sorting, pagination and the category/tag filters.
- Ids for local records start at `900001`, so they can never collide with upstream ids.
- Rows created or edited locally are flagged with a **"New"** or **"Edited"** badge in the UI.
- Writes are **validated on the server** with the same Yup schemas the forms use, so the rules cannot drift between client and server (invalid payloads return `422` with the messages).
- If the filesystem is not writable (a read-only serverless runtime, for example), the store degrades to **memory-only** instead of failing requests.

### Resetting

```bash
# Report how many local changes are layered over the upstream data
curl http://localhost:3000/api/local-data

# Discard every local change and restore the pristine upstream dataset
curl -X DELETE http://localhost:3000/api/local-data
```

Deleting the `.data/` directory has the same effect.

### Why not a database?

A real database (Prisma + SQLite/Postgres) would be the production answer, but it would also replace the DummyJSON dataset the assignment specifies. The overlay keeps DummyJSON as the source of truth for the seed data while making every record writable — and because the repositories are the only thing that knows this, swapping the overlay for a real database later means rewriting one folder, not the app.

---

## Implementation notes

**Loading, success and error states.** Every query renders one of three surfaces: a skeleton or `Loader` while pending, the data on success, or an `ErrorState` with a retry action on failure. Mutations disable their submit button while in flight and report the outcome through a toast. Axios errors are normalised into an `ApiError` with a readable message by a response interceptor.

**Responsiveness.** Layouts are fluid from 320 px upwards: the navigation collapses into a drawer, filter bars stack, secondary table columns are hidden on small screens (`hideOnMobile`), tables scroll horizontally rather than overflowing the page, and the recipe grid reflows across four breakpoints.

**Type safety.** `strict` TypeScript throughout; API envelopes, module entities, form values (inferred from the Yup schemas) and the generic `DataTable` are all typed. There are no `any` casts in feature code.

**Accessibility.** Semantic landmarks, `aria-sort` on sortable headers, `aria-current` on the active nav item, labelled icon-only buttons, `role="alert"` on validation and error surfaces, and visible focus rings.

**Mutations.** Every mutation invalidates the relevant React Query caches on success, so listings, detail screens and filters all reflect the change immediately — and because the write actually persists server-side, the data is still there after a refresh.

---

## Requirement coverage

| # | Requirement | Where |
| --- | --- | --- |
| 1 | App Router + TypeScript + Tailwind + DM Sans | `src/app/layout.tsx`, `src/app/globals.css` |
| 2 | Brand colours applied globally | `src/app/globals.css` |
| 3 | Module-wise folder structure | `src/modules/*` |
| 4 | Consistent naming conventions | See "Naming conventions" |
| 5 | Logo, favicon, metadata | `src/components/layout/logo.tsx`, `src/app/icon.svg`, `src/app/layout.tsx` |
| 6 | Custom 404 page | `src/app/not-found.tsx` |
| 7 | Axios + React Query configured | `src/lib/api-client.ts`, `src/providers/query-provider.tsx` |
| 8 | Reusable Table + server-side search/sort/pagination | `src/components/common/data-table.tsx`, `src/app/api/products/route.ts` |
| 9 | Product Details page | `src/app/products/[id]/page.tsx` |
| 10 | Add Product page | `src/app/products/new/page.tsx` |
| 11 | Edit Product page | `src/app/products/[id]/edit/page.tsx` |
| 12 | Delete from listing | `src/modules/products/components/product-list-view.tsx` |
| 13 | Preserve & restore listing state | `src/hooks/use-list-params.ts` |
| 14 | User CRUD on one page (modal + drawer) | `src/modules/users/components/*` |
| 15 | Recipes card listing with search + pagination | `src/modules/recipes/components/recipe-list-view.tsx` |
| 16 | Recipe details via server-side API call | `src/app/recipes/[id]/page.tsx` |
| Bonus | shadcn/ui components | `src/components/ui/*` |
| Extra | Writes that actually persist | `src/server/overlay/*`, `src/app/api/*` |
