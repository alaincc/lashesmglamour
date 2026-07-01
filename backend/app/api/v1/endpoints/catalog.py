from datetime import date, datetime, time
from zoneinfo import ZoneInfo
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from backend.app.database.session import get_db
from backend.app.models.models import Category as CategoryModel
from backend.app.models.models import Service as ServiceModel
from backend.app.models.models import Staff as StaffModel
from backend.app.schemas import schemas
from backend.app.services.cache import get_cache, set_cache
from backend.app.services.square_client import SquareAsyncClient

router = APIRouter()


@router.get("/services", response_model=List[schemas.Service])
def get_services(
    category_id: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Get all active services. Utilizes Redis caching (TTL 300s).
    """
    cache_key = f"services:all" if not category_id else f"services:cat:{category_id}"
    
    # Try cache
    cached_data = get_cache(cache_key)
    if cached_data:
        return cached_data

    # Query DB
    query = db.query(ServiceModel).filter(ServiceModel.is_active == True)
    if category_id:
        query = query.filter(ServiceModel.category_id == category_id)
    
    services = query.all()
    
    # Store in cache
    response_data = [schemas.Service.from_orm(s).dict() for s in services]
    set_cache(cache_key, response_data, ttl=300)
    
    return services


@router.get("/services/{id}", response_model=schemas.Service)
def get_service_by_id(id: str, db: Session = Depends(get_db)):
    """
    Get a specific service by ID.
    """
    cache_key = f"services:item:{id}"
    
    cached_data = get_cache(cache_key)
    if cached_data:
        return cached_data

    service = db.query(ServiceModel).filter(ServiceModel.id == id, ServiceModel.is_active == True).first()
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
        
    response_data = schemas.Service.from_orm(service).dict()
    set_cache(cache_key, response_data, ttl=300)
    
    return service


@router.get("/categories", response_model=List[schemas.Category])
def get_categories(db: Session = Depends(get_db)):
    """
    Get categories structure. Cached.
    """
    cache_key = "categories:all"
    cached_data = get_cache(cache_key)
    if cached_data:
        return cached_data

    categories = db.query(CategoryModel).all()
    response_data = [schemas.Category.from_orm(c).dict() for c in categories]
    set_cache(cache_key, response_data, ttl=300)
    
    return categories


@router.get("/staff", response_model=List[schemas.Staff])
def get_staff(db: Session = Depends(get_db)):
    """
    Get active staff list. Cached.
    """
    cache_key = "staff:all"
    cached_data = get_cache(cache_key)
    if cached_data:
        return cached_data

    staff = db.query(StaffModel).filter(StaffModel.is_active == True).all()
    response_data = [schemas.Staff.from_orm(s).dict() for s in staff]
    set_cache(cache_key, response_data, ttl=300)
    
    return staff


@router.get("/availability", response_model=List[schemas.DayAvailabilitySlots])
async def check_availability(
    service_id: str,
    start_date: date,
    end_date: date,
    staff_id: Optional[str] = None
):
    """
    Search availability slots from Square API.
    """
    client = SquareAsyncClient()
    
    # Format dates to RFC 3339 timestamps for Square search
    start_time_iso = f"{start_date}T00:00:00Z"
    end_time_iso = f"{end_date}T23:59:59Z"
    
    try:
        availabilities = await client.search_availability(
            start_time=start_time_iso,
            end_time=end_time_iso,
            service_id=service_id,
            staff_id=staff_id
        )
        
        # Group slot times by date, converting from UTC to business local timezone
        local_tz = ZoneInfo("America/New_York")
        grouped: dict[date, List[str]] = {}
        for av in availabilities:
            utc_dt = datetime.fromisoformat(av["start_at"].replace("Z", "+00:00"))
            local_dt = utc_dt.astimezone(local_tz)
            slot_date = local_dt.date()
            slot_time_str = local_dt.time().isoformat()
            
            if slot_date not in grouped:
                grouped[slot_date] = []
            grouped[slot_date].append(slot_time_str)

        response = []
        for d, slots in sorted(grouped.items()):
            response.append(schemas.DayAvailabilitySlots(date=d, slots=slots))
            
        return response
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
