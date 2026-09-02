import os
import logging
import asyncio
from typing import Optional
from pathlib import Path
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
import pymongo

import certifi

logger = logging.getLogger("cart_insight.database")

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

mongo_url = os.environ.get("MONGO_URL", "mongodb://127.0.0.1:27017")
db_name = os.environ.get("DB_NAME", "cart_insight")

_client: Optional[AsyncIOMotorClient] = None
_client_loop = None


def get_client() -> AsyncIOMotorClient:
    global _client, _client_loop
    try:
        current_loop = asyncio.get_running_loop()
    except RuntimeError:
        current_loop = None

    if _client is None or _client_loop != current_loop:
        try:
            _client = AsyncIOMotorClient(
                mongo_url,
                tlsCAFile=certifi.where(),
                tlsAllowInvalidCertificates=True,
                serverSelectionTimeoutMS=3000,
                connectTimeoutMS=3000,
                socketTimeoutMS=5000,
            )
        except Exception:
            _client = AsyncIOMotorClient(
                mongo_url,
                serverSelectionTimeoutMS=3000,
                connectTimeoutMS=3000,
            )
        _client_loop = current_loop
    return _client


def get_db() -> AsyncIOMotorDatabase:
    return get_client()[db_name]


class DynamicCollection:
    def __init__(self, coll_name: str):
        self.coll_name = coll_name

    def __getattr__(self, item):
        collection = get_db()[self.coll_name]
        return getattr(collection, item)


class DynamicDatabase:
    def __getattr__(self, item):
        if item in ("sales_rows", "inventory_rows", "datasets", "schedules", "deliveries"):
            return DynamicCollection(item)
        return getattr(get_db(), item)

    def __getitem__(self, item):
        return DynamicCollection(item)


db = DynamicDatabase()


async def init_db_indexes():
    """Create essential indexes for sales, inventory, datasets, and schedules."""
    try:
        database = get_db()
        await database.sales_rows.create_index([("date", pymongo.ASCENDING)])
        await database.sales_rows.create_index([("category", pymongo.ASCENDING)])
        await database.sales_rows.create_index([("product", pymongo.ASCENDING)])
        await database.sales_rows.create_index([("dataset_id", pymongo.ASCENDING)])

        await database.inventory_rows.create_index([("status", pymongo.ASCENDING)])
        await database.inventory_rows.create_index([("category", pymongo.ASCENDING)])
        await database.inventory_rows.create_index([("dataset_id", pymongo.ASCENDING)])

        await database.datasets.create_index([("uploaded_at", pymongo.DESCENDING)])
        await database.schedules.create_index([("id", pymongo.ASCENDING)], unique=True)
        await database.deliveries.create_index([("delivered_at", pymongo.DESCENDING)])

        logger.info("Database indexes successfully initialized.")
    except Exception as e:
        logger.warning(f"Could not initialize database indexes: {e}")


async def close_db():
    """Close the MongoDB client connection."""
    global _client
    if _client is not None:
        _client.close()
        _client = None
    logger.info("Database connection closed.")

