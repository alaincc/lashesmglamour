from fastapi import APIRouter
from backend.app.api.v1.endpoints import catalog, booking, admin, webhooks

api_router = APIRouter()

# Include endpoints routers
# Catalog endpoints (GET /services, GET /categories, GET /staff, GET /availability)
api_router.include_router(catalog.router, tags=["catalog"])

# Booking endpoints (POST /booking, PUT /booking, DELETE /booking)
api_router.include_router(booking.router, prefix="/booking", tags=["booking"])

# Webhook events receiver (POST /webhooks/square)
api_router.include_router(webhooks.router, prefix="/webhooks/square", tags=["webhooks"])

# Admin portal functions (POST /admin/login, POST /admin/sync, GET /admin/status)
api_router.include_router(admin.router, prefix="/admin", tags=["admin"])
