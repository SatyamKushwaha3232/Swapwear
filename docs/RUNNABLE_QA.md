# Runnable QA Guide

This guide gives SwapWear a filled database for checking pages and flows.

## Demo Seed

From the project root:

```bash
npm run seed:demo
```

Default password for every demo user:

```text
SwapWear123
```

Demo users:

- `admin@swapwear.local` - admin dashboard
- `aisha@swapwear.local` - marketplace user
- `rohan@swapwear.local` - marketplace user
- `meera@swapwear.local` - marketplace user

The seed creates:

- User profiles
- Addresses
- Available listings
- One pending swap request
- One chat conversation
- Welcome notifications
- One admin report

The script is idempotent, so running it again updates the same demo records instead of creating duplicate listings/users.

## Smoke Check

From the project root:

```bash
npm run smoke
```

This confirms:

- Environment config loads
- Database is reachable
- Core tables/models are available
- Basic record counts can be read

## Recommended Local Order

```bash
npm run setup
npm run db:generate
npm run db:push
npm run seed:demo
npm run smoke
npm run dev
```

Then run the frontend in backend mode and login with the demo accounts.
