import React, { useEffect, useRef } from 'react';
import L from 'leaflet';

export default function LiveTrackingMap({
  origin = { coordinates: [72.8777, 19.0760], address: 'Origin' }, // [lng, lat]
  destination = { coordinates: [77.2090, 28.6139], address: 'Destination' }, // [lng, lat]
  currentLocation = null, // { coordinates: [lng, lat], speed: 65 }
  height = '420px',
  truckPlate = 'Fleet Vehicle',
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef({ origin: null, destination: null, truck: null, line: null });

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Convert GeoJSON [lng, lat] to Leaflet [lat, lng]
    const originLat = origin?.coordinates?.[1] || 19.0760;
    const originLng = origin?.coordinates?.[0] || 72.8777;

    const destLat = destination?.coordinates?.[1] || 28.6139;
    const destLng = destination?.coordinates?.[0] || 77.2090;

    const currentLat = currentLocation?.coordinates?.[1] || (originLat + destLat) / 2;
    const currentLng = currentLocation?.coordinates?.[0] || (originLng + destLng) / 2;

    // Initialize map if not already done
    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [currentLat, currentLng],
        zoom: 6,
        zoomControl: true,
      });

      // CartoDB Dark Matter / OSM Dark Tiles for modern look
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
        maxZoom: 19,
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Clear previous markers
    if (markersRef.current.origin) map.removeLayer(markersRef.current.origin);
    if (markersRef.current.destination) map.removeLayer(markersRef.current.destination);
    if (markersRef.current.truck) map.removeLayer(markersRef.current.truck);
    if (markersRef.current.line) map.removeLayer(markersRef.current.line);

    // Custom Icon Creators
    const createHtmlIcon = (emoji, bg) =>
      L.divIcon({
        className: 'custom-leaflet-icon',
        html: `<div style="background-color: ${bg}; width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 16px; box-shadow: 0 4px 14px rgba(0,0,0,0.4); border: 2px solid white;">${emoji}</div>`,
        iconSize: [34, 34],
        iconAnchor: [17, 17],
      });

    // Markers
    const originMarker = L.marker([originLat, originLng], {
      icon: createHtmlIcon('🟢', '#10b981'),
    })
      .addTo(map)
      .bindPopup(`<b>Origin:</b><br/>${origin.address}`);

    const destMarker = L.marker([destLat, destLng], {
      icon: createHtmlIcon('🏁', '#ef4444'),
    })
      .addTo(map)
      .bindPopup(`<b>Destination:</b><br/>${destination.address}`);

    const truckMarker = L.marker([currentLat, currentLng], {
      icon: createHtmlIcon('🚛', '#f97316'),
    })
      .addTo(map)
      .bindPopup(`<b>${truckPlate}</b><br/>Speed: ${currentLocation?.speed || 60} km/h`);

    // Route Polyline
    const polyline = L.polyline(
      [
        [originLat, originLng],
        [currentLat, currentLng],
        [destLat, destLng],
      ],
      { color: '#f97316', weight: 4, dashArray: '6, 8', opacity: 0.8 }
    ).addTo(map);

    markersRef.current = {
      origin: originMarker,
      destination: destMarker,
      truck: truckMarker,
      line: polyline,
    };

    // Auto fit bounds
    const group = L.featureGroup([originMarker, destMarker, truckMarker]);
    map.fitBounds(group.getBounds().pad(0.2));
  }, [origin, destination, currentLocation, truckPlate]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <div className="relative w-full rounded-xl overflow-hidden border border-slate-700/60 shadow-xl bg-dark-900">
      <div ref={mapContainerRef} style={{ height, width: '100%' }} />
      {/* Live Badge Overlay */}
      <div className="absolute top-4 right-4 z-[400] flex items-center gap-2 px-3 py-1.5 rounded-lg bg-dark-900/90 border border-slate-700 backdrop-blur-md shadow-lg text-xs font-semibold">
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
        <span className="text-emerald-400">Live GPS Stream</span>
      </div>
    </div>
  );
}
