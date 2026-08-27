from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import time

# Import our actual backend modules
from .ml import get_surrogate_prediction
from .hydro import simulate_hydro_ca
from .router import calculate_evacuation_route

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class SimulationRequest(BaseModel):
    breachWidth: float
    reservoirLevel: float
    time: float

@app.post("/api/simulate")
def run_simulation(req: SimulationRequest):
    start_t = time.time()
    
    # 1. Real PyTorch Inference
    discharge = get_surrogate_prediction(req.breachWidth, req.reservoirLevel, req.time)
    
    # 2. Real 2D Hydrodynamic CA Solver (Rasterio DEM processing)
    hydro_results = simulate_hydro_ca(req.breachWidth, req.reservoirLevel, req.time)
    
    # 3. Real OSMnx Graph Routing
    route_results = calculate_evacuation_route(hydro_results["polygon"])
    
    inference_time_ms = int((time.time() - start_t) * 1000)
    
    return {
        "discharge": max(0, discharge),
        "hydro": hydro_results,
        "routing": route_results,
        "inferenceTimeMs": inference_time_ms
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
