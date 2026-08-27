import numpy as np
from .terrain import load_dem

def simulate_hydro_ca(breach_width_m, reservoir_capacity_pct, time_hrs):
    """
    Minimal Viable 2D Cellular Automata Hydrodynamic solver.
    Approximates shallow water routing over the DEM.
    """
    dem, transform = load_dem()
    size = dem.shape[0]
    
    # Initialize water depth array
    water_depth = np.zeros_like(dem)
    
    # Breach location (top center of our dummy DEM)
    breach_x = size // 2
    breach_y = 5
    
    # Calculate volume based on capacity and breach width
    initial_volume = (reservoir_capacity_pct / 100.0) * (breach_width_m / 10.0) * 100
    
    # Deposit water at the breach
    water_depth[breach_y, breach_x] = initial_volume
    
    # CA iterations based on time (more time = more spread steps)
    iterations = int(time_hrs * 10)
    
    for _ in range(iterations):
        new_water = water_depth.copy()
        for y in range(1, size - 1):
            for x in range(1, size - 1):
                if water_depth[y, x] > 0:
                    # Look at neighbors (downhill only for simplicity)
                    current_h = dem[y, x] + water_depth[y, x]
                    neighbors = [
                        (y+1, x), (y, x-1), (y, x+1), (y+1, x-1), (y+1, x+1) # bias south
                    ]
                    
                    for ny, nx in neighbors:
                        if 0 <= ny < size and 0 <= nx < size:
                            neighbor_h = dem[ny, nx] + water_depth[ny, nx]
                            if current_h > neighbor_h:
                                # Transfer a fraction of water
                                transfer = min(water_depth[y, x], (current_h - neighbor_h) * 0.2)
                                new_water[y, x] -= transfer
                                new_water[ny, nx] += transfer
                                current_h = dem[y, x] + new_water[y, x] # Update local height
                                
        water_depth = new_water
        
    # Return max depth, area, and bounding polygon approximation
    flooded_cells = np.sum(water_depth > 0.1)
    max_depth = np.max(water_depth)
    
    # Simple polygon extraction based on southernmost and widest spread
    y_coords, x_coords = np.where(water_depth > 0.1)
    if len(y_coords) > 0:
        min_y, max_y = np.min(y_coords), np.max(y_coords)
        min_x, max_x = np.min(x_coords), np.max(x_coords)
        # Convert grid coords back to lat/lon using rasterio transform
        # For demo, just return the extent box
        lon_min, lat_max = transform * (min_x, min_y)
        lon_max, lat_min = transform * (max_x, max_y)
        polygon = [[lon_min, lat_max], [lon_max, lat_max], [lon_max, lat_min], [lon_min, lat_min]]
    else:
        polygon = []

    return {
        "max_depth_m": float(max_depth),
        "flooded_area_cells": int(flooded_cells),
        "polygon": polygon
    }
