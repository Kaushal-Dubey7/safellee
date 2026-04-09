const CrimeZone = require('../models/CrimeZone');
const RouteRating = require('../models/RouteRating');

const WEATHER_SCORE_MAP = {
  'Clear': 100,
  'Clouds': 70,
  'Mist': 60,
  'Fog': 50,
  'Haze': 55,
  'Drizzle': 50,
  'Rain': 40,
  'Thunderstorm': 10,
  'Snow': 30,
  'Smoke': 40,
  'Dust': 35,
  'Sand': 30,
  'Tornado': 5
};

const getTimeMultiplier = () => {
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 18) return 1.0;
  if (hour >= 18 && hour < 22) return 0.8;
  return 0.6;
};

const getCrimeScoreForRoute = async (routeCoordinates) => {
  try {
    if (!routeCoordinates || routeCoordinates.length === 0) return 70;

    const samplePoints = [];
    const step = Math.max(1, Math.floor(routeCoordinates.length / 10));
    for (let i = 0; i < routeCoordinates.length; i += step) {
      samplePoints.push(routeCoordinates[i]);
    }

    let totalCrimeScore = 0;
    let totalLightingScore = 0;
    let totalCrowdScore = 0;
    let matchCount = 0;

    for (const point of samplePoints) {
      const zones = await CrimeZone.find({
        geometry: {
          $geoIntersects: {
            $geometry: {
              type: 'Point',
              coordinates: [point[1], point[0]]
            }
          }
        }
      });

      if (zones.length > 0) {
        for (const zone of zones) {
          totalCrimeScore += zone.crimeScore;
          totalLightingScore += zone.lightingScore;
          totalCrowdScore += zone.crowdScore;
          matchCount++;
        }
      }
    }

    if (matchCount === 0) {
      return { crimeScore: 70, lightingScore: 60, crowdScore: 60 };
    }

    return {
      crimeScore: 100 - Math.round(totalCrimeScore / matchCount),
      lightingScore: Math.round(totalLightingScore / matchCount),
      crowdScore: Math.round(totalCrowdScore / matchCount)
    };
  } catch (error) {
    console.error('Error calculating crime score:', error);
    return { crimeScore: 70, lightingScore: 60, crowdScore: 60 };
  }
};

const getWeatherScore = (weatherData) => {
  if (!weatherData || !weatherData.weather || !weatherData.weather[0]) return 70;
  const main = weatherData.weather[0].main;
  return WEATHER_SCORE_MAP[main] || 50;
};

const getCommunityScore = async (sourceCoords, destCoords) => {
  try {
    const ratings = await RouteRating.find({
      'sourceCoords.lat': { $gte: sourceCoords.lat - 0.01, $lte: sourceCoords.lat + 0.01 },
      'sourceCoords.lng': { $gte: sourceCoords.lng - 0.01, $lte: sourceCoords.lng + 0.01 },
      'destCoords.lat': { $gte: destCoords.lat - 0.01, $lte: destCoords.lat + 0.01 },
      'destCoords.lng': { $gte: destCoords.lng - 0.01, $lte: destCoords.lng + 0.01 }
    });

    if (ratings.length === 0) return 60;

    const avgRating = ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length;
    return Math.round(avgRating * 20);
  } catch (error) {
    console.error('Error fetching community scores:', error);
    return 60;
  }
};

const calculateRouteScore = async (routeCoordinates, weatherData, sourceCoords, destCoords) => {
  const { crimeScore, lightingScore, crowdScore: rawCrowdScore } = await getCrimeScoreForRoute(routeCoordinates);

  const timeMultiplier = getTimeMultiplier();
  const crowdScore = Math.round(rawCrowdScore * timeMultiplier);

  const weatherScore = getWeatherScore(weatherData);

  const communityScore = await getCommunityScore(sourceCoords, destCoords);

  const finalScore = Math.round(
    crimeScore * 0.35 +
    lightingScore * 0.25 +
    crowdScore * 0.20 +
    weatherScore * 0.10 +
    communityScore * 0.10
  );

  return {
    total: Math.min(100, Math.max(0, finalScore)),
    breakdown: {
      crime: crimeScore,
      lighting: lightingScore,
      crowd: crowdScore,
      weather: weatherScore,
      community: communityScore
    }
  };
};

module.exports = { calculateRouteScore, getWeatherScore, getCommunityScore };
