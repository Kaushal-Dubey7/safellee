import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
    <div style={{ background: '#f9f9f9', minHeight: '100vh', paddingBottom: 60 }}>
      <Navbar />
      <div style={{ maxWidth: 1100, margin: '0 auto', paddingTop: 120, paddingLeft: 24, paddingRight: 24 }}>
        
        {/* Active Journey Warning (Preserved Logic) */}
        {activeJourney && (
          <div style={{ background: '#fff7ed', border: '2px solid #FF6B00', borderRadius: 16, padding: 24, marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 20, fontWeight: 700, margin: '0 0 8px', color: '#FF6B00' }}>Active Journey in Progress</h3>
              <p style={{ margin: 0, color: '#5a4136', fontSize: 14 }}>{activeJourney.source?.name} → {activeJourney.destination?.name}</p>
            </div>
            <button onClick={() => navigate('/journey/active')} style={{ padding: '12px 24px', background: '#FF6B00', color: 'white', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer' }}>
              Resume Tracking
            </button>
          </div>
        )}

        <div className="dashboard-top-row" style={{ display: 'grid', gap: 24, marginBottom: 40 }}>
          
          {/* HERO CARD */}
          <div className="soft-shadow soft-shadow-hover" style={{ background: 'white', borderRadius: 16, padding: '48px 40px', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ position: 'relative', zIndex: 2 }}>
              <p className="animate-entrance" style={{ fontSize: 18, fontWeight: 600, color: '#5f5e5e', margin: '0 0 8px' }}>
                Hii {firstName},
              </p>
              <h1 className="animate-entrance delay-100" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 48, fontWeight: 800, color: '#FF6B00', margin: '0 0 16px', lineHeight: 1.1 }}>
                Plan New Journey
              </h1>
              <div className="animate-entrance delay-200">
                <p style={{ fontSize: 16, color: '#5a4136', margin: '0 0 32px', lineHeight: 1.5, maxWidth: 300 }}>
                  Choose your destination and let Safelle guide you safely.
                </p>
                
                <button
                  onClick={() => navigate('/route-planner')}
                  className="plan-journey-btn"
                  style={{
                    background: '#1a1c1c', color: 'white', padding: '16px 28px',
                    borderRadius: 8, border: 'none', fontWeight: 600, fontSize: 15,
                    display: 'inline-flex', alignItems: 'center', gap: 12, cursor: 'pointer'
                  }}
                >
                  <svg className="plan-btn-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14.106 5.553a2 2 0 0 0 1.788 0l3.659-1.83A1 1 0 0 1 21 4.619v12.764a1 1 0 0 1-.553.894l-4.553 2.277a2 2 0 0 1-1.788 0l-4.212-2.106a2 2 0 0 0-1.788 0l-3.659 1.83A1 1 0 0 1 3 19.381V6.618a1 1 0 0 1 .553-.894l4.553-2.277a2 2 0 0 1 1.788 0z"/><path d="M15 5.764v15"/><path d="M9 3.236v15"/>
                  </svg>
                  Make Plan Your Journey
                </button>
              </div>
            </div>
            
            {/* SVG Map Path */}
            <div className="hero-svg-wrapper" style={{ position: 'absolute', right: 40, top: '50%', transform: 'translateY(-50%)', width: '40%', height: '100%', pointerEvents: 'none' }}>
              <svg viewBox="0 0 200 150" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                <path className="route-dash-path" d="M20 100 C 60 120, 70 30, 110 50 S 160 30, 180 20" fill="none" stroke="#22C55E" strokeWidth="2" strokeLinecap="round" />
                <circle cx="20" cy="100" r="12" fill="#ffeadd" />
                <svg x="10" y="80" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FF6B00" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/></svg>
                
                <g className="pin-float">
                  <circle cx="180" cy="20" r="12" fill="white" />
                  <svg x="170" y="0" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FF6B00" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/></svg>
                </g>
              </svg>
            </div>
          </div>

          {/* RECENT JOURNEY CARD */}
          <div className="soft-shadow soft-shadow-hover animate-entrance delay-300" style={{ background: 'white', borderRadius: 16, padding: '32px', display: 'flex', flexDirection: 'column' }}>
            <h2 style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 24, fontWeight: 700, margin: '0 0 24px', color: '#1a1c1c' }}>
              Recent Journey
            </h2>
            {loading ? (
              <p>Loading...</p>
            ) : journeyHistory.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'start' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1a1c1c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 2 }}>
                    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                  </svg>
                  <p style={{ margin: 0, fontSize: 15, color: '#1a1c1c', fontWeight: 600, lineHeight: 1.5 }}>
                    {journeyHistory[0].source?.name} → {journeyHistory[0].destination?.name}
                  </p>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#5f5e5e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/>
                    </svg>
                    <span style={{ fontSize: 14, color: '#5f5e5e', fontWeight: 500 }}>
                      {new Date(journeyHistory[0].startedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <span style={{
                    padding: '4px 12px', borderRadius: 100, fontSize: 12, fontWeight: 700,
                    background: journeyHistory[0].status === 'sos' ? '#fef2f2' : journeyHistory[0].safetyScore < 40 ? '#fef2f2' : journeyHistory[0].safetyScore < 70 ? '#fff7ed' : '#dcfce7',
                    color: journeyHistory[0].status === 'sos' ? '#dc2626' : journeyHistory[0].safetyScore < 40 ? '#dc2626' : journeyHistory[0].safetyScore < 70 ? '#c2410c' : '#15803d'
                  }}>
                    <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: 'currentColor', marginRight: 6, marginBottom: 1 }} />
                    {journeyHistory[0].status === 'sos' ? 'SOS Triggered' : journeyHistory[0].safetyScore < 40 ? 'Risky Route' : journeyHistory[0].safetyScore < 70 ? 'Moderate Route' : 'Safe Route'}
                  </span>
                </div>
              </div>
            ) : (
              <p style={{ color: '#5f5e5e', margin: 0 }}>No journeys yet — plan your first safe journey above</p>
            )}
          </div>
        </div>

        {/* QUICK LINKS */}
        <div className="animate-entrance delay-400">
          <h2 style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 28, fontWeight: 800, margin: '0 0 24px', color: '#1a1c1c' }}>
            Quick Links
          </h2>
          
          <div className="quick-links-grid" style={{ display: 'grid', gap: 24 }}>
            
            <div className="soft-shadow soft-shadow-hover" style={{ background: 'white', borderRadius: 16, padding: 32, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#1a1c1c', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              </div>
              <h3 style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 18, fontWeight: 700, margin: '0 0 12px' }}>1. Manage Contacts</h3>
              <p style={{ color: '#5f5e5e', fontSize: 14, margin: '0 0 24px', lineHeight: 1.5, flex: 1 }}>
                Add, edit or remove your emergency contacts for quick access.
              </p>
              <button onClick={() => navigate('/loved-ones')} className="quick-link-btn" style={{ width: '100%', padding: '14px 0', background: 'transparent', border: '2px solid #1a1c1c', borderRadius: 8, fontWeight: 600, cursor: 'pointer', color: '#1a1c1c' }}>
                Manage Contacts
              </button>
            </div>

            <div className="soft-shadow soft-shadow-hover" style={{ background: 'white', borderRadius: 16, padding: 32, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#1a1c1c', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              </div>
              <h3 style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 18, fontWeight: 700, margin: '0 0 12px' }}>2. Community Ratings</h3>
              <p style={{ color: '#5f5e5e', fontSize: 14, margin: '0 0 24px', lineHeight: 1.5, flex: 1 }}>
                Share your experience and contribute safety ratings to help other users make informed journeys.
              </p>
              <button onClick={() => navigate('/community-ratings')} className="quick-link-btn" style={{ width: '100%', padding: '14px 0', background: 'transparent', border: '2px solid #1a1c1c', borderRadius: 8, fontWeight: 600, cursor: 'pointer', color: '#1a1c1c' }}>
                Give Ratings
              </button>
            </div>

            <div className="soft-shadow soft-shadow-hover" style={{ background: 'white', borderRadius: 16, padding: 32, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#1a1c1c', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
              </div>
              <h3 style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 18, fontWeight: 700, margin: '0 0 12px' }}>3. Profile Settings</h3>
              <p style={{ color: '#5f5e5e', fontSize: 14, margin: '0 0 24px', lineHeight: 1.5, flex: 1 }}>
                Update your profile and preferences to personalize your experience.
              </p>
              <button onClick={() => navigate('/profile')} className="quick-link-btn" style={{ width: '100%', padding: '14px 0', background: 'transparent', border: '2px solid #1a1c1c', borderRadius: 8, fontWeight: 600, cursor: 'pointer', color: '#1a1c1c' }}>
                Profile Settings
              </button>
            </div>
          </div>
        </div>
      </div>

      <SOSButton />

      <style>{`
        .plan-journey-btn { transition: transform 0.15s cubic-bezier(0.4, 0, 0.2, 1); }
        .plan-journey-btn:hover { transform: scale(0.95); }
        .plan-journey-btn:active { transform: scale(0.90); }
        .plan-journey-btn:hover .plan-btn-icon { transform: rotate(12deg); }
        .plan-btn-icon { transition: transform 0.15s cubic-bezier(0.4, 0, 0.2, 1); }

        .quick-link-btn { transition: all 0.3s ease; }
        .quick-link-btn:hover { background: #1a1c1c !important; color: white !important; }

        .dashboard-top-row {
          grid-template-columns: 7fr 3fr;
        }
        .quick-links-grid {
          grid-template-columns: repeat(3, 1fr);
        }
        @media (max-width: 900px) {
          .dashboard-top-row { grid-template-columns: 1fr; }
          .hero-svg-wrapper { display: none; }
          .dashboard-top-row > div:first-child > div { max-width: 100% !important; }
        }
        @media (max-width: 768px) {
          .quick-links-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
