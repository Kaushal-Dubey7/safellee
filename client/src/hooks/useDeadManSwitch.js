import { useState, useEffect, useRef, useCallback } from 'react';

const useDeadManSwitch = (options = {}) => {
  const { onCheckin, onSOS, checkinMinutes = 5, sosMinutes = 10, enabled = false } = options;
  const [showCheckin, setShowCheckin] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const checkinTimerRef = useRef(null);
  const sosTimerRef = useRef(null);
  const countdownRef = useRef(null);

  const onCheckinRef = useRef(onCheckin);
  const onSOSRef = useRef(onSOS);

  useEffect(() => {
    onCheckinRef.current = onCheckin;
    onSOSRef.current = onSOS;
  }, [onCheckin, onSOS]);

  const resetTimers = useCallback(() => {
    setShowCheckin(false);
    setCountdown(0);

    if (checkinTimerRef.current) clearTimeout(checkinTimerRef.current);
    if (sosTimerRef.current) clearTimeout(sosTimerRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);

    if (!enabled) return;

    checkinTimerRef.current = setTimeout(() => {
      setShowCheckin(true);
      setCountdown((sosMinutes - checkinMinutes) * 60);

      if (onCheckinRef.current) onCheckinRef.current();

      countdownRef.current = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(countdownRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      sosTimerRef.current = setTimeout(() => {
        setShowCheckin(false);
        if (onSOSRef.current) onSOSRef.current();
      }, (sosMinutes - checkinMinutes) * 60 * 1000);
    }, checkinMinutes * 60 * 1000);
  }, [enabled, checkinMinutes, sosMinutes]);

  const confirmSafe = useCallback(() => {
    resetTimers();
  }, [resetTimers]);

  useEffect(() => {
    if (enabled) {
      resetTimers();
    }
    return () => {
      if (checkinTimerRef.current) clearTimeout(checkinTimerRef.current);
      if (sosTimerRef.current) clearTimeout(sosTimerRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [enabled, resetTimers]);

  return { showCheckin, countdown, confirmSafe, resetTimers };
};

export default useDeadManSwitch;
