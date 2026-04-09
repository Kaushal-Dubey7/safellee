import api from './api';

export const fetchSafeRoutes = async (sourceLat, sourceLng, destLat, destLng) => {
  const response = await api.post('/api/route/safe-routes', {
    sourceLat, sourceLng, destLat, destLng
  });
  return response.data;
};

export const geocodeAddress = async (query) => {
  const response = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&countrycodes=in`,
    { headers: { 'User-Agent': 'Safelle/1.0' } }
  );
  const data = await response.json();
  return data.map(item => ({
    display_name: item.display_name,
    lat: parseFloat(item.lat),
    lng: parseFloat(item.lon)
  }));
};

export const reverseGeocode = async (lat, lng) => {
  const response = await fetch(
    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18`,
    { headers: { 'User-Agent': 'Safelle/1.0' } }
  );
  const data = await response.json();
  return data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
};
