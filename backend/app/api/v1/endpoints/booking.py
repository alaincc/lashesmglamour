from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.app.database.session import get_db
from backend.app.models.models import Booking as BookingModel
from backend.app.models.models import Service as ServiceModel
from backend.app.schemas import schemas
from backend.app.services.square_client import SquareAsyncClient

router = APIRouter()


@router.post("", response_model=schemas.Booking, status_code=status.HTTP_201_CREATED)
async def create_booking(
    payload: schemas.BookingCreateRequest,
    db: Session = Depends(get_db)
):
    """
    Submits a reservation request to Square, registers client directory,
    and logs reservation inside the local DB.
    """
    client = SquareAsyncClient()

    # 1. Fetch service to verify duration
    service = db.query(ServiceModel).filter(ServiceModel.id == payload.service_id).first()
    if not service:
        raise HTTPException(status_code=404, detail="Service variation ID not found")

    try:
        # 2. Get or create customer ID in Square
        customer_id = await client.get_or_create_customer(
            first_name=payload.customer.first_name,
            last_name=payload.customer.last_name,
            email=payload.customer.email,
            phone=payload.customer.phone
        )

        # 3. Create reservation in Square system
        start_time_iso = payload.start_time.astimezone(timezone.utc).isoformat().replace("+00:00", "Z")
        sq_booking = await client.create_booking(
            service_id=payload.service_id,
            staff_id=payload.staff_id,
            start_time=start_time_iso,
            customer_id=customer_id
        )

        # 4. Calculate end time based on service duration
        duration_minutes = service.duration_minutes
        end_time = payload.start_time + timedelta(minutes=duration_minutes)

        # 5. Save details inside local DB
        db_booking = BookingModel(
            id=sq_booking["id"],
            service_id=payload.service_id,
            staff_id=payload.staff_id,
            start_time=payload.start_time,
            end_time=end_time,
            status=sq_booking.get("status", "ACCEPTED"),
            customer_name=f"{payload.customer.first_name} {payload.customer.last_name}",
            customer_email=payload.customer.email,
            customer_phone=payload.customer.phone
        )
        db.add(db_booking)
        db.commit()
        db.refresh(db_booking)

        return db_booking

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Booking creation failed: {str(e)}")


@router.put("/{id}", response_model=schemas.Booking)
async def update_booking(
    id: str,
    payload: schemas.BookingUpdateRequest,
    db: Session = Depends(get_db)
):
    """
    Reschedules an existing reservation in Square and logs updates in the local DB.
    """
    client = SquareAsyncClient()

    # 1. Check local DB for booking details
    booking = db.query(BookingModel).filter(BookingModel.id == id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking record not found")

    try:
        # 2. Reschedule booking in Square
        # Note: In production we query Square to retrieve the exact version. For this connector setup
        # we try standard updating sequence (Version 1).
        start_time_iso = payload.start_time.astimezone(timezone.utc).isoformat().replace("+00:00", "Z")
        
        sq_booking = await client.update_booking(
            booking_id=id,
            version=1,
            start_time=start_time_iso,
            service_id=booking.service_id,
            staff_id=booking.staff_id
        )

        # 3. Update local details
        service = db.query(ServiceModel).filter(ServiceModel.id == booking.service_id).first()
        duration = service.duration_minutes if service else 60
        
        booking.start_time = payload.start_time
        booking.end_time = payload.start_time + timedelta(minutes=duration)
        booking.status = "REPROGRAMMED"
        
        db.commit()
        db.refresh(booking)
        return booking

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Failed to update booking: {str(e)}")


@router.delete("/{id}", response_model=schemas.Booking)
async def cancel_booking(id: str, db: Session = Depends(get_db)):
    """
    Cancels an active booking in Square and flags local status.
    """
    client = SquareAsyncClient()

    booking = db.query(BookingModel).filter(BookingModel.id == id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking record not found")

    try:
        # Cancel booking in Square
        await client.cancel_booking(booking_id=id, version=1)

        # Mark cancelled locally
        booking.status = "CANCELED"
        db.commit()
        db.refresh(booking)
        return booking

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Failed to cancel booking: {str(e)}")
