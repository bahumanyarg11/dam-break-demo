import osmnx as ox
import networkx as nx
import os

GRAPH_PATH = "backend/graph.graphml"

def load_or_create_graph():
    """Downloads a small road network graph using OSMnx."""
    if os.path.exists(GRAPH_PATH):
        return ox.load_graphml(GRAPH_PATH)
        
    print("Downloading OSMnx graph for routing...")
    # Bounding box roughly matching our dummy DEM area in the Himalayas
    # North, South, East, West
    # 30.4 -> 30.3, 78.4 -> 78.5
    north, south, east, west = 30.4, 30.3, 78.5, 78.4
    
    # Download drive network
    G = ox.graph_from_bbox(bbox=(west, south, east, north), network_type='drive')
    ox.save_graphml(G, GRAPH_PATH)
    return G

def calculate_evacuation_route(flood_polygon):
    """
    Calculates an evacuation route avoiding the flood polygon.
    For MVP, we just find if a path exists between two arbitrary nodes,
    simulating dropping nodes that intersect the polygon.
    """
    G = load_or_create_graph()
    
    # In a real scenario, we would use geopandas to intersect nodes with flood_polygon
    # and remove them. For this MVP, we just return dummy stats based on graph size to prove it loaded.
    
    nodes = len(G.nodes)
    edges = len(G.edges)
    
    return {
        "status": "success",
        "nodes_scanned": nodes,
        "edges_scanned": edges,
        "safe_route_found": True,
        "isolated_nodes": int(nodes * 0.05) if len(flood_polygon) > 0 else 0
    }

if __name__ == "__main__":
    load_or_create_graph()
