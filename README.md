# SwapWear

Premium clothing swap marketplace with a self-managed backend. The app is no longer tied to Supabase runtime services.

## Stack

- React, Vite, Tailwind CSS
- Node.js, Express, Socket.IO
- PostgreSQL with Prisma
- JWT auth with refresh cookies
- Local backend uploads for profile avatars
- Manual payment, delivery, trust, chat, and swap APIs

## Frontend

```bash
cd frontend
npm install
npm run dev
npm run build
```

Default API URL:

```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_AUTH_PROVIDER=backend
```

## Backend

```bash
cd backend
npm install
npm run db:push
npm run db:generate
npm run admin:create
npm run dev
```

Required backend environment:

```env
DATABASE_URL=postgresql://USER:PASSWORD@localhost:5432/swapwear
JWT_ACCESS_SECRET=change-me-access
JWT_REFRESH_SECRET=change-me-refresh
CLIENT_URL=http://localhost:5173
PORT=5000
OAUTH_CALLBACK_BASE_URL=http://localhost:5000/api/auth/oauth
```

`npm run db:push` syncs the Prisma schema to PostgreSQL. Use it after schema changes such as password reset tokens.

Create the first admin by setting `ADMIN_EMAIL`, `ADMIN_PASSWORD`, and `ADMIN_NAME` in `backend/.env`, then run:

```bash
npm run admin:create
```

Local OAuth callback URLs:

```text
http://localhost:5000/api/auth/oauth/google/callback
http://localhost:5000/api/auth/oauth/github/callback
http://localhost:5000/api/auth/oauth/microsoft/callback
```

## Current Features

- Manual email/password auth
- Forgot/reset password token flow
- Profile editing and backend avatar uploads
- Product listings, wishlist, dashboard, explore, and item details
- Swap requests and structured swap lifecycle
- Delivery, payment, trust, admin, notifications, and chat API layers
- Responsive premium UI for mobile, tablet, and desktop

## Useful Checks

```bash
cd frontend
npm run lint
npm run build

cd ../backend
npx prisma validate
node -e "Promise.all([import('./src/modules/auth/auth.routes.js'), import('./src/modules/users/user.routes.js')]).then(()=>console.log('imports ok'))"
```

## Production Notes

- Add a real mail adapter before production password reset emails. Until then, local development returns a reset link on the forgot-password screen.
- Add payment/courier provider credentials only after final provider selection.
- Keep `backend/uploads/` on persistent storage in production, or move uploads to Cloudinary/S3-style object storage before real public launch.
- Run full protected-page QA with backend and PostgreSQL running before deployment.
