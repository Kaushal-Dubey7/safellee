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

const prayagrajZones = [
  // ── PRAYAGRAJ SAFE ZONES ──────────────────────────────────────────
  {
    name: 'Civil Lines',
    city: 'Prayagraj',
    crimeScore: 22, lightingScore: 90, crowdScore: 88,
    type: 'low', incidentCount: 67, areaType: 'government',
    geometry: { type: 'Polygon', coordinates: [[[81.834,25.461],[81.858,25.461],[81.858,25.448],[81.834,25.448],[81.834,25.461]]] }
  },
  {
    name: 'Allahabad University Campus',
    city: 'Prayagraj',
    crimeScore: 20, lightingScore: 85, crowdScore: 90,
    type: 'low', incidentCount: 45, areaType: 'public',
    geometry: { type: 'Polygon', coordinates: [[[81.839,25.457],[81.852,25.457],[81.852,25.448],[81.839,25.448],[81.839,25.457]]] }
  },
  {
    name: 'George Town',
    city: 'Prayagraj',
    crimeScore: 35, lightingScore: 78, crowdScore: 85,
    type: 'low', incidentCount: 112, areaType: 'commercial',
    geometry: { type: 'Polygon', coordinates: [[[81.852,25.452],[81.868,25.452],[81.868,25.441],[81.852,25.441],[81.852,25.452]]] }
  },
  {
    name: 'Cantonment Area',
    city: 'Prayagraj',
    crimeScore: 18, lightingScore: 88, crowdScore: 72,
    type: 'low', incidentCount: 34, areaType: 'government',
    geometry: { type: 'Polygon', coordinates: [[[81.808,25.475],[81.830,25.475],[81.830,25.462],[81.808,25.462],[81.808,25.475]]] }
  },
  {
    name: 'Tagore Town',
    city: 'Prayagraj',
    crimeScore: 28, lightingScore: 82, crowdScore: 80,
    type: 'low', incidentCount: 78, areaType: 'residential',
    geometry: { type: 'Polygon', coordinates: [[[81.828,25.460],[81.842,25.460],[81.842,25.450],[81.828,25.450],[81.828,25.460]]] }
  },
  {
    name: 'Lukerganj',
    city: 'Prayagraj',
    crimeScore: 30, lightingScore: 80, crowdScore: 82,
    type: 'low', incidentCount: 89, areaType: 'residential',
    geometry: { type: 'Polygon', coordinates: [[[81.822,25.455],[81.836,25.455],[81.836,25.445],[81.822,25.445],[81.822,25.455]]] }
  },
  // ── PRAYAGRAJ MEDIUM RISK ZONES ───────────────────────────────────
  {
    name: 'Mumfordganj',
    city: 'Prayagraj',
    crimeScore: 52, lightingScore: 60, crowdScore: 75,
    type: 'medium', incidentCount: 245, areaType: 'mixed',
    geometry: { type: 'Polygon', coordinates: [[[81.842,25.462],[81.856,25.462],[81.856,25.452],[81.842,25.452],[81.842,25.462]]] }
  },
  {
    name: 'Katra',
    city: 'Prayagraj',
    crimeScore: 60, lightingScore: 55, crowdScore: 78,
    type: 'medium', incidentCount: 312, areaType: 'commercial',
    geometry: { type: 'Polygon', coordinates: [[[81.842,25.448],[81.858,25.448],[81.858,25.438],[81.842,25.438],[81.842,25.448]]] }
  },
  {
    name: 'Colonelganj',
    city: 'Prayagraj',
    crimeScore: 55, lightingScore: 62, crowdScore: 72,
    type: 'medium', incidentCount: 278, areaType: 'commercial',
    geometry: { type: 'Polygon', coordinates: [[[81.858,25.448],[81.872,25.448],[81.872,25.438],[81.858,25.438],[81.858,25.448]]] }
  },
  {
    name: 'Bahadurganj',
    city: 'Prayagraj',
    crimeScore: 58, lightingScore: 58, crowdScore: 80,
    type: 'medium', incidentCount: 298, areaType: 'commercial',
    geometry: { type: 'Polygon', coordinates: [[[81.862,25.455],[81.875,25.455],[81.875,25.445],[81.862,25.445],[81.862,25.455]]] }
  },
  {
    name: 'Rajapur',
    city: 'Prayagraj',
    crimeScore: 48, lightingScore: 65, crowdScore: 70,
    type: 'medium', incidentCount: 198, areaType: 'residential',
    geometry: { type: 'Polygon', coordinates: [[[81.790,25.452],[81.808,25.452],[81.808,25.440],[81.790,25.440],[81.790,25.452]]] }
  },
  {
    name: 'Mahewa',
    city: 'Prayagraj',
    crimeScore: 62, lightingScore: 48, crowdScore: 65,
    type: 'medium', incidentCount: 334, areaType: 'residential',
    geometry: { type: 'Polygon', coordinates: [[[81.820,25.432],[81.838,25.432],[81.838,25.420],[81.820,25.420],[81.820,25.432]]] }
  },
  {
    name: 'Salori',
    city: 'Prayagraj',
    crimeScore: 55, lightingScore: 55, crowdScore: 68,
    type: 'medium', incidentCount: 267, areaType: 'residential',
    geometry: { type: 'Polygon', coordinates: [[[81.860,25.440],[81.876,25.440],[81.876,25.428],[81.860,25.428],[81.860,25.440]]] }
  },
  {
    name: 'Kareli',
    city: 'Prayagraj',
    crimeScore: 65, lightingScore: 45, crowdScore: 62,
    type: 'medium', incidentCount: 389, areaType: 'mixed',
    geometry: { type: 'Polygon', coordinates: [[[81.800,25.462],[81.818,25.462],[81.818,25.450],[81.800,25.450],[81.800,25.462]]] }
  },
  {
    name: 'Daraganj',
    city: 'Prayagraj',
    crimeScore: 50, lightingScore: 62, crowdScore: 72,
    type: 'medium', incidentCount: 223, areaType: 'residential',
    geometry: { type: 'Polygon', coordinates: [[[81.868,25.438],[81.884,25.438],[81.884,25.426],[81.868,25.426],[81.868,25.438]]] }
  },
  {
    name: 'Jhunsi',
    city: 'Prayagraj',
    crimeScore: 58, lightingScore: 50, crowdScore: 60,
    type: 'medium', incidentCount: 289, areaType: 'residential',
    geometry: { type: 'Polygon', coordinates: [[[81.900,25.432],[81.922,25.432],[81.922,25.418],[81.900,25.418],[81.900,25.432]]] }
  },
  {
    name: 'Naini Industrial',
    city: 'Prayagraj',
    crimeScore: 68, lightingScore: 38, crowdScore: 45,
    type: 'medium', incidentCount: 423, areaType: 'industrial',
    geometry: { type: 'Polygon', coordinates: [[[81.880,25.402],[81.905,25.402],[81.905,25.386],[81.880,25.386],[81.880,25.402]]] }
  },
  // ── PRAYAGRAJ HIGH RISK ZONES ─────────────────────────────────────
  {
    name: 'Atala',
    city: 'Prayagraj',
    crimeScore: 78, lightingScore: 35, crowdScore: 68,
    type: 'high', incidentCount: 534, areaType: 'mixed',
    geometry: { type: 'Polygon', coordinates: [[[81.872,25.458],[81.888,25.458],[81.888,25.446],[81.872,25.446],[81.872,25.458]]] }
  },
  {
    name: 'Chak',
    city: 'Prayagraj',
    crimeScore: 80, lightingScore: 30, crowdScore: 62,
    type: 'high', incidentCount: 589, areaType: 'residential',
    geometry: { type: 'Polygon', coordinates: [[[81.888,25.450],[81.906,25.450],[81.906,25.438],[81.888,25.438],[81.888,25.450]]] }
  },
  {
    name: 'Phaphamau',
    city: 'Prayagraj',
    crimeScore: 72, lightingScore: 38, crowdScore: 58,
    type: 'high', incidentCount: 467, areaType: 'residential',
    geometry: { type: 'Polygon', coordinates: [[[81.858,25.482],[81.878,25.482],[81.878,25.468],[81.858,25.468],[81.858,25.482]]] }
  },
  {
    name: 'Shivkuti',
    city: 'Prayagraj',
    crimeScore: 75, lightingScore: 32, crowdScore: 55,
    type: 'high', incidentCount: 512, areaType: 'residential',
    geometry: { type: 'Polygon', coordinates: [[[81.888,25.468],[81.908,25.468],[81.908,25.455],[81.888,25.455],[81.888,25.468]]] }
  },
  {
    name: 'Dariyabad',
    city: 'Prayagraj',
    crimeScore: 82, lightingScore: 28, crowdScore: 60,
    type: 'high', incidentCount: 623, areaType: 'residential',
    geometry: { type: 'Polygon', coordinates: [[[81.838,25.428],[81.858,25.428],[81.858,25.415],[81.838,25.415],[81.838,25.428]]] }
  },
  {
    name: 'Baharia',
    city: 'Prayagraj',
    crimeScore: 76, lightingScore: 35, crowdScore: 52,
    type: 'high', incidentCount: 498, areaType: 'mixed',
    geometry: { type: 'Polygon', coordinates: [[[81.780,25.442],[81.800,25.442],[81.800,25.430],[81.780,25.430],[81.780,25.442]]] }
  },
  {
    name: 'Soraon',
    city: 'Prayagraj',
    crimeScore: 70, lightingScore: 35, crowdScore: 48,
    type: 'high', incidentCount: 445, areaType: 'residential',
    geometry: { type: 'Polygon', coordinates: [[[81.838,25.510],[81.862,25.510],[81.862,25.494],[81.838,25.494],[81.838,25.510]]] }
  },
  {
    name: 'Bamrauli',
    city: 'Prayagraj',
    crimeScore: 68, lightingScore: 40, crowdScore: 50,
    type: 'medium', incidentCount: 398, areaType: 'mixed',
    geometry: { type: 'Polygon', coordinates: [[[81.748,25.452],[81.772,25.452],[81.772,25.438],[81.748,25.438],[81.748,25.452]]] }
  },
  {
    name: 'Arail',
    city: 'Prayagraj',
    crimeScore: 62, lightingScore: 42, crowdScore: 55,
    type: 'medium', incidentCount: 356, areaType: 'residential',
    geometry: { type: 'Polygon', coordinates: [[[81.878,25.422],[81.898,25.422],[81.898,25.408],[81.878,25.408],[81.878,25.422]]] }
  },
  {
    name: 'Nain (Naini Crossing)',
    city: 'Prayagraj',
    crimeScore: 58, lightingScore: 50, crowdScore: 62,
    type: 'medium', incidentCount: 312, areaType: 'mixed',
    geometry: { type: 'Polygon', coordinates: [[[81.898,25.412],[81.918,25.412],[81.918,25.398],[81.898,25.398],[81.898,25.412]]] }
  },
  {
    name: 'Shankargarh',
    city: 'Prayagraj',
    crimeScore: 72, lightingScore: 28, crowdScore: 40,
    type: 'high', incidentCount: 478, areaType: 'residential',
    geometry: { type: 'Polygon', coordinates: [[[81.692,25.298],[81.718,25.298],[81.718,25.280],[81.692,25.280],[81.692,25.298]]] }
  },
];

