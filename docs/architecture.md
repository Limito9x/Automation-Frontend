# HybridVSA Frontend — Architecture

## Tech Stack

| Role | Library |
|---|---|
| Framework | React 19 + TypeScript + Vite |
| Styling | Tailwind CSS v4 + shadcn/ui (Nova style) |
| Routing | TanStack Router (file-based) |
| Server State | TanStack Query v5 |
| Form State | React Hook Form + Zod |
| API Client | hey-api (generated from OpenAPI spec) |
| Date/Time | Temporal API + `temporal-polyfill` (Safari fallback) |
| Icons | Lucide React |

---

## Project Structure

```
src/
├── api/
│   └── generated/              # hey-api output — KHÔNG sửa tay, chỉ re-generate
│
├── components/                 # Shared, dùng 2+ feature
│   ├── ui/                     # shadcn primitives — KHÔNG sửa tay
│   ├── data-table/             # DataTable building blocks
│   │   ├── DataTable.tsx
│   │   ├── DataTableToolbar.tsx
│   │   ├── DataTablePagination.tsx
│   │   ├── DataTableColumnHeader.tsx
│   │   └── index.ts
│   └── layout/
│       ├── AppShell.tsx        # Root layout wrapper
│       ├── Sidebar.tsx
│       └── PageHeader.tsx
│
├── hooks/                      # Shared hooks — dùng 2+ feature
│   ├── useDebounce.ts
│   └── useLocalStorage.ts
│
├── lib/
│   ├── temporal.ts             # Temporal helpers + convert utils
│   ├── queryClient.ts          # TanStack Query global config
│   ├── api-client.ts           # hey-api client config + middleware
│   └── zod/                    # Shared Zod schemas
│
├── features/
│   └── [feature-name]/
│       ├── components/         # UI component riêng của feature
│       ├── hooks/              # useQuery/useMutation hooks
│       ├── types.ts            # Filter types, form value types
│       └── index.ts            # Public API của feature (re-export)
│
└── routes/                     # TanStack Router file-based
    ├── __root.tsx              # Root route + layout
    ├── _layout.tsx             # Authenticated layout
    ├── index.tsx               # / redirect
    └── [feature]/
        ├── index.tsx
        └── $id.tsx
```

---

## Data Flow

```
OpenAPI Spec
    ↓ hey-api generate
src/api/generated/              # type-safe API functions
    ↓ wrap bằng useQuery/useMutation
features/*/hooks/               # server state hooks
    ↓
features/*/components/          # UI components
    ↓ compose lên
routes/                         # Pages
```

---

## Layer Responsibilities

### `src/api/generated/`
- Auto-generated từ OpenAPI spec bằng `hey-api`
- **Không bao giờ sửa tay** — chạy lại generate nếu spec thay đổi
- Chứa: API functions, request/response types

### `src/lib/api-client.ts`
- Config hey-api client: baseUrl, headers
- Error handling middleware tập trung tại đây
- Auth token injection (từ storage hoặc context)

### `features/*/hooks/`
- Wrap generated API functions bằng `useQuery` / `useMutation`
- Define `queryKey` convention: `[feature, action, params]`
- Không chứa UI logic

### `features/*/components/`
- Chỉ biết hooks của feature đó
- Không gọi generated API trực tiếp
- Không chứa business logic — delegate về hooks

### `src/components/`
- Hoàn toàn không biết feature nào tồn tại
- Nhận data qua props
- Tái sử dụng được không cần context

---

## Routing Convention (TanStack Router file-based)

```
routes/
├── __root.tsx          # RootRoute — wrap toàn app (QueryClient, ThemeProvider)
├── _layout.tsx         # Authenticated layout — Sidebar + AppShell
├── index.tsx           # / → redirect về dashboard
│
├── auth/
│   ├── login.tsx       # /auth/login
│   └── logout.tsx      # /auth/logout
│
└── dashboard/
    ├── index.tsx       # /dashboard
    └── users/
        ├── index.tsx   # /dashboard/users
        └── $userId.tsx # /dashboard/users/:userId
```

Prefix `_` = layout route (không tạo URL segment).
Prefix `$` = dynamic param.
Prefix `__` = root route.

---

## State Management Philosophy

| Loại state | Tool | Ghi chú |
|---|---|---|
| Server state | TanStack Query | Data từ API — không dùng useState cache |
| Form state | React Hook Form | Local, chưa submit |
| URL state | TanStack Router search params | Filter, pagination |
| UI state | useState / useReducer | Modal open, tab active |
| Global client state | Context API | Auth user, theme — chỉ khi thực sự cần |

**Không dùng Redux / Zustand** — TanStack Query đã xử lý phần lớn state management.

---

## Date/Time Convention

Toàn app dùng `Temporal`. `Date` object chỉ xuất hiện tại boundary với UI components chưa support Temporal (shadcn Calendar, react-day-picker).

```ts
// lib/temporal.ts
import { Temporal } from 'temporal-polyfill'
export { Temporal }

// Convert tại boundary — không leak Date ra ngoài component
export const fromDate = (d: Date): Temporal.PlainDate => ...
export const toDate = (t: Temporal.PlainDate): Date => ...
export const fromISOString = (s: string): Temporal.PlainDate =>
  Temporal.PlainDate.from(s)
```

**Rule:** API nhận/trả ISO string. FE parse về Temporal ngay khi nhận, serialize về string ngay khi gửi.