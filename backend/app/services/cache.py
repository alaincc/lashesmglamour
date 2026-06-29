import json
import logging
from typing import Any, Optional
import redis
from fastapi.encoders import jsonable_encoder
from backend.app.core.config import settings

logger = logging.getLogger(__name__)

# Initialize connection pool for Redis
try:
    redis_client = redis.from_url(settings.REDIS_URL, decode_responses=True)
except Exception as e:
    logger.error(f"Failed to connect to Redis at {settings.REDIS_URL}: {e}")
    redis_client = None


def get_cache(key: str) -> Optional[Any]:
    """
    Retrieve value from cache. If not found or client is missing, return None.
    """
    if not redis_client:
        return None
    try:
        data = redis_client.get(key)
        if data:
            return json.loads(data)
    except Exception as e:
        logger.error(f"Error retrieving cache for key {key}: {e}")
    return None


def set_cache(key: str, value: Any, ttl: int = 300) -> bool:
    """
    Set a value in the cache with a specific TTL (seconds).
    """
    if not redis_client:
        return False
    try:
        serialized = json.dumps(jsonable_encoder(value))
        redis_client.set(key, serialized, ex=ttl)
        return True
    except Exception as e:
        logger.error(f"Error writing to cache for key {key}: {e}")
    return False


def delete_cache(key: str) -> bool:
    """
    Delete a single cache key.
    """
    if not redis_client:
        return False
    try:
        redis_client.delete(key)
        return True
    except Exception as e:
        logger.error(f"Error deleting cache key {key}: {e}")
    return False


def invalidate_catalog_cache() -> None:
    """
    Clears all catalog related caches (services, categories, staff).
    """
    if not redis_client:
        return
    try:
        # Get all keys matching our catalog schemas
        keys = redis_client.keys("services:*") + redis_client.keys("staff:*")
        if keys:
            redis_client.delete(*keys)
            logger.info(f"Invalidated {len(keys)} catalog cache keys.")
    except Exception as e:
        logger.error(f"Error invalidating catalog cache: {e}")
