import os
import time
import datetime
from subprocess import Popen
from pathlib import Path
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, List, Any
import json
import asyncio
from uuid import uuid4
import logging
from src.fetch_resources import fetch_resources  # Updated import path
import shutil

# Enhanced logging setup
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Connection Manager for WebSockets
class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, Dict[str, WebSocket]] = {}  # job_id -> {client_id: websocket}
        self.job_status: Dict[str, dict] = {}  # job_id -> status info
        self.job_tasks: Dict[str, asyncio.Task] = {}  # Track background tasks

    async def connect(self, websocket: WebSocket, job_id: str):
        await websocket.accept()
        client_id = str(uuid4())
        logger.debug(f"New client connected - job_id: {job_id}, client_id: {client_id}")
        
        if job_id not in self.active_connections:
            self.active_connections[job_id] = {}
        self.active_connections[job_id][client_id] = websocket
        
        # Send current status immediately if it exists
        if job_id in self.job_status:
            try:
                await websocket.send_json(self.job_status[job_id])
            except Exception as e:
                logger.error(f"Error sending initial status: {e}")
        
        return client_id

    async def disconnect(self, job_id: str, client_id: str):
        if job_id in self.active_connections:
            self.active_connections[job_id].pop(client_id, None)
            if not self.active_connections[job_id]:
                self.active_connections.pop(job_id)
                # Don't remove job_status here as other clients might connect later

    async def broadcast_to_job(self, job_id: str, message: dict):
        logger.debug(f"Broadcasting to job {job_id}: {message}")
        self.job_status[job_id] = message  # Update status before broadcasting
        
        if job_id in self.active_connections:
            disconnected_clients = []
            for client_id, connection in self.active_connections[job_id].items():
                try:
                    await connection.send_json(message)
                except Exception as e:
                    logger.error(f"Error sending message to client {client_id}: {e}")
                    disconnected_clients.append(client_id)
            
            # Clean up disconnected clients
            for client_id in disconnected_clients:
                await self.disconnect(job_id, client_id)

    def start_job_task(self, job_id: str, task: asyncio.Task):
        self.job_tasks[job_id] = task
        # Initialize job status
        self.job_status[job_id] = {
            "job_id": job_id,
            "current_step": 0,
            "total_steps": len(COMMANDS),
            "status": "initializing",
            "message": "Job initialized",
            "progress_percentage": 0
        }

manager = ConnectionManager()

LOG_DIR = Path("./logs")
LOG_DIR.mkdir(exist_ok=True)

# Set Schrodinger path here if needed
SCHRODINGER_PATH = "/opt/schrodinger2025-1"
os.environ["PATH"] = f"{SCHRODINGER_PATH}:{SCHRODINGER_PATH}/utilities:{os.environ['PATH']}"

COMMANDS = [
    "ligprep -ismi imatinib.smi -omae imatinib.mae -epik",
    "structconvert 1iep.cif 1iep.mae",
    "prepwizard 1iep.mae 1iep_prepared.mae",
    'generate_glide_grids -rec_file 1iep_prepared.mae -cent_coor "11.879, 62.272, 12.570" -inner_box 30 -outer_box 60.0 -j "1iep_grids"',
    "glide dock_test.in"
]

OUTPUT_FILES = [
    "imatinib.mae",
    "1iep.mae",
    "1iep_prepared.mae",
    "1iep_grids-gridgen.zip",           # Adjust based on actual grid output
    "dock_test.csv"       # Adjust based on actual docking output
]

def wait_for_file(file_path, timeout=900, check_interval=5):
    """Wait for a file to appear, checking every few seconds."""
    waited = 0
    while waited < timeout:
        if os.path.exists(file_path):
            return True
        time.sleep(check_interval)
        waited += check_interval
    return False

