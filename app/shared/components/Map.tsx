import React, { useRef, useEffect, useState } from 'react';
import type { Map } from 'maplibre-gl';
import maplibregl from 'maplibre-gl';

interface MapProps {
  latitude?: number;
  longitude?: number;
  children?: React.ReactNode
}

export type MapContextValue = {
  map: Map | null;
};

export const MapContext = React.createContext<MapContextValue>({
  map: null
});

export default function MyMap ({latitude = 7, longitude = 52, children}: MapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const [mapInstance, setMapInstance] = useState<Map | null>(null);

  const {current: contextValue} = useRef<MapContextValue>({map: null});

  useEffect(() => {
    if (contextValue.map) return; //stops map from intializing more than once

    let map: Map;

    const initialState = {
      lng: longitude,
      lat: latitude,
      zoom: 14
    }

    if (mapContainer.current) {
      map = new maplibregl.Map({
        container: mapContainer.current,
        style: `https://api.maptiler.com/maps/streets/style.json?key=s6ZwTwU4u8uKGSjMhzHX`,
        center: [initialState.lng, initialState.lat],
        zoom: initialState.zoom
      });

      contextValue.map = map

      setMapInstance(map)
    }

    return () => {
      if (mapInstance) {
        map.remove()
      }
    };
  }, [contextValue, longitude, latitude, mapInstance]);

  return (
    <div className="relative w-full h-full min-h-full">
      <div ref={mapContainer} className="absolute w-full h-full">
        {mapInstance && (
          <MapContext.Provider value={contextValue}>{children}</MapContext.Provider>
        )}
      </div>
    </div>
  );
}