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

Status: complete

Deliverables:
- Prisma schema for the full platform
- Environment template
- Backend module structure
- Migration plan from Supabase direct access to backend APIs
- Existing frontend remains working

## Batch 2: Auth And Profiles

Status: complete

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

Status: complete

Goal: Move marketplace core to backend.

Deliverables:
- Listing CRUD APIs
- Local file upload storage for development
- Wishlist APIs
- Search/filter/sort
- Listing availability checks
- Frontend listing/wishlist services switched to backend

Notes:
- Frontend still defaults to Supabase until `VITE_AUTH_PROVIDER=backend` is enabled.
- Backend mode now uses Prisma for listings/wishlist and local uploads for product media.

## Batch 4: Swap Lifecycle

Status: complete

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

Notes:
- Backend mode now handles swap request, accept, reject/cancel, complete, archive, dispute, delivery-method selection, and handover/received confirmations.
- Accepting a swap reserves both listings and expires competing pending swaps.
- Cancelling/rejecting/failed swaps relist items and revive eligible expired requests.

## Batch 5: Delivery And Courier

Status: complete

Goal: Add full delivery workflow.

Deliverables:
- User addresses
- Delivery method selection
- Manual courier tracking
- Pickup/shipping/in-transit/delivered states
- Delivery proof upload
- Delivery dispute hook
- Later provider adapter for Shiprocket/Delhivery

Notes:
- Backend mode now has address book APIs, two courier delivery legs per swap, tracking/proof updates, and courier-readiness checks before shipping confirmation.
- Local meetup remains address-free.

## Batch 6: Payments

Status: complete

Goal: Add payment records and premium/fee flow.

Deliverables:
- Payment order records
- Premium listing boost records
- Webhook-ready status model
- Refund/cancel states
- Admin payment dashboard
- Razorpay/Stripe adapter later

Notes:
- Backend mode now supports manual payment orders, user payment history, admin payment queue, webhook-ready updates, cancellation, refund/failed states, and premium unlock side effects.
- The frontend never marks payments successful; success requires admin/provider confirmation.

## Batch 7: Audio And Video Calls

Status: complete

Goal: Add real-time call signaling for chat.

Deliverables:
- Socket.IO server
- Call session records
- Ringing/accepted/rejected/ended/missed states
- WebRTC offer/answer/ICE signaling
- Call history in chat
- TURN server plan for production reliability

Notes:
- Backend mode now has Prisma-backed chat conversations/messages, local chat uploads, Socket.IO conversation rooms, typing events, message events, and call session records.
- Audio/video buttons create call sessions and emit signaling-ready events; full peer media connection still needs the WebRTC peer UI and TURN credentials in production.

## Batch 8: Admin, Reports, Reviews

Status: complete

Goal: Complete trust and moderation.

Deliverables:
- User moderation
- Listing moderation
- Report queues
- Review moderation
- Admin dashboard backed by backend APIs
- Audit log

Notes:
- Backend mode now supports marketplace reports, report resolution/block listing action, swap reviews, user review retrieval, admin dashboard stats, moderation queues, and trust score data.

## Batch 9: Notifications

Status: next

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
