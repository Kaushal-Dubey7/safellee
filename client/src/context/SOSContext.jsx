import { createContext, useContext, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';
import api from '../services/api';
import { vibrateSOS } from '../utils/vibrate';

const SOSContext = createContext(null);

export const useSOS = () => {
  const context = useContext(SOSContext);
  if (!context) throw new Error('useSOS must be used within SOSProvider');
  return context;
};

export const SOSProvider = ({ children }) => {
  const { user } = useAuth();
  const [sosActive, setSOSActive] = useState(false);
  const [sosData, setSOSData] = useState(null);
  const [contacts, setContacts] = useState([]);

  const fetchContacts = useCallback(async () => {
    try {
      const res = await api.get('/api/lovedones');
      setContacts(res.data.contacts || []);
      return res.data.contacts || [];
    } catch {
      return [];
    }
  }, []);

  const activateSOS = useCallback(async (location, journeyId = null) => {
    vibrateSOS();
    setSOSActive(true);

    let currentContacts = contacts;
    if (currentContacts.length === 0) {
      currentContacts = await fetchContacts();
    }

    try {
      const res = await api.post('/api/sos/trigger', {
        journeyId,
        lat: location.lat,
        lng: location.lng,
        triggerType: 'manual'
      });

      const data = {
        ...res.data,
        contacts: currentContacts.map(c => ({ name: c.name, phone: c.phone }))
      };
      setSOSData(data);

      // Note: Browsers block window.open in async callbacks.
      // We rely on the explicit buttons in SOSPage.jsx to trigger calls and messages reliably.

      return data;
    } catch (err) {
      console.error('SOS activation error:', err);
      setSOSData({
        contacts: currentContacts.map(c => ({ name: c.name, phone: c.phone })),
        location,
        mapLink: `https://maps.google.com/?q=${location.lat},${location.lng}`
      });
    }
  }, [contacts, fetchContacts, user]);

  const deactivateSOS = useCallback(() => {
    setSOSActive(false);
    setSOSData(null);
  }, []);

  return (
    <SOSContext.Provider value={{
      sosActive, sosData, contacts,
      activateSOS, deactivateSOS, fetchContacts
    }}>
      {children}
    </SOSContext.Provider>
  );
};

export default SOSContext;
