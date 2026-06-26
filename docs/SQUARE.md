# Square API Integration Specification

This document details the interface schemas, background synchronization processes, and booking state transactions configured between the FastAPI microservice and **Square API**.

---

## 🔑 Integration Settings & Credentials

The application uses the official Square SDK client, configured via the following environment variables:
- `SQUARE_ACCESS_TOKEN`: The bearer auth token utilized to authorize API transactions.
- `SQUARE_APPLICATION_ID`: The unique identifier representing our registered Square Application.
- `SQUARE_LOCATION_ID`: The specific business branch/location representing **Lashes & MGlamour**.
- `SQUARE_ENVIRONMENT`: Configured to `sandbox` (for staging/testing) or `production`.
- `SQUARE_WEBHOOK_SIGNATURE`: The signature key utilized to validate event payload integrity.

---

## 🔄 Catalog Synchronization Service

To avoid API rate limits and deliver ultra-fast responses, we synchronize services, categories, team members, and pricing models into our local PostgreSQL database.

```text
+-----------------------+           Every 15 mins           +------------------------+
|   Square Catalog API  |  =============================>  |  FastAPI Sync Service  |
|                       |                                   |  (Overwrites local DB) |
+-----------------------+                                   +------------------------+
                                                                         ||
                                                                         || Writes to cache
                                                                         \/
                                                            +------------------------+
                                                            |      Redis Cache       |
                                                            |  (TTL 300s reset)      |
                                                            +------------------------+
```

### Sync Details
- **Trigger**: Every 15 minutes via an asynchronous scheduler loop or instantly upon receiving a `catalog.updated` webhook event.
- **Downloaded Objects**:
  - **Catalog items & variants**: Parsed and filtered to extract title, descriptions, price, and duration.
  - **Categories**: Map service organization structures.
  - **Team members**: Fetch staff details and service assignments.
  - **Location hours**: Sync availability dates and shifts.

---

## 📅 Booking Transaction Workflows

All reservation actions write directly to the Square engine to prevent overbookings.

### 1. Booking Creation flow
```text
[Astro Wizard UI] --(POST /api/v1/booking)--> [FastAPI middleware]
                                                     │
                                                     ▼
                                            [Query local DB state]
                                            (Validate availability slots)
                                                     │
                                                     ▼
                                           [Call Square Bookings API]
                                         - Create Customer if new
                                         - Create Booking reservation
                                                     │
                                                     ▼
                                           [Return Success JSON]
```

### 2. Payload Mappings
- **Service Mapping**: Map local IDs matching Square object identifiers (`catalog_object_id`).
- **Time Representation**: All timestamps are formatted and transmitted in ISO 8601 UTC formats (`YYYY-MM-DDTHH:MM:SSZ`).
- **Customer details**: Automated integration checks if the customer's phone/email exists in Square Directory; if not, it triggers `CreateCustomer` before reserving the slot.

---

## ⚡ Webhook Subscriptions

We subscribe to these specific event notifications in the Square Developer Console:

| Event Type | System Action |
| :--- | :--- |
| **`booking.created`** | Updates local PostgreSQL booking list state to track reservations. |
| **`booking.updated`** | Updates timestamps, status shifts, or specialist changes in the DB. |
| **`booking.canceled`**| Frees up local availability charts and updates reservation statuses. |
| **`catalog.updated`** | Immediately flags the cache as invalid and triggers an active sync. |
| **`customer.updated`**| Refreshes contact details stored in the client tracking DB table. |
