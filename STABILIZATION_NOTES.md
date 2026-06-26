# SwapWear Stabilized Build

This build keeps the existing project and stabilizes the core flow:

- Auth context and protected routes
- Login/signup with automatic profile creation
- Profile edit + avatar upload
- Listing create/read/delete with size, owner, images, video
- Explore + item details loading from Supabase
- Swap request creation with logged-in user data
- Chat with logged-in display name
- Toast notifications

Run:

```powershell
npm install
npm run dev
```

Supabase setup:

Run `SUPABASE_SETUP.sql` in Supabase SQL Editor. Ensure public Storage buckets exist:

- listings
- avatars
```
