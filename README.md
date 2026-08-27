# Dam Break Inundation Hub (NTRO - SIH26161)

A production-ready React showcase demonstrating a real-time Dam Break Inundation dashboard. This demo simulates advanced predictive modeling features for emergency response operations.

## Features

- **Interactive 3D Volumetric Wave Front:** Visualizes the flood progression over a map using `deck.gl`.
- **Dynamic Time Scrubbing:** A timeline slider (T+0 to T+12 hours) to jump back and forth through the simulation.
- **Live Synthetic Breach Controls:** UI sliders to configure *Breach Width*, *Reservoir Capacity*, and *Failure Time (Tf)* which immediately recompute downstream risk metrics.
- **Automated Multi-Indicator Risk Matrix:** Automatically calculates critical impassable road segments and isolated populations.
- **Outflow Hydrograph:** A live-updating area chart representing the discharge rate.

## Tech Stack

- React 18
- Vite
- Tailwind CSS
- Deck.gl & MapLibre GL
- Recharts
- Lucide React (Icons)

## Quick Start

Follow these steps to run the demo locally on your machine.

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- `npm` (comes with Node.js)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/bahumanyarg11/dam-break-demo.git
   cd dam-break-demo
   ```

2. Install the dependencies:
   ```bash
   npm install
   ```

### Running the App

Start the Vite development server:

```bash
npm run dev
```

You can now view the app by navigating to **http://localhost:5173** in your web browser.

## Building for Production

To create an optimized production build:

```bash
npm run build
```

This will generate a `dist` directory with the compiled static assets.
