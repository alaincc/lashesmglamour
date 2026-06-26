from datetime import date, datetime, time
from typing import List, Optional
from pydantic import BaseModel, EmailStr, Field


# Token schemas
class Token(BaseModel):
    access_token: str
    token_type: str


class TokenPayload(BaseModel):
    sub: Optional[str] = None


# Admin schemas
class AdminLogin(BaseModel):
    username: str
    password: str


# Category schemas
class CategoryBase(BaseModel):
    id: str
    name: str


class CategoryCreate(CategoryBase):
    pass


class Category(CategoryBase):
    updated_at: datetime

    class Config:
        from_attributes = True


# Service schemas
class ServiceBase(BaseModel):
    id: str
    category_id: Optional[str] = None
    name: str
    description: Optional[str] = None
    price_cents: int
    currency: str = "USD"
    duration_minutes: int
    image_url: Optional[str] = None
    is_active: bool = True


class ServiceCreate(ServiceBase):
    pass


class Service(ServiceBase):
    updated_at: datetime

    class Config:
        from_attributes = True


# Staff schemas
class StaffBase(BaseModel):
    id: str
    first_name: str
    last_name: Optional[str] = None
    bio: Optional[str] = None
    avatar_url: Optional[str] = None
    is_active: bool = True


class StaffCreate(StaffBase):
    pass


class Staff(StaffBase):
    updated_at: datetime

    class Config:
        from_attributes = True


# Availability schemas
class AvailabilityBase(BaseModel):
    staff_id: str
    date: date
    start_time: time
    end_time: time


class AvailabilityCreate(AvailabilityBase):
    pass


class Availability(AvailabilityBase):
    id: int
    updated_at: datetime

    class Config:
        from_attributes = True


# Booking Customer details
class CustomerInfo(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    phone: str


# Booking schemas
class BookingBase(BaseModel):
    service_id: str
    staff_id: str
    start_time: datetime
    customer_name: str
    customer_email: Optional[EmailStr] = None
    customer_phone: Optional[str] = None


class BookingCreateRequest(BaseModel):
    service_id: str
    staff_id: str
    start_time: datetime
    customer: CustomerInfo


class BookingCreate(BookingBase):
    id: str
    end_time: datetime
    status: str


class BookingUpdateRequest(BaseModel):
    start_time: datetime


class Booking(BookingBase):
    id: str
    end_time: datetime
    status: str
    updated_at: datetime

    class Config:
        from_attributes = True


# Availability response schemas
class DayAvailabilitySlots(BaseModel):
    date: date
    slots: List[str]  # e.g., ["09:00:00", "10:30:00"]


# API status dashboard schema
class APIStatus(BaseModel):
    status: str
    database_connected: bool
    redis_connected: bool
    cached_services_count: int
    square_environment: str
