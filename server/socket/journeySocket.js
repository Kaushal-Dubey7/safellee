const Journey = require('../models/Journey');
const LovedOne = require('../models/LovedOne');
const User = require('../models/User');
const SOSLog = require('../models/SOSLog');
const { fetchNearestPoliceStation } = require('../services/poiService');

const deadManTimers = new Map();
const warningTimers = new Map();

const CHECKIN_TIMEOUT = 5 * 60 * 1000;
const SOS_TIMEOUT = 10 * 60 * 1000;

const setupJourneySocket = (io) => {
  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    socket.on('journey:join', (journeyId) => {
      socket.join(`journey:${journeyId}`);
      console.log(`Socket ${socket.id} joined journey:${journeyId}`);
      resetDeadManSwitch(io, journeyId);
    });

    socket.on('location:send', async (data) => {
      const { journeyId, lat, lng, heading } = data;

      if (!journeyId || typeof lat !== 'number' || typeof lng !== 'number') return;

      try {
        const journey = await Journey.findById(journeyId);
        if (!journey || journey.status !== 'active') return;

        journey.locationHistory.push({ lat, lng, timestamp: new Date() });
        journey.lastLocationUpdate = new Date();
        await journey.save();

        io.to(`journey:${journeyId}`).emit('location:update', {
          lat,
          lng,
          heading: heading || 0,
          timestamp: new Date()
        });

        resetDeadManSwitch(io, journeyId);
      } catch (error) {
        console.error('location:send error:', error.message);
      }
    });

    socket.on('journey:confirm_safe', (journeyId) => {
      console.log(`User confirmed safe for journey: ${journeyId}`);
      resetDeadManSwitch(io, journeyId);
    });

    socket.on('sos:trigger', async (data) => {
      const { journeyId, lat, lng, type, userId } = data;
      console.log(`SOS triggered for journey: ${journeyId}`);

      try {
        if (journeyId) {
          await Journey.findByIdAndUpdate(journeyId, { status: 'sos' });
        }

        clearTimers(journeyId);

        let contacts = [];
        let user = null;

        if (userId) {
          contacts = await LovedOne.find({ userId });
          user = await User.findById(userId).select('-password');
        }

        const policeStation = await fetchNearestPoliceStation(lat, lng);

        const sosLog = new SOSLog({
          userId: userId,
          triggerType: type || 'auto',
          location: { lat, lng },
          contactsNotified: contacts.map(c => c.phone),
          nearestPoliceStation: policeStation ? {
            name: policeStation.name,
            phone: policeStation.phone || '',
            lat: policeStation.lat,
            lng: policeStation.lng
          } : undefined
        });
        await sosLog.save();

        io.to(`journey:${journeyId}`).emit('journey:sos', {
          contacts: contacts.map(c => ({ name: c.name, phone: c.phone })),
          policeStation,
          location: { lat, lng },
          mapLink: `https://maps.google.com/?q=${lat},${lng}`,
          userName: user ? user.fullName : 'User',
          message: `🚨 SAFELLE EMERGENCY ALERT 🚨\n${user ? user.fullName : 'User'} needs immediate help!\n📍 Location: https://maps.google.com/?q=${lat},${lng}\n⏰ Time: ${new Date().toLocaleString()}\nPlease check on her or call 112 immediately.`
        });
      } catch (error) {
        console.error('sos:trigger socket error:', error.message);
      }
    });

    socket.on('journey:leave', (journeyId) => {
      socket.leave(`journey:${journeyId}`);
      clearTimers(journeyId);
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });
};

const resetDeadManSwitch = (io, journeyId) => {
  clearTimers(journeyId);

  const warningTimer = setTimeout(() => {
    console.log(`5-min checkin warning for journey: ${journeyId}`);
    io.to(`journey:${journeyId}`).emit('journey:checkin', {
      message: 'Are you okay? Please confirm you are safe.',
      timestamp: new Date()
    });
    io.to(`journey:${journeyId}`).emit('journey:freeze_warning', {
      message: 'No location update received for 5 minutes.',
      vibrate: [500, 100, 500, 100, 500]
    });
  }, CHECKIN_TIMEOUT);

  const sosTimer = setTimeout(async () => {
    console.log(`10-min auto SOS for journey: ${journeyId}`);
    try {
      const journey = await Journey.findById(journeyId).populate('userId');
      if (!journey || journey.status !== 'active') return;

      const lastLoc = journey.locationHistory[journey.locationHistory.length - 1];
      if (!lastLoc) return;

      const contacts = await LovedOne.find({ userId: journey.userId._id });
      const policeStation = await fetchNearestPoliceStation(lastLoc.lat, lastLoc.lng);

      journey.status = 'sos';
      await journey.save();

      const sosLog = new SOSLog({
        userId: journey.userId._id,
        triggerType: 'auto',
        location: { lat: lastLoc.lat, lng: lastLoc.lng },
        contactsNotified: contacts.map(c => c.phone),
        nearestPoliceStation: policeStation ? {
          name: policeStation.name,
          phone: policeStation.phone || '',
          lat: policeStation.lat,
          lng: policeStation.lng
        } : undefined
      });
      await sosLog.save();

      io.to(`journey:${journeyId}`).emit('journey:sos', {
        contacts: contacts.map(c => ({ name: c.name, phone: c.phone })),
        policeStation,
        location: { lat: lastLoc.lat, lng: lastLoc.lng },
        mapLink: `https://maps.google.com/?q=${lastLoc.lat},${lastLoc.lng}`,
        userName: journey.userId.fullName,
        autoTriggered: true,
        message: `🚨 AUTO SOS - SAFELLE 🚨\n${journey.userId.fullName} has not responded for 10 minutes!\n📍 Last Location: https://maps.google.com/?q=${lastLoc.lat},${lastLoc.lng}\nPlease check on her immediately!`
      });
    } catch (error) {
      console.error('Auto SOS error:', error.message);
    }
  }, SOS_TIMEOUT);

  warningTimers.set(journeyId, warningTimer);
  deadManTimers.set(journeyId, sosTimer);
};

const clearTimers = (journeyId) => {
  if (warningTimers.has(journeyId)) {
    clearTimeout(warningTimers.get(journeyId));
    warningTimers.delete(journeyId);
  }
  if (deadManTimers.has(journeyId)) {
    clearTimeout(deadManTimers.get(journeyId));
    deadManTimers.delete(journeyId);
  }
};

module.exports = setupJourneySocket;
