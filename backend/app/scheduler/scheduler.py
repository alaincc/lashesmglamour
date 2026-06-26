import asyncio
import logging
from backend.app.services.square_sync import sync_square_data

logger = logging.getLogger(__name__)

# Control flag for the scheduler loop
_running = False


async def _scheduler_loop(interval_seconds: int = 900):
    """
    Background loop that sleep-cycles and triggers synchronization
    """
    global _running
    logger.info(f"Background sync scheduler started. Interval: {interval_seconds} seconds")
    
    # Wait briefly on startup to let server bind and run initial sync
    await asyncio.sleep(5)
    
    while _running:
        try:
            logger.info("Scheduler triggering catalog sync with Square")
            await sync_square_data()
        except Exception as e:
            logger.error(f"Scheduler sync loop error: {e}")
        
        await asyncio.sleep(interval_seconds)


def start_scheduler():
    """
    Initiates the scheduler in the current asyncio loop
    """
    global _running
    if not _running:
        _running = True
        asyncio.create_task(_scheduler_loop())
        logger.info("Scheduler thread started successfully")


def stop_scheduler():
    """
    Flags the scheduler to stop running
    """
    global _running
    _running = False
    logger.info("Scheduler stop flag requested")
