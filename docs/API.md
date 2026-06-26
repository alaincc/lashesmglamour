# Backend API Reference (FastAPI Gateway)

This reference outlines the endpoints, request/response models, webhooks, and security protocols implemented in the FastAPI backend module.

---

## 🔒 Security & Authentication

- All administrative endpoints (e.g., manual sync triggers, CRUD operations for FAQs and Testimonials) require a Bearer JWT Token.
- Public endpoints utilize a rate limiter (limiting requests per client IP to 60 per minute).

---

## 🌐 Public Catalog & Directory Endpoints

### 1. Retrieve Services List
- **Endpoint**: `GET /api/v1/services`
- **Description**: Returns all active catalog services mapped from the synced Square location database.
- **Query Parameters**:
  - `category_id` (string, optional): Filter by service category.
- **Response** (`200 OK`):
  ```json
  [
    {
      "id": "SERV_Y7R34NBQ2X",
      "name": "Classic Eyelash Full Set",
      "description": "A classic natural lash extensions application.",
      "price_cents": 12000,
      "currency": "USD",
      "duration_minutes": 90,
      "category_id": "CAT_98P11",
      "image_url": "https://cdn.square.com/images/..."
    }
  ]
  ```

### 2. Retrieve Specific Service
- **Endpoint**: `GET /api/v1/services/{id}`
- **Response** (`200 OK`):
  ```json
  {
    "id": "SERV_Y7R34NBQ2X",
    "name": "Classic Eyelash Full Set",
    "description": "A classic natural lash extensions application.",
    "price_cents": 12000,
    "currency": "USD",
    "duration_minutes": 90,
    "category_id": "CAT_98P11",
    "image_url": "https://cdn.square.com/images/..."
  }
  ```

### 3. Retrieve Categories
- **Endpoint**: `GET /api/v1/categories`
- **Response** (`200 OK`):
  ```json
  [
    {
      "id": "CAT_98P11",
      "name": "Eyelash Extensions"
    }
  ]
  ```

### 4. Retrieve Staff Members
- **Endpoint**: `GET /api/v1/staff`
- **Response** (`200 OK`):
  ```json
  [
    {
      "id": "STAFF_02KML8",
      "first_name": "Maria",
      "last_name": "Glamour",
      "bio": "Lead eyelash technician & aesthetician.",
      "avatar_url": "https://..."
    }
  ]
  ```

### 5. Check Staff Availability
- **Endpoint**: `GET /api/v1/availability`
- **Query Parameters**:
  - `service_id` (string, required)
  - `staff_id` (string, optional)
  - `start_date` (ISO date `YYYY-MM-DD`, required)
  - `end_date` (ISO date `YYYY-MM-DD`, required)
- **Response** (`200 OK`):
  ```json
  [
    {
      "date": "2026-07-01",
      "slots": ["09:00:00", "10:30:00", "13:00:00"]
    }
  ]
  ```

---

## 📅 Booking Transaction Endpoints

### 1. Create a New Booking
- **Endpoint**: `POST /api/v1/booking`
- **Payload Schema**:
  ```json
  {
    "service_id": "SERV_Y7R34NBQ2X",
    "staff_id": "STAFF_02KML8",
    "start_time": "2026-07-01T10:30:00Z",
    "customer": {
      "first_name": "Valerie",
      "last_name": "Doe",
      "email": "valerie@example.com",
      "phone": "+13055550199"
    }
  }
  ```
- **Response** (`201 Created`):
  ```json
  {
    "booking_id": "BOOK_SQ_990117A",
    "status": "ACCEPTED",
    "service_id": "SERV_Y7R34NBQ2X",
    "start_time": "2026-07-01T10:30:00Z"
  }
  ```

### 2. Update an Existing Booking
- **Endpoint**: `PUT /api/v1/booking/{id}`
- **Payload Schema**:
  ```json
  {
    "start_time": "2026-07-01T13:00:00Z"
  }
  ```
- **Response** (`200 OK`):
  ```json
  {
    "booking_id": "BOOK_SQ_990117A",
    "status": "REPROGRAMMED",
    "start_time": "2026-07-01T13:00:00Z"
  }
  ```

### 3. Cancel a Booking
- **Endpoint**: `DELETE /api/v1/booking/{id}`
- **Response** (`200 OK`):
  ```json
  {
    "booking_id": "BOOK_SQ_990117A",
    "status": "CANCELED"
  }
  ```

---

## ⚡ Webhook Handler Endpoints

- **Endpoint**: `POST /api/v1/webhooks/square`
- **Security Check**: Verifies signature utilizing header `x-square-signature` and environment `SQUARE_WEBHOOK_SIGNATURE`.
- **Observed Events**:
  - `booking.created` / `booking.updated` / `booking.canceled` -> Triggers DB updates on bookings lists.
  - `catalog.updated` -> Forces a background fetch of catalog objects from Square.
