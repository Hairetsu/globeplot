"use client";

import GlobalVisualWidget from "@/components/global-breakdown";
import { ThemeToggle } from "@/components/theme-toggle";


const locationsData = [
  {
    name: "New York City",
    city: "New York",
    state: "New York",
    country: "United States",
    lat: 40.7128,
    lon: -74.0060,
    visitors: 100,
  },
  {
    name: "Buffalo",
    city: "New York",
    state: "New York",
    country: "United States",
    lat: 42.8865,
    lon: -78.8784,
    visitors: 50,
  },
  {
    name: "Los Angeles",
    city: "California",
    state: "California",
    country: "United States",
    lat: 34.0522,
    lon: -118.2437,
    visitors: 200,
  },
  {
    name: "San Francisco",
    city: "California",
    state: "California",
    country: "United States",
    lat: 37.7749,
    lon: -122.4194,
    visitors: 150,
  },
  {
    name: "San Diego",
    city: "California",
    state: "California",
    country: "United States",
    lat: 32.7157,
    lon: -117.1611,
    visitors: 100,
  },
  {
    name: "San Jose",
    city: "California",
    state: "California",
    country: "United States",
    lat: 37.3382,
    lon: -121.8863,
    visitors: 50,
  },
  {
    name: "San Bernardino",
    city: "California",
    state: "California",
    country: "United States",
    lat: 34.1139,
    lon: -117.1563,
    visitors: 200,
  },
]

export default function Home() {

  return (
    <div className="w-full h-screen flex items-center justify-center relative">
      <div className="absolute top-4 right-4 z-50">
        <ThemeToggle />
      </div>
      <GlobalVisualWidget locationsData={locationsData} />
    </div>
  );
}
