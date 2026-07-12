# Auth Module Plan

Manual backend auth will replace Supabase Auth in Batch 2.

## Endpoints

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `PATCH /api/auth/profile`

## Rules

- Passwords are hashed with bcrypt.
- Access token is short-lived.
- Refresh token is stored in an httpOnly cookie.
- Admin access uses `User.role`.
- Deleted/suspended users cannot log in.

## Frontend Migration

Replace `frontend/src/context/AuthContext.jsx` Supabase calls with backend API calls after this module is implemented.
