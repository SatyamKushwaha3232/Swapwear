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
npm run dev
```

Required backend environment:

```env
DATABASE_URL=postgresql://USER:PASSWORD@localhost:5432/swapwear
JWT_ACCESS_SECRET=change-me-access
JWT_REFRESH_SECRET=change-me-refresh
CLIENT_URL=http://localhost:5173
PORT=5000
```

`npm run db:push` syncs the Prisma schema to PostgreSQL. Use it after schema changes such as password reset tokens.

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
- Keep `uploads/` on persistent storage in production.
- Run full protected-page QA with backend and PostgreSQL running before deployment.
