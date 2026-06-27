require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { Server } = require('socket.io');
const connectDB = require('./config/db');
const setupJourneySocket = require('./socket/journeySocket');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const lovedOnesRoutes = require('./routes/lovedones');
const routeRoutes = require('./routes/route');
const journeyRoutes = require('./routes/journey');
const sosRoutes = require('./routes/sos');
const ratingsRoutes = require('./routes/ratings');
const poiRoutes = require('./routes/poi');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

connectDB();

app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));

// Rate limiter disabled for Hackathon load-balancer compatibility
// app.use(limiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/lovedones', lovedOnesRoutes);
app.use('/api/route', routeRoutes);
app.use('/api/journey', journeyRoutes);
app.use('/api/sos', sosRoutes);
app.use('/api/ratings', ratingsRoutes);
app.use('/api/poi', poiRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error.' });
});

setupJourneySocket(io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`\n🛡️  Safelle Server running on port ${PORT}`);
  console.log(`📡 Socket.IO ready for connections`);
  console.log(`🌐 Client URL: ${process.env.CLIENT_URL || 'http://localhost:5173'}\n`);
});

const checkOverpassConnectivity = async () => {
  try {
    const fetch = require('node-fetch');
    const res = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      body: '[out:json];node(1);out;',
      signal: AbortSignal.timeout(5000)
    });
    console.log(`🌐 Overpass connectivity check: ${res.ok ? '✅ REACHABLE' : '⚠️ REACHABLE BUT ERROR ' + res.status}`);
  } catch (err) {
    console.log(`🌐 Overpass connectivity check: ❌ UNREACHABLE (${err.message})`);
    console.log('⚠️ If this fails, your hosting/dev environment likely blocks this domain.');
    console.log('⚠️ Check Antigravity/hosting network settings for outbound domain restrictions.');
    console.log('⚠️ The app will rely on time-of-day fallback scores for lighting/crowd until this is resolved.');
  }
};

// Call this once after server starts
checkOverpassConnectivity();

module.exports = { app, server, io };
