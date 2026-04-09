import { createContext, useContext, useState, useCallback } from 'react';
import api from '../services/api';

const JourneyContext = createContext(null);

export const useJourney = () => {
  const context = useContext(JourneyContext);
  if (!context) throw new Error('useJourney must be used within JourneyProvider');
  return context;
};

export const JourneyProvider = ({ children }) => {
  const [activeJourney, setActiveJourney] = useState(null);
  const [routes, setRoutes] = useState(null);
  const [selectedRoute, setSelectedRoute] = useState('safe');
  const [loading, setLoading] = useState(false);

  const fetchActiveJourney = useCallback(async () => {
    try {
      const res = await api.get('/api/journey/active');
      setActiveJourney(res.data.journey);
      return res.data.journey;
    } catch {
      return null;
    }
  }, []);

  const startJourney = useCallback(async (data) => {
    setLoading(true);
    try {
      const res = await api.post('/api/journey/start', data);
      setActiveJourney(res.data.journey);
      return res.data.journey;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateLocation = useCallback(async (journeyId, lat, lng) => {
    try {
      await api.put(`/api/journey/${journeyId}/update-location`, { lat, lng });
    } catch (err) {
      console.error('Location update failed:', err);
    }
  }, []);

  const pauseJourney = useCallback(async (journeyId) => {
    try {
      const res = await api.put(`/api/journey/${journeyId}/pause`);
      setActiveJourney(res.data.journey);
      return res.data.journey;
    } catch (err) {
      console.error('Pause failed:', err);
    }
  }, []);

  const resumeJourney = useCallback(async (journeyId) => {
    try {
      const res = await api.put(`/api/journey/${journeyId}/resume`);
      setActiveJourney(res.data.journey);
      return res.data.journey;
    } catch (err) {
      console.error('Resume failed:', err);
    }
  }, []);

  const endJourney = useCallback(async (journeyId) => {
    try {
      const res = await api.put(`/api/journey/${journeyId}/end`);
      setActiveJourney(null);
      return res.data.journey;
    } catch (err) {
      console.error('End journey failed:', err);
    }
  }, []);

  return (
    <JourneyContext.Provider value={{
      activeJourney, setActiveJourney,
      routes, setRoutes,
      selectedRoute, setSelectedRoute,
      loading,
      fetchActiveJourney, startJourney,
      updateLocation, pauseJourney, resumeJourney, endJourney
    }}>
      {children}
    </JourneyContext.Provider>
  );
};

export default JourneyContext;
