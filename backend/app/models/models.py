from datetime import date, datetime, time
from sqlalchemy import Boolean, Column, Date, DateTime, ForeignKey, Integer, String, Time, text
from sqlalchemy.orm import relationship
from backend.app.database.session import Base


class Category(Base):
    __tablename__ = "categories"

    id = Column(String, primary_key=True, index=True)  # Square Category ID
    name = Column(String, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    services = relationship("Service", back_populates="category", cascade="all, delete-orphan")


class Service(Base):
    __tablename__ = "services"

    id = Column(String, primary_key=True, index=True)  # Square Catalog Item ID
    category_id = Column(String, ForeignKey("categories.id", ondelete="SET NULL"), nullable=True, index=True)
    name = Column(String, nullable=False)
    description = Column(String, nullable=True)
    price_cents = Column(Integer, nullable=False)
    currency = Column(String, default="USD", nullable=False)
    duration_minutes = Column(Integer, nullable=False)
    image_url = Column(String, nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    category = relationship("Category", back_populates="services")
    bookings = relationship("Booking", back_populates="service")


class Staff(Base):
    __tablename__ = "staff"

    id = Column(String, primary_key=True, index=True)  # Square Team Member ID
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=True)
    bio = Column(String, nullable=True)
    avatar_url = Column(String, nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    bookings = relationship("Booking", back_populates="staff")
    availabilities = relationship("Availability", back_populates="staff", cascade="all, delete-orphan")


class Booking(Base):
    __tablename__ = "bookings"

    id = Column(String, primary_key=True, index=True)  # Square Booking ID
    service_id = Column(String, ForeignKey("services.id", ondelete="RESTRICT"), nullable=False, index=True)
    staff_id = Column(String, ForeignKey("staff.id", ondelete="RESTRICT"), nullable=False, index=True)
    start_time = Column(DateTime(timezone=True), nullable=False)
    end_time = Column(DateTime(timezone=True), nullable=False)
    status = Column(String, nullable=False)  # ACCEPTED, REPROGRAMMED, CANCELED
    customer_name = Column(String, nullable=False)
    customer_email = Column(String, nullable=True)
    customer_phone = Column(String, nullable=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    service = relationship("Service", back_populates="bookings")
    staff = relationship("Staff", back_populates="bookings")


class Availability(Base):
    __tablename__ = "availabilities"

    id = Column(Integer, primary_key=True, autoincrement=True)
    staff_id = Column(String, ForeignKey("staff.id", ondelete="CASCADE"), nullable=False, index=True)
    date = Column(Date, nullable=False, index=True)
    start_time = Column(Time, nullable=False)
    end_time = Column(Time, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    staff = relationship("Staff", back_populates="availabilities")
