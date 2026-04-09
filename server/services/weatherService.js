const fetch = require('node-fetch');

const WEATHER_CACHE = new Map();
const CACHE_DURATION = 10 * 60 * 1000;

const fetchWeather = async (lat, lng) => {
  const cacheKey = `${Math.round(lat * 10) / 10},${Math.round(lng * 10) / 10}`;
  const cached = WEATHER_CACHE.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  try {
    const apiKey = process.env.OPENWEATHER_API_KEY;
    if (!apiKey || apiKey === 'your_key_here') {
      return { weather: [{ main: 'Clear', description: 'clear sky' }], main: { temp: 25 } };
    }

    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${apiKey}&units=metric`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status}`);
    }

    const data = await response.json();
    WEATHER_CACHE.set(cacheKey, { data, timestamp: Date.now() });
    return data;
  } catch (error) {
    console.error('Error fetching weather:', error.message);
    return { weather: [{ main: 'Clear', description: 'clear sky' }], main: { temp: 25 } };
  }
};

module.exports = { fetchWeather };
