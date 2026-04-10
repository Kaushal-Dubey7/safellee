const mongoose = require('mongoose');
const CrimeZone = require('../models/CrimeZone');
require('dotenv').config({ path: require('path').join(__dirname, '..', '..', '.env') });

const delhiCrimeZones = [

  // ── CENTRAL DELHI ────────────────────────────────────────────────
  {
    name: 'Connaught Place',
    city: 'Delhi',
    crimeScore: 35, lightingScore: 92, crowdScore: 95,
    type: 'medium', incidentCount: 142, areaType: 'commercial',
    geometry: { type: 'Polygon', coordinates: [[[77.208,28.636],[77.226,28.636],[77.226,28.625],[77.208,28.625],[77.208,28.636]]] }
  },
  {
    name: 'Paharganj',
    city: 'Delhi',
    crimeScore: 78, lightingScore: 42, crowdScore: 70,
    type: 'high', incidentCount: 412, areaType: 'mixed',
    geometry: { type: 'Polygon', coordinates: [[[77.200,28.648],[77.215,28.648],[77.215,28.638],[77.200,28.638],[77.200,28.648]]] }
  },
  {
    name: 'Karol Bagh',
    city: 'Delhi',
    crimeScore: 55, lightingScore: 72, crowdScore: 88,
    type: 'medium', incidentCount: 289, areaType: 'commercial',
    geometry: { type: 'Polygon', coordinates: [[[77.185,28.655],[77.200,28.655],[77.200,28.645],[77.185,28.645],[77.185,28.655]]] }
  },
  {
    name: 'Chandni Chowk',
    city: 'Delhi',
    crimeScore: 65, lightingScore: 55, crowdScore: 90,
    type: 'high', incidentCount: 378, areaType: 'commercial',
    geometry: { type: 'Polygon', coordinates: [[[77.226,28.658],[77.242,28.658],[77.242,28.648],[77.226,28.648],[77.226,28.658]]] }
  },
  {
    name: 'Old Delhi Walled City',
    city: 'Delhi',
    crimeScore: 72, lightingScore: 40, crowdScore: 82,
    type: 'high', incidentCount: 520, areaType: 'mixed',
    geometry: { type: 'Polygon', coordinates: [[[77.228,28.666],[77.248,28.666],[77.248,28.648],[77.228,28.648],[77.228,28.666]]] }
  },
  {
    name: 'Daryaganj',
    city: 'Delhi',
    crimeScore: 58, lightingScore: 62, crowdScore: 78,
    type: 'medium', incidentCount: 198, areaType: 'mixed',
    geometry: { type: 'Polygon', coordinates: [[[77.240,28.645],[77.258,28.645],[77.258,28.635],[77.240,28.635],[77.240,28.645]]] }
  },

  // ── NORTH DELHI ──────────────────────────────────────────────────
  {
    name: 'Rohini Sector 3-9',
    city: 'Delhi',
    crimeScore: 48, lightingScore: 68, crowdScore: 72,
    type: 'medium', incidentCount: 267, areaType: 'residential',
    geometry: { type: 'Polygon', coordinates: [[[77.085,28.735],[77.110,28.735],[77.110,28.718],[77.085,28.718],[77.085,28.735]]] }
  },
  {
    name: 'Rohini Sector 10-18',
    city: 'Delhi',
    crimeScore: 42, lightingScore: 72, crowdScore: 68,
    type: 'medium', incidentCount: 198, areaType: 'residential',
    geometry: { type: 'Polygon', coordinates: [[[77.060,28.738],[77.085,28.738],[77.085,28.722],[77.060,28.722],[77.060,28.738]]] }
  },
  {
    name: 'Jahangirpuri',
    city: 'Delhi',
    crimeScore: 82, lightingScore: 35, crowdScore: 75,
    type: 'high', incidentCount: 634, areaType: 'residential',
    geometry: { type: 'Polygon', coordinates: [[[77.148,28.745],[77.168,28.745],[77.168,28.732],[77.148,28.732],[77.148,28.745]]] }
  },
  {
    name: 'Shalimar Bagh',
    city: 'Delhi',
    crimeScore: 38, lightingScore: 75, crowdScore: 70,
    type: 'low', incidentCount: 112, areaType: 'residential',
    geometry: { type: 'Polygon', coordinates: [[[77.150,28.720],[77.170,28.720],[77.170,28.705],[77.150,28.705],[77.150,28.720]]] }
  },
  {
    name: 'Pitampura',
    city: 'Delhi',
    crimeScore: 40, lightingScore: 78, crowdScore: 74,
    type: 'low', incidentCount: 134, areaType: 'residential',
    geometry: { type: 'Polygon', coordinates: [[[77.128,28.712],[77.148,28.712],[77.148,28.698],[77.128,28.698],[77.128,28.712]]] }
  },
  {
    name: 'Mukherjee Nagar',
    city: 'Delhi',
    crimeScore: 52, lightingScore: 65, crowdScore: 80,
    type: 'medium', incidentCount: 223, areaType: 'mixed',
    geometry: { type: 'Polygon', coordinates: [[[77.198,28.712],[77.215,28.712],[77.215,28.700],[77.198,28.700],[77.198,28.712]]] }
  },
  {
    name: 'Burari',
    city: 'Delhi',
    crimeScore: 60, lightingScore: 45, crowdScore: 60,
    type: 'medium', incidentCount: 312, areaType: 'residential',
    geometry: { type: 'Polygon', coordinates: [[[77.178,28.760],[77.205,28.760],[77.205,28.742],[77.178,28.742],[77.178,28.760]]] }
  },

  // ── SOUTH DELHI ──────────────────────────────────────────────────
  {
    name: 'Hauz Khas',
    city: 'Delhi',
    crimeScore: 28, lightingScore: 85, crowdScore: 88,
    type: 'low', incidentCount: 89, areaType: 'commercial',
    geometry: { type: 'Polygon', coordinates: [[[77.195,28.555],[77.215,28.555],[77.215,28.542],[77.195,28.542],[77.195,28.555]]] }
  },
  {
    name: 'Saket',
    city: 'Delhi',
    crimeScore: 22, lightingScore: 88, crowdScore: 90,
    type: 'low', incidentCount: 67, areaType: 'commercial',
    geometry: { type: 'Polygon', coordinates: [[[77.208,28.528],[77.230,28.528],[77.230,28.515],[77.208,28.515],[77.208,28.528]]] }
  },
  {
    name: 'Lajpat Nagar',
    city: 'Delhi',
    crimeScore: 42, lightingScore: 78, crowdScore: 85,
    type: 'medium', incidentCount: 178, areaType: 'commercial',
    geometry: { type: 'Polygon', coordinates: [[[77.235,28.568],[77.255,28.568],[77.255,28.555],[77.235,28.555],[77.235,28.568]]] }
  },
  {
    name: 'Greater Kailash',
    city: 'Delhi',
    crimeScore: 25, lightingScore: 88, crowdScore: 82,
    type: 'low', incidentCount: 78, areaType: 'residential',
    geometry: { type: 'Polygon', coordinates: [[[77.228,28.548],[77.248,28.548],[77.248,28.535],[77.228,28.535],[77.228,28.548]]] }
  },
  {
    name: 'Malviya Nagar',
    city: 'Delhi',
    crimeScore: 30, lightingScore: 82, crowdScore: 80,
    type: 'low', incidentCount: 95, areaType: 'residential',
    geometry: { type: 'Polygon', coordinates: [[[77.198,28.538],[77.218,28.538],[77.218,28.525],[77.198,28.525],[77.198,28.538]]] }
  },
  {
    name: 'Mehrauli',
    city: 'Delhi',
    crimeScore: 62, lightingScore: 48, crowdScore: 65,
    type: 'medium', incidentCount: 298, areaType: 'mixed',
    geometry: { type: 'Polygon', coordinates: [[[77.178,28.515],[77.202,28.515],[77.202,28.498],[77.178,28.498],[77.178,28.515]]] }
  },
  {
    name: 'Sangam Vihar',
    city: 'Delhi',
    crimeScore: 75, lightingScore: 35, crowdScore: 58,
    type: 'high', incidentCount: 487, areaType: 'residential',
    geometry: { type: 'Polygon', coordinates: [[[77.258,28.508],[77.282,28.508],[77.282,28.490],[77.258,28.490],[77.258,28.508]]] }
  },
  {
    name: 'Tughlakabad',
    city: 'Delhi',
    crimeScore: 70, lightingScore: 38, crowdScore: 55,
    type: 'high', incidentCount: 445, areaType: 'mixed',
    geometry: { type: 'Polygon', coordinates: [[[77.278,28.495],[77.302,28.495],[77.302,28.478],[77.278,28.478],[77.278,28.495]]] }
  },

  // ── EAST DELHI ───────────────────────────────────────────────────
  {
    name: 'Laxmi Nagar',
    city: 'Delhi',
    crimeScore: 58, lightingScore: 65, crowdScore: 85,
    type: 'medium', incidentCount: 334, areaType: 'commercial',
    geometry: { type: 'Polygon', coordinates: [[[77.268,28.635],[77.288,28.635],[77.288,28.622],[77.268,28.622],[77.268,28.635]]] }
  },
  {
    name: 'Preet Vihar',
    city: 'Delhi',
    crimeScore: 38, lightingScore: 78, crowdScore: 76,
    type: 'low', incidentCount: 123, areaType: 'residential',
    geometry: { type: 'Polygon', coordinates: [[[77.285,28.642],[77.302,28.642],[77.302,28.630],[77.285,28.630],[77.285,28.642]]] }
  },
  {
    name: 'Vivek Vihar',
    city: 'Delhi',
    crimeScore: 42, lightingScore: 72, crowdScore: 72,
    type: 'medium', incidentCount: 156, areaType: 'residential',
    geometry: { type: 'Polygon', coordinates: [[[77.302,28.668],[77.322,28.668],[77.322,28.655],[77.302,28.655],[77.302,28.668]]] }
  },
  {
    name: 'Shahdara',
    city: 'Delhi',
    crimeScore: 68, lightingScore: 52, crowdScore: 78,
    type: 'high', incidentCount: 489, areaType: 'mixed',
    geometry: { type: 'Polygon', coordinates: [[[77.278,28.672],[77.300,28.672],[77.300,28.658],[77.278,28.658],[77.278,28.672]]] }
  },
  {
    name: 'Anand Vihar',
    city: 'Delhi',
    crimeScore: 55, lightingScore: 70, crowdScore: 82,
    type: 'medium', incidentCount: 267, areaType: 'commercial',
    geometry: { type: 'Polygon', coordinates: [[[77.312,28.648],[77.330,28.648],[77.330,28.636],[77.312,28.636],[77.312,28.648]]] }
  },
  {
    name: 'Mayur Vihar Phase 1',
    city: 'Delhi',
    crimeScore: 35, lightingScore: 80, crowdScore: 78,
    type: 'low', incidentCount: 98, areaType: 'residential',
    geometry: { type: 'Polygon', coordinates: [[[77.298,28.605],[77.318,28.605],[77.318,28.592],[77.298,28.592],[77.298,28.605]]] }
  },
  {
    name: 'Patparganj Industrial',
    city: 'Delhi',
    crimeScore: 72, lightingScore: 32, crowdScore: 38,
    type: 'high', incidentCount: 398, areaType: 'industrial',
    geometry: { type: 'Polygon', coordinates: [[[77.305,28.620],[77.328,28.620],[77.328,28.605],[77.305,28.605],[77.305,28.620]]] }
  },

  // ── WEST DELHI ───────────────────────────────────────────────────
  {
    name: 'Dwarka Sector 1-8',
    city: 'Delhi',
    crimeScore: 32, lightingScore: 82, crowdScore: 75,
    type: 'low', incidentCount: 112, areaType: 'residential',
    geometry: { type: 'Polygon', coordinates: [[[77.038,28.578],[77.062,28.578],[77.062,28.558],[77.038,28.558],[77.038,28.578]]] }
  },
  {
    name: 'Dwarka Sector 9-20',
    city: 'Delhi',
    crimeScore: 28, lightingScore: 85, crowdScore: 78,
    type: 'low', incidentCount: 89, areaType: 'residential',
    geometry: { type: 'Polygon', coordinates: [[[77.012,28.588],[77.038,28.588],[77.038,28.568],[77.012,28.568],[77.012,28.588]]] }
  },
  {
    name: 'Janakpuri',
    city: 'Delhi',
    crimeScore: 38, lightingScore: 78, crowdScore: 80,
    type: 'low', incidentCount: 134, areaType: 'residential',
    geometry: { type: 'Polygon', coordinates: [[[77.072,28.628],[77.095,28.628],[77.095,28.612],[77.072,28.612],[77.072,28.628]]] }
  },
  {
    name: 'Uttam Nagar',
    city: 'Delhi',
    crimeScore: 62, lightingScore: 52, crowdScore: 72,
    type: 'medium', incidentCount: 356, areaType: 'residential',
    geometry: { type: 'Polygon', coordinates: [[[77.048,28.618],[77.072,28.618],[77.072,28.602],[77.048,28.602],[77.048,28.618]]] }
  },
  {
    name: 'Najafgarh',
    city: 'Delhi',
    crimeScore: 65, lightingScore: 40, crowdScore: 55,
    type: 'high', incidentCount: 423, areaType: 'mixed',
    geometry: { type: 'Polygon', coordinates: [[[76.978,28.612],[77.010,28.612],[77.010,28.590],[76.978,28.590],[76.978,28.612]]] }
  },
  {
    name: 'Tilak Nagar',
    city: 'Delhi',
    crimeScore: 50, lightingScore: 68, crowdScore: 82,
    type: 'medium', incidentCount: 245, areaType: 'commercial',
    geometry: { type: 'Polygon', coordinates: [[[77.095,28.642],[77.115,28.642],[77.115,28.630],[77.095,28.630],[77.095,28.642]]] }
  },
  {
    name: 'Vikaspuri',
    city: 'Delhi',
    crimeScore: 45, lightingScore: 72, crowdScore: 74,
    type: 'medium', incidentCount: 189, areaType: 'residential',
    geometry: { type: 'Polygon', coordinates: [[[77.065,28.645],[77.088,28.645],[77.088,28.630],[77.065,28.630],[77.065,28.645]]] }
  },

  // ── SOUTH WEST / AIRPORT ZONE ────────────────────────────────────
  {
    name: 'IGI Airport Zone',
    city: 'Delhi',
    crimeScore: 18, lightingScore: 95, crowdScore: 85,
    type: 'low', incidentCount: 34, areaType: 'commercial',
    geometry: { type: 'Polygon', coordinates: [[[77.082,28.562],[77.110,28.562],[77.110,28.542],[77.082,28.542],[77.082,28.562]]] }
  },
  {
    name: 'Vasant Kunj',
    city: 'Delhi',
    crimeScore: 25, lightingScore: 85, crowdScore: 80,
    type: 'low', incidentCount: 78, areaType: 'residential',
    geometry: { type: 'Polygon', coordinates: [[[77.148,28.535],[77.172,28.535],[77.172,28.518],[77.148,28.518],[77.148,28.535]]] }
  },
  {
    name: 'Mahipalpur',
    city: 'Delhi',
    crimeScore: 58, lightingScore: 55, crowdScore: 65,
    type: 'medium', incidentCount: 312, areaType: 'mixed',
    geometry: { type: 'Polygon', coordinates: [[[77.118,28.548],[77.142,28.548],[77.142,28.532],[77.118,28.532],[77.118,28.548]]] }
  },

  // ── NORTHEAST / HIGH RISK ZONES ──────────────────────────────────
  {
    name: 'Bhajanpura',
    city: 'Delhi',
    crimeScore: 80, lightingScore: 32, crowdScore: 65,
    type: 'high', incidentCount: 578, areaType: 'residential',
    geometry: { type: 'Polygon', coordinates: [[[77.268,28.702],[77.290,28.702],[77.290,28.688],[77.268,28.688],[77.268,28.702]]] }
  },
  {
    name: 'Mustafabad',
    city: 'Delhi',
    crimeScore: 85, lightingScore: 28, crowdScore: 60,
    type: 'high', incidentCount: 645, areaType: 'residential',
    geometry: { type: 'Polygon', coordinates: [[[77.288,28.718],[77.312,28.718],[77.312,28.702],[77.288,28.702],[77.288,28.718]]] }
  },
  {
    name: 'Seelampur',
    city: 'Delhi',
    crimeScore: 82, lightingScore: 30, crowdScore: 68,
    type: 'high', incidentCount: 612, areaType: 'residential',
    geometry: { type: 'Polygon', coordinates: [[[77.262,28.688],[77.282,28.688],[77.282,28.675],[77.262,28.675],[77.262,28.688]]] }
  },
  {
    name: 'Okhla Industrial Area',
    city: 'Delhi',
    crimeScore: 78, lightingScore: 28, crowdScore: 35,
    type: 'high', incidentCount: 498, areaType: 'industrial',
    geometry: { type: 'Polygon', coordinates: [[[77.282,28.535],[77.308,28.535],[77.308,28.515],[77.282,28.515],[77.282,28.535]]] }
  },
  {
    name: 'Trilokpuri',
    city: 'Delhi',
    crimeScore: 76, lightingScore: 38, crowdScore: 62,
    type: 'high', incidentCount: 534, areaType: 'residential',
    geometry: { type: 'Polygon', coordinates: [[[77.308,28.605],[77.328,28.605],[77.328,28.592],[77.308,28.592],[77.308,28.605]]] }
  },

  // ── KNOWN SAFE ZONES ─────────────────────────────────────────────
  {
    name: 'India Gate - Rajpath',
    city: 'Delhi',
    crimeScore: 15, lightingScore: 98, crowdScore: 92,
    type: 'low', incidentCount: 28, areaType: 'public',
    geometry: { type: 'Polygon', coordinates: [[[77.225,28.618],[77.245,28.618],[77.245,28.608],[77.225,28.608],[77.225,28.618]]] }
  },
  {
    name: 'Lutyens Delhi',
    city: 'Delhi',
    crimeScore: 12, lightingScore: 98, crowdScore: 70,
    type: 'low', incidentCount: 18, areaType: 'government',
    geometry: { type: 'Polygon', coordinates: [[[77.195,28.622],[77.225,28.622],[77.225,28.600],[77.195,28.600],[77.195,28.622]]] }
  },
  {
    name: 'Vasant Vihar',
    city: 'Delhi',
    crimeScore: 20, lightingScore: 90, crowdScore: 78,
    type: 'low', incidentCount: 52, areaType: 'residential',
    geometry: { type: 'Polygon', coordinates: [[[77.155,28.558],[77.178,28.558],[77.178,28.542],[77.155,28.542],[77.155,28.558]]] }
  },
  {
    name: 'Defence Colony',
    city: 'Delhi',
    crimeScore: 18, lightingScore: 88, crowdScore: 80,
    type: 'low', incidentCount: 45, areaType: 'residential',
    geometry: { type: 'Polygon', coordinates: [[[77.232,28.572],[77.252,28.572],[77.252,28.558],[77.232,28.558],[77.232,28.572]]] }
  },
  {
    name: 'Khan Market',
    city: 'Delhi',
    crimeScore: 22, lightingScore: 92, crowdScore: 92,
    type: 'low', incidentCount: 56, areaType: 'commercial',
    geometry: { type: 'Polygon', coordinates: [[[77.228,28.598],[77.245,28.598],[77.245,28.588],[77.228,28.588],[77.228,28.598]]] }
  }
];

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing crime zones
    await CrimeZone.deleteMany({ city: 'Delhi' });
    console.log('Cleared old Delhi crime zones');

    // Insert all zones
    const inserted = await CrimeZone.insertMany(delhiCrimeZones);
    console.log(`✅ Inserted ${inserted.length} Delhi crime zones`);

    // Verify 2dsphere index exists
    await CrimeZone.collection.createIndex({ geometry: '2dsphere' });
    console.log('✅ 2dsphere index confirmed');

    // Summary stats
    const high = delhiCrimeZones.filter(z => z.type === 'high').length;
    const med  = delhiCrimeZones.filter(z => z.type === 'medium').length;
    const low  = delhiCrimeZones.filter(z => z.type === 'low').length;
    console.log(`\n📊 Delhi Crime Zone Summary:`);
    console.log(`   🔴 High risk zones:   ${high}`);
    console.log(`   🟠 Medium risk zones: ${med}`);
    console.log(`   🟢 Safe zones:        ${low}`);
    console.log('\n🏆 Safelle Delhi dataset ready for demo!');

    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err);
    process.exit(1);
  }
};

seedDatabase();
