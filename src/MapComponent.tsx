import React, { useMemo } from 'react';
import DeckGL from '@deck.gl/react';
import { PolygonLayer } from '@deck.gl/layers';
import Map from 'react-map-gl/maplibre';

const INITIAL_VIEW_STATE = {
  longitude: 77.5946, // Bangalore for demo, or some dam location. Let's use a generic mountainous area. 
  // Let's use coordinates near a known dam, e.g., Tehri Dam: 30.37, 78.48
  latitude: 30.37,
  zoom: 12,
  pitch: 45,
  bearing: 0
};

// Mapbox token not strictly needed for maplibre with a free style, but we need a style URL.
// We can use a free Carto style with maplibre.
const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json';

interface MapComponentProps {
  time: number;
  breachWidth: number;
  reservoirLevel: number;
}

export const MapComponent: React.FC<MapComponentProps> = ({ time, breachWidth, reservoirLevel }) => {
  // Generate some simulated flood polygon data based on time
  const floodData = useMemo(() => {
    if (time === 0) return [];
    
    // Base coordinate (dam location)
    const baseLon = 78.48;
    const baseLat = 30.37;
    
    // Flood expands southward along the valley. Simple wedge shape.
    const spread = (time / 12) * (breachWidth / 50) * 0.1; // roughly 0.1 degrees spread
    const length = (time / 12) * (reservoirLevel / 100) * 0.2; // roughly 0.2 degrees length

    const polygon = [
      [baseLon, baseLat], // Origin
      [baseLon - spread, baseLat - length], // Bottom left
      [baseLon + spread, baseLat - length], // Bottom right
    ];

    return [
      {
        polygon,
        elevation: (12 - time) * 10 * (reservoirLevel / 100), // Height of wave decreases over time
        color: [33, 150, 243, 180] // Water blue
      }
    ];
  }, [time, breachWidth, reservoirLevel]);

  const layers = [
    new PolygonLayer({
      id: 'flood-wave',
      data: floodData,
      pickable: true,
      stroked: true,
      filled: true,
      extruded: true,
      wireframe: true,
      getPolygon: d => d.polygon,
      getElevation: d => d.elevation,
      getFillColor: d => d.color,
      getLineColor: [0, 0, 0, 100],
      getLineWidth: 10,
      transitions: {
        getPolygon: 500, // smooth animation
        getElevation: 500
      }
    })
  ];

  return (
    <div className="relative w-full h-full bg-slate-100 rounded-lg overflow-hidden border border-slate-200">
      <DeckGL
        initialViewState={INITIAL_VIEW_STATE}
        controller={true}
        layers={layers}
      >
        <Map mapStyle={MAP_STYLE} />
      </DeckGL>
      
      {/* Overlay legend or status */}
      <div className="absolute top-4 left-4 bg-white/90 p-3 rounded shadow-md text-sm">
        <h4 className="font-bold mb-1">Live Telemetry</h4>
        <div>Time: T+{time.toFixed(1)} hrs</div>
        <div>Wave Peak: {time > 0 ? ((12-time)*10*(reservoirLevel/100)).toFixed(1) : 0}m</div>
      </div>
    </div>
  );
};
