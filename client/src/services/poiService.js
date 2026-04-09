import api from './api';

const POI_CACHE = new Map();
const CACHE_DURATION = 5 * 60 * 1000;

export const fetchNearbyPOIs = async (lat, lng) => {
  const cacheKey = `${Math.round(lat * 200) / 200},${Math.round(lng * 200) / 200}`;
  const cached = POI_CACHE.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  try {
    const response = await api.get(`/api/poi/nearby?lat=${lat}&lng=${lng}`);
    const data = response.data;
    POI_CACHE.set(cacheKey, { data, timestamp: Date.now() });
    return data;
  } catch (error) {
    console.error('POI fetch error:', error);
    return { hospital: [], pharmacy: [], police: [] };
  }
};

export const getDistanceMoved = (prevPos, currentPos) => {
  if (!prevPos) return Infinity;
  const R = 6371000;
  const lat1 = prevPos.lat * Math.PI / 180;
  const lat2 = currentPos.lat * Math.PI / 180;
  const dLat = (currentPos.lat - prevPos.lat) * Math.PI / 180;
  const dLng = (currentPos.lng - prevPos.lng) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};
