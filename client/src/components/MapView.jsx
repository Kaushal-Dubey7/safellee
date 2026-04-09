import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const createLiveDotIcon = () => L.divIcon({
  className: 'live-dot-marker',
  html: `<div class="live-dot"></div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10]
});

const createPOIIcon = (type) => {
  const configs = {
    hospital: { emoji: '🏥', bg: '#EF4444' },
    pharmacy: { emoji: '💊', bg: '#8B5CF6' },
    police: { emoji: '👮', bg: '#3B82F6' }
  };
  const config = configs[type] || { emoji: '📍', bg: '#666' };
  return L.divIcon({
    className: 'poi-marker',
    html: `<div style="width:36px;height:36px;border-radius:50%;background:${config.bg};display:flex;align-items:center;justify-content:center;font-size:18px;box-shadow:0 2px 8px rgba(0,0,0,0.3);border:2px solid white;">${config.emoji}</div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18]
  });
};

const sourceIcon = L.divIcon({
  className: 'source-marker',
  html: `<div style="width:16px;height:16px;border-radius:50%;background:#22C55E;border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3);"></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8]
});

const destIcon = L.divIcon({
  className: 'dest-marker',
  html: `<div style="width:20px;height:20px;border-radius:4px;background:#EF4444;border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3);transform:rotate(45deg);"></div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10]
});

const MapRecenter = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, zoom || map.getZoom(), { animate: true });
    }
  }, [center, zoom, map]);
  return null;
};

const MapView = ({
  center = [28.6139, 77.2090],
  zoom = 15,
  routes = null,
  selectedRouteKey = 'safe',
  livePosition = null,
  pois = [],
  showSource = null,
  showDest = null,
  height = '500px',
  followUser = false,
  className = ''
}) => {
  const mapRef = useRef(null);

  const routeColors = {
    safe: { color: '#22C55E', weight: 6, opacity: 0.9 },
    medium: { color: '#FF6B00', weight: 4, opacity: 0.7 },
    risky: { color: '#EF4444', weight: 3, opacity: 0.6, dashArray: '8 6' }
  };

  return (
    <div className={`map-container ${className}`} style={{ height, width: '100%' }}>
      <MapContainer
        center={center}
        zoom={zoom}
        ref={mapRef}
        style={{ height: '100%', width: '100%' }}
        zoomControl={true}
        scrollWheelZoom={true}
        touchZoom={true}
        dragging={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {followUser && livePosition && (
          <MapRecenter center={[livePosition.lat, livePosition.lng]} />
        )}

        {/* Routes */}
        {routes && Object.entries(routes).map(([key, route]) => {
          if (!route?.coordinates) return null;
          const style = routeColors[key] || routeColors.risky;
          const isSelected = key === selectedRouteKey;
          return (
            <Polyline
              key={key}
              positions={route.coordinates}
              pathOptions={{
                ...style,
                weight: isSelected ? style.weight + 2 : style.weight,
                opacity: isSelected ? 1 : style.opacity * 0.5
              }}
            />
          );
        })}

        {/* Source marker */}
        {showSource && (
          <Marker position={[showSource.lat, showSource.lng]} icon={sourceIcon}>
            <Popup>
              <strong>Start</strong>
              <br />{showSource.name || 'Your location'}
            </Popup>
          </Marker>
        )}

        {/* Destination marker */}
        {showDest && (
          <Marker position={[showDest.lat, showDest.lng]} icon={destIcon}>
            <Popup>
              <strong>Destination</strong>
              <br />{showDest.name || 'Destination'}
            </Popup>
          </Marker>
        )}

        {/* Live tracking dot */}
        {livePosition && (
          <Marker
            position={[livePosition.lat, livePosition.lng]}
            icon={createLiveDotIcon()}
            zIndexOffset={1000}
          >
            <Popup>Your current location</Popup>
          </Marker>
        )}

        {/* POI markers */}
        {pois.map((poi, i) => (
          <Marker
            key={`poi-${poi.type}-${i}`}
            position={[poi.lat, poi.lng]}
            icon={createPOIIcon(poi.type)}
          >
            <Popup>
              <div style={{ minWidth: 150 }}>
                <strong style={{ fontSize: 14 }}>{poi.name}</strong>
                {poi.phone && (
                  <div style={{ marginTop: 6 }}>
                    <a href={`tel:${poi.phone}`} style={{ color: '#2563eb', fontWeight: 600, fontSize: 13 }}>
                      📞 {poi.phone}
                    </a>
                  </div>
                )}
                {poi.address && (
                  <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>{poi.address}</div>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default MapView;
