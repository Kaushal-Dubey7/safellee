import { useState, useEffect, useRef, useCallback } from 'react';

const useGeolocation = (options = {}) => {
  const { enableTracking = false, onPositionUpdate = null } = options;
  const [position, setPosition] = useState(null);
  const [error, setError] = useState(null);
  const [heading, setHeading] = useState(0);
  const watchRef = useRef(null);
  const prevPosRef = useRef(null);

  const getBearing = (lat1, lng1, lat2, lng2) => {
    const toRad = (d) => d * Math.PI / 180;
    const toDeg = (r) => r * 180 / Math.PI;
    const dLng = toRad(lng2 - lng1);
    const y = Math.sin(dLng) * Math.cos(toRad(lat2));
    const x = Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) -
      Math.sin(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(dLng);
    return (toDeg(Math.atan2(y, x)) + 360) % 360;
  };

  const getCurrentPosition = useCallback(() => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setPosition(loc);
          setError(null);
          resolve(loc);
        },
        (err) => {
          setError(err.message);
          reject(err);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    });
  }, []);

  const startTracking = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation not supported');
      return;
    }

    if (watchRef.current !== null) return;

    watchRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const newPos = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setPosition(newPos);
        setError(null);

        if (prevPosRef.current) {
          const h = getBearing(
            prevPosRef.current.lat, prevPosRef.current.lng,
            newPos.lat, newPos.lng
          );
          setHeading(h);
        }

        if (onPositionUpdate) {
          onPositionUpdate(newPos, heading);
        }

        prevPosRef.current = newPos;
      },
      (err) => setError(err.message),
      { enableHighAccuracy: true, maximumAge: 0, timeout: 15000 }
    );
  }, [onPositionUpdate, heading]);

  const stopTracking = useCallback(() => {
    if (watchRef.current !== null) {
      navigator.geolocation.clearWatch(watchRef.current);
      watchRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (enableTracking) {
      startTracking();
    }
    return () => stopTracking();
  }, [enableTracking, startTracking, stopTracking]);

  return { position, error, heading, getCurrentPosition, startTracking, stopTracking };
};

export default useGeolocation;
