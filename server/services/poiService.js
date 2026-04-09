const fetch = require('node-fetch');

const POI_CACHE = new Map();
const CACHE_DURATION = 5 * 60 * 1000;

const getCacheKey = (lat, lng, type) => {
  const roundedLat = Math.round(lat * 200) / 200;
  const roundedLng = Math.round(lng * 200) / 200;
  return `${roundedLat},${roundedLng},${type}`;
};

const fetchNearbyPOI = async (lat, lng, type, radius = 2000) => {
  const cacheKey = getCacheKey(lat, lng, type);
  const cached = POI_CACHE.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  const amenityMap = {
    hospital: 'hospital',
    pharmacy: 'pharmacy',
    police: 'police'
  };

  const amenity = amenityMap[type] || type;
  const query = `[out:json][timeout:10];node[amenity=${amenity}](around:${radius},${lat},${lng});out body 3;`;

  try {
    const response = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `data=${encodeURIComponent(query)}`
    });

    if (!response.ok) {
      throw new Error(`Overpass API error: ${response.status}`);
    }

    const data = await response.json();
    const results = (data.elements || []).slice(0, 3).map(el => ({
      id: el.id,
      name: (el.tags && el.tags.name) || `${type.charAt(0).toUpperCase() + type.slice(1)}`,
      lat: el.lat,
      lng: el.lon,
      phone: (el.tags && el.tags.phone) || (el.tags && el.tags['contact:phone']) || null,
      type: type,
      address: (el.tags && (el.tags['addr:full'] || el.tags['addr:street'])) || ''
    }));

    POI_CACHE.set(cacheKey, { data: results, timestamp: Date.now() });
    return results;
  } catch (error) {
    console.error(`Error fetching ${type} POIs:`, error.message);
    return [];
  }
};

const fetchNearestPoliceStation = async (lat, lng) => {
  const query = `[out:json][timeout:10];node[amenity=police](around:3000,${lat},${lng});out body 1;`;

  try {
    const response = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `data=${encodeURIComponent(query)}`
    });

    if (!response.ok) return null;

    const data = await response.json();
    if (!data.elements || data.elements.length === 0) return null;

    const station = data.elements[0];
    return {
      name: (station.tags && station.tags.name) || 'Police Station',
      phone: (station.tags && (station.tags.phone || station.tags['contact:phone'])) || null,
      lat: station.lat,
      lng: station.lon
    };
  } catch (error) {
    console.error('Error fetching nearest police station:', error.message);
    return null;
  }
};

module.exports = { fetchNearbyPOI, fetchNearestPoliceStation };
