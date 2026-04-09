import { useState, useEffect, useCallback, useRef } from 'react';
import { isOnRoute } from '../utils/geoUtils';

const useDeviation = (options = {}) => {
  const { routeCoords = null, threshold = 50, enabled = false, onDeviate = null } = options;
  const [isDeviated, setIsDeviated] = useState(false);
  const [deviationCount, setDeviationCount] = useState(0);
  const lastAlertRef = useRef(0);

  const checkDeviation = useCallback((lat, lng) => {
    if (!enabled || !routeCoords || routeCoords.length === 0) return false;

    const onRoute = isOnRoute(lat, lng, routeCoords, threshold);

    if (!onRoute && !isDeviated) {
      const now = Date.now();
      if (now - lastAlertRef.current > 30000) {
        setIsDeviated(true);
        setDeviationCount(prev => prev + 1);
        lastAlertRef.current = now;
        if (onDeviate) onDeviate({ lat, lng });
      }
    } else if (onRoute && isDeviated) {
      setIsDeviated(false);
    }

    return !onRoute;
  }, [enabled, routeCoords, threshold, isDeviated, onDeviate]);

  const resetDeviation = useCallback(() => {
    setIsDeviated(false);
    setDeviationCount(0);
  }, []);

  return { isDeviated, deviationCount, checkDeviation, resetDeviation };
};

export default useDeviation;
