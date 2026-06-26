import asyncio
import logging
from backend.app.services.square_sync import sync_square_data

logging.basicConfig(level=logging.INFO)

async def main():
    print("Triggering manual catalog sync...")
    success = await sync_square_data()
    if success:
        print("Sync completed successfully!")
    else:
        print("Sync failed!")

if __name__ == "__main__":
    asyncio.run(main())
