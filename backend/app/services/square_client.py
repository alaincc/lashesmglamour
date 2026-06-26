import logging
from typing import Any, Dict, List, Optional
import httpx
from backend.app.core.config import settings

logger = logging.getLogger(__name__)


class SquareAsyncClient:
    def __init__(self):
        self.access_token = settings.SQUARE_ACCESS_TOKEN
        self.environment = settings.SQUARE_ENVIRONMENT.lower()
        self.location_id = settings.SQUARE_LOCATION_ID

        if self.environment == "production":
            self.base_url = "https://connect.squareup.com"
        else:
            self.base_url = "https://connect.squareupsandbox.com"

        self.headers = {
            "Authorization": f"Bearer {self.access_token}",
            "Square-Version": "2024-05-15",
            "Content-Type": "application/json",
        }

    async def _request(
        self, method: str, path: str, json_data: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Generic HTTP request helper using httpx.AsyncClient
        """
        url = f"{self.base_url}{path}"
        async with httpx.AsyncClient() as client:
            try:
                response = await client.request(
                    method=method, url=url, headers=self.headers, json=json_data, timeout=15.0
                )
                response.raise_for_status()
                return response.json()
            except httpx.HTTPStatusError as e:
                logger.error(f"Square API error status code {e.response.status_code}: {e.response.text}")
                raise Exception(f"Square API error: {e.response.text}")
            except Exception as e:
                logger.error(f"Square connection failure: {e}")
                raise Exception(f"Failed to connect to Square: {e}")

    async def fetch_catalog(self) -> Dict[str, Any]:
        """
        Fetches full catalog items and categories from Square Catalog API.
        """
        logger.info("Fetching catalog objects from Square")
        return await self._request("GET", "/v2/catalog/list")

    async def fetch_team_members(self) -> List[Dict[str, Any]]:
        """
        Fetches all active team members (staff) associated with the location.
        """
        logger.info("Fetching team members from Square")
        payload = {
            "query": {
                "filter": {
                    "status": "ACTIVE"
                }
            }
        }
        response = await self._request("POST", "/v2/team-members/search", json_data=payload)
        return response.get("team_members", [])

    async def search_availability(
        self, start_time: str, end_time: str, service_id: str, staff_id: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """
        Search available booking slots from Square Bookings API.
        """
        logger.info(f"Searching availability from {start_time} to {end_time} for service {service_id}")
        
        segment = {
            "service_variation_id": service_id
        }
        if staff_id:
            segment["team_member_id"] = staff_id

        payload = {
            "query": {
                "filter": {
                    "start_at_range": {
                        "start_at": start_time,
                        "end_at": end_time
                    },
                    "location_id": self.location_id,
                    "segment_filters": [
                        {
                            "team_member_id_filter": {
                                "any": [staff_id] if staff_id else []
                            },
                            "service_variation_id": service_id
                        }
                    ]
                }
            }
        }
        
        # If no specific staff member filter is requested, search for any matching team member
        if not staff_id:
            payload["query"]["filter"]["segment_filters"][0].pop("team_member_id_filter")

        response = await self._request("POST", "/v2/bookings/availability/search", json_data=payload)
        return response.get("availabilities", [])

    async def create_booking(
        self, service_id: str, staff_id: str, start_time: str, customer_id: str, customer_note: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Creates a new reservation slot inside the Square Booking system.
        """
        logger.info(f"Submitting booking request to Square for customer {customer_id}")
        payload = {
            "booking": {
                "start_at": start_time,
                "location_id": self.location_id,
                "customer_id": customer_id,
                "customer_note": customer_note or "Booked via Lashes & MGlamour Web",
                "appointment_segments": [
                    {
                        "duration_minutes": 60,  # fallback duration, Square override based on service_variation
                        "service_variation_id": service_id,
                        "team_member_id": staff_id
                    }
                ]
            }
        }
        response = await self._request("POST", "/v2/bookings", json_data=payload)
        return response.get("booking", {})

    async def cancel_booking(self, booking_id: str, version: int = 1) -> Dict[str, Any]:
        """
        Cancels an active booking in Square.
        """
        logger.info(f"Cancelling booking {booking_id} in Square")
        payload = {
            "booking_version": version,
            "reason": "Cancelled by user via Lashes & MGlamour Platform"
        }
        response = await self._request(
            "POST", f"/v2/bookings/{booking_id}/cancel", json_data=payload
        )
        return response.get("booking", {})

    async def update_booking(
        self, booking_id: str, version: int, start_time: str, service_id: str, staff_id: str
    ) -> Dict[str, Any]:
        """
        Updates (reschedules) an existing booking.
        """
        logger.info(f"Rescheduling booking {booking_id} to {start_time}")
        payload = {
            "booking": {
                "version": version,
                "start_at": start_time,
                "appointment_segments": [
                    {
                        "service_variation_id": service_id,
                        "team_member_id": staff_id
                    }
                ]
            }
        }
        response = await self._request("PUT", f"/v2/bookings/{booking_id}", json_data=payload)
        return response.get("booking", {})

    async def get_or_create_customer(self, first_name: str, last_name: str, email: str, phone: str) -> str:
        """
        Searches if the customer profile already exists in Square; if not, creates a new profile.
        Returns the Customer ID.
        """
        logger.info(f"Searching Square customer directory for email: {email}")
        search_payload = {
            "query": {
                "filter": {
                    "email_address": {
                        "exact": email
                    }
                }
            }
        }
        
        try:
            search_res = await self._request("POST", "/v2/customers/search", json_data=search_payload)
            customers = search_res.get("customers", [])
            if customers:
                customer_id = customers[0]["id"]
                logger.info(f"Found existing customer in Square: {customer_id}")
                return customer_id
        except Exception as e:
            logger.warning(f"Error searching customer, proceeding to create new profile: {e}")

        # If not found, create new customer
        logger.info(f"Creating new customer profile in Square for {first_name} {last_name}")
        create_payload = {
            "given_name": first_name,
            "family_name": last_name,
            "email_address": email,
            "phone_number": phone
        }
        create_res = await self._request("POST", "/v2/customers", json_data=create_payload)
        return create_res["customer"]["id"]
