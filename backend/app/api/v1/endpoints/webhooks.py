import base64
import hashlib
import hmac
import logging
from datetime import datetime, timedelta
from fastapi import APIRouter, BackgroundTasks, Depends, Header, HTTPException, Request, status
from sqlalchemy.orm import Session

from backend.app.core.config import settings
from backend.app.database.session import get_db
from backend.app.models.models import Booking as BookingModel, Service as ServiceModel
from backend.app.services.square_sync import sync_square_data
from backend.app.services.square_client import SquareAsyncClient


def parse_square_time(time_str: str) -> datetime:
    if not time_str:
        return datetime.utcnow()
    parsed = time_str.replace("Z", "+00:00")
    return datetime.fromisoformat(parsed)

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
    scheme = request.headers.get("x-forwarded-proto", request.url.scheme)
    host = request.headers.get("host", request.url.netloc or "localhost:8000")
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
        logger.warning(f"Rejected Square Webhook: Invalid Signature. URL: {constructed_url}, Signature Header: {x_square_signature}")
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
            elif event_type == "booking.updated" or data.get("status") == "REPROGRAMMED":
                status_str = "REPROGRAMMED"
            
            try:
                client = SquareAsyncClient()
                sq_booking = await client.retrieve_booking(booking_id)
                
                if sq_booking:
                    start_time_str = sq_booking.get("start_at")
                    start_time = parse_square_time(start_time_str) if start_time_str else datetime.utcnow()
                    
                    segments = sq_booking.get("appointment_segments", [])
                    service_id = None
                    staff_id = None
                    duration_minutes = 60
                    
                    if segments:
                        segment = segments[0]
                        service_id = segment.get("service_variation_id")
                        staff_id = segment.get("team_member_id")
                        duration_minutes = segment.get("duration_minutes", 60)
                    
                    # Look up duration from local service info if available
                    if service_id:
                        local_service = db.query(ServiceModel).filter(ServiceModel.id == service_id).first()
                        if local_service:
                            duration_minutes = local_service.duration_minutes
                    
                    end_time = start_time + timedelta(minutes=duration_minutes)
                    
                    # Fetch customer details from Square
                    customer_id = sq_booking.get("customer_id")
                    customer_name = "Square Customer"
                    customer_email = None
                    customer_phone = None
                    
                    if customer_id:
                        try:
                            sq_customer = await client.retrieve_customer(customer_id)
                            if sq_customer:
                                first_name = sq_customer.get("given_name", "")
                                last_name = sq_customer.get("family_name", "")
                                customer_name = f"{first_name} {last_name}".strip() or "Square Customer"
                                customer_email = sq_customer.get("email_address")
                                customer_phone = sq_customer.get("phone_number")
                        except Exception as cust_err:
                            logger.warning(f"Failed to fetch customer details for ID {customer_id}: {cust_err}")
                    
                    if db_booking:
                        db_booking.status = status_str
                        db_booking.start_time = start_time
                        db_booking.end_time = end_time
                        if service_id:
                            db_booking.service_id = service_id
                        if staff_id:
                            db_booking.staff_id = staff_id
                        db_booking.customer_name = customer_name
                        db_booking.customer_email = customer_email
                        db_booking.customer_phone = customer_phone
                        db.commit()
                        logger.info(f"Updated existing local booking ID {booking_id} to status {status_str}")
                    else:
                        if service_id and staff_id:
                            new_booking = BookingModel(
                                id=booking_id,
                                service_id=service_id,
                                staff_id=staff_id,
                                start_time=start_time,
                                end_time=end_time,
                                status=status_str,
                                customer_name=customer_name,
                                customer_email=customer_email,
                                customer_phone=customer_phone
                            )
                            db.add(new_booking)
                            db.commit()
                            logger.info(f"Inserted new external booking ID {booking_id} locally with status {status_str}")
                        else:
                            logger.warning(f"Could not insert new booking {booking_id}: segment service_id or staff_id missing")

                    # Queue email notification for client
                    if customer_email:
                        from backend.app.models.models import Staff as StaffModel
                        staff = db.query(StaffModel).filter(StaffModel.id == staff_id).first() if staff_id else None
                        staff_name = f"{staff.first_name} {staff.last_name or ''}".strip() if staff else "Specialist"
                        
                        service_name = "Lash Service"
                        if service_id:
                            local_service = db.query(ServiceModel).filter(ServiceModel.id == service_id).first()
                            if local_service:
                                service_name = local_service.name
                        
                        event_type_map = {
                            "ACCEPTED": "confirmed",
                            "REPROGRAMMED": "rescheduled",
                            "CANCELED": "cancelled"
                        }
                        email_event = event_type_map.get(status_str, "confirmed")
                        
                        from backend.app.services.email import send_booking_email
                        background_tasks.add_task(
                            send_booking_email,
                            recipient_email=customer_email,
                            event_type=email_event,
                            customer_name=customer_name,
                            service_name=service_name,
                            start_time=start_time,
                            staff_name=staff_name,
                            booking_id=booking_id,
                            lang="en"  # Square webhooks default to English
                        )
            except Exception as err:
                logger.error(f"Error fetching/syncing booking from Square API: {err}")
                # Fallback to simple status update if Square connection fails
                if db_booking:
                    db_booking.status = status_str
                    db.commit()
                    logger.info(f"Fallback: Updated local booking ID {booking_id} status to {status_str}")

    return {"status": "processed"}
