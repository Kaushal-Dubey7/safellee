export const haversineDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371000;
  const toRad = (deg) => deg * Math.PI / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

export const isOnRoute = (lat, lng, routeCoords, thresholdMeters = 50) => {
  if (!routeCoords || routeCoords.length === 0) return true;
  let minDist = Infinity;
  const step = Math.max(1, Math.floor(routeCoords.length / 100));
  for (let i = 0; i < routeCoords.length; i += step) {
    const [rLat, rLng] = routeCoords[i];
    const dist = haversineDistance(lat, lng, rLat, rLng);
    if (dist < minDist) minDist = dist;
    if (dist < thresholdMeters) return true;
  }
  return minDist < thresholdMeters;
};

export const formatDistance = (meters) => {
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1)} km`;
};

export const formatDuration = (seconds) => {
  if (seconds < 60) return `${Math.round(seconds)} sec`;
  const mins = Math.round(seconds / 60);
  if (mins < 60) return `${mins} min`;
  const hrs = Math.floor(mins / 60);
  const remainMins = mins % 60;
  return `${hrs}h ${remainMins}m`;
};

export const getBearing = (lat1, lng1, lat2, lng2) => {
  const toRad = (deg) => deg * Math.PI / 180;
  const toDeg = (rad) => rad * 180 / Math.PI;
  const dLng = toRad(lng2 - lng1);
  const y = Math.sin(dLng) * Math.cos(toRad(lat2));
  const x = Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) -
    Math.sin(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(dLng);
  return (toDeg(Math.atan2(y, x)) + 360) % 360;
};
