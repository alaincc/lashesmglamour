import base64
import hashlib
import hmac
import logging
from fastapi import APIRouter, BackgroundTasks, Depends, Header, HTTPException, Request, status
from sqlalchemy.orm import Session

from backend.app.core.config import settings
from backend.app.database.session import get_db
from backend.app.models.models import Booking as BookingModel
from backend.app.services.square_sync import sync_square_data

router = APIRouter()
logger = logging.getLogger(__name__)


def verify_square_webhook_signature(
    request_url: str, request_body: bytes, signature_header: str, signature_key: str
) -> bool:
    """
    Validates Square signature using HMAC-SHA256
    """
    if not signature_header or not signature_key:
        return False
    try:
        # Concatenate webhook endpoint URL and raw request body
        combined = request_url.encode("utf-8") + request_body
        mac = hmac.new(signature_key.encode("utf-8"), combined, hashlib.sha256)
        calculated_sig = base64.b64encode(mac.digest()).decode("utf-8")
        return hmac.compare_digest(calculated_sig, signature_header)
    except Exception as e:
        logger.error(f"Error checking webhook signature: {e}")
        return False


@router.post("")
async def receive_square_webhook(
    request: Request,
    background_tasks: BackgroundTasks,
    x_square_signature: str = Header(None),
    db: Session = Depends(get_db)
):
    """
    Webhooks receiver for Square events. Validates signature and runs updates.
    """
    raw_body = await request.body()
    payload = await request.json()

    # Reconstruct request URL
    # Note: in production behind a proxy we use x-forwarded-proto and host header to match the correct scheme
    scheme = request.headers.get("x-forwarded-proto", "https")
    host = request.headers.get("host", request.url.host)
    constructed_url = f"{scheme}://{host}{request.url.path}"

    # Verify signature
    # In sandbox or local testing where SQUARE_WEBHOOK_SIGNATURE is a placeholder, we skip validation
    is_valid = True
    if settings.SQUARE_ENVIRONMENT.lower() == "production" or settings.SQUARE_WEBHOOK_SIGNATURE != "webhook_sig_XXXXXXXXXXXX":
        is_valid = verify_square_webhook_signature(
            request_url=constructed_url,
            request_body=raw_body,
            signature_header=x_square_signature,
            signature_key=settings.SQUARE_WEBHOOK_SIGNATURE
        )

    if not is_valid:
        logger.warning("Rejected Square Webhook: Invalid Signature")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid signature validation"
        )

    event_type = payload.get("type", "")
    logger.info(f"Received webhook event type from Square: {event_type}")

    # Process events
    if event_type == "catalog.version.updated":
        logger.info("Catalog updated event received. Triggering background data synchronization.")
        background_tasks.add_task(sync_square_data)
        
    elif event_type in ["booking.created", "booking.updated", "booking.canceled"]:
        data = payload.get("data", {}).get("object", {}).get("booking", {})
        booking_id = data.get("id")
        
        if booking_id:
            logger.info(f"Booking update event received for ID {booking_id}")
            db_booking = db.query(BookingModel).filter(BookingModel.id == booking_id).first()
            
            # Map status
            status_str = "ACCEPTED"
            if event_type == "booking.canceled" or data.get("status") == "CANCELED":
                status_str = "CANCELED"
            
            if db_booking:
                db_booking.status = status_str
                db.commit()
                logger.info(f"Updated local booking status for ID {booking_id} to {status_str}")

    return {"status": "processed"}
