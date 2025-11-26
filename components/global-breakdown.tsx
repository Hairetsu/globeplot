"use client";

import { useState, useMemo } from "react";
import Globe from "@/components/globe";
import { LocationData } from "@/components/globe";
export default function GlobalVisualWidget({ locationsData }: { locationsData: LocationData[] }) {
    const [aggregationMode, setAggregationMode] = useState<'country' | 'state' | 'city'>('city');
    const [showFilters, setShowFilters] = useState(false);
    const [filterCountry, setFilterCountry] = useState<string>("");
    const [filterState, setFilterState] = useState<string>("");
    const [filterCity, setFilterCity] = useState<string>("");


    // Extract unique values for filters
    const countries = useMemo(() => {
        const unique = [...new Set(locationsData.map(loc => loc.country))];
        return unique.sort();
    }, []);

    const states = useMemo(() => {
        let filtered = locationsData;
        if (filterCountry) {
            filtered = filtered.filter(loc => loc.country === filterCountry);
        }
        const unique = [...new Set(filtered.map(loc => loc.state))];
        return unique.sort();
    }, [filterCountry]);

    const cities = useMemo(() => {
        let filtered = locationsData;
        if (filterCountry) {
            filtered = filtered.filter(loc => loc.country === filterCountry);
        }
        if (filterState) {
            filtered = filtered.filter(loc => loc.state === filterState);
        }
        const unique = [...new Set(filtered.map(loc => loc.city))];
        return unique.sort();
    }, [filterCountry, filterState]);

    const handleCountryChange = (country: string) => {
        setFilterCountry(country);
        setFilterState("");
        setFilterCity("");
    };

    const handleStateChange = (state: string) => {
        setFilterState(state);
        setFilterCity("");
    };

    const clearFilters = () => {
        setFilterCountry("");
        setFilterState("");
        setFilterCity("");
    };

    return (
        <div className="w-full h-full flex items-center justify-center relative">
            {/* Toggle Button for Mobile */}
            <button
                onClick={() => setShowFilters(!showFilters)}
                className="md:hidden absolute top-4 left-4 z-20 bg-background/80 backdrop-blur-sm border shadow-sm p-2 rounded-lg transition-colors"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
            </button>

            {/* Controls Container */}
            <div className={`absolute top-4 left-4 z-10 flex flex-col gap-3 max-w-xs transition-opacity duration-300 ${showFilters ? 'opacity-100' : 'opacity-0 md:opacity-100 pointer-events-none md:pointer-events-auto'
                } ${showFilters ? 'mt-12 md:mt-0' : ''}`}>

                {/* Aggregation Mode Selector */}
                <div className="flex flex-col gap-2 bg-background/80 backdrop-blur-sm p-3 rounded-lg border shadow-sm">
                    <h3 className="text-xs font-semibold text-muted-foreground">View Mode</h3>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setAggregationMode('country')}
                            className={`px-2 py-1 text-xs rounded transition-colors ${aggregationMode === 'country'
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted text-muted-foreground hover:bg-muted/80'
                                }`}
                        >
                            Country
                        </button>
                        <button
                            onClick={() => setAggregationMode('state')}
                            className={`px-2 py-1 text-xs rounded transition-colors ${aggregationMode === 'state'
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted text-muted-foreground hover:bg-muted/80'
                                }`}
                        >
                            State
                        </button>
                        <button
                            onClick={() => setAggregationMode('city')}
                            className={`px-2 py-1 text-xs rounded transition-colors ${aggregationMode === 'city'
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted text-muted-foreground hover:bg-muted/80'
                                }`}
                        >
                            City
                        </button>
                    </div>
                </div>

                {/* Filter Controls */}
                <div className="flex flex-col gap-2 bg-background/80 backdrop-blur-sm p-3 rounded-lg border shadow-sm">
                    <h3 className="text-xs font-semibold text-muted-foreground">Filters</h3>

                    {/* Country Filter */}
                    <div className="flex flex-col gap-1">
                        <label className="text-xs text-muted-foreground">Country</label>
                        <select
                            value={filterCountry}
                            onChange={(e) => handleCountryChange(e.target.value)}
                            className="bg-background border rounded px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                            <option value="">All Countries</option>
                            {countries.map(country => (
                                <option key={country} value={country}>{country}</option>
                            ))}
                        </select>
                    </div>

                    {/* State Filter */}
                    <div className="flex flex-col gap-1">
                        <label className="text-xs text-muted-foreground">State</label>
                        <select
                            value={filterState}
                            onChange={(e) => handleStateChange(e.target.value)}
                            disabled={!filterCountry}
                            className="bg-background border rounded px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                        >
                            <option value="">All States</option>
                            {states.map(state => (
                                <option key={state} value={state}>{state}</option>
                            ))}
                        </select>
                    </div>

                    {/* City Filter */}
                    <div className="flex flex-col gap-1">
                        <label className="text-xs text-muted-foreground">City</label>
                        <select
                            value={filterCity}
                            onChange={(e) => setFilterCity(e.target.value)}
                            disabled={!filterCountry}
                            className="bg-background border rounded px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                        >
                            <option value="">All Cities</option>
                            {cities.map(city => (
                                <option key={city} value={city}>{city}</option>
                            ))}
                        </select>
                    </div>

                    {/* Clear Button */}
                    {(filterCountry || filterState || filterCity) && (
                        <button
                            onClick={clearFilters}
                            className="text-xs bg-primary hover:bg-primary/90 text-primary-foreground px-2 py-1 rounded transition-colors"
                        >
                            Clear Filters
                        </button>
                    )}

                    {/* Stats */}
                    <div className="text-xs text-muted-foreground pt-2 border-t">
                        {locationsData.length} locations
                    </div>
                </div>
            </div>

            <Globe
                data={locationsData}
                aggregationMode={aggregationMode}
                filterCountry={filterCountry}
                filterState={filterState}
                filterCity={filterCity}
            />
        </div>
    );
}
