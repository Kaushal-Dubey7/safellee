import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSOS } from '../context/SOSContext';
import { useAuth } from '../context/AuthContext';

const SOSPage = () => {
  const navigate = useNavigate();
  const { sosActive, sosData, deactivateSOS } = useSOS();
  const { user } = useAuth();
  const [cancelProgress, setCancelProgress] = useState(0);
  const [cancelling, setCancelling] = useState(false);
  const cancelTimerRef = useRef(null);
  const cancelIntervalRef = useRef(null);

  const [actions, setActions] = useState([
    { id: 'contacts', label: 'Alerting your loved ones...', done: false },
    { id: 'location', label: 'Sending your location...', done: false },
    { id: 'police', label: 'Contacting nearest police station...', done: false }
  ]);

  useEffect(() => {
    const timers = [
      setTimeout(() => setActions(prev => prev.map(a => a.id === 'contacts' ? { ...a, done: true } : a)), 1500),
      setTimeout(() => setActions(prev => prev.map(a => a.id === 'location' ? { ...a, done: true } : a)), 3000),
      setTimeout(() => setActions(prev => prev.map(a => a.id === 'police' ? { ...a, done: true } : a)), 4500)
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  const handleCancelStart = () => {
    setCancelling(true);
    setCancelProgress(0);
    cancelIntervalRef.current = setInterval(() => {
      setCancelProgress(prev => {
        if (prev >= 100) {
          clearInterval(cancelIntervalRef.current);
          deactivateSOS();
          navigate('/dashboard');
          return 100;
        }
        return prev + (100 / 30);
      });
    }, 100);
  };

  const handleCancelEnd = () => {
    setCancelling(false);
    setCancelProgress(0);
    if (cancelIntervalRef.current) clearInterval(cancelIntervalRef.current);
  };

  const contacts = sosData?.contacts || [];
  const policeStation = sosData?.policeStation;
  const mapLink = sosData?.mapLink || '';

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a0000, #3d0000, #1a0000)',
      color: 'white',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background pulse */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(circle at center, rgba(220,38,38,0.15) 0%, transparent 70%)',
        animation: 'pulse 2s ease-in-out infinite'
      }} />

      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 480, textAlign: 'center' }}>
        {/* SOS icon */}
        <div className="animate-bounceIn" style={{
          width: 100, height: 100, borderRadius: '50%',
          background: '#DC2626', margin: '0 auto 24px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 36, fontWeight: 900,
          boxShadow: '0 0 60px rgba(220,38,38,0.5)',
          position: 'relative'
        }}>
          SOS
          <div style={{
            position: 'absolute', inset: -8, borderRadius: '50%',
            border: '2px solid rgba(220,38,38,0.5)',
            animation: 'sonar 2s ease-out infinite'
          }} />
          <div style={{
            position: 'absolute', inset: -8, borderRadius: '50%',
            border: '2px solid rgba(220,38,38,0.5)',
            animation: 'sonar 2s ease-out infinite 1s'
          }} />
        </div>

        <h1 style={{ fontSize: 32, fontWeight: 900, marginBottom: 8 }}>
          SOS ACTIVATED
        </h1>
        <p style={{ opacity: 0.7, marginBottom: 32, fontSize: 15 }}>
          Emergency protocols in progress
        </p>

        {/* Action items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32, textAlign: 'left' }}>
          {actions.map((action, i) => (
            <div
              key={action.id}
              className="animate-fadeSlideUp"
              style={{
                animationDelay: `${i * 0.3}s`,
                display: 'flex', alignItems: 'center', gap: 12,
                background: 'rgba(255,255,255,0.08)',
                borderRadius: 16, padding: '16px 20px',
                border: '1px solid rgba(255,255,255,0.1)'
              }}
            >
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                background: action.done ? '#22C55E' : 'rgba(255,255,255,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 16, transition: 'all 0.3s',
                flexShrink: 0
              }}>
                {action.done ? '✓' : (
                  <div className="loading-spinner" style={{
                    width: 16, height: 16, borderWidth: 2,
                    borderColor: 'rgba(255,255,255,0.2)', borderTopColor: 'white'
                  }} />
                )}
              </div>
              <span style={{ fontSize: 15, fontWeight: action.done ? 600 : 400, opacity: action.done ? 1 : 0.7 }}>
                {action.done ? action.label.replace('...', '') + ' ✓' : action.label}
              </span>
            </div>
          ))}
        </div>

        {/* Contacts notified */}
        {contacts.length > 0 && (
          <div style={{
            background: 'rgba(255,255,255,0.05)', borderRadius: 16,
            padding: 20, marginBottom: 24, textAlign: 'left'
          }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, opacity: 0.7, textTransform: 'uppercase', letterSpacing: 1 }}>
              Contacts Notified
            </h3>
            {contacts.map((c, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '8px 0', borderBottom: i < contacts.length - 1 ? '1px solid rgba(255,255,255,0.1)' : 'none'
              }}>
                <span style={{ fontWeight: 600 }}>{c.name}</span>
                <a
                  href={`tel:${c.phone}`}
                  style={{ color: '#22C55E', fontWeight: 600, fontSize: 13 }}
                >
                  📞 Call
                </a>
              </div>
            ))}
          </div>
        )}

        {/* Police station */}
        {policeStation && (
          <div style={{
            background: 'rgba(59,130,246,0.1)', borderRadius: 16,
            padding: 16, marginBottom: 24, textAlign: 'left',
            border: '1px solid rgba(59,130,246,0.2)'
          }}>
            <div style={{ fontSize: 13, fontWeight: 700, opacity: 0.7, marginBottom: 4 }}>
              👮 Nearest Police Station
            </div>
            <div style={{ fontWeight: 700, fontSize: 16 }}>{policeStation.name}</div>
            {policeStation.phone && (
              <a href={`tel:${policeStation.phone}`} style={{ color: '#60a5fa', fontSize: 14 }}>
                {policeStation.phone}
              </a>
            )}
          </div>
        )}

        {/* Emergency number */}
        <a
          href="tel:112"
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            background: 'white', color: '#DC2626',
            padding: '16px 32px', borderRadius: 16,
            fontWeight: 800, fontSize: 18, marginBottom: 16,
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
            textDecoration: 'none'
          }}
        >
          📞 Call Emergency 112
        </a>

        {/* Cancel button - requires 3 second hold */}
        <div style={{ position: 'relative', marginTop: 16 }}>
          <button
            onMouseDown={handleCancelStart}
            onMouseUp={handleCancelEnd}
            onMouseLeave={handleCancelEnd}
            onTouchStart={handleCancelStart}
            onTouchEnd={handleCancelEnd}
            style={{
              width: '100%', padding: '14px 24px',
              borderRadius: 12, border: '1px solid rgba(255,255,255,0.2)',
              background: cancelling ? `linear-gradient(90deg, rgba(255,255,255,0.15) ${cancelProgress}%, transparent ${cancelProgress}%)` : 'transparent',
              color: 'rgba(255,255,255,0.5)',
              fontSize: 14, fontWeight: 600,
              cursor: 'pointer', transition: 'all 0.2s'
            }}
          >
            {cancelling ? `Hold to cancel... ${Math.round(cancelProgress)}%` : 'Hold 3 seconds to Cancel SOS'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SOSPage;
