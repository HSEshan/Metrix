import asyncio
import time

from fastapi import APIRouter, Depends, WebSocket, WebSocketDisconnect

from src.api.services.api_health import APIHealthService
from src.api.services.metrics import MetricsService
from src.api.services.registry import service_registry
from src.api.services.websocket import WebsocketService

router = APIRouter()


@router.websocket("/ws")
async def websocket_endpoint(
    websocket: WebSocket,
    websocket_service: WebsocketService = Depends(
        service_registry.get(WebsocketService)
    ),
    metrics_service: MetricsService = Depends(service_registry.get(MetricsService)),
    api_health_service: APIHealthService = Depends(
        service_registry.get(APIHealthService)
    ),
):
    await websocket_service.connect(websocket)
    websocket_service.metrics_service = metrics_service
    websocket_service.api_health_service = api_health_service
    flag = True

    try:
        #     # Create tasks for sending metrics and health data
        #     metrics_task = asyncio.create_task(
        #         websocket_service.send_metrics(websocket, flag)
        #     )
        #     health_task = asyncio.create_task(
        #         websocket_service.send_api_health(websocket, flag)
        #     )

        while True:
            try:
                await websocket_service.send_metrics(websocket, flag)
                await websocket_service.send_api_health(websocket, flag)
                await asyncio.sleep(1)
                print("Sent Metrics and API Health")

            except WebSocketDisconnect:
                break

    except Exception:
        pass

    finally:
        flag = False  # Stop all tasks
        print(f"{websocket.client.host} disconnected")
        print(f"flag: {flag}")
