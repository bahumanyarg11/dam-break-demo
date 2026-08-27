import React, { useState, useEffect, useMemo } from 'react';
import { Play, Pause, RotateCcw, AlertTriangle, Activity, Settings, Maximize2 } from 'lucide-react';
import { MapComponent } from './MapComponent';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, AreaChart, Area 
} from 'recharts';

export default function App() {
  const [time, setTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Synthetic Breach Parameters
  const [breachWidth, setBreachWidth] = useState(50); // meters
  const [reservoirLevel, setReservoirLevel] = useState(90); // percentage
  const [failureTime, setFailureTime] = useState(1); // hours (Tf)

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && time < 12) {
      interval = setInterval(() => {
        setTime(prev => {
          if (prev >= 12) {
            setIsPlaying(false);
            return 12;
          }
          return prev + 0.2; // increment time by 0.2 hours every interval
        });
      }, 500);
    } else if (time >= 12) {
      setIsPlaying(false);
    }
    return () => clearInterval(interval);
  }, [isPlaying, time]);

  const resetSimulation = () => {
    setIsPlaying(false);
    setTime(0);
  };

  // Generate hydrograph data based on parameters
  const hydrographData = useMemo(() => {
    const data = [];
    const peakQ = (breachWidth / 50) * (reservoirLevel / 100) * 10000; // Peak discharge in m3/s
    const peakTime = failureTime;

    for (let t = 0; t <= 12; t += 0.5) {
      let discharge = 0;
      if (t >= peakTime) {
        // Exponential decay after failure time
        discharge = peakQ * Math.exp(-(t - peakTime) * 0.5);
      } else if (t > 0) {
        // Linear rise to peak
        discharge = peakQ * (t / peakTime);
      }
      data.push({ time: t, discharge: Math.round(discharge) });
    }
    return data;
  }, [breachWidth, reservoirLevel, failureTime]);

  // Generate risk matrix stats
  const riskStats = useMemo(() => {
    const hazardFactor = (breachWidth / 100) * (reservoirLevel / 100) * (time > 0 ? time/12 : 0);
    return {
      isolatedVillages: Math.floor(hazardFactor * 15),
      floodedRoads: (hazardFactor * 45.5).toFixed(1),
      maxVelocity: (hazardFactor * 8.5).toFixed(1),
    }
  }, [breachWidth, reservoirLevel, time]);

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Sidebar - Controls */}
      <aside className="w-80 bg-white border-r border-slate-200 shadow-sm flex flex-col h-full z-10 overflow-y-auto">
        <div className="p-5 border-b border-slate-100 bg-slate-900 text-white">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="w-6 h-6 text-red-500" />
            <h1 className="text-xl font-bold tracking-tight">NTRO Sirens</h1>
          </div>
          <p className="text-xs text-slate-400">Dam Break Inundation Hub (SIH26161)</p>
        </div>

        <div className="p-5 flex-1">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2 mb-4">
            <Settings className="w-4 h-4" /> Live Breach Controls
          </h2>
          
          <div className="space-y-6">
            <div>
              <div className="flex justify-between mb-1">
                <label className="text-sm font-medium text-slate-700">Breach Width</label>
                <span className="text-sm text-slate-500 font-mono">{breachWidth} m</span>
              </div>
              <input 
                type="range" min="10" max="200" value={breachWidth} 
                onChange={(e) => setBreachWidth(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <label className="text-sm font-medium text-slate-700">Reservoir Capacity</label>
                <span className="text-sm text-slate-500 font-mono">{reservoirLevel}%</span>
              </div>
              <input 
                type="range" min="50" max="100" value={reservoirLevel} 
                onChange={(e) => setReservoirLevel(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <label className="text-sm font-medium text-slate-700">Failure Time (Tf)</label>
                <span className="text-sm text-slate-500 font-mono">{failureTime} hrs</span>
              </div>
              <input 
                type="range" min="0" max="5" step="0.5" value={failureTime} 
                onChange={(e) => setFailureTime(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>
          </div>

          <div className="mt-10">
             <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2 mb-4">
              <Activity className="w-4 h-4" /> Surrogate Model Output
            </h2>
            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Peak Discharge</span>
                <span className="font-mono font-semibold text-red-600">
                  {Math.round((breachWidth / 50) * (reservoirLevel / 100) * 10000)} m³/s
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Time to Peak</span>
                <span className="font-mono font-semibold">{failureTime} hrs</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Inference Time</span>
                <span className="font-mono font-semibold text-green-600">12 ms</span>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden p-4 gap-4 bg-slate-200/50">
        
        {/* 3D Map View Container */}
        <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col overflow-hidden relative">
          <div className="absolute top-4 right-4 z-10 flex gap-2">
             <div className="bg-white/90 backdrop-blur px-3 py-1.5 rounded-md shadow border border-slate-200 flex items-center gap-2 text-sm font-medium">
               <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
               Physics-Informed ML Active
             </div>
             <button className="bg-white p-2 rounded-md shadow border border-slate-200 hover:bg-slate-50 transition">
               <Maximize2 className="w-4 h-4 text-slate-600" />
             </button>
          </div>
          
          {/* Map renders here */}
          <div className="flex-1 relative">
            <MapComponent time={time} breachWidth={breachWidth} reservoirLevel={reservoirLevel} />
          </div>

          {/* Time Scrubber */}
          <div className="p-4 border-t border-slate-100 bg-white flex items-center gap-4">
            <button 
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition shadow-sm"
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </button>
            <button 
              onClick={resetSimulation}
              className="p-3 bg-slate-100 text-slate-600 rounded-full hover:bg-slate-200 transition"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
            
            <div className="flex-1 flex items-center gap-4 px-4">
              <span className="text-sm font-mono font-medium text-slate-500 w-16">T+0h</span>
              <div className="flex-1 relative flex items-center">
                <input 
                  type="range" min="0" max="12" step="0.1" value={time}
                  onChange={(e) => {
                    setTime(Number(e.target.value));
                    setIsPlaying(false);
                  }}
                  className="w-full h-3 bg-slate-100 border border-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600 z-10 relative"
                />
                {/* Timeline markers */}
                <div className="absolute inset-0 px-2 flex justify-between pointer-events-none items-center">
                  {[0,3,6,9,12].map(t => (
                    <div key={t} className="h-1.5 w-[1px] bg-slate-300"></div>
                  ))}
                </div>
              </div>
              <span className="text-sm font-mono font-medium text-slate-500 w-16">T+12h</span>
            </div>
            
            <div className="text-2xl font-mono font-bold text-blue-600 w-24 text-right">
              T+{time.toFixed(1)}h
            </div>
          </div>
        </div>

        {/* Bottom Panel: Analytics & Routing */}
        <div className="h-72 flex gap-4">
          
          {/* Hydrograph Chart */}
          <div className="w-1/2 bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex flex-col">
            <h3 className="text-sm font-bold text-slate-700 mb-4">Outflow Hydrograph (Breach)</h3>
            <div className="flex-1 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={hydrographData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorDischarge" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="time" tick={{fontSize: 12}} tickFormatter={(t) => `T+${t}h`} stroke="#94a3b8" />
                  <YAxis tick={{fontSize: 12}} tickFormatter={(v) => v/1000 + 'k'} stroke="#94a3b8" />
                  <RechartsTooltip 
                    labelFormatter={(label) => `Time: T+${label} hours`}
                    formatter={(value) => [`${value} m³/s`, 'Discharge']}
                  />
                  <Area type="monotone" dataKey="discharge" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorDischarge)" />
                  {/* Vertical line for current time */}
                  {time > 0 && (
                    <Line type="monotone" data={[{time: time, discharge: 0}, {time: time, discharge: 15000}]} dataKey="discharge" stroke="#ef4444" strokeWidth={2} dot={false} strokeDasharray="5 5" />
                  )}
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Automated Multi-Indicator Risk Matrix */}
          <div className="w-1/2 bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex flex-col">
            <h3 className="text-sm font-bold text-slate-700 mb-4">Evacuation & Hazard Router</h3>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-red-50 border border-red-100 rounded-lg p-3">
                <div className="text-xs font-semibold text-red-600 mb-1">Hazard Factor (H) &gt; 0.6 m²/s</div>
                <div className="text-2xl font-bold text-red-700">{riskStats.floodedRoads} km</div>
                <div className="text-xs text-red-500">Impassable Road Segments</div>
              </div>
              <div className="bg-orange-50 border border-orange-100 rounded-lg p-3">
                <div className="text-xs font-semibold text-orange-600 mb-1">Isolated Populations</div>
                <div className="text-2xl font-bold text-orange-700">{riskStats.isolatedVillages}</div>
                <div className="text-xs text-orange-500">Villages Cut Off</div>
              </div>
            </div>

            <div className="flex-1 bg-slate-900 rounded-lg p-4 text-white font-mono text-sm overflow-hidden flex flex-col justify-end relative">
               <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-green-400 via-slate-900 to-slate-900"></div>
               <div className="relative z-10 space-y-1">
                 <div className="text-green-400">&gt; routing_engine initialized...</div>
                 <div className="text-slate-300">&gt; OSMnx graph loaded (nodes: 14,203)</div>
                 {time > 2 ? (
                   <>
                    <div className="text-red-400">&gt; ALERT: Highway NH-34 inundated at chainage 45km.</div>
                    <div className="text-blue-300">&gt; Calculating alternative high-ground paths...</div>
                    <div className="text-green-400">&gt; Evacuation routes regenerated in 430ms.</div>
                   </>
                 ) : (
                   <div className="text-slate-400">Waiting for critical flood depth...</div>
                 )}
               </div>
            </div>

          </div>

        </div>
      </main>
    </div>
  );
}
