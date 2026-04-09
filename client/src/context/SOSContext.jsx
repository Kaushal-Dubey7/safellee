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

      // Open WhatsApp links
      const mapLink = `https://maps.google.com/?q=${location.lat},${location.lng}`;
      const message = `🚨 SAFELLE EMERGENCY ALERT 🚨\n${user?.fullName || 'User'} needs immediate help!\n📍 Location: ${mapLink}\n⏰ Time: ${new Date().toLocaleString()}\nPlease check on her or call 112 immediately.`;
      const encoded = encodeURIComponent(message);

      currentContacts.forEach((contact, i) => {
        const cleanPhone = contact.phone.replace(/[\s-]/g, '');
        setTimeout(() => {
          window.open(`https://wa.me/${cleanPhone}?text=${encoded}`, '_blank');
        }, i * 1000);
      });

      // Tel link fallback
      if (currentContacts.length > 0) {
        setTimeout(() => {
          window.open(`tel:${currentContacts[0].phone.replace(/[\s-]/g, '')}`, '_self');
        }, currentContacts.length * 1000 + 500);
      }

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