async def run_commands_async(job_id: str, state: Dict[str, Any]):
    try:
        timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
        logfile = LOG_DIR / f"workflow_{timestamp}.log"
        
        # Fetch resources first
        try:
            resources = fetch_resources(state)
            logger.info(f"Resources fetched successfully for job {job_id}")
            
            # Copy the fetched files to current working directory
        except Exception as e:
            logger.error(f"Error fetching resources: {e}")
            raise
        
        total_steps = len(COMMANDS)
        
        with open(logfile, "w") as log:
            for i, cmd in enumerate(COMMANDS):
                progress = {
                    "job_id": job_id,
                    "current_step": i + 1,
                    "total_steps": total_steps,
                    "status": "running",
                    "message": f"Running: {cmd}",
                    "progress_percentage": ((i) / total_steps) * 100
                }
                logger.debug(f"Broadcasting progress: {progress}")
                await asyncio.create_task(manager.broadcast_to_job(job_id, progress))

                cwd = os.getcwd()
                log.write(f"\n[✓] Current working directory: {cwd}\n")
                log.write(f"--- Running: {cmd} ---\n")
                log.flush()

                # Run the command in a separate thread to avoid blocking
                process = await asyncio.to_thread(
                    lambda: Popen(cmd, shell=True, stdout=log, stderr=log, env=os.environ).wait()
                )
                exit_code = process

                if exit_code == 0:
                    log.write(f"✓ Success: {cmd}\n")

                    if i < len(OUTPUT_FILES):
                        expected_file = OUTPUT_FILES[i]
                        log.write(f"→ Waiting for output file: {expected_file}\n")
                        log.flush()

                        await asyncio.create_task(manager.broadcast_to_job(job_id, {
                            **progress,
                            "message": f"Waiting for output file: {expected_file}"
                        }))

                        # Run file check in a separate thread
                        file_exists = await asyncio.to_thread(
                            wait_for_file, expected_file
                        )

                        if file_exists:
                            log.write(f"✓ Output file detected: {expected_file}\n")
                        else:
                            log.write(f"✗ Timeout waiting for file: {expected_file}\n")
                            await asyncio.create_task(manager.broadcast_to_job(job_id, {
                                **progress,
                                "status": "error",
                                "message": f"Timeout waiting for file: {expected_file}"
                            }))
                            return
                else:
                    log.write(f"✗ Command failed with exit code {exit_code}: {cmd}\n")
                    await asyncio.create_task(manager.broadcast_to_job(job_id, {
                        **progress,
                        "status": "error",
                        "message": f"Command failed with exit code {exit_code}: {cmd}"
                    }))
                    return

        await asyncio.create_task(manager.broadcast_to_job(job_id, {
            "job_id": job_id,
            "current_step": total_steps,
            "total_steps": total_steps,
            "status": "completed",
            "message": "Workflow completed successfully",
            "progress_percentage": 100
        }))
    except Exception as e:
        logger.error(f"Error in run_commands_async: {e}")
        await asyncio.create_task(manager.broadcast_to_job(job_id, {
            "job_id": job_id,
            "status": "error",
            "message": f"Internal error: {str(e)}",
            "progress_percentage": 0
        }))

@app.post("/run-docking/")
async def run_docking(background_tasks: BackgroundTasks, state: Dict[str, Any]):
    job_id = str(uuid4())
    logger.info(f"Starting new docking job: {job_id}")
    
    # Initialize job status
    manager.job_status[job_id] = {
        "job_id": job_id,
        "current_step": 0,
        "total_steps": len(COMMANDS),
        "status": "initializing",
        "message": "Job initialized",
        "progress_percentage": 0
    }
    
    # Add the task to background_tasks with state parameter
    background_tasks.add_task(run_commands_async, job_id, state)
    
    logger.info(f"Job {job_id} initialized and ready for WebSocket connections")
    return {
        "status": "started", 
        "job_id": job_id,
        "ws_url": f"ws://35.228.70.53:8000/ws/progress/{job_id}"
    }

@app.websocket("/ws/progress/{job_id}")
async def websocket_endpoint(websocket: WebSocket, job_id: str):
    logger.debug(f"WebSocket connection attempt for job {job_id}")
    
    try:
        client_id = await manager.connect(websocket, job_id)
        logger.info(f"WebSocket connected - job_id: {job_id}, client_id: {client_id}")
        
        # Send initial status immediately after connection
        if job_id in manager.job_status:
            await websocket.send_json(manager.job_status[job_id])
        
        try:
            while True:
                # Keep the connection alive
                data = await websocket.receive_text()
                logger.debug(f"Received message from client {client_id}: {data}")
        except WebSocketDisconnect:
            logger.info(f"WebSocket disconnected - job_id: {job_id}, client_id: {client_id}")
        finally:
            await manager.disconnect(job_id, client_id)
    except Exception as e:
        logger.error(f"Error in WebSocket connection: {e}")
        raise
