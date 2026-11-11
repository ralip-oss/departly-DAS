// Source: Google Maps Platform Code Assist
import React, { useState, useEffect, useRef } from 'react';
import { Map, AdvancedMarker, Pin, useMap, useMapsLibrary } from '@vis.gl/react-google-maps';
import { Navigation, ExternalLink } from 'lucide-react';

interface GoogleMapViewProps {
  origin?: { lat: number; lng: number; title?: string };
  destination?: { lat: number; lng: number; title?: string };
  height?: string;
  zoom?: number;
  className?: string;
  theme?: 'light' | 'dark';
  showTraffic?: boolean;
}

// Inner helper that binds to map instance to render the real road path from A to B and fit bounds
const MapRouteOverlay: React.FC<{
  origin: { lat: number; lng: number; title?: string };
  destination: { lat: number; lng: number; title?: string };
  showTraffic?: boolean;
}> = ({ origin, destination, showTraffic = true }) => {
  const map = useMap();
  const routesLib = useMapsLibrary('routes');
  const polylineRef = useRef<google.maps.Polyline | null>(null);
  const trafficLayerRef = useRef<google.maps.TrafficLayer | null>(null);

  useEffect(() => {
    if (!map || !window.google?.maps) return;

    // Fit map bounds to encompass both Origin and Destination
    try {
      const bounds = new google.maps.LatLngBounds();
      bounds.extend(new google.maps.LatLng(origin.lat, origin.lng));
      bounds.extend(new google.maps.LatLng(destination.lat, destination.lng));
      map.fitBounds(bounds, { top: 45, bottom: 45, left: 45, right: 45 });
    } catch {
      map.setCenter({
        lat: (origin.lat + destination.lat) / 2,
        lng: (origin.lng + destination.lng) / 2,
      });
    }

    // Toggle Traffic Layer
    if (showTraffic) {
      if (!trafficLayerRef.current) {
        trafficLayerRef.current = new google.maps.TrafficLayer();
      }
      trafficLayerRef.current.setMap(map);
    } else if (trafficLayerRef.current) {
      trafficLayerRef.current.setMap(null);
    }

    // Create polyline if not exists
    if (!polylineRef.current) {
      polylineRef.current = new google.maps.Polyline({
        map,
        strokeColor: '#0284C7',
        strokeWeight: 5,
        strokeOpacity: 0.9,
        geodesic: true,
      });
    }

    // Calculate real-world road directions following streets and paths
    const fetchRealRoadPath = async () => {
      // First, try standard Google Maps DirectionsService which guarantees real street paths
      if (window.google?.maps?.DirectionsService) {
        try {
          const ds = new window.google.maps.DirectionsService();
          const result = await new Promise<google.maps.DirectionsResult | null>((resolve) => {
            ds.route(
              {
                origin: { lat: origin.lat, lng: origin.lng },
                destination: { lat: destination.lat, lng: destination.lng },
                travelMode: google.maps.TravelMode.DRIVING,
              },
              (res, status) => {
                if (status === google.maps.DirectionsStatus.OK && res) {
                  resolve(res);
                } else {
                  resolve(null);
                }
              }
            );
          });

          if (result && result.routes && result.routes[0]) {
            const overview = result.routes[0].overview_path;
            if (overview && overview.length > 0) {
              polylineRef.current?.setPath(overview);
              if (result.routes[0].bounds) {
                map.fitBounds(result.routes[0].bounds, { top: 40, bottom: 40, left: 40, right: 40 });
              } else {
                const b = new google.maps.LatLngBounds();
                overview.forEach((pt) => b.extend(pt));
                map.fitBounds(b, { top: 40, bottom: 40, left: 40, right: 40 });
              }
              return;
            }
          }
        } catch (err) {
          console.warn('Error in DirectionsService, trying Routes API:', err);
        }
      }

      // Method 2: Routes API (Route.computeRoutes)
      try {
        const RouteClass = routesLib?.Route || (window.google?.maps as any)?.routes?.Route;
        if (RouteClass?.computeRoutes) {
          const response = await RouteClass.computeRoutes({
            origin: { lat: origin.lat, lng: origin.lng },
            destination: { lat: destination.lat, lng: destination.lng },
            travelMode: 'DRIVE',
            fields: ['path', 'legs', 'durationMillis', 'distanceMeters'],
            internalUsageAttributionIds: ['gmp_mcp_codeassist_v1_aistudio'],
          });

          if (response?.routes?.[0]?.path && response.routes[0].path.length > 0) {
            polylineRef.current?.setPath(response.routes[0].path);
            const routeBounds = new google.maps.LatLngBounds();
            response.routes[0].path.forEach((pt: google.maps.LatLng) => routeBounds.extend(pt));
            map.fitBounds(routeBounds, { top: 40, bottom: 40, left: 40, right: 40 });
            return;
          }
        }
      } catch (err) {
        console.warn('Error in Route.computeRoutes:', err);
      }

      // Fallback only if both network/API calls fail
      polylineRef.current?.setPath(generateInterpolatedRoadPath(origin, destination));
    };

    fetchRealRoadPath();

    return () => {
      if (polylineRef.current) {
        polylineRef.current.setMap(null);
        polylineRef.current = null;
      }
      if (trafficLayerRef.current) {
        trafficLayerRef.current.setMap(null);
        trafficLayerRef.current = null;
      }
    };
  }, [map, origin.lat, origin.lng, destination.lat, destination.lng, showTraffic, routesLib]);

  return null;
};

