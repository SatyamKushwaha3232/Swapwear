# SwapWear Production Roadmap

This roadmap finishes SwapWear in batches without breaking the current frontend.

## Database Decision

Use self-managed PostgreSQL, not MongoDB.

Reason: SwapWear needs strict relationships and transactions across listings, swaps, payments, delivery, disputes, reviews, and notifications. PostgreSQL is the right fit for safe product locking, swap completion, refund/cancel flows, and admin audit history.

## Target Architecture

React frontend
Node.js API
PostgreSQL
Prisma ORM
JWT auth
Socket.IO signaling
WebRTC audio/video
Local uploads for development
Cloud storage later
Razorpay/Stripe later
Manual courier first
Courier provider integration later

## Batch 1: Manual Backend Foundation

Status: in progress

Deliverables:
- Prisma schema for the full platform
- Environment template
- Backend module structure
- Migration plan from Supabase direct access to backend APIs
- Existing frontend remains working

## Batch 2: Auth And Profiles

Goal: Replace Supabase auth with backend-owned auth.

Deliverables:
- Register/login/logout APIs
- JWT access token
- Password hashing
- Current user API
- Admin role middleware
- Profile update API
- Frontend auth services switched to backend

## Batch 3: Listings, Uploads, Wishlist

Goal: Move marketplace core to backend.

Deliverables:
- Listing CRUD APIs
- Local file upload storage for development
- Wishlist APIs
- Search/filter/sort
- Listing availability checks
- Frontend listing/wishlist services switched to backend

## Batch 4: Swap Lifecycle

Goal: Move swap mechanism into backend transactions.

Deliverables:
- Create request
- Accept and lock both listings
- Expire competing pending swaps
- Cancel/relist
- Complete/archive
- Reopen eligible expired requests
- Event history
- Admin dispute resolve

## Batch 5: Delivery And Courier

Goal: Add full delivery workflow.

Deliverables:
- User addresses
- Delivery method selection
- Manual courier tracking
- Pickup/shipping/in-transit/delivered states
- Delivery proof upload
- Delivery dispute hook
- Later provider adapter for Shiprocket/Delhivery

## Batch 6: Payments

Goal: Add payment records and premium/fee flow.

Deliverables:
- Payment order records
- Premium listing boost records
- Webhook-ready status model
- Refund/cancel states
- Admin payment dashboard
- Razorpay/Stripe adapter later

## Batch 7: Audio And Video Calls

Goal: Add real-time call signaling for chat.

Deliverables:
- Socket.IO server
- Call session records
- Ringing/accepted/rejected/ended/missed states
- WebRTC offer/answer/ICE signaling
- Call history in chat
- TURN server plan for production reliability

## Batch 8: Admin, Reports, Reviews

Goal: Complete trust and moderation.

Deliverables:
- User moderation
- Listing moderation
- Report queues
- Review moderation
- Admin dashboard backed by backend APIs
- Audit log

## Batch 9: Notifications

Goal: Move notifications to backend events.

Deliverables:
- In-app notifications
- Chat notifications
- Swap status notifications
- Payment/delivery notifications
- Optional email later

## Batch 10: Deployment

Goal: Production launch.

Deliverables:
- Environment secrets
- Database migration
- Backend hosting
- Frontend hosting
- Storage setup
- Monitoring and logs

## Rule For Every Batch

- Keep current app working.
- Migrate one module at a time.
- Run lint/build before commit.
- Commit after every finished batch.
