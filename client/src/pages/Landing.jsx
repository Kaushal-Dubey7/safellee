import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';

const Landing = () => {
  return (
    <div className="page-container" style={{ background: '#F8F9FB' }}>
      <Navbar />

      {/* Hero Section */}
      <section style={{
        paddingTop: 120, paddingBottom: 80,
        maxWidth: 1200, margin: '0 auto', padding: '120px 24px 80px',
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60,
        alignItems: 'center', minHeight: '100vh'
      }}>
        {/* Left: Text */}
        <div className="animate-fadeSlideUp">
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '6px 16px', borderRadius: 100,
            background: '#dcfce7', color: '#15803d',
            fontSize: 13, fontWeight: 600, marginBottom: 24
          }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22C55E' }} />
            Your Safety, Our Priority
          </div>

          <h1 style={{
            fontSize: 'clamp(40px, 6vw, 84px)',
            fontWeight: 900, lineHeight: 0.95,
            letterSpacing: '-0.04em', color: '#000',
            marginBottom: 24
          }}>
            Navigate
            <br />
            <span style={{ color: '#FF6B00' }}>Safely</span>,
            <br />
            Always.
          </h1>

          <p style={{
            fontSize: 18, color: '#585F6C', lineHeight: 1.7,
            maxWidth: 440, marginBottom: 40
          }}>
            Safelle analyzes crime data, street lighting, crowd density, and weather conditions to find the safest route for your journey. Real-time tracking with instant SOS alerts keeps you protected every step of the way.
          </p>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Link to="/register" className="btn btn-primary btn-lg" id="hero-get-started">
              Get Started — It's Free
            </Link>
            <Link to="/login" className="btn btn-outline btn-lg" id="hero-login">
              I have an account
            </Link>
          </div>

          {/* Trust indicators */}
          <div style={{
            display: 'flex', gap: 32, marginTop: 48,
            borderTop: '1px solid #EDEDED', paddingTop: 32
          }}>
            {[
              { value: '10K+', label: 'Safe Journeys' },
              { value: '99.2%', label: 'Safety Score' },
              { value: '<3s', label: 'SOS Response' }
            ].map(stat => (
              <div key={stat.label}>
                <div style={{ fontSize: 28, fontWeight: 800, color: '#000' }}>{stat.value}</div>
                <div style={{ fontSize: 13, color: '#585F6C', marginTop: 2 }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Map Card */}
        <div className="animate-fadeSlideUp delay-200" style={{ position: 'relative' }}>
          <div style={{
            background: '#1a1a2e', borderRadius: 32,
            padding: 0, overflow: 'hidden',
            boxShadow: '0 24px 80px rgba(0,0,0,0.15)',
            position: 'relative', height: 500
          }}>
            {/* Map placeholder with animated elements */}
            <div style={{
              width: '100%', height: '100%',
              background: 'linear-gradient(135deg, #1a1a2e, #16213e)',
              position: 'relative', overflow: 'hidden'
            }}>
              {/* Grid lines */}
              <svg width="100%" height="100%" style={{ position: 'absolute', opacity: 0.1 }}>
                {Array.from({ length: 20 }).map((_, i) => (
                  <line key={`h${i}`} x1="0" y1={i * 25} x2="100%" y2={i * 25} stroke="white" strokeWidth="0.5" />
                ))}
                {Array.from({ length: 20 }).map((_, i) => (
                  <line key={`v${i}`} x1={i * 25} y1="0" x2={i * 25} y2="100%" stroke="white" strokeWidth="0.5" />
                ))}
              </svg>

              {/* Animated route path */}
              <svg width="100%" height="100%" style={{ position: 'absolute' }} viewBox="0 0 500 500">
                <path
                  d="M 80 400 C 120 300 180 250 220 200 S 320 150 380 120"
                  stroke="#22C55E"
                  strokeWidth="4"
                  fill="none"
                  strokeDasharray="8 4"
                  style={{ animation: 'dashOffset 3s linear infinite' }}
                />
                <path
                  d="M 80 400 C 140 350 200 280 260 220 S 350 170 380 120"
                  stroke="#FF6B00"
                  strokeWidth="3"
                  fill="none"
                  opacity="0.5"
                  strokeDasharray="6 4"
                />
                <path
                  d="M 80 400 C 160 380 240 320 300 260 S 370 180 380 120"
                  stroke="#EF4444"
                  strokeWidth="2"
                  fill="none"
                  opacity="0.4"
                  strokeDasharray="4 4"
                />

                {/* Start dot */}
                <circle cx="80" cy="400" r="8" fill="#22C55E" />
                <circle cx="80" cy="400" r="14" fill="none" stroke="#22C55E" strokeWidth="2" opacity="0.3">
                  <animate attributeName="r" values="14;22;14" dur="2s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.3;0;0.3" dur="2s" repeatCount="indefinite" />
                </circle>

                {/* End dot */}
                <circle cx="380" cy="120" r="8" fill="#FF6B00" />

                {/* Moving dot */}
                <circle r="6" fill="white">
                  <animateMotion
                    path="M 80 400 C 120 300 180 250 220 200 S 320 150 380 120"
                    dur="4s"
                    repeatCount="indefinite"
                  />
                </circle>
                <circle r="12" fill="none" stroke="white" strokeWidth="1.5" opacity="0.5">
                  <animateMotion
                    path="M 80 400 C 120 300 180 250 220 200 S 320 150 380 120"
                    dur="4s"
                    repeatCount="indefinite"
                  />
                  <animate attributeName="r" values="12;20;12" dur="1.5s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.5;0;0.5" dur="1.5s" repeatCount="indefinite" />
                </circle>
              </svg>

              {/* Floating cards */}
              <div className="animate-float" style={{
                position: 'absolute', top: 30, right: 30,
                background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)',
                borderRadius: 16, padding: '12px 18px',
                border: '1px solid rgba(255,255,255,0.2)',
                color: 'white'
              }}>
                <div style={{ fontSize: 11, opacity: 0.7, textTransform: 'uppercase', letterSpacing: 1 }}>Safety Score</div>
                <div style={{ fontSize: 28, fontWeight: 800, color: '#22C55E' }}>87<span style={{ fontSize: 14 }}>/100</span></div>
              </div>

              <div className="animate-float delay-300" style={{
                position: 'absolute', bottom: 80, left: 30,
                background: 'rgba(220,38,38,0.2)', backdropFilter: 'blur(10px)',
                borderRadius: 16, padding: '12px 18px',
                border: '1px solid rgba(220,38,38,0.3)',
                color: 'white', display: 'flex', alignItems: 'center', gap: 10
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: '50%', background: '#DC2626',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 800
                }}>SOS</div>
                <span style={{ fontSize: 13, fontWeight: 600 }}>SOS Ready</span>
              </div>

              <div className="animate-float delay-200" style={{
                position: 'absolute', bottom: 30, right: 30,
                background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)',
                borderRadius: 16, padding: '12px 18px',
                border: '1px solid rgba(255,255,255,0.15)',
                color: 'white'
              }}>
                <div style={{ fontSize: 11, opacity: 0.7 }}>Est. Time</div>
                <div style={{ fontSize: 20, fontWeight: 700 }}>8 minutes</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Strip */}
      <section style={{
        background: 'white', borderTop: '1px solid #EDEDED',
        padding: '80px 24px'
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <h2 style={{ fontSize: 36, fontWeight: 800, marginBottom: 16 }}>
              Your Safety Arsenal
            </h2>
            <p style={{ fontSize: 18, color: '#585F6C', maxWidth: 500, margin: '0 auto' }}>
              Every feature designed to keep you safe, every second of your journey.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
            {[
              {
                icon: '📍',
                title: 'Real-Time Tracking',
                desc: 'GPS-powered live tracking with automatic location sharing to your loved ones.',
                color: '#dcfce7'
              },
              {
                icon: '🚨',
                title: 'One-Tap SOS',
                desc: 'Instantly alert all emergency contacts via WhatsApp, SMS, and auto-call.',
                color: '#fef2f2'
              },
              {
                icon: '⚡',
                title: 'Smart Alerts',
                desc: 'Automatic check-in prompts and dead-man switch for hands-free protection.',
                color: '#fff7ed'
              },
              {
                icon: '🗺️',
                title: 'Safe Route Planner',
                desc: 'AI-scored routes based on crime data, lighting, crowds, and weather.',
                color: '#eff6ff'
              },
              {
                icon: '🏥',
                title: 'Nearby Safety Points',
                desc: 'Find hospitals, police stations, and pharmacies along your route.',
                color: '#f5f3ff'
              },
              {
                icon: '⭐',
                title: 'Community Ratings',
                desc: 'Rate and review routes to help build a safer world for all women.',
                color: '#fef9c3'
              }
            ].map((feature, i) => (
              <div
                key={feature.title}
                className="card animate-fadeSlideUp"
                style={{
                  animationDelay: `${i * 0.1}s`,
                  opacity: 0, animationFillMode: 'forwards'
                }}
              >
                <div style={{
                  width: 56, height: 56, borderRadius: 16,
                  background: feature.color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 28, marginBottom: 16
                }}>
                  {feature.icon}
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>
                  {feature.title}
                </h3>
                <p style={{ fontSize: 15, color: '#585F6C', lineHeight: 1.6 }}>
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA section */}
      <section style={{
        padding: '80px 24px',
        background: 'linear-gradient(135deg, #0A0A0A, #1a1a2e)',
        color: 'white', textAlign: 'center'
      }}>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <h2 style={{ fontSize: 40, fontWeight: 800, marginBottom: 16 }}>
            Start Your Safe Journey Today
          </h2>
          <p style={{ fontSize: 18, opacity: 0.7, marginBottom: 32 }}>
            Join thousands of women who trust Safelle for their daily commute.
          </p>
          <Link to="/register" className="btn btn-accent btn-lg" id="cta-get-started">
            Get Started — Free Forever
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        padding: '32px 24px', background: '#0A0A0A', color: 'rgba(255,255,255,0.5)',
        textAlign: 'center', fontSize: 13
      }}>
        <p>© 2024 Safelle — The Silent Guardian. Built for the safety of women everywhere.</p>
      </footer>

      <style>{`
        @media (max-width: 768px) {
          section:first-of-type > div:first-child {
            grid-template-columns: 1fr !important;
          }
          section:first-of-type > div:first-child > div:last-child {
            display: none;
          }
          section > div > div[style*="grid-template-columns: repeat(3"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Landing;
