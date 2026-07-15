# SwapWear Deployment Checklist

Use this when moving from local development to a real server.

## Backend

1. Create a PostgreSQL database.
2. Copy `backend/.env.example` to `backend/.env`.
3. Set real production values:
   - `NODE_ENV=production`
   - `DATABASE_URL`
   - `CLIENT_URL`
   - `CLIENT_URLS`
   - `JWT_ACCESS_SECRET`
   - `JWT_REFRESH_SECRET`
   - `PUBLIC_FILE_BASE_URL`
4. Install backend packages.
5. Run `npm run db:generate`.
6. Run `npm run db:deploy`.
7. Create first admin:
   - Set `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_NAME`
   - Run `npm run admin:create`
8. Start backend with `npm start`.
9. Confirm `/health` returns `status: ok`.

## Frontend

1. Copy `frontend/.env.example` to `frontend/.env`.
2. Set `VITE_AUTH_PROVIDER=backend`.
3. Set `VITE_API_BASE_URL` to the production backend `/api` URL.
4. Run `npm run build`.
5. Host the generated `frontend/dist` folder.

## Before Launch

- Test signup, login, listing upload, wishlist, swap request, accept, cancel, complete, chat, notification bell, delivery, payment queue, report, review, and admin dashboard.
- Keep `PAYMENT_PROVIDER=manual` until Razorpay/Stripe webhook verification is fully wired.
- Keep `COURIER_PROVIDER=manual` until courier provider credentials and webhook tracking are tested.
- Add persistent object storage before high traffic; local uploads are fine for a single VPS but not for multi-server hosting.
