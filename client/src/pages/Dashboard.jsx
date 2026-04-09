import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useJourney } from '../context/JourneyContext';
import Navbar from '../components/Navbar';
import SOSButton from '../components/SOSButton';
import api from '../services/api';

const SAFETY_TIPS = [
  "Share your live location with a trusted contact before every journey.",
  "Always stick to well-lit and busy routes, especially after dark.",
  "Keep your phone charged above 30% before heading out.",
  "Trust your instincts — if something feels wrong, trigger SOS immediately.",
  "Add at least 3 emergency contacts for faster help during emergencies.",
  "Rate routes after your journey to help other women stay safe.",
  "Enable high-accuracy GPS for the most precise tracking.",
  "Walk facing traffic so you can see approaching vehicles."
];

const Dashboard = () => {
  const { user } = useAuth();
  const { activeJourney, fetchActiveJourney } = useJourney();
  const navigate = useNavigate();
  const [journeyHistory, setJourneyHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tip] = useState(SAFETY_TIPS[Math.floor(Math.random() * SAFETY_TIPS.length)]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      await fetchActiveJourney();
      const res = await api.get('/api/journey/history');
      setJourneyHistory(res.data.journeys || []);
    } catch (err) {
      console.error('Dashboard load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const firstName = user?.fullName?.split(' ')[0] || 'User';

  return (
    <div className="page-container">
      <Navbar />
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '96px 24px 40px' }}>
        {/* Greeting */}
        <div className="animate-fadeSlideUp" style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 4 }}>
            {getGreeting()}, {firstName} 👋
          </h1>
          <p style={{ color: '#585F6C', fontSize: 16 }}>Stay safe out there. Here's your safety dashboard.</p>
        </div>

        {/* Quick Actions */}
        <div className="animate-fadeSlideUp delay-100" style={{
          display: 'grid', gridTemplateColumns: activeJourney ? '1fr 1fr' : '1fr', gap: 16, marginBottom: 24
        }}>
          <button
            className="btn btn-accent btn-lg btn-block"
            onClick={() => navigate('/route-planner')}
            id="plan-journey-btn"
            style={{
              fontSize: 18, padding: '24px 32px',
              background: 'linear-gradient(135deg, #FF6B00, #e55d00)',
              borderRadius: 20, boxShadow: '0 8px 30px rgba(255,107,0,0.3)'
            }}
          >
            🗺️ Plan New Journey
          </button>

          {activeJourney && (
            <button
              className="btn btn-success btn-lg btn-block"
              onClick={() => navigate('/journey/active')}
              style={{ fontSize: 18, padding: '24px 32px', borderRadius: 20 }}
            >
              📍 Continue Active Journey
            </button>
          )}
        </div>

        {/* Active Journey Card */}
        {activeJourney && (
          <div className="card animate-fadeSlideUp delay-200" style={{
            marginBottom: 24, border: '2px solid #22C55E',
            background: 'linear-gradient(135deg, #f0fdf4, white)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 12 }}>
              <div>
                <span className="badge badge-success">🟢 Active Journey</span>
                <h3 style={{ fontSize: 18, fontWeight: 700, marginTop: 8 }}>
                  {activeJourney.source?.name || 'Source'} → {activeJourney.destination?.name || 'Destination'}
                </h3>
              </div>
              <div style={{
                padding: '8px 14px', borderRadius: 12,
                background: '#22C55E', color: 'white', fontWeight: 700, fontSize: 14
              }}>
                Score: {activeJourney.safetyScore || '--'}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 16, fontSize: 13, color: '#585F6C' }}>
              <span>Status: {activeJourney.status}</span>
              <span>Route: {activeJourney.selectedRoute}</span>
              <span>Started: {new Date(activeJourney.startedAt).toLocaleTimeString()}</span>
            </div>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20, marginBottom: 24 }}>
          {/* Recent Journeys */}
          <div className="card animate-fadeSlideUp delay-200">
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Recent Journeys</h3>
            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[1, 2, 3].map(i => (
                  <div key={i} className="skeleton" style={{ height: 60, borderRadius: 12 }} />
                ))}
              </div>
            ) : journeyHistory.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px 0', color: '#585F6C' }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>🗺️</div>
                <p>No journeys yet. Plan your first safe route!</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {journeyHistory.slice(0, 5).map(j => (
                  <div key={j._id} className="card-flat" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>
                        {j.source?.name || 'Location'} → {j.destination?.name || 'Destination'}
                      </div>
                      <div style={{ fontSize: 12, color: '#585F6C', marginTop: 2 }}>
                        {new Date(j.startedAt).toLocaleDateString()} · {j.selectedRoute} route
                      </div>
                    </div>
                    <span className={`badge ${j.status === 'completed' ? 'badge-success' : j.status === 'sos' ? 'badge-danger' : 'badge-warning'}`}>
                      {j.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Safety Tip */}
          <div className="animate-fadeSlideUp delay-300">
            <div className="card" style={{
              background: 'linear-gradient(135deg, #0A0A0A, #1a1a2e)',
              color: 'white', marginBottom: 16
            }}>
              <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, opacity: 0.6, marginBottom: 10 }}>
                💡 Safety Tip of the Day
              </div>
              <p style={{ fontSize: 15, lineHeight: 1.6, opacity: 0.9 }}>{tip}</p>
            </div>

            <div className="card">
              <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Quick Links</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <Link to="/loved-ones" style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 12px', borderRadius: 10,
                  background: '#f8f9fb', fontSize: 14, fontWeight: 500,
                  transition: 'all 0.2s'
                }}>
                  <span>👥</span> Manage Contacts
                </Link>
                <Link to="/community-ratings" style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 12px', borderRadius: 10,
                  background: '#f8f9fb', fontSize: 14, fontWeight: 500
                }}>
                  <span>⭐</span> Community Ratings
                </Link>
                <Link to="/profile" style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 12px', borderRadius: 10,
                  background: '#f8f9fb', fontSize: 14, fontWeight: 500
                }}>
                  <span>⚙️</span> Profile Settings
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <SOSButton />

      <style>{`
        @media (max-width: 768px) {
          div[style*="grid-template-columns: 2fr 1fr"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
