"use client";

import React, {
  useRef,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { cva, type VariantProps } from "class-variance-authority";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface LocationData {
  name: string;
  city: string;
  state: string;
  country: string;
  lat: number;
  lon: number;
  visitors: number;
}

interface ClusterData {
  id: string;
  lat: number;
  lon: number;
  visitors: number;
  count: number;
  name: string;
  locations: LocationData[];
}

const markerVariants = cva(
  "absolute rounded-full border cursor-pointer flex items-center justify-center transition-colors duration-200",
  {
    variants: {
      variant: {
        default:
          "bg-cyan-400/60 border-cyan-300/80 shadow-[0_0_15px_rgba(34,211,238,0.5)] hover:bg-cyan-300/80",
        minimal:
          "bg-foreground/60 border-foreground/80 shadow-[0_0_15px_rgba(0,0,0,0.2)] hover:bg-foreground/80",
        hologram:
          "bg-blue-500/60 border-blue-400/80 shadow-[0_0_15px_rgba(59,130,246,0.5)] hover:bg-blue-400/80",
        vintage:
          "bg-amber-700/60 border-amber-600/80 shadow-[0_0_15px_rgba(180,83,9,0.5)] hover:bg-amber-600/80",
        night:
          "bg-sky-500/60 border-sky-400/80 shadow-[0_0_15px_rgba(14,165,233,0.5)] hover:bg-sky-400/80",
        "dark-gold":
          "bg-yellow-500/60 border-yellow-400/80 shadow-[0_0_15px_rgba(234,179,8,0.5)] hover:bg-yellow-400/80",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

const VARIANTS_CONFIG = {
  default: {
    map: "/earth-map.webp",
    tooltip: "bg-black/80 text-white border-white/10",
    tooltipCount: "text-cyan-300",
  },
  minimal: {
    map: "/earth-minimal-light.webp",
    tooltip: "bg-background/80 text-foreground border-border",
    tooltipCount: "text-muted-foreground",
  },
  hologram: {
    map: "/earth-blue-hologram.webp",
    tooltip: "bg-blue-950/80 text-blue-100 border-blue-500/30",
    tooltipCount: "text-blue-400",
  },
  vintage: {
    map: "/earth-vintage.webp",
    tooltip: "bg-amber-950/80 text-amber-100 border-amber-500/30",
    tooltipCount: "text-amber-400",
  },
  night: {
    map: "/earth-night.webp",
    tooltip: "bg-black/90 text-white border-white/20",
    tooltipCount: "text-sky-400",
  },
  "dark-gold": {
    map: "/earth-dark-gold.webp",
    tooltip: "bg-yellow-950/90 text-yellow-100 border-yellow-500/30",
    tooltipCount: "text-yellow-400",
  },
} as const;

export interface GlobeProps
  extends React.HTMLAttributes<HTMLDivElement>,
  VariantProps<typeof markerVariants> {
  data: LocationData[];
  filterCountry?: string;
  filterState?: string;
  filterCity?: string;
  aggregationMode?: "country" | "state" | "city";
  mapImage?: string;
  variant?: keyof typeof VARIANTS_CONFIG;
}

export default function Globe({
  data,
  filterCountry,
  filterState,
  filterCity,
  aggregationMode = "city",
  mapImage,
  variant = "default",
  className,
  ...props
}: GlobeProps) {
  const config = VARIANTS_CONFIG[variant || "default"];
  const currentMapImage = mapImage || config.map;

  const globeRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<Map<string, HTMLDivElement>>(new Map());
  const tooltipRef = useRef<HTMLDivElement>(null);
  const hoveredIdRef = useRef<string | null>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [globeSize, setGlobeSize] = useState({ width: 0, height: 0 });

  const rotationRef = useRef({ lon: 0, lat: 0 });
  const velocityRef = useRef({ lon: 0, lat: 0 });
  const lastPosRef = useRef({ x: 0, y: 0 });
  const requestRef = useRef<number>(0);
  const scaleRef = useRef(1);

  // Filter locations based on props
  const filteredLocations = useMemo(() => {
    let filtered = data;

    if (filterCountry) {
      filtered = filtered.filter((loc) => loc.country === filterCountry);
    }
    if (filterState) {
      filtered = filtered.filter((loc) => loc.state === filterState);
    }
    if (filterCity) {
      filtered = filtered.filter((loc) => loc.city === filterCity);
    }

    return filtered;
  }, [data, filterCountry, filterState, filterCity]);

  // Aggregation Logic based on mode
  const clusters = useMemo(() => {
    // Aggregate based on the selected mode
    const aggregationMap = new Map<
      string,
      {
        name: string;
        latSum: number;
        lonSum: number;
        visitors: number;
        count: number;
        locations: LocationData[];
      }
    >();

    filteredLocations.forEach((loc) => {
      let key: string;
      let displayName: string;

      switch (aggregationMode) {
        case "country":
          key = loc.country;
          displayName = loc.country;
          break;
        case "state":
          key = `${loc.country}-${loc.state}`;
          displayName = `${loc.state}, ${loc.country}`;
          break;
        case "city":
        default:
          key = `${loc.country}-${loc.state}-${loc.city}`;
          displayName = `${loc.city}, ${loc.state}`;
          break;
      }

      if (!aggregationMap.has(key)) {
        aggregationMap.set(key, {
          name: displayName,
          latSum: 0,
          lonSum: 0,
          visitors: 0,
          count: 0,
          locations: [],
        });
      }

      const agg = aggregationMap.get(key)!;
      agg.latSum += loc.lat;
      agg.lonSum += loc.lon;
      agg.visitors += loc.visitors;
      agg.count += 1;
      agg.locations.push(loc);
    });

    const result: ClusterData[] = [];
    aggregationMap.forEach((agg, key) => {
      result.push({
        id: key,
        lat: agg.latSum / agg.count,
        lon: agg.lonSum / agg.count,
        visitors: agg.visitors,
        count: agg.count,
        name: agg.count > 1 ? `${agg.name} (${agg.count} cities)` : agg.name,
        locations: agg.locations,
      });
    });

    return result;
  }, [filteredLocations, aggregationMode]);

  // Auto-center on filtered locations
  useEffect(() => {
    if (filteredLocations.length === 0) return;

    // Calculate center of filtered locations
    const avgLat =
      filteredLocations.reduce((sum, loc) => sum + loc.lat, 0) /
      filteredLocations.length;
    const avgLon =
      filteredLocations.reduce((sum, loc) => sum + loc.lon, 0) /
      filteredLocations.length;

    // Animate to the new position
    const startLon = rotationRef.current.lon;
    const startLat = rotationRef.current.lat;

    // Handle longitude wrapping for shortest path
    let targetLon = avgLon;
    const diff = targetLon - startLon;
    if (diff > 180) targetLon -= 360;
    if (diff < -180) targetLon += 360;

    const duration = 1000; // 1 second
    const startTime = Date.now();

    const animateToTarget = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);

      rotationRef.current.lon = startLon + (targetLon - startLon) * eased;
      rotationRef.current.lat = startLat + (avgLat - startLat) * eased;

      if (progress < 1) {
        requestAnimationFrame(animateToTarget);
      }
    };

    animateToTarget();
  }, [filteredLocations]);

  useEffect(() => {
    if (globeRef.current) {
      setGlobeSize({
        width: globeRef.current.offsetWidth,
        height: globeRef.current.offsetHeight,
      });
    }

    const handleResize = () => {
      if (globeRef.current) {
        setGlobeSize({
          width: globeRef.current.offsetWidth,
          height: globeRef.current.offsetHeight,
        });
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const getMarkerSize = (visitors: number) => {
    const minSize = 6;
    const maxSize = 40;
    const maxVisitors = 50000;
    const scale = Math.log(visitors + 1) / Math.log(maxVisitors + 1);
    return minSize + Math.min(scale, 1) * (maxSize - minSize);
  };

  const updateMarkers = useCallback(() => {
    if (globeSize.width === 0) return;

    const W = globeSize.width;
    const H = globeSize.height;

    const visibleLon = 360 / 2;
    const visibleLat = 180; // Show full height

    const pxPerDegLon = W / visibleLon;
    const pxPerDegLat = H / visibleLat;

    let tooltipVisible = false;

    clusters.forEach((cluster) => {
      const markerEl = markersRef.current.get(cluster.id);
      if (!markerEl) return;

      let diffLon = cluster.lon - rotationRef.current.lon;

      while (diffLon > 180) diffLon -= 360;
      while (diffLon < -180) diffLon += 360;

      const diffLat = rotationRef.current.lat - cluster.lat;

      const isVisible =
        Math.abs(diffLon) <= visibleLon / 2 + 2 &&
        Math.abs(diffLat) <= visibleLat / 2 + 2;

      if (isVisible) {
        const x = W / 2 + diffLon * pxPerDegLon;
        const y = H / 2 + diffLat * pxPerDegLat;

        markerEl.style.display = "flex";
        markerEl.style.transform = `translate(-50%, -50%) translate(${x}px, ${y}px)`;

        if (cluster.id === hoveredIdRef.current && tooltipRef.current) {
          tooltipVisible = true;
          const size = getMarkerSize(cluster.visitors);

          tooltipRef.current.style.transform = `translate(-50%, -100%) translate(${x}px, ${y - size / 2 - 8}px)`;

          const nameEl = tooltipRef.current.querySelector(".tooltip-name");
          const countEl = tooltipRef.current.querySelector(".tooltip-count");
          if (nameEl) nameEl.textContent = cluster.name;
          if (countEl)
            countEl.textContent = `${cluster.visitors.toLocaleString()} visitors`;
        }
      } else {
        markerEl.style.display = "none";
      }
    });

    if (tooltipRef.current) {
      tooltipRef.current.style.display = tooltipVisible ? "block" : "none";
      tooltipRef.current.style.opacity = tooltipVisible ? "1" : "0";
    }
  }, [globeSize, clusters]);

  useEffect(() => {
    const animate = () => {
      if (!isDragging) {
        rotationRef.current.lon += velocityRef.current.lon;
        // rotationRef.current.lat += velocityRef.current.lat; // Removed

        velocityRef.current.lon *= 0.95;
        // velocityRef.current.lat *= 0.95; // Removed

        if (Math.abs(velocityRef.current.lon) < 0.01)
          velocityRef.current.lon = 0;
        // if (Math.abs(velocityRef.current.lat) < 0.01) velocityRef.current.lat = 0; // Removed
      }

      rotationRef.current.lon =
        ((((rotationRef.current.lon + 180) % 360) + 360) % 360) - 180;

      // Lock latitude at 0 (equator centered, no vertical rotation)
      rotationRef.current.lat = 0;

      // Constrain latitude to prevent scrolling past image boundaries
      // The image covers 180 degrees, and we show 180/1.75 ≈ 102.86 degrees
      // So we can pan ±(180 - 102.86)/2 ≈ ±38.57 degrees from center
      // const visibleLat = 180 / 1.75; // Removed
      // const maxLatOffset = (180 - visibleLat) / 2; // Removed
      // rotationRef.current.lat = Math.max(Math.min(rotationRef.current.lat, maxLatOffset), -maxLatOffset); // Removed

      if (globeRef.current && globeSize.width > 0) {
        const W = globeSize.width;

        const visibleLon = 360 / 2;

        const pxPerDegLon = W / visibleLon;
        // const pxPerDegLat = H / visibleLat; // Removed

        const bgPosX = -0.5 * W - rotationRef.current.lon * pxPerDegLon;
        const bgPosY = 0; // Full height (100%) naturally centers in the circle

        globeRef.current.style.backgroundPosition = `${bgPosX}px ${bgPosY}px`;

        updateMarkers();
      }

      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current);
  }, [isDragging, globeSize, updateMarkers]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    lastPosRef.current = { x: e.clientX, y: e.clientY };
    velocityRef.current = { lon: 0, lat: 0 };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;

    const deltaX = e.clientX - lastPosRef.current.x;

    lastPosRef.current = { x: e.clientX, y: e.clientY };

    const sensitivity = 0.25;
    const moveLon = -deltaX * sensitivity;

    rotationRef.current.lon += moveLon;

    velocityRef.current = { lon: moveLon, lat: 0 };
  };

  const handleMouseUp = () => setIsDragging(false);
  const handleMouseLeave = () => setIsDragging(false);

  useEffect(() => {
    const globeEl = globeRef.current;
    if (!globeEl) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();

      const zoomSpeed = 0.001;
      const newScale = scaleRef.current - e.deltaY * zoomSpeed;
      scaleRef.current = Math.min(Math.max(newScale, 0.5), 3); // Min 0.5x, Max 3x

      if (globeEl.parentElement) {
        // Get cursor position relative to the globe element
        const rect = globeEl.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Calculate the transform origin as a percentage
        const originX = (x / rect.width) * 100;
        const originY = (y / rect.height) * 100;

        // Set the transform origin to the cursor position
        globeEl.parentElement.style.transformOrigin = `${originX}% ${originY}%`;
        globeEl.parentElement.style.transform = `scale(${scaleRef.current})`;
        globeEl.parentElement.style.transition = "transform 0.1s ease-out";
      }
    };

    // Touch handling state
    let touchStartDist = 0;
    let touchStartScale = 1;
    let lastTouchX = 0;

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        // Single touch - Drag/Spin
        setIsDragging(true);
        lastTouchX = e.touches[0].clientX;
        velocityRef.current = { lon: 0, lat: 0 };
      } else if (e.touches.length === 2) {
        // Two touches - Pinch Zoom
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        const dist = Math.hypot(
          touch1.clientX - touch2.clientX,
          touch1.clientY - touch2.clientY
        );
        touchStartDist = dist;
        touchStartScale = scaleRef.current;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      // Prevent default scrolling behavior when interacting with the globe
      if (e.cancelable) {
        e.preventDefault();
      }

      if (e.touches.length === 1 && isDragging) {
        // Single touch move - Spin
        const touchX = e.touches[0].clientX;
        const deltaX = touchX - lastTouchX;
        lastTouchX = touchX;

        const sensitivity = 0.25;
        const moveLon = -deltaX * sensitivity;

        rotationRef.current.lon += moveLon;
        velocityRef.current = { lon: moveLon, lat: 0 };
      } else if (e.touches.length === 2) {
        // Two touches move - Zoom
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        const dist = Math.hypot(
          touch1.clientX - touch2.clientX,
          touch1.clientY - touch2.clientY
        );

        if (touchStartDist > 0) {
          const scaleChange = dist / touchStartDist;
          const newScale = touchStartScale * scaleChange;
          scaleRef.current = Math.min(Math.max(newScale, 0.5), 3);

          if (globeEl.parentElement) {
            // Calculate center of pinch for transform origin
            const centerX = (touch1.clientX + touch2.clientX) / 2;
            const centerY = (touch1.clientY + touch2.clientY) / 2;
            const rect = globeEl.getBoundingClientRect();

            const x = centerX - rect.left;
            const y = centerY - rect.top;

            const originX = (x / rect.width) * 100;
            const originY = (y / rect.height) * 100;

            globeEl.parentElement.style.transformOrigin = `${originX}% ${originY}%`;
            globeEl.parentElement.style.transform = `scale(${scaleRef.current})`;
            globeEl.parentElement.style.transition = "transform 0.1s ease-out";
          }
        }
      }
    };

    const handleTouchEnd = () => {
      setIsDragging(false);
      touchStartDist = 0;
    };

    globeEl.addEventListener("wheel", handleWheel, { passive: false });
    globeEl.addEventListener("touchstart", handleTouchStart, { passive: false });
    globeEl.addEventListener("touchmove", handleTouchMove, { passive: false });
    globeEl.addEventListener("touchend", handleTouchEnd);
    globeEl.addEventListener("touchcancel", handleTouchEnd);

    return () => {
      globeEl.removeEventListener("wheel", handleWheel);
      globeEl.removeEventListener("touchstart", handleTouchStart);
      globeEl.removeEventListener("touchmove", handleTouchMove);
      globeEl.removeEventListener("touchend", handleTouchEnd);
      globeEl.removeEventListener("touchcancel", handleTouchEnd);
    };
  }, [isDragging]);

  return (
    <div className={cn("relative w-full flex items-center justify-center", className)} {...props}>
      <div className="relative w-[300px] h-[300px] md:w-[500px] md:h-[500px]">
        <div
          ref={globeRef}
          className="absolute inset-0 rounded-full bg-[#000] shadow-[inset_20px_0_50px_6px_rgba(0,0,0,1)] cursor-grab active:cursor-grabbing overflow-hidden"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          style={{
            backgroundImage: `url('${currentMapImage}')`,
            backgroundSize: "200% 100%",
            backgroundRepeat: "repeat",
            boxShadow:
              "inset 30px 0 60px -10px rgba(0,0,0,1), -10px -5px 20px -5px rgba(255,255,255,0.1)",
          }}
        >
          {clusters.map((cluster) => {
            const size = getMarkerSize(cluster.visitors);
            return (
              <div
                key={cluster.id}
                ref={(el) => {
                  if (el) markersRef.current.set(cluster.id, el);
                  else markersRef.current.delete(cluster.id);
                }}
                onMouseEnter={() => (hoveredIdRef.current = cluster.id)}
                onMouseLeave={() => {
                  if (hoveredIdRef.current === cluster.id)
                    hoveredIdRef.current = null;
                }}
                className={markerVariants({ variant })}
                style={{
                  width: `${size}px`,
                  height: `${size}px`,
                  top: 0,
                  left: 0,
                  display: "none",
                }}
              >
                <div className="w-1 h-1 bg-white rounded-full pointer-events-none" />
              </div>
            );
          })}
        </div>

        <div
          ref={tooltipRef}
          className="absolute top-0 left-0 pointer-events-none z-20 transition-opacity duration-150"
          style={{ display: "none", opacity: 0 }}
        >
          <div className={`text-[10px] px-2 py-1 rounded whitespace-nowrap backdrop-blur-sm border shadow-xl transform -translate-x-1/2 ${config.tooltip}`}>
            <span className="font-bold tooltip-name"></span>
            <span className={`block tooltip-count ${config.tooltipCount}`}></span>
          </div>
        </div>

        <div
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            background:
              "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.05) 0%, rgba(0,0,0,0) 60%, rgba(0,0,0,0.4) 100%)",
            boxShadow:
              "inset -20px -20px 50px rgba(0,0,0,0.5), inset 10px 10px 30px rgba(255,255,255,0.1)",
          }}
        />

        <div className="absolute inset-0 rounded-full shadow-[0_0_40px_-10px_rgba(6,182,212,0.3)] pointer-events-none" />
      </div>
    </div>
  );
}