const aligarhZones = [
  // ── ALIGARH SAFE ZONES ────────────────────────────────────────────
  {
    name: 'AMU Campus',
    city: 'Aligarh',
    crimeScore: 15, lightingScore: 92, crowdScore: 92,
    type: 'low', incidentCount: 28, areaType: 'public',
    geometry: { type: 'Polygon', coordinates: [[[78.058,27.918],[78.080,27.918],[78.080,27.904],[78.058,27.904],[78.058,27.918]]] }
  },
  {
    name: 'Civil Lines Aligarh',
    city: 'Aligarh',
    crimeScore: 22, lightingScore: 88, crowdScore: 85,
    type: 'low', incidentCount: 56, areaType: 'government',
    geometry: { type: 'Polygon', coordinates: [[[78.070,27.898],[78.090,27.898],[78.090,27.886],[78.070,27.886],[78.070,27.898]]] }
  },
  {
    name: 'Ramghat Road',
    city: 'Aligarh',
    crimeScore: 30, lightingScore: 80, crowdScore: 82,
    type: 'low', incidentCount: 89, areaType: 'commercial',
    geometry: { type: 'Polygon', coordinates: [[[78.068,27.888],[78.085,27.888],[78.085,27.878],[78.068,27.878],[78.068,27.888]]] }
  },
  {
    name: 'Marris Road',
    city: 'Aligarh',
    crimeScore: 28, lightingScore: 82, crowdScore: 80,
    type: 'low', incidentCount: 72, areaType: 'commercial',
    geometry: { type: 'Polygon', coordinates: [[[78.076,27.882],[78.092,27.882],[78.092,27.872],[78.076,27.872],[78.076,27.882]]] }
  },
  {
    name: 'Sarai Rawat',
    city: 'Aligarh',
    crimeScore: 32, lightingScore: 78, crowdScore: 78,
    type: 'low', incidentCount: 96, areaType: 'residential',
    geometry: { type: 'Polygon', coordinates: [[[78.082,27.878],[78.098,27.878],[78.098,27.866],[78.082,27.866],[78.082,27.878]]] }
  },
  {
    name: 'Dodhpur',
    city: 'Aligarh',
    crimeScore: 25, lightingScore: 85, crowdScore: 80,
    type: 'low', incidentCount: 65, areaType: 'residential',
    geometry: { type: 'Polygon', coordinates: [[[78.048,27.898],[78.065,27.898],[78.065,27.886],[78.048,27.886],[78.048,27.898]]] }
  },
  // ── ALIGARH MEDIUM RISK ZONES ─────────────────────────────────────
  {
    name: 'Upper Fort',
    city: 'Aligarh',
    crimeScore: 55, lightingScore: 60, crowdScore: 75,
    type: 'medium', incidentCount: 267, areaType: 'mixed',
    geometry: { type: 'Polygon', coordinates: [[[78.040,27.892],[78.058,27.892],[78.058,27.880],[78.040,27.880],[78.040,27.892]]] }
  },
  {
    name: 'Kwarsi',
    city: 'Aligarh',
    crimeScore: 58, lightingScore: 55, crowdScore: 70,
    type: 'medium', incidentCount: 298, areaType: 'residential',
    geometry: { type: 'Polygon', coordinates: [[[78.020,27.892],[78.040,27.892],[78.040,27.878],[78.020,27.878],[78.020,27.892]]] }
  },
  {
    name: 'Jamalpur',
    city: 'Aligarh',
    crimeScore: 60, lightingScore: 52, crowdScore: 68,
    type: 'medium', incidentCount: 334, areaType: 'mixed',
    geometry: { type: 'Polygon', coordinates: [[[78.076,27.870],[78.095,27.870],[78.095,27.858],[78.076,27.858],[78.076,27.870]]] }
  },
  {
    name: 'Bannadevi',
    city: 'Aligarh',
    crimeScore: 62, lightingScore: 50, crowdScore: 72,
    type: 'medium', incidentCount: 356, areaType: 'commercial',
    geometry: { type: 'Polygon', coordinates: [[[78.085,27.895],[78.102,27.895],[78.102,27.882],[78.085,27.882],[78.085,27.895]]] }
  },
  {
    name: 'Mahav Nagar',
    city: 'Aligarh',
    crimeScore: 50, lightingScore: 65, crowdScore: 74,
    type: 'medium', incidentCount: 223, areaType: 'residential',
    geometry: { type: 'Polygon', coordinates: [[[78.092,27.870],[78.110,27.870],[78.110,27.858],[78.092,27.858],[78.092,27.870]]] }
  },
  {
    name: 'Atrauli Road',
    city: 'Aligarh',
    crimeScore: 55, lightingScore: 55, crowdScore: 65,
    type: 'medium', incidentCount: 278, areaType: 'mixed',
    geometry: { type: 'Polygon', coordinates: [[[78.068,27.920],[78.090,27.920],[78.090,27.906],[78.068,27.906],[78.068,27.920]]] }
  },
  {
    name: 'Dhorra Mafi',
    city: 'Aligarh',
    crimeScore: 65, lightingScore: 42, crowdScore: 58,
    type: 'medium', incidentCount: 389, areaType: 'residential',
    geometry: { type: 'Polygon', coordinates: [[[78.030,27.908],[78.052,27.908],[78.052,27.894],[78.030,27.894],[78.030,27.908]]] }
  },
  {
    name: 'Masudabad',
    city: 'Aligarh',
    crimeScore: 60, lightingScore: 48, crowdScore: 62,
    type: 'medium', incidentCount: 312, areaType: 'residential',
    geometry: { type: 'Polygon', coordinates: [[[78.048,27.880],[78.068,27.880],[78.068,27.866],[78.048,27.866],[78.048,27.880]]] }
  },
  {
    name: 'Aligarh Railway Station Area',
    city: 'Aligarh',
    crimeScore: 65, lightingScore: 65, crowdScore: 85,
    type: 'medium', incidentCount: 423, areaType: 'commercial',
    geometry: { type: 'Polygon', coordinates: [[[78.080,27.906],[78.098,27.906],[78.098,27.894],[78.080,27.894],[78.080,27.906]]] }
  },
  // ── ALIGARH HIGH RISK ZONES ───────────────────────────────────────
  {
    name: 'Quarsi',
    city: 'Aligarh',
    crimeScore: 78, lightingScore: 30, crowdScore: 60,
    type: 'high', incidentCount: 534, areaType: 'residential',
    geometry: { type: 'Polygon', coordinates: [[[78.002,27.888],[78.022,27.888],[78.022,27.874],[78.002,27.874],[78.002,27.888]]] }
  },
  {
    name: 'Lodha',
    city: 'Aligarh',
    crimeScore: 80, lightingScore: 28, crowdScore: 58,
    type: 'high', incidentCount: 589, areaType: 'residential',
    geometry: { type: 'Polygon', coordinates: [[[78.098,27.880],[78.118,27.880],[78.118,27.866],[78.098,27.866],[78.098,27.880]]] }
  },
  {
    name: 'Haathras Road Industrial',
    city: 'Aligarh',
    crimeScore: 75, lightingScore: 30, crowdScore: 42,
    type: 'high', incidentCount: 498, areaType: 'industrial',
    geometry: { type: 'Polygon', coordinates: [[[78.118,27.882],[78.140,27.882],[78.140,27.866],[78.118,27.866],[78.118,27.882]]] }
  },
  {
    name: 'Achnera Road',
    city: 'Aligarh',
    crimeScore: 72, lightingScore: 32, crowdScore: 50,
    type: 'high', incidentCount: 467, areaType: 'mixed',
    geometry: { type: 'Polygon', coordinates: [[[78.020,27.874],[78.040,27.874],[78.040,27.860],[78.020,27.860],[78.020,27.874]]] }
  },
  {
    name: 'Tappal',
    city: 'Aligarh',
    crimeScore: 70, lightingScore: 28, crowdScore: 40,
    type: 'high', incidentCount: 445, areaType: 'residential',
    geometry: { type: 'Polygon', coordinates: [[[77.982,27.842],[78.008,27.842],[78.008,27.826],[77.982,27.826],[77.982,27.842]]] }
  },
  {
    name: 'Iglas',
    city: 'Aligarh',
    crimeScore: 68, lightingScore: 32, crowdScore: 45,
    type: 'high', incidentCount: 412, areaType: 'residential',
    geometry: { type: 'Polygon', coordinates: [[[77.956,27.722],[77.980,27.722],[77.980,27.706],[77.956,27.706],[77.956,27.722]]] }
  },
  {
    name: 'Khair',
    city: 'Aligarh',
    crimeScore: 66, lightingScore: 35, crowdScore: 48,
    type: 'high', incidentCount: 389, areaType: 'mixed',
    geometry: { type: 'Polygon', coordinates: [[[77.842,27.954],[77.868,27.954],[77.868,27.938],[77.842,27.938],[77.842,27.954]]] }
  },
  {
    name: 'Gabhana',
    city: 'Aligarh',
    crimeScore: 70, lightingScore: 28, crowdScore: 42,
    type: 'high', incidentCount: 434, areaType: 'residential',
    geometry: { type: 'Polygon', coordinates: [[[78.268,27.862],[78.292,27.862],[78.292,27.846],[78.268,27.846],[78.268,27.862]]] }
  },
];

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing crime zones (Delhi, Prayagraj, Aligarh)
    await CrimeZone.deleteMany({});
    console.log('Cleared all crime zones');

    // Insert all zones
    const allZones = [...delhiCrimeZones, ...prayagrajZones, ...aligarhZones];
    const inserted = await CrimeZone.insertMany(allZones);
    console.log(`✅ Inserted ${inserted.length} crime zones across all cities`);

    // Verify 2dsphere index exists
    await CrimeZone.collection.createIndex({ geometry: '2dsphere' });
    console.log('✅ 2dsphere index confirmed');

    // Print summary
    const cities = ['Delhi', 'Prayagraj', 'Aligarh'];
    for (const city of cities) {
      const zones = allZones.filter(z => z.city === city);
      const high  = zones.filter(z => z.type === 'high').length;
      const med   = zones.filter(z => z.type === 'medium').length;
      const low   = zones.filter(z => z.type === 'low').length;
      console.log(`\n${city}: ${zones.length} zones | 🔴 ${high} high | 🟠 ${med} medium | 🟢 ${low} safe`);
    }

    console.log('\n🏆 Safelle multi-city dataset ready for demo!');

    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err);
    process.exit(1);
  }
};

seedDatabase();
