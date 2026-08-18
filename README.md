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
| HTTP client | Axios (single shared instance) |
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

The dark theme keeps the same hues and only lightens them, so the brand stays recognisable while text and controls remain legible on dark surfaces.

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

| Variable | Required | Default | Description |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_API_BASE_URL` | No | `https://dummyjson.com` | Base URL of the REST API |

All configuration is read through `src/config/env.ts`; no host or secret is hardcoded in feature code.

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
│   └── recipes/
│       ├── page.tsx              # Card listing
│       └── [id]/page.tsx         # Server-rendered details
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
│   │   ├── services/             # product.service.ts (all Axios calls)
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
- **Layering:** `app/` → `modules/*/components` → `modules/*/hooks` → `modules/*/services` → `lib/api-client`. A page never calls Axios directly.

---

## Features by module

### Products

- Reusable, generic `DataTable` component drives the listing.
- **Server-side search** (`/products/search?q=`), **sorting** (`sortBy` + `order`) and **pagination** (`limit` + `skip`) — the client only forwards parameters.
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

## Implementation notes

**Loading, success and error states.** Every query renders one of three surfaces: a skeleton or `Loader` while pending, the data on success, or an `ErrorState` with a retry action on failure. Mutations disable their submit button while in flight and report the outcome through a toast. Axios errors are normalised into an `ApiError` with a readable message by a response interceptor.

**Responsiveness.** Layouts are fluid from 320 px upwards: the navigation collapses into a drawer, filter bars stack, secondary table columns are hidden on small screens (`hideOnMobile`), tables scroll horizontally rather than overflowing the page, and the recipe grid reflows across four breakpoints.

**Type safety.** `strict` TypeScript throughout; API envelopes, module entities, form values (inferred from the Yup schemas) and the generic `DataTable` are all typed. There are no `any` casts in feature code.

**Accessibility.** Semantic landmarks, `aria-sort` on sortable headers, `aria-current` on the active nav item, labelled icon-only buttons, `role="alert"` on validation and error surfaces, and visible focus rings.

**API caveat.** DummyJSON is a read-only demo API: create, update and delete requests return a realistic simulated response but do not persist. The UI treats them as successful mutations and invalidates the relevant React Query caches, which is exactly how it would behave against a real backend.

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
| 8 | Reusable Table + server-side search/sort/pagination | `src/components/common/data-table.tsx`, `src/modules/products/services/product.service.ts` |
| 9 | Product Details page | `src/app/products/[id]/page.tsx` |
| 10 | Add Product page | `src/app/products/new/page.tsx` |
| 11 | Edit Product page | `src/app/products/[id]/edit/page.tsx` |
| 12 | Delete from listing | `src/modules/products/components/product-list-view.tsx` |
| 13 | Preserve & restore listing state | `src/hooks/use-list-params.ts` |
| 14 | User CRUD on one page (modal + drawer) | `src/modules/users/components/*` |
| 15 | Recipes card listing with search + pagination | `src/modules/recipes/components/recipe-list-view.tsx` |
| 16 | Recipe details via server-side API call | `src/app/recipes/[id]/page.tsx` |
| Bonus | shadcn/ui components | `src/components/ui/*` |
