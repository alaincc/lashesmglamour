"""
Database initialization: creates tables and seeds initial data.
Called once on application startup.
"""
import logging
from sqlalchemy.orm import Session
from backend.app.database.session import Base, engine, SessionLocal
from backend.app.models.models import Category, Service, Staff, Availability
from datetime import date, time, timedelta

logger = logging.getLogger(__name__)


def create_tables() -> None:
    """Create all tables if they don't exist."""
    logger.info("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables ready.")


def seed_initial_data(db: Session) -> None:
    """Seed initial categories, services, and staff if the DB is empty."""

    # --- Categories ---
    if db.query(Category).count() == 0:
        logger.info("Seeding categories...")
        categories = [
            Category(id="cat-lashes", name="Lash Extensions"),
            Category(id="cat-brows", name="Brows"),
            Category(id="cat-skincare", name="Skincare"),
        ]
        db.add_all(categories)
        db.commit()

    # --- Services ---
    if db.query(Service).count() == 0:
        logger.info("Seeding services...")
        services = [
            # Lash Extensions
            Service(
                id="svc-classic-full",
                category_id="cat-lashes",
                name="Classic Full Set",
                description="Natural, elegant lash extensions applied one-to-one on each natural lash.",
                price_cents=12000,
                currency="USD",
                duration_minutes=120,
                is_active=True,
            ),
            Service(
                id="svc-classic-fill",
                category_id="cat-lashes",
                name="Classic Fill (2 weeks)",
                description="Maintenance fill for Classic lash sets. Recommended every 2-3 weeks.",
                price_cents=6500,
                currency="USD",
                duration_minutes=60,
                is_active=True,
            ),
            Service(
                id="svc-hybrid-full",
                category_id="cat-lashes",
                name="Hybrid Full Set",
                description="Mix of Classic and Volume techniques for a textured, wispy look.",
                price_cents=14000,
                currency="USD",
                duration_minutes=135,
                is_active=True,
            ),
            Service(
                id="svc-hybrid-fill",
                category_id="cat-lashes",
                name="Hybrid Fill (2 weeks)",
                description="Maintenance fill for Hybrid lash sets.",
                price_cents=7500,
                currency="USD",
                duration_minutes=75,
                is_active=True,
            ),
            Service(
                id="svc-volume-full",
                category_id="cat-lashes",
                name="Volume Full Set",
                description="Dramatic, full look using lightweight fans of multiple extensions per lash.",
                price_cents=16000,
                currency="USD",
                duration_minutes=150,
                is_active=True,
            ),
            Service(
                id="svc-volume-fill",
                category_id="cat-lashes",
                name="Volume Fill (2 weeks)",
                description="Maintenance fill for Volume lash sets.",
                price_cents=8500,
                currency="USD",
                duration_minutes=90,
                is_active=True,
            ),
            # Brows
            Service(
                id="svc-brow-lamination",
                category_id="cat-brows",
                name="Brow Lamination",
                description="Relaxes and shapes brow hairs for a fuller, brushed-up symmetrical look.",
                price_cents=8500,
                currency="USD",
                duration_minutes=60,
                is_active=True,
            ),
            Service(
                id="svc-brow-tint",
                category_id="cat-brows",
                name="Brow Tint",
                description="Color tinting to define and enhance eyebrows.",
                price_cents=4500,
                currency="USD",
                duration_minutes=30,
                is_active=True,
            ),
            Service(
                id="svc-brow-lamination-tint",
                category_id="cat-brows",
                name="Brow Lamination + Tint",
                description="Combined brow lamination and tinting for maximum definition.",
                price_cents=11000,
                currency="USD",
                duration_minutes=75,
                is_active=True,
            ),
            # Skincare
            Service(
                id="svc-lash-lift",
                category_id="cat-skincare",
                name="Lash Lift & Tint",
                description="Lifts and curls your natural lashes with a tint for extra definition.",
                price_cents=9500,
                currency="USD",
                duration_minutes=75,
                is_active=True,
            ),
        ]
        db.add_all(services)
        db.commit()

    # --- Staff ---
    if db.query(Staff).count() == 0:
        logger.info("Seeding staff...")
        staff = [
            Staff(
                id="staff-001",
                first_name="Maria",
                last_name="Garcia",
                bio="Certified lash technician with 5+ years of experience specializing in Volume and Hybrid sets.",
                is_active=True,
            ),
            Staff(
                id="staff-002",
                first_name="Sofia",
                last_name="Martinez",
                bio="Expert in Classic lash extensions and brow lamination. Known for her precise and natural-looking results.",
                is_active=True,
            ),
        ]
        db.add_all(staff)
        db.commit()

        # Seed availability for the next 30 days (Mon-Sat, 9am-6pm)
        logger.info("Seeding availability...")
        availabilities = []
        today = date.today()
        for staff_member in staff:
            for i in range(30):
                day = today + timedelta(days=i)
                # Skip Sundays (weekday 6)
                if day.weekday() == 6:
                    continue
                availabilities.append(
                    Availability(
                        staff_id=staff_member.id,
                        date=day,
                        start_time=time(9, 0),
                        end_time=time(18, 0),
                    )
                )
        db.add_all(availabilities)
        db.commit()

    logger.info("Database seeding complete.")


def init_db() -> None:
    """Main entry point: create tables then seed if empty."""
    create_tables()
    db = SessionLocal()
    try:
        seed_initial_data(db)
    finally:
        db.close()
