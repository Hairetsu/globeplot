# Globeplot

A CLI tool to easily add an interactive 3D globe component to your Next.js project.

## Features

- 🌍 **Interactive 3D Globe** - Rotate, zoom, and explore the globe with smooth animations
- 📍 **Location Markers** - Plot locations with latitude/longitude coordinates
- 🎨 **Customizable** - Filter by country/state/city and adjust aggregation modes
- 📱 **Responsive** - Works seamlessly on desktop and mobile
- 🚀 **Easy Installation** - One command to add to your project

## Installation

Use the CLI directly with `npx` or `pnpm dlx`:

```bash
npx globeplot add
```

or with pnpm:

```bash
pnpm dlx globeplot add
```

## What it does

The CLI will:

1. Create a `components` directory if it doesn't exist
2. Copy `globe.tsx` component to `components/globe.tsx`
3. Copy `global-breakdown.tsx` component to `components/global-breakdown.tsx`
4. Copy the earth map image to `public/earth-map.webp`

## Components

- **Globe** - The core 3D globe component with interactive rotation, zoom, and location markers
- **GlobalBreakdown** - A wrapper component that adds filter controls (country/state/city) and aggregation modes

## Usage

After running the CLI, you can import and use the components:

### Basic Globe Component

```tsx
import Globe from "@/components/globe";

const data = [
  {
    name: "New York",
    city: "New York",
    state: "New York",
    country: "United States",
    lat: 40.7128,
    lon: -74.006,
    visitors: 10000,
  },
  // Add more locations...
];

export default function Page() {
  return <Globe data={data} />;
}
```

### Globe with Filters (GlobalBreakdown)

```tsx
import GlobalBreakdown from "@/components/global-breakdown";

const data = [
  // Same location data as above
];

export default function Dashboard() {
  return <GlobalBreakdown locationsData={data} />;
}
```

## Component Props

- `data: LocationData[]` - Array of location data with lat/lon coordinates
- `filterCountry?: string` - Filter locations by country
- `filterState?: string` - Filter locations by state
- `filterCity?: string` - Filter locations by city
- `aggregationMode?: 'country' | 'state' | 'city'` - How to aggregate/cluster locations
- `mapImage?: string` - Path to custom map image (defaults to '/earth-map.webp')