// Generates smooth road-like path points between origin and destination
function generateInterpolatedRoadPath(
  orig: { lat: number; lng: number },
  dest: { lat: number; lng: number }
): Array<{ lat: number; lng: number }> {
  const points: Array<{ lat: number; lng: number }> = [];
  const steps = 20;
  const dLat = dest.lat - orig.lat;
  const dLng = dest.lng - orig.lng;
  const midLat = (orig.lat + dest.lat) / 2;
  const midLng = (orig.lng + dest.lng) / 2;
  const offsetLat = -dLng * 0.1;
  const offsetLng = dLat * 0.1;

  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const lat = (1 - t) * (1 - t) * orig.lat + 2 * (1 - t) * t * (midLat + offsetLat) + t * t * dest.lat;
    const lng = (1 - t) * (1 - t) * orig.lng + 2 * (1 - t) * t * (midLng + offsetLng) + t * t * dest.lng;
    points.push({ lat, lng });
  }

  return points;
}

export const GoogleMapView: React.FC<GoogleMapViewProps> = ({
  origin = { lat: 38.7223, lng: -9.1485, title: 'Origem (Partida)' },
  destination = { lat: 38.7675, lng: -9.0988, title: 'Destino (Reunião)' },
  height = '240px',
  zoom = 12,
  className = '',
  theme = 'light',
  showTraffic = true,
}) => {
  const centerLat = (origin.lat + destination.lat) / 2;
  const centerLng = (origin.lng + destination.lng) / 2;
  const [activePin, setActivePin] = useState<'origin' | 'dest' | null>(null);

  return (
    <div
      className={`relative w-full rounded-2xl overflow-hidden border border-[#E1E6F0] dark:border-[#243248] shadow-sm select-none ${className}`}
      style={{ height }}
    >
      {/* Google Map Canvas */}
      <Map
        mapId="DEMO_MAP_ID"
        internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
        defaultCenter={{ lat: centerLat, lng: centerLng }}
        defaultZoom={zoom}
        gestureHandling="greedy"
        disableDefaultUI={false}
        mapTypeControl={false}
        streetViewControl={false}
        fullscreenControl={false}
        style={{ width: '100%', height: '100%' }}
      >
        {/* Route Path Following Roads & Traffic Layer Overlay */}
        <MapRouteOverlay
          origin={origin}
          destination={destination}
          showTraffic={showTraffic}
        />

        {/* Origin Marker (Point A) */}
        <AdvancedMarker
          position={{ lat: origin.lat, lng: origin.lng }}
          title={origin.title || 'Partida (Ponto A)'}
          onClick={() => setActivePin(activePin === 'origin' ? null : 'origin')}
        >
          <Pin
            background="#0284C7"
            borderColor="#0369A1"
            glyphColor="#FFFFFF"
            scale={1.15}
          />
        </AdvancedMarker>

        {/* Destination Marker (Point B) */}
        <AdvancedMarker
          position={{ lat: destination.lat, lng: destination.lng }}
          title={destination.title || 'Destino (Ponto B)'}
          onClick={() => setActivePin(activePin === 'dest' ? null : 'dest')}
        >
          <Pin
            background="#FF6B57"
            borderColor="#E11D48"
            glyphColor="#FFFFFF"
            scale={1.2}
          />
        </AdvancedMarker>
      </Map>

      {/* Floating Info Pill overlay: top-right link only (no top-left text) */}
      <div className="absolute top-2.5 right-2.5 flex items-center pointer-events-none z-10">
        <a
          href={`https://www.google.com/maps/dir/?api=1&origin=${origin.lat},${origin.lng}&destination=${destination.lat},${destination.lng}`}
          target="_blank"
          rel="noopener noreferrer"
          className="px-2.5 py-1 rounded-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200 dark:border-slate-800 shadow-sm font-mono-telemetry text-[10px] font-semibold text-[#0284C7] dark:text-[#38BDF8] hover:underline flex items-center gap-1 pointer-events-auto"
        >
          <Navigation size={10} />
          <span>Abrir no Maps</span>
          <ExternalLink size={10} />
        </a>
      </div>
    </div>
  );
};
