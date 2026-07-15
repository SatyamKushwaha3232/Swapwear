# Auth Module Plan

Manual backend auth is implemented in Batch 2.

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

Frontend auth now uses backend API calls.

## Current Integration

Frontend supports this module behind:

```env
VITE_AUTH_PROVIDER=backend
VITE_API_BASE_URL=http://localhost:5000/api
```

Default mode is backend.
