require('dotenv').config({ path: require('path').join(__dirname, '..', '..', '.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const LovedOne = require('../models/LovedOne');
const CrimeZone = require('../models/CrimeZone');
const RouteRating = require('../models/RouteRating');

const createPolygon = (centerLat, centerLng, radiusDeg = 0.008) => {
  const offsets = [
    [-radiusDeg, -radiusDeg],
    [radiusDeg, -radiusDeg],
    [radiusDeg, radiusDeg],
    [-radiusDeg, radiusDeg],
    [-radiusDeg, -radiusDeg]
  ];
  return [offsets.map(([dLng, dLat]) => [centerLng + dLng, centerLat + dLat])];
};

const crimeZones = [
  { name: 'Connaught Place', city: 'Delhi', crimeScore: 25, lightingScore: 90, crowdScore: 95, type: 'low', center: [28.6315, 77.2167], incidentCount: 12 },
  { name: 'Rajiv Chowk Metro Area', city: 'Delhi', crimeScore: 20, lightingScore: 92, crowdScore: 98, type: 'low', center: [28.6328, 77.2197], incidentCount: 8 },
  { name: 'Lajpat Nagar', city: 'Delhi', crimeScore: 40, lightingScore: 75, crowdScore: 80, type: 'medium', center: [28.5700, 77.2400], incidentCount: 28 },
  { name: 'Lajpat Nagar Market', city: 'Delhi', crimeScore: 35, lightingScore: 78, crowdScore: 85, type: 'medium', center: [28.5685, 77.2435], incidentCount: 22 },
  { name: 'Paharganj', city: 'Delhi', crimeScore: 75, lightingScore: 45, crowdScore: 60, type: 'high', center: [28.6440, 77.2130], incidentCount: 65 },
  { name: 'Paharganj Back Lanes', city: 'Delhi', crimeScore: 82, lightingScore: 35, crowdScore: 45, type: 'high', center: [28.6455, 77.2105], incidentCount: 78 },
  { name: 'Saket', city: 'Delhi', crimeScore: 20, lightingScore: 85, crowdScore: 90, type: 'low', center: [28.5244, 77.2066], incidentCount: 10 },
  { name: 'Saket Metro Area', city: 'Delhi', crimeScore: 18, lightingScore: 88, crowdScore: 92, type: 'low', center: [28.5220, 77.2100], incidentCount: 7 },
  { name: 'Chandni Chowk', city: 'Delhi', crimeScore: 65, lightingScore: 50, crowdScore: 85, type: 'high', center: [28.6560, 77.2300], incidentCount: 52 },
  { name: 'Old Delhi Station Area', city: 'Delhi', crimeScore: 70, lightingScore: 42, crowdScore: 80, type: 'high', center: [28.6615, 77.2285], incidentCount: 58 },
  { name: 'Okhla Industrial Area', city: 'Delhi', crimeScore: 80, lightingScore: 30, crowdScore: 40, type: 'high', center: [28.5300, 77.2700], incidentCount: 72 },
  { name: 'Okhla Phase 2', city: 'Delhi', crimeScore: 78, lightingScore: 32, crowdScore: 35, type: 'high', center: [28.5350, 77.2750], incidentCount: 68 },
  { name: 'Hauz Khas', city: 'Delhi', crimeScore: 30, lightingScore: 80, crowdScore: 85, type: 'low', center: [28.5494, 77.2001], incidentCount: 18 },
  { name: 'Hauz Khas Village', city: 'Delhi', crimeScore: 28, lightingScore: 82, crowdScore: 88, type: 'low', center: [28.5535, 77.1980], incidentCount: 15 },
  { name: 'Dwarka Sector 21', city: 'Delhi', crimeScore: 35, lightingScore: 70, crowdScore: 75, type: 'medium', center: [28.5521, 77.0580], incidentCount: 25 },
  { name: 'Dwarka Sector 10', city: 'Delhi', crimeScore: 38, lightingScore: 68, crowdScore: 72, type: 'medium', center: [28.5850, 77.0480], incidentCount: 30 },
  { name: 'Rohini Sector 3', city: 'Delhi', crimeScore: 55, lightingScore: 60, crowdScore: 65, type: 'medium', center: [28.7150, 77.1200], incidentCount: 40 },
  { name: 'Rohini Sector 7', city: 'Delhi', crimeScore: 52, lightingScore: 62, crowdScore: 68, type: 'medium', center: [28.7100, 77.1150], incidentCount: 38 },
  { name: 'Nehru Place', city: 'Delhi', crimeScore: 50, lightingScore: 65, crowdScore: 70, type: 'medium', center: [28.5491, 77.2532], incidentCount: 35 },
  { name: 'Nehru Place Market', city: 'Delhi', crimeScore: 48, lightingScore: 67, crowdScore: 73, type: 'medium', center: [28.5475, 77.2510], incidentCount: 32 },
  { name: 'Karol Bagh', city: 'Delhi', crimeScore: 45, lightingScore: 72, crowdScore: 82, type: 'medium', center: [28.6514, 77.1907], incidentCount: 33 },
  { name: 'Janakpuri', city: 'Delhi', crimeScore: 42, lightingScore: 65, crowdScore: 70, type: 'medium', center: [28.6219, 77.0878], incidentCount: 29 },
  { name: 'Yamuna Bank Area', city: 'Delhi', crimeScore: 85, lightingScore: 25, crowdScore: 30, type: 'high', center: [28.6250, 77.2800], incidentCount: 80 },
  { name: 'Sarai Kale Khan', city: 'Delhi', crimeScore: 72, lightingScore: 38, crowdScore: 55, type: 'high', center: [28.5890, 77.2580], incidentCount: 60 },
  { name: 'Green Park', city: 'Delhi', crimeScore: 22, lightingScore: 88, crowdScore: 90, type: 'low', center: [28.5597, 77.2072], incidentCount: 9 }
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB for seeding...');

    await CrimeZone.deleteMany({});
    await User.deleteMany({});
    await LovedOne.deleteMany({});
    await RouteRating.deleteMany({});
    console.log('Cleared existing data.');

    const crimeZoneDocs = crimeZones.map(zone => ({
      name: zone.name,
      city: zone.city,
      crimeScore: zone.crimeScore,
      lightingScore: zone.lightingScore,
      crowdScore: zone.crowdScore,
      type: zone.type,
      geometry: {
        type: 'Polygon',
        coordinates: createPolygon(zone.center[0], zone.center[1])
      },
      incidentCount: zone.incidentCount,
      lastUpdated: new Date()
    }));

    await CrimeZone.insertMany(crimeZoneDocs);
    console.log(`✅ Seeded ${crimeZoneDocs.length} crime zones.`);

    const salt = await bcrypt.genSalt(12);
    const hashedPw = await bcrypt.hash('safelle123', salt);

    const user1 = await User.create({
      fullName: 'Priya Sharma',
      email: 'priya@safelle.com',
      password: hashedPw,
      phone: '+919876543210',
      address: '42, Hauz Khas Village, New Delhi - 110016',
      profilePhoto: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iNTAiIGN5PSI1MCIgcj0iNTAiIGZpbGw9IiNGRjZCMDAiLz48dGV4dCB4PSI1MCIgeT0iNTUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IndoaXRlIiBmb250LXNpemU9IjM2IiBmb250LWZhbWlseT0iSW50ZXIiIGZvbnQtd2VpZ2h0PSJib2xkIj5QUzwvdGV4dD48L3N2Zz4=',
      isProfileComplete: true
    });

    const user2 = await User.create({
      fullName: 'Ananya Gupta',
      email: 'ananya@safelle.com',
      password: hashedPw,
      phone: '+919123456789',
      address: '15, Saket, New Delhi - 110017',
      profilePhoto: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iNTAiIGN5PSI1MCIgcj0iNTAiIGZpbGw9IiMyMkM1NUUiLz48dGV4dCB4PSI1MCIgeT0iNTUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IndoaXRlIiBmb250LXNpemU9IjM2IiBmb250LWZhbWlseT0iSW50ZXIiIGZvbnQtd2VpZ2h0PSJib2xkIj5BRzwvdGV4dD48L3N2Zz4=',
      isProfileComplete: true
    });
    console.log('✅ Seeded 2 demo users (priya@safelle.com / ananya@safelle.com, password: safelle123)');

    const lovedOnes = [
      { userId: user1._id, name: 'Rajesh Sharma', phone: '+919876501234', relationship: 'Father' },
      { userId: user1._id, name: 'Meera Sharma', phone: '+919876501235', relationship: 'Mother' },
      { userId: user1._id, name: 'Arjun Sharma', phone: '+919876501236', relationship: 'Brother' },
      { userId: user2._id, name: 'Suresh Gupta', phone: '+919123450001', relationship: 'Father' },
      { userId: user2._id, name: 'Kavita Gupta', phone: '+919123450002', relationship: 'Mother' },
      { userId: user2._id, name: 'Rahul Gupta', phone: '+919123450003', relationship: 'Husband' }
    ];

    await LovedOne.insertMany(lovedOnes);
    console.log('✅ Seeded 6 loved ones (3 per user)');

    const ratings = [
      { userId: user1._id, routeId: 'cp-to-saket-1', sourceCoords: { lat: 28.6315, lng: 77.2167 }, destCoords: { lat: 28.5244, lng: 77.2066 }, rating: 5, likes: ['Well-lit', 'Busy', 'Safe footpath'], dislikes: [], comment: 'Very safe route, well lit even at night.' },
      { userId: user1._id, routeId: 'hk-to-cp-1', sourceCoords: { lat: 28.5494, lng: 77.2001 }, destCoords: { lat: 28.6315, lng: 77.2167 }, rating: 4, likes: ['Good roads', 'Busy'], dislikes: ['Dark stretch'], comment: 'Mostly safe, one dark patch near flyover.' },
      { userId: user2._id, routeId: 'saket-to-nehru-1', sourceCoords: { lat: 28.5244, lng: 77.2066 }, destCoords: { lat: 28.5491, lng: 77.2532 }, rating: 3, likes: ['Safe footpath'], dislikes: ['Isolated', 'Poor lighting'], comment: 'Some stretches feel isolated.' },
      { userId: user2._id, routeId: 'cp-to-dwarka-1', sourceCoords: { lat: 28.6315, lng: 77.2167 }, destCoords: { lat: 28.5521, lng: 77.058 }, rating: 4, likes: ['Well-lit', 'Good roads', 'Busy'], dislikes: [], comment: 'Good metro connectivity, felt safe.' },
      { userId: user1._id, routeId: 'rohini-to-cp-1', sourceCoords: { lat: 28.715, lng: 77.12 }, destCoords: { lat: 28.6315, lng: 77.2167 }, rating: 3, likes: ['Busy'], dislikes: ['Dark stretch', 'Suspicious activity'], comment: 'Avoid late night travel on this route.' },
      { userId: user2._id, routeId: 'nehru-to-hk-1', sourceCoords: { lat: 28.5491, lng: 77.2532 }, destCoords: { lat: 28.5494, lng: 77.2001 }, rating: 4, likes: ['Well-lit', 'Safe footpath'], dislikes: [], comment: 'Pleasant experience.' },
      { userId: user1._id, routeId: 'karol-to-cp-1', sourceCoords: { lat: 28.6514, lng: 77.1907 }, destCoords: { lat: 28.6315, lng: 77.2167 }, rating: 4, likes: ['Busy', 'Well-lit'], dislikes: [], comment: 'Main road route is safe.' },
      { userId: user2._id, routeId: 'janakpuri-to-dwarka-1', sourceCoords: { lat: 28.6219, lng: 77.0878 }, destCoords: { lat: 28.5521, lng: 77.058 }, rating: 3, likes: ['Good roads'], dislikes: ['Poor lighting', 'Isolated'], comment: 'OK during daytime.' },
      { userId: user1._id, routeId: 'greenpark-to-saket-1', sourceCoords: { lat: 28.5597, lng: 77.2072 }, destCoords: { lat: 28.5244, lng: 77.2066 }, rating: 5, likes: ['Well-lit', 'Busy', 'Safe footpath', 'Good roads'], dislikes: [], comment: 'Best route I have used!' },
      { userId: user2._id, routeId: 'lajpat-to-cp-1', sourceCoords: { lat: 28.57, lng: 77.24 }, destCoords: { lat: 28.6315, lng: 77.2167 }, rating: 3, likes: ['Busy'], dislikes: ['Dark stretch'], comment: 'Take the main road, avoid short cuts.' }
    ];

    await RouteRating.insertMany(ratings);
    console.log('✅ Seeded 10 route ratings');

    console.log('\n🎉 Seeding complete! Database is ready.\n');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seed();
