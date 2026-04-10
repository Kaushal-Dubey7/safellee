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

      const responseData = res.data.data;
      setSOSData(responseData);

      // Capacitor auto-call (APK only) — as additional layer
      if (window.Capacitor?.isNativePlatform()) {
        const { PhoneCall } = await import('@capacitor-community/phone-call');
        for (const contact of responseData.contactsNotified) {
          try {
            await PhoneCall.call({ number: contact.phone });
            // Wait 30 seconds between calls to give them time to pick up
            await new Promise(r => setTimeout(r, 30000));
          } catch (e) {
            console.log('Capacitor call failed:', e);
          }
        }
      }

      return responseData;
    } catch (err) {
      console.error('SOS activation error:', err);
      setSOSData({
        contactsNotified: currentContacts.map(c => ({ name: c.name, phone: c.phone, smsSent: false })),
        location,
        locationLink: `https://maps.google.com/?q=${location.lat},${location.lng}`
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
