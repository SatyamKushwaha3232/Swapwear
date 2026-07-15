# SwapWear API Migration Matrix

This file tracks the move from Supabase direct frontend calls to a self-managed Node/PostgreSQL backend.

| Area | Current State | Target Backend Module | Batch |
| --- | --- | --- | --- |
| Auth | Backend-ready behind `VITE_AUTH_PROVIDER=backend` | `/api/auth/*` with JWT | 2 complete |
| Profiles | Backend-ready behind `VITE_AUTH_PROVIDER=backend` | `/api/users/me/profile` | 2 complete |
| Listings | Backend-ready behind `VITE_AUTH_PROVIDER=backend` | `/api/listings/*` with Prisma | 3 complete |
| Uploads | Local backend uploads in backend mode | `/uploads/listings/*` static files | 3 complete |
| Wishlist | Backend-ready behind `VITE_AUTH_PROVIDER=backend` | `/api/wishlist/*` with Prisma | 3 complete |
| Swaps | Backend-ready behind `VITE_AUTH_PROVIDER=backend` | `/api/swaps/*` transaction service | 4 complete |
| Swap events | Backend audit events in backend mode | `SwapEvent` writer | 4 complete |
| Delivery | Backend-ready behind `VITE_AUTH_PROVIDER=backend` | `/api/delivery/*` | 5 complete |
| Payments | Backend-ready behind `VITE_AUTH_PROVIDER=backend` | `/api/payments/*` | 6 complete |
| Chat | Backend-ready behind `VITE_AUTH_PROVIDER=backend` | `/api/chat/*` and Socket.IO | 7 complete |
| Audio/video calls | Backend call sessions and signaling-ready events | Socket.IO signaling + WebRTC hooks | 7 complete |
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
