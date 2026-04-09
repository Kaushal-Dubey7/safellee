const WEATHER_KEY = import.meta.env.VITE_OPENWEATHER_KEY;

let cachedWeather = null;
let cacheTime = 0;
const CACHE_DURATION = 10 * 60 * 1000;

export const fetchWeather = async (lat, lng) => {
  if (cachedWeather && Date.now() - cacheTime < CACHE_DURATION) {
    return cachedWeather;
  }

  if (!WEATHER_KEY || WEATHER_KEY === 'your_key_here') {
    return { main: 'Clear', description: 'clear sky', temp: 25, icon: '01d' };
  }

  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${WEATHER_KEY}&units=metric`
    );
    if (!response.ok) throw new Error('Weather API error');
    const data = await response.json();
    const result = {
      main: data.weather[0].main,
      description: data.weather[0].description,
      temp: Math.round(data.main.temp),
      icon: data.weather[0].icon
    };
    cachedWeather = result;
    cacheTime = Date.now();
    return result;
  } catch (error) {
    console.error('Weather fetch error:', error);
    return { main: 'Clear', description: 'clear sky', temp: 25, icon: '01d' };
  }
};
