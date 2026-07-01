import logging
from datetime import datetime
from sqlalchemy.orm import Session
from backend.app.database.session import SessionLocal
from backend.app.models.models import Category, Service, Staff
from backend.app.services.square_client import SquareAsyncClient
from backend.app.services.cache import invalidate_catalog_cache

logger = logging.getLogger(__name__)


async def sync_square_data() -> bool:
    """
    Core sync service. Pulls catalog and staff from Square API
    and updates PostgreSQL tables. Invalidates Redis cache.
    """
    logger.info("Initializing background data sync with Square API")
    db: Session = SessionLocal()
    client = SquareAsyncClient()

    try:
        # 1. Fetch Catalog (Items & Categories)
        catalog = await client.fetch_catalog()
        objects = catalog.get("objects", [])

        # Parse and save categories
        square_categories = [obj for obj in objects if obj["type"] == "CATEGORY"]
        for cat in square_categories:
            cat_id = cat["id"]
            cat_name = cat["category_data"]["name"]
            
            db_cat = db.query(Category).filter(Category.id == cat_id).first()
            if db_cat:
                db_cat.name = cat_name
            else:
                db_cat = Category(id=cat_id, name=cat_name)
                db.add(db_cat)

        # Flush categories to resolve FK references
        db.commit()

        # Parse and save services (Item Variations in Square Catalog)
        square_items = [obj for obj in objects if obj["type"] == "ITEM"]
        active_service_ids = []

        for item in square_items:
            item_data = item.get("item_data", {})
            category_id = item_data.get("category_id")
            item_name = item_data.get("name", "")
            description = item_data.get("description", "")
            
            # Fallback category mapping by name keywords if not set in Square catalog
            if not category_id:
                name_lower = item_name.lower()
                if "wax" in name_lower or "thread" in name_lower:
                    cat = db.query(Category).filter(Category.name.ilike("%wax%")).first()
                    if cat:
                        category_id = cat.id
                elif "brow" in name_lower or "lamin" in name_lower:
                    cat = db.query(Category).filter(Category.name.ilike("%brow%")).first()
                    if cat:
                        category_id = cat.id
                elif "facial" in name_lower:
                    cat = db.query(Category).filter(Category.name.ilike("%facial%")).first()
                    if cat:
                        category_id = cat.id
                elif "acne" in name_lower:
                    cat = db.query(Category).filter(Category.name.ilike("%acne%")).first()
                    if cat:
                        category_id = cat.id
                elif "skin" in name_lower:
                    cat = db.query(Category).filter(Category.name.ilike("%skin%")).first()
                    if cat:
                        category_id = cat.id
                elif any(x in name_lower for x in ["lash", "volumen", "classic", "hybrid", "refill", "set"]):
                    cat = db.query(Category).filter(Category.name.ilike("%lash%")).first()
                    if cat:
                        category_id = cat.id
            
            # Variations represent the individual service mappings (Classic full, etc.)
            variations = item_data.get("variations", [])
            for var in variations:
                var_id = var["id"]
                var_data = var.get("item_variation_data", {})
                
                # Check if it is a bookable appointment service in Square
                if not var_data.get("bookable", False):
                    continue
                
                active_service_ids.append(var_id)

                
                # Retrieve version
                version = var.get("version")
                
                # Retrieve price
                price_money = var_data.get("price_money", {})
                price_cents = price_money.get("amount", 0)
                currency = price_money.get("currency", "USD")

                # Retrieve duration (default to 60 mins if missing)
                duration_ms = var_data.get("service_duration", 60 * 60 * 1000)
                duration_minutes = int(duration_ms / (60 * 1000))

                var_name = f"{item_name} - {var_data.get('name', '')}" if len(variations) > 1 else item_name

                # Image URL mapping (look for catalog image)
                image_url = None
                image_id = item_data.get("image_id") or var_data.get("image_id")
                if image_id:
                    # Look up image details inside objects array if available
                    for img in objects:
                        if img["id"] == image_id and img["type"] == "IMAGE":
                            image_url = img.get("image_data", {}).get("url")
                            break

                db_service = db.query(Service).filter(Service.id == var_id).first()
                if db_service:
                    db_service.category_id = category_id
                    db_service.name = var_name
                    db_service.description = description
                    db_service.price_cents = price_cents
                    db_service.currency = currency
                    db_service.duration_minutes = duration_minutes
                    db_service.image_url = image_url or db_service.image_url
                    db_service.version = version
                    db_service.is_active = True
                else:
                    db_service = Service(
                        id=var_id,
                        category_id=category_id,
                        name=var_name,
                        description=description,
                        price_cents=price_cents,
                        currency=currency,
                        duration_minutes=duration_minutes,
                        image_url=image_url,
                        version=version,
                        is_active=True
                    )
                    db.add(db_service)

        # Deactivate services no longer active in Square catalog
        db.query(Service).filter(Service.id.notin_(active_service_ids)).update(
            {"is_active": False}, synchronize_session=False
        )
        db.commit()

        # 2. Fetch and save Team Members (Staff)
        team_members = await client.fetch_team_members()
        active_staff_ids = []

        for tm in team_members:
            tm_id = tm["id"]
            active_staff_ids.append(tm_id)
            first_name = tm.get("given_name", "")
            last_name = tm.get("family_name", "")
            
            # Simple custom metadata mapping for bio/avatar if available
            bio = f"Professional therapist at Lashes & MGlamour."
            avatar_url = None

            db_staff = db.query(Staff).filter(Staff.id == tm_id).first()
            if db_staff:
                db_staff.first_name = first_name
                db_staff.last_name = last_name
                db_staff.is_active = True
            else:
                db_staff = Staff(
                    id=tm_id,
                    first_name=first_name,
                    last_name=last_name,
                    bio=bio,
                    avatar_url=avatar_url,
                    is_active=True
                )
                db.add(db_staff)

        # Deactivate staff no longer active in Square
        db.query(Staff).filter(Staff.id.notin_(active_staff_ids)).update(
            {"is_active": False}, synchronize_session=False
        )
        db.commit()

        # 3. Invalidate Redis Caching
        invalidate_catalog_cache()
        logger.info("Background synchronization completed successfully")
        return True

    except Exception as e:
        logger.error(f"Failed to synchronize catalog with Square API: {e}")
        db.rollback()
        return False
    finally:
        db.close()
