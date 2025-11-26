# GlobePlot 🌍

An interactive 3D globe component for React/Next.js that lets you visualize geographic data with beautiful animations and filtering capabilities.

🌐 **[Live Demo](https://hairetsu.github.io/globeplot/)** - See it in action!

![GlobePlot Demo](public/earth-map.webp)

## Features

- 🌍 **Interactive 3D Globe** - Smooth rotation, drag, and zoom controls with momentum-based physics
- 📍 **Location Markers** - Plot any location using latitude/longitude coordinates
- 🎯 **Smart Clustering** - Automatic aggregation by country, state, or city
- 🔍 **Dynamic Filtering** - Filter locations by country, state, and city with cascading controls
- 📱 **Fully Responsive** - Optimized for desktop, tablet, and mobile devices
- 🎨 **Customizable** - Easy to style and extend with your own data
- ⚡ **Performance Optimized** - GPU-accelerated CSS transforms for smooth interactions
- 🎪 **Fishbowl Effect** - Spherical lens distortion for realistic globe appearance

## Quick Start

### Option 1: CLI Installation (Recommended)

Use our CLI tool to instantly add the globe components to your Next.js project:

```bash
npx globeplot add
```

This will copy all necessary files to your project.

### Option 2: Manual Installation

1. Clone this repository:

```bash
git clone https://github.com/yourusername/globeplot.git
cd globeplot
```

2. Install dependencies:

```bash
npm install
```

3. Run the development server:

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) to see the demo

## Usage

### Basic Globe Component

```tsx
import Globe from "@/components/globe";

const locations = [
  {
    name: "New York City",
    city: "New York",
    state: "New York",
    country: "United States",
    lat: 40.7128,
    lon: -74.006,
    visitors: 10000,
  },
  {
    name: "London",
    city: "London",
    state: "England",
    country: "United Kingdom",
    lat: 51.5074,
    lon: -0.1278,
    visitors: 8500,
  },
  // Add more locations...
];

export default function Page() {
  return <Globe data={locations} />;
}
```

### Globe with Filters

```tsx
import GlobalBreakdown from "@/components/global-breakdown";

export default function Dashboard() {
  return <GlobalBreakdown locationsData={locations} />;
}
```

## Component API

### Globe Props

| Prop              | Type                             | Default             | Description                                 |
| ----------------- | -------------------------------- | ------------------- | ------------------------------------------- |
| `data`            | `LocationData[]`                 | **Required**        | Array of location data points               |
| `filterCountry`   | `string`                         | `undefined`         | Filter to show only specific country        |
| `filterState`     | `string`                         | `undefined`         | Filter to show only specific state/province |
| `filterCity`      | `string`                         | `undefined`         | Filter to show only specific city           |
| `aggregationMode` | `'country' \| 'state' \| 'city'` | `'country'`         | How to cluster/aggregate locations          |
| `mapImage`        | `string`                         | `'/earth-map.webp'` | Path to custom Earth texture image          |

### LocationData Type

```typescript
interface LocationData {
  name: string; // Display name for the location
  city: string; // City name
  state: string; // State/province name
  country: string; // Country name
  lat: number; // Latitude (-90 to 90)
  lon: number; // Longitude (-180 to 180)
  visitors: number; // Metric value (size of marker)
}
```

## Project Structure

```
globeplot/
├── app/
│   └── page.tsx              # Demo page
├── components/
│   ├── globe.tsx             # Main globe component
│   └── global-breakdown.tsx  # Globe with filter controls
├── globe-cli/                # CLI tool for easy installation
│   ├── bin/
│   ├── templates/
│   └── package.json
├── public/
│   └── earth-map.webp        # Earth texture image (WebP format)
└── package.json
```

## CLI Tool

The `globe-cli` package makes it easy to add GlobePlot to any Next.js project:

```bash
npx globeplot add
```

This copies the globe components and assets to your project. See the [CLI README](globe-cli/README.md) for more details.

## Tech Stack

- **Next.js 16** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS 4** - Utility-first styling
- **Lucide React** - Beautiful icons
- **CSS 3D Transforms** - Hardware-accelerated 3D rotation and perspective

## Features in Detail

### Interactive Controls

- **Drag to Rotate** - Click and drag to spin the globe in any direction
- **Scroll to Zoom** - Use mouse wheel or pinch gestures to zoom in/out
- **Momentum Physics** - Globe continues spinning when released with natural friction
- **Infinite Rotation** - Smooth 360° rotation in all directions

### Smart Clustering

The globe automatically clusters nearby locations based on the aggregation mode:

- **Country Mode** - Shows one marker per country
- **State Mode** - Shows one marker per state/province
- **City Mode** - Shows individual city markers

Markers scale based on the total visitors/metric at that location.

### Dynamic Filtering

The `GlobalBreakdown` component includes built-in filter controls:

- Filter by country (shows all states in that country)
- Filter by state (shows all cities in that state)
- Filter by city (shows specific city)
- Filters cascade and update the aggregation modes automatically

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - see the [LICENSE](globe-cli/LICENSE) file for details

## Credits

Built with ❤️ for the web mapping community

---

**Questions?** Open an issue or reach out on Twitter [@yourusername](https://twitter.com/yourusername)
