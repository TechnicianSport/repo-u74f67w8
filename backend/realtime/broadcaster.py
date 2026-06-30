from __future__ import annotations

import asyncio
import json
import time
from typing import Optional

from redis.asyncio import Redis

from config import settings

_redis: Optional[Redis] = None
_clients: set[asyncio.Queue[str]] = set()
CHANNEL = "lnm:live_packages"


async def get_redis() -> Redis:
    global _redis
    if _redis is None:
        _redis = Redis.from_url(settings.REDIS_URL, decode_responses=True)
    return _redis


async def subscribe_client() -> asyncio.Queue[str]:
    queue: asyncio.Queue[str] = asyncio.Queue(maxsize=128)
    _clients.add(queue)
    return queue


def unsubscribe_client(queue: asyncio.Queue[str]) -> None:
    _clients.discard(queue)


async def publish_package(package_json: dict) -> None:
    redis = await get_redis()
    message = json.dumps(
        {
            "type": "new_package",
            "data": package_json,
            "ts": time.time(),
        }
    )
    await redis.publish(CHANNEL, message)
    for q in list(_clients):
        try:
            q.put_nowait(message)
        except asyncio.QueueFull:
            pass


async def publish_breaking(package_json: dict) -> None:
    redis = await get_redis()
    message = json.dumps(
        {
            "type": "breaking_alert",
            "data": package_json,
            "ts": time.time(),
        }
    )
    await redis.publish(CHANNEL, message)
    for q in list(_clients):
        try:
            q.put_nowait(message)
        except asyncio.QueueFull:
            pass


async def broadcast_heartbeat() -> None:
    message = json.dumps(
        {"type": "heartbeat", "ts": time.time(), "data": None}
    )
    for q in list(_clients):
        try:
            q.put_nowait(message)
        except asyncio.QueueFull:
            pass


async def redis_subscriber_task() -> None:
    """Listen on Redis pub/sub and relay to local WebSocket queues."""
    redis = await get_redis()
    pubsub = redis.pubsub()
    await pubsub.subscribe(CHANNEL)
    try:
        async for raw_msg in pubsub.listen():
            if raw_msg["type"] != "message":
                continue
            data = raw_msg["data"]
            for q in list(_clients):
                try:
                    q.put_nowait(data)
                except asyncio.QueueFull:
                    pass
    finally:
        await pubsub.unsubscribe(CHANNEL)
        await pubsub.close()


async def start_heartbeat_loop() -> None:
    while True:
        await broadcast_heartbeat()
        await asyncio.sleep(15)
