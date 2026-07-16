# SwapWear Stabilized Build

This build keeps the existing project and stabilizes the core flow on the manual backend:

- JWT auth context and protected routes
- Login/signup with automatic profile creation
- Forgot/reset password token flow
- Profile edit and backend avatar upload
- Listing create/read/delete with size, owner, images, video
- Explore and item details loading from the Node/PostgreSQL API
- Swap request creation with logged-in user data
- Chat with logged-in display name
- Toast notifications

Run frontend:

```powershell
cd frontend
npm install
npm run dev
```

Run backend:

```powershell
cd backend
npm install
npm run db:push
npm run dev
```

Backend needs PostgreSQL and `backend/.env` with `DATABASE_URL`, JWT secrets, and client URLs.
