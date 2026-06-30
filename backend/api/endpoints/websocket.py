import asyncio
import json
import time

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from realtime.broadcaster import subscribe_client, unsubscribe_client

router = APIRouter()


@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket) -> None:
    await websocket.accept()

    init_msg = json.dumps(
        {"type": "connection_ack", "ts": time.time(), "data": None}
    )
    await websocket.send_text(init_msg)

    queue = await subscribe_client()

    try:
        while True:
            try:
                message = await asyncio.wait_for(queue.get(), timeout=30.0)
                await websocket.send_text(message)
            except asyncio.TimeoutError:
                heartbeat = json.dumps(
                    {"type": "heartbeat", "ts": time.time(), "data": None}
                )
                await websocket.send_text(heartbeat)
            except WebSocketDisconnect:
                break
    finally:
        unsubscribe_client(queue)
