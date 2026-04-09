import api from './api';

export const triggerSOS = async (user, contacts, location, journeyId) => {
  const { lat, lng } = location;
  const mapLink = `https://maps.google.com/?q=${lat},${lng}`;
  const message = `🚨 SAFELLE EMERGENCY ALERT 🚨\n${user.fullName} needs immediate help!\n📍 Location: ${mapLink}\n⏰ Time: ${new Date().toLocaleString()}\nPlease check on her or call 112 immediately.`;
  const encoded = encodeURIComponent(message);

  const actions = [];

  // 1. WhatsApp to ALL contacts
  contacts.forEach(contact => {
    const cleanPhone = contact.phone.replace(/[\s-]/g, '');
    actions.push({ type: 'whatsapp', contact: contact.name, status: 'sending' });
    window.open(`https://wa.me/${cleanPhone}?text=${encoded}`, '_blank');
  });

  // 2. SMS fallback
  const smsMsg = `SAFELLE SOS: ${user.fullName} needs help! Location: ${mapLink}`;
  if (contacts.length > 0) {
    const primaryPhone = contacts[0].phone.replace(/[\s-]/g, '');
    window.open(`sms:${primaryPhone}?body=${encodeURIComponent(smsMsg)}`, '_self');
  }

  // 3. Auto call via Capacitor or tel: URI
  try {
    if (window.Capacitor?.isNativePlatform()) {
      const { PhoneCall } = await import('@capacitor-community/phone-call');
      for (const contact of contacts) {
        await PhoneCall.call({ number: contact.phone.replace(/[\s-]/g, '') });
        await new Promise(r => setTimeout(r, 30000));
      }
    } else if (contacts.length > 0) {
      window.open(`tel:${contacts[0].phone.replace(/[\s-]/g, '')}`, '_self');
    }
  } catch (err) {
    console.error('Auto call failed:', err);
    if (contacts.length > 0) {
      window.open(`tel:${contacts[0].phone.replace(/[\s-]/g, '')}`, '_self');
    }
  }

  // 4. Log to server and get nearest police
  try {
    const response = await api.post('/api/sos/trigger', {
      journeyId,
      lat,
      lng,
      triggerType: 'manual'
    });

    if (response.data.policeStation?.phone) {
      window.open(`https://wa.me/${response.data.policeStation.phone}?text=${encoded}`, '_blank');
    }

    return response.data;
  } catch (error) {
    console.error('SOS API error:', error);
    return { contacts, location: { lat, lng }, mapLink };
  }
};

export const fetchNearestPoliceStation = async (lat, lng) => {
  const query = `[out:json];node[amenity=police](around:3000,${lat},${lng});out body;`;
  try {
    const res = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `data=${encodeURIComponent(query)}`
    });
    const data = await res.json();
    if (!data.elements || data.elements.length === 0) return null;
    const station = data.elements[0];
    return {
      name: station.tags?.name || 'Police Station',
      phone: station.tags?.phone || station.tags?.['contact:phone'] || null,
      lat: station.lat,
      lng: station.lon
    };
  } catch (err) {
    console.error('Police station fetch error:', err);
    return null;
  }
};

export const getSOSHistory = async () => {
  const response = await api.get('/api/sos/history');
  return response.data.logs;
};

// Vibration patterns
export const vibrateDeviation = () => navigator.vibrate?.([200, 50, 200]);
export const vibrateCheckin = () => navigator.vibrate?.([500, 100, 500, 100, 500]);
export const vibrateSOS = () => navigator.vibrate?.([1000, 200, 1000, 200, 1000, 200, 1000]);
