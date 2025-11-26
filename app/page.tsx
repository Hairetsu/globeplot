"use client";

import GlobalVisualWidget from "@/components/global-breakdown";
import { ThemeToggle } from "@/components/theme-toggle";

import mockLocationsData from "@/data/locations.json";


export default function Home() {

  return (
    <div className="w-full h-screen flex items-center justify-center relative">
      <GlobalVisualWidget locationsData={mockLocationsData} />
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
    </div>
  );
}
