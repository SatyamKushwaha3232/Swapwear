# Delivery Module Plan

Delivery starts as a manual courier workflow and can later attach to Shiprocket or Delhivery.

## States

1. `ADDRESS_PENDING`
2. `PICKUP_PENDING`
3. `PICKED_UP`
4. `IN_TRANSIT`
5. `DELIVERED`
6. `FAILED`
7. `RETURNED`
8. `DISPUTED`

## Endpoints

- `POST /api/delivery/addresses`
- `GET /api/delivery/addresses`
- `POST /api/swaps/:id/delivery`
- `PATCH /api/delivery/:id/status`
- `PATCH /api/delivery/:id/tracking`
- `POST /api/delivery/:id/proof`

## Swap Integration

If `deliveryMethod = COURIER`, both users must add address details before handover can progress.
