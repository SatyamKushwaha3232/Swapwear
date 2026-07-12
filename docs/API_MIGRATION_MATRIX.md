# SwapWear API Migration Matrix

This file tracks the move from Supabase direct frontend calls to a self-managed Node/PostgreSQL backend.

| Area | Current State | Target Backend Module | Batch |
| --- | --- | --- | --- |
| Auth | Supabase Auth in frontend | `/api/auth/*` with JWT | 2 |
| Profiles | Frontend Supabase service | `/api/users/me`, `/api/users/profile` | 2 |
| Listings | Frontend Supabase service, old backend wrapper | `/api/listings/*` with Prisma | 3 |
| Uploads | Supabase Storage | Local uploads in dev, cloud adapter later | 3 |
| Wishlist | Frontend Supabase service | `/api/wishlist/*` with Prisma | 3 |
| Swaps | Frontend Supabase RPCs | `/api/swaps/*` transaction service | 4 |
| Swap events | Supabase table/RPC | Backend audit writer | 4 |
| Delivery | UI method only | `/api/delivery/*` | 5 |
| Payments | Not implemented | `/api/payments/*` | 6 |
| Chat | Supabase realtime/table | `/api/chat/*` and Socket.IO | 7 |
| Audio/video calls | UI placeholder | Socket.IO signaling + WebRTC | 7 |
| Reports | Frontend Supabase RPC | `/api/reports/*` | 8 |
| Reviews | Frontend Supabase RPC | `/api/reviews/*` | 8 |
| Admin | Frontend Supabase RPC | `/api/admin/*` | 8 |
| Notifications | Frontend Supabase table | `/api/notifications/*` + socket events | 9 |

## Migration Rule

Do not switch all services at once. For each area:

1. Implement backend model and service.
2. Add controller and routes.
3. Add auth/admin middleware.
4. Update one frontend service file.
5. Run lint and build.
6. Commit.

## First Backend Module To Build

Start with auth and profiles because every other module needs a trusted `req.user`.
