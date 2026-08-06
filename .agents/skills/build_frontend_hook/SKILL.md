---
name: build_frontend_hook
description: Hướng dẫn tiêu chuẩn để xây dựng custom hook (Query và Mutation) kết nối các API được generate với giao diện cho một feature.
---

# Build Frontend Hook

Khi cần tạo custom hook cho một tính năng (ví dụ: `useUsers.ts`, `useRoles.ts`, `useSystemSettings.ts`), BẮT BUỘC tuân thủ các quy tắc sau:

## 1. Vị trí
Tất cả các hooks API của một feature phải được đặt chung trong một file: `src/features/{feature}/hooks/use{Feature}.ts`. 
KHÔNG import trực tiếp hook từ `src/gen/endpoints/` vào các file giao diện (Component/Dialog).

## 2. Các Query Hook (Get List)
- Phải import Zod schema QueryParams tương ứng từ file `.zod.ts` (ví dụ: `GetUsersQueryParams`).
- Infer type từ schema: `type FeatureQuery = z.infer<typeof GetFeatureQueryParams>`.
- Hook lấy danh sách phải nhận tham số `params: FeatureQuery`.
- Sử dụng cấu hình `query: { placeholderData: keepPreviousData }` (import `keepPreviousData` từ `@tanstack/react-query`) để hỗ trợ UX pagination mượt mà.

## 3. Các Query Hook (Get By Id)
- Tạo wrapper nhận `id: string`.
- Thêm cấu hình `query: { enabled: !!id }` để tránh gọi API rác khi ID chưa sẵn sàng.

## 4. Các Mutation Hook (Create, Update, Delete, v.v...)
- **Tuyệt đối KHÔNG** tự gọi queryClient invalidate bên trong Dialog UI.
- Phải sử dụng utility `createMutationHook` từ `@/lib/query-utils`.
- Export mutation bằng cách bọc hook tự sinh: 
  `export const useUpdateFeature = createMutationHook(Api.useUpdateFeature, [Api.getGetFeaturesQueryKey()]);`
- Bằng cách này, mọi thao tác mutation thành công sẽ tự động làm mới (invalidate) danh sách của query key tương ứng.
