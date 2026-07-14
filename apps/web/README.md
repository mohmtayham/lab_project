# LabSphere Web

Animated frontend for the LabSphere Laboratory Information System, built with **Next.js 14 (App Router) + TypeScript + Tailwind CSS + Framer Motion**.

## Highlights

- **Framer Motion everywhere** — page transitions, staggered table rows, animated stat counters, spring-based sidebar indicator, modal enter/exit, notification/menu popovers.
- **TanStack Query** data layer with a typed `fetch` client (auto access-token refresh on 401).
- **RBAC-aware UI** — navigation and action buttons appear only for the permissions the signed-in user holds.
- Full workspace: dashboard (charts + KPIs), patients, orders, requests, samples, results (enter → review → approve/reject with history timeline), tests, devices, payments, support requests, users & roles.

## Getting started

```bash
npm install
# point the app at your API (defaults to http://localhost:8000/api)
# edit .env.local if needed
npm run dev
```

Open http://localhost:3000 and sign in with the seeded admin account:

```
admin@labsphere.io / Admin@123
```

## Structure

```
app/
  (auth)/            login + register (split-screen animated auth)
  (dashboard)/       protected workspace (sidebar + topbar shell)
    dashboard/       KPIs, charts, recent activity
    patients/ orders/ requests/ samples/ results/
    tests/ devices/ payments/ support/ users/
components/
  ui/                Button, Field, Modal, Table, Badge, Pagination, states
  layout/            Sidebar, Topbar, NotificationBell
  dashboard/         StatCard (count-up), Charts (recharts)
  motion.ts          shared Framer Motion variants
lib/
  api.ts             fetch client + token store + refresh
  auth-context.tsx   session/auth provider
  types.ts           shared domain types
  nav.ts utils.ts    navigation + helpers
```

> Auth is handled client-side (tokens in `localStorage`, guarded layout). This keeps the app a pure SPA against the Nest API.
