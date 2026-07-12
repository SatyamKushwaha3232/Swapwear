# Payments Module Plan

Payments are backend-owned. The frontend never directly marks payments successful.

## Uses

- Premium membership
- Listing boost
- Platform fee
- Delivery fee

## States

- `PENDING`
- `AUTHORIZED`
- `PAID`
- `FAILED`
- `REFUNDED`
- `CANCELLED`

## Endpoints

- `POST /api/payments/order`
- `POST /api/payments/webhook`
- `GET /api/payments/me`
- `GET /api/admin/payments`

## Provider Plan

Start with `manual` provider for development. Add Razorpay first for India payments, Stripe later if needed.
