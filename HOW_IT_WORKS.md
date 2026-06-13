# How FreeStack Works

> This document walks the architecture, data pipeline, and internals for contributors and curious readers. For the project overview and quick-start, see the [README](./README.md).

---

## 1. Overview

FreeStack is a searchable frontend for [ripienaar/free-for-dev](https://github.com/ripienaar/free-for-dev) — the canonical community list of developer services that offer a genuine free tier. The upstream source is a single giant alphabetical README (~1,600 contributors, 56+ categories). FreeStack turns it into a fast, goal-first directory: you start from what you need to build ("Host a website", "Spin up a database", "Add login & auth") instead of having to know whether the thing you want is filed under "BaaS", "PaaS", or "Managed Data Services." The headline differentiator is the **side-by-side free-tier compare**: pick 2–4 services and FreeStack lays their extracted free-tier limits out as a table, with the best value in each row highlighted.

---

## 2. Architecture at a glance

- **Next.js 15** (App Router) · **React 19** · **TypeScript** · **Tailwind CSS v4** · **framer-motion**
- **Static-first / fully client-side at runtime.** The root page (`app/page.tsx`) is a Next.js server component that imports `data/services.json` at build time. The directory, filtering, and compare features all run client-side. There is no database, no API route, and no server-side rendering of the grid.
- **One server touch per deploy:** `app/page.tsx` fetches the FreeStack GitHub star count via `fetch(..., { next: { revalidate: 3600 } })` to keep the header badge fresh.
- **Hosted on Vercel free tier.** The build output is a static shell + a single revalidating RSC; no backend infrastructure is needed.

---

## 3. Data pipeline

**Script:** `scripts/build-data.ts` (run via `tsx`)
**Run:** `npm run data`

### Upstream source

The script fetches the raw README directly from GitHub:
```
https://raw.githubusercontent.com/ripienaar/free-for-dev/master/README.md
```
No local clone is required — the fetch happens at data-generation time and the result is committed to `data/services.json`, so production builds are reproducible with zero network calls.

### Parse

`parse(md)` walks every line of the README with three regexes:

| Pattern | Purpose |
|---|---|
| `SERVICE_RE` | Top-level bullet: `* [Name](url) - description` |
| `PROVIDER_RE` | Bare provider link with no description (cloud providers like AWS, GCP) |
| `SUBITEM_RE` | Indented sub-bullet under a cloud provider (e.g. "S3 - 5 GB …") |

`## ` headings set the current `category`. Lines before the first real content heading (e.g. "Table of Contents") are skipped. Cloud-provider sub-bullets are named as `"ProviderName · ProductName"` and linked back to the provider URL when no direct link is present. Duplicates are deduplicated by a `slug(name + domain)` key.

### Enrich

After parsing, each service is enriched with:

1. **Logo URL** — `https://icon.horse/icon/{domain}` (icon.horse resolves favicons server-side; the card falls back to a tinted monogram if the image fails to load).
2. **Structured facets** — `extractFacets(description)` runs regex passes over the free-tier prose to extract:
   - `storageGb` — first storage figure in GB/TB/MB (excluding egress/bandwidth context)
   - `bandwidthGb` — egress/transfer/bandwidth figure in GB/TB
   - `requestsPerMonth` — requests/events/invocations/pageviews, with `k`/`m`/`million` multipliers
   - `buildMinutes` — CI build-minute allowance (only when context includes "build/ci/pipeline")
   - `seats` — users/team members/collaborators
   - `projects` — projects/apps/sites/repos
   - `openSource: true` — if "open source" appears in the text
   - `noCreditCard: true` — "no credit card", "without credit card", "credit card not required"
   - `unlimited: string[]` — things described as unlimited, e.g. `["projects", "users"]`
3. **`freeTierNotes`** — `freeTierLine(description)` picks the most "free-tier-like" sentence (one matching storage, request, plan, tier, etc. keywords) to surface prominently on cards and in the compare table.

### Output

```ts
// data/services.json
{
  generatedAt: string;        // ISO timestamp of when the script ran
  source: string;             // "https://github.com/ripienaar/free-for-dev"
  count: number;
  categories: Category[];     // sorted by size desc; each: { name, count, id }
  services: Service[];        // sorted A–Z by name
}
```

### Service record shape

```ts
type Service = {
  id: string;              // slug of "name-domain", e.g. "supabase-supabase-com"
  name: string;
  url: string;
  domain: string;          // e.g. "supabase.com"
  category: string;        // upstream ## heading
  description: string;     // full prose from the README bullet
  freeTierNotes: string;   // most free-tier-relevant sentence
  logo: string;            // icon.horse URL
  facets: {
    storageGb?: number;
    requestsPerMonth?: number;
    seats?: number;
    projects?: number;
    bandwidthGb?: number;
    buildMinutes?: number;
    openSource?: boolean;
    noCreditCard?: boolean;
    unlimited?: string[];  // up to 4 items
  };
};
```

---

## 4. The goal layer — `lib/goals.ts`

The upstream list organizes services by what they *are* (tech categories like "BaaS"). Developers think in jobs — "I need a database." `lib/goals.ts` defines 24 plain-language goals that map over those categories.

```ts
type Goal = {
  id: string;           // e.g. "database"
  label: string;        // "Spin up a database"
  short: string;        // "Database" (chip label)
  icon: string;         // emoji
  categories: string[]; // free-for-dev category names that satisfy this goal
};
```

**Matcher — `servicesForGoal(services, goal)`:**
Filters services to those whose `category` is in `new Set(goal.categories)`. Pure set-membership check — no fuzzy matching.

**Tile metadata — `goalMeta(services)`:**
Returns `{ count, examples: string[] }` per goal, where `examples` is the first 3 service names in the matched set. Used by `GoalGrid` to show subtitles like "Supabase · PlanetScale · Neon" under the tile.

**Usage in the UI:** `Directory.tsx` calls `servicesForGoal` inside a `useMemo` whenever `goal` state changes. The result becomes the `base` array that search and facet toggles then refine.

---

## 5. Key components and data flow

```
app/page.tsx (RSC)
  └─ imports services.json at build time
  └─ <Header>          — logo, star count, nav
  └─ <Hero>            — headline stats
  └─ <AppShell>        — client island (wraps CompareProvider)
       ├─ <Directory>  — goal grid + search + filter + service cards
       ├─ <CompareTray>— sticky bottom bar summarizing current selection
       └─ <CompareModal>— full side-by-side comparison table
  └─ <HowItWorks>      — static explainer section
  └─ <Footer>          — data freshness date, links
```

### State: `CompareContext` / `useCompare`

`components/CompareContext.tsx` is a React context that holds the list of selected `Service` objects (up to `MAX_COMPARE = 4`) and whether the comparison modal is open. Unlike CanIHost's selection (which stores only IDs), `CompareContext` stores full `Service` objects so the modal can render without looking anything up.

### `AppShell`

A thin client boundary that wraps `CompareProvider` around `Directory`, `CompareTray`, and `CompareModal`, so all three share the same compare state.

### `Directory` component

1. Manages `query`, `goal`, `category`, `toggles` (a `Set<string>` of active facet keys), and `limit` for pagination.
2. Uses `useDeferredValue(query)` so fast typing doesn't block card rendering.
3. `base` = `servicesForGoal(...)` if a goal is active, else all services.
4. `filtered` = `base` with category filter, facet toggles (`TOGGLE_FACETS` from `lib/format.ts`), and text search (name, domain, category, description).
5. When no goal is active, a horizontally scrollable category chip rail is shown. When a goal is active, it's replaced by a goal banner showing which upstream categories are included.
6. Renders in pages of 60 with a "Show more" button. The grid gets `paddingBottom: 88px` when the compare tray is visible to prevent cards from hiding under it.

### `ServiceCard`

CSS-only card with no local state. Shows the logo, service name, domain, the `freeTierNotes` line, and up to 3 facet chips (rendered by `facetChips()` from `lib/format.ts`). The "Compare" button calls `toggle(service)` on `CompareContext`. When `isFull` and the card is not selected, the button is disabled with a tooltip.

---

## 6. The differentiator features

### Free-tier facet extraction

`extractFacets()` in `scripts/build-data.ts` runs conservative regex passes over each service's free-tier prose. Key design choices:
- Storage and bandwidth are extracted separately (bandwidth/egress is excluded from the storage match).
- Numeric multipliers (`k`, `m`, `million`, `thousand`, `billion`) are normalized in `scaled()`.
- Boolean facets (`openSource`, `noCreditCard`) use multi-pattern matching to handle common phrasings.
- `unlimited: string[]` captures up to 4 items described as unlimited (e.g. `["projects", "users"]`).
- The facets are intentionally conservative — a value is only set if the regex has strong signal. The full description is always preserved in `freeTierNotes`.

`TOGGLE_FACETS` in `lib/format.ts` exposes four facet-driven filter toggles: "Open source", "No credit card", "Free storage" (`storageGb != null`), "Free requests" (`requestsPerMonth != null`).

### Side-by-side compare — `CompareModal` + `CompareTray`

**Selection flow:**
1. User clicks "Compare" on a `ServiceCard` → `toggle(service)` adds it to `CompareContext.selected` (max 4).
2. `CompareTray` spring-animates up from the bottom with logo chips for each selected service and a "Compare N" button (disabled until ≥ 2 are selected).
3. Clicking "Compare" sets `open = true` on `CompareContext`, triggering `CompareModal`.

**Compare table (`CompareModal`):**
- Columns = selected services; rows = `FACET_ROWS` from `lib/format.ts` (Storage, Bandwidth, Requests/mo, Build minutes, Seats, Projects, Open source, No credit card) plus a "Free tier details" row showing `freeTierNotes`.
- Only rows where **at least one** selected service has a value are rendered (`activeRows`).
- **Best-value highlighting:** for numeric facets in `higherIsBetter` (storage, bandwidth, requests, build minutes, seats, projects), `bestIndexFor(key)` finds the column index with the highest value. If there is no tie, that cell gets `bg-mint` (emerald tint) and a green "best" badge. Ties are not highlighted.
- Escape closes the modal; body scroll is locked while open.

---

## 7. SEO and rendering

| Feature | Implementation |
|---|---|
| Title / description | `app/layout.tsx` — Next.js `Metadata` object |
| Open Graph / Twitter card | Same `Metadata` object — links to `/og.png` (1200×630) |
| Generated OG image | `app/opengraph-image.tsx` — `next/og` `ImageResponse`; renders the tagline + live service count baked from `services.json` |
| JSON-LD | `app/page.tsx` — `WebSite` schema with `SearchAction` (`target: ${SITE.url}/?q={search_term_string}`) |
| Sitemap | `app/sitemap.ts` — single URL entry, `changeFrequency: "weekly"` |
| robots.txt | `app/robots.ts` — allow all, points to `/sitemap.xml` |
| Canonical URL | Set in `Metadata.alternates.canonical` |
| Font | Inter loaded via `next/font/google` |

---

## 8. Run it locally

```bash
# 1. Install dependencies
npm install

# 2. (Re)generate data from the live upstream README
npm run data          # fetches ripienaar/free-for-dev README, writes data/services.json

# 3. Dev server
npm run dev           # → http://localhost:7693

# 4. Production build (includes typecheck)
npm run build

# 5. Capture README screenshots via Playwright (dev/prod server must be running)
npm run shot
```

The data script (`scripts/build-data.ts`) is TypeScript and is executed directly via `tsx` — no separate compile step.

---

## 9. Project structure

```
freestack/
├── app/
│   ├── layout.tsx            # global metadata, font, body wrapper
│   ├── page.tsx              # RSC: imports JSON, emits JSON-LD, fetches star count
│   ├── globals.css           # Tailwind v4 base + CSS variables / utilities
│   ├── opengraph-image.tsx   # generated OG image (next/og ImageResponse)
│   ├── robots.ts             # robots.txt route
│   ├── sitemap.ts            # sitemap.xml route
│   └── icon.svg              # favicon
│
├── components/
│   ├── AppShell.tsx          # client boundary: wraps CompareProvider around Directory + tray + modal
│   ├── CompareContext.tsx    # compare selection state (up to 4 Service objects)
│   ├── CompareTray.tsx       # sticky bottom bar summarizing current selection
│   ├── CompareModal.tsx      # full side-by-side comparison table with best-value highlighting
│   ├── Directory.tsx         # search/goal/filter grid (client component)
│   ├── GoalGrid.tsx          # 24-goal tile grid with counts and examples
│   ├── ServiceCard.tsx       # individual service card (CSS-only, no local state)
│   ├── Logo.tsx              # icon.horse logo with monogram fallback
│   ├── HowItWorks.tsx        # static explainer section on the homepage
│   ├── Header.tsx / Footer.tsx / Hero.tsx
│   └── icons.tsx             # inline SVG icon components
│
├── lib/
│   ├── types.ts              # Service, Facets, Category, ServicesData type definitions
│   ├── goals.ts              # 24 Goal definitions + servicesForGoal() + goalMeta()
│   ├── format.ts             # FACET_ROWS, TOGGLE_FACETS, facetChips(), compact(), gb()
│   └── site.ts               # SITE constant (URLs, repo name)
│
├── scripts/
│   ├── build-data.ts         # data pipeline: fetch README → parse → enrich → services.json
│   └── capture.mjs           # Playwright script to capture README screenshots
│
├── data/
│   └── services.json         # committed, baked service records (generated)
│
└── assets/                   # README screenshots
```
