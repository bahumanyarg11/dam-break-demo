import numpy as np
import rasterio
from rasterio.transform import from_origin
import os

DEM_PATH = "backend/dummy_dem.tif"

def generate_valley_dem(size=100):
    """Generates a V-shaped valley DEM."""
    # Create a simple V-shaped valley
    x = np.linspace(-1, 1, size)
    y = np.linspace(0, 2, size)
    X, Y = np.meshgrid(x, y)
    
    # Elevation: higher on sides (X^2), slopes down along Y
    elevation = (X**2) * 500 + (2 - Y) * 200
    
    # Add a dam at the top (Y=0, X in center)
    elevation[0:5, 45:55] = 800 
    
    return elevation.astype(np.float32)

def setup_dem():
    """Saves the generated DEM to a GeoTIFF using rasterio."""
    if os.path.exists(DEM_PATH):
        return
        
    data = generate_valley_dem()
    
    # Dummy transform for Northern India/Himalayas area (approx)
    transform = from_origin(78.4, 30.4, 0.001, 0.001)
    
    with rasterio.open(
        DEM_PATH,
        'w',
        driver='GTiff',
        height=data.shape[0],
        width=data.shape[1],
        count=1,
        dtype=data.dtype,
        crs='+proj=latlong',
        transform=transform,
    ) as dst:
        dst.write(data, 1)
    print(f"Generated dummy DEM at {DEM_PATH}")

def load_dem():
    """Loads the DEM using rasterio."""
    if not os.path.exists(DEM_PATH):
        setup_dem()
    with rasterio.open(DEM_PATH) as src:
        return src.read(1), src.transform

if __name__ == "__main__":
    setup_dem()
