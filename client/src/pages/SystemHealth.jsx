import { useState, useEffect } from 'react';
import api from '../services/api';
import Navbar from '../components/Navbar';

const STATUS_COLORS = {
  healthy: '#22C55E',
  degraded: '#FF6B00',
  down: '#EF4444'
};

const STATUS_ICONS = {
  healthy: '✅',
  degraded: '⚠️',
  down: '❌'
};

const SERVICE_LABELS = {
  mongodb: 'MongoDB Database',
  osrm: 'OSRM Routing Engine',
  overpass: 'Overpass (OSM Data)',
  weather: 'OpenWeatherMap',
  nominatim: 'Nominatim Geocoder',
  mlService: 'ML Safety Model',
  twilio: 'Twilio (SOS Alerts)',
  socketio: 'Socket.IO Realtime',
  crimeData: 'Crime Zone Data'
};

const SystemHealth = () => {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchHealth = async () => {
    try {
      const res = await api.get('/api/health/status');
      setHealth(res.data);
    } catch (err) {
      console.error('Failed to fetch health status:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 15000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return (
    <div className="page-container">
      <Navbar />
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '100px 24px 40px' }}>
        <div style={{ textAlign: 'center', color: '#585F6C', fontSize: 15 }}>
          <div className="loading-spinner" style={{ margin: '0 auto 12px', width: 32, height: 32 }} />
          Loading system diagnostics...
        </div>
      </div>
    </div>
  );

  if (!health) return (
    <div className="page-container">
      <Navbar />
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '100px 24px 40px', textAlign: 'center', color: '#EF4444' }}>
        Unable to load health status. The server may be unreachable.
      </div>
    </div>
  );

  const healthyCount = Object.values(health.services).filter(s => s.status === 'healthy').length;
  const totalCount = Object.keys(health.services).length;

  return (
    <div className="page-container">
      <Navbar />
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '100px 24px 40px' }}>
        {/* Overall Status Header */}
        <div style={{
          background: health.overall === 'healthy' ? 'linear-gradient(135deg, #0D2818, #1A4D2E)' :
                      health.overall === 'degraded' ? 'linear-gradient(135deg, #3D2200, #5C3500)' :
                      'linear-gradient(135deg, #3D0000, #5C0000)',
          borderRadius: 20, padding: '32px 28px', marginBottom: 24, color: 'white'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 8 }}>
            <div style={{
              width: 18, height: 18, borderRadius: '50%',
              backgroundColor: STATUS_COLORS[health.overall],
              boxShadow: `0 0 12px ${STATUS_COLORS[health.overall]}80`,
              animation: health.overall !== 'healthy' ? 'pulse 2s infinite' : 'none'
            }} />
            <h1 style={{ fontSize: 28, fontWeight: 800, margin: 0 }}>
              System Status: {health.overall.toUpperCase()}
            </h1>
          </div>
          <p style={{ fontSize: 14, opacity: 0.7, margin: '8px 0 0' }}>
            {healthyCount}/{totalCount} services operational · Last checked: {new Date(health.lastChecked).toLocaleTimeString()}
          </p>
        </div>

        {/* Service Grid */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: 16
        }}>
          {Object.entries(health.services).map(([name, svc]) => (
            <div
              key={name}
              style={{
                background: 'white',
                border: `2px solid ${STATUS_COLORS[svc.status]}30`,
                borderRadius: 16, padding: '20px 18px',
                transition: 'transform 0.2s, box-shadow 0.2s',
                cursor: 'default'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = `0 8px 24px ${STATUS_COLORS[svc.status]}20`;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <span style={{ fontWeight: 700, fontSize: 14, color: '#1A1A2E' }}>
                  {SERVICE_LABELS[name] || name}
                </span>
                <span style={{
                  fontSize: 11, fontWeight: 700, padding: '4px 10px',
                  borderRadius: 20,
                  backgroundColor: STATUS_COLORS[svc.status] + '18',
                  color: STATUS_COLORS[svc.status]
                }}>
                  {STATUS_ICONS[svc.status]} {svc.status.toUpperCase()}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <span style={{ fontSize: 12, color: '#8B8FA3' }}>Response time:</span>
                <span style={{
                  fontSize: 12, fontWeight: 600,
                  color: svc.responseTimeMs > 2000 ? '#FF6B00' : '#585F6C'
                }}>
                  {svc.responseTimeMs}ms
                </span>
              </div>

              {svc.error && (
                <div style={{
                  fontSize: 12, color: '#EF4444', background: '#FEF2F2',
                  borderRadius: 8, padding: '8px 10px', marginTop: 6,
                  lineHeight: 1.4
                }}>
                  {svc.error}
                </div>
              )}

              {svc.meta && (
                <div style={{ fontSize: 11, color: '#8B8FA3', marginTop: 6 }}>
                  {svc.meta.connectedClients !== undefined && `${svc.meta.connectedClients} client(s) connected`}
                  {svc.meta.zoneCount !== undefined && `${svc.meta.zoneCount} crime zones loaded`}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div style={{
          display: 'flex', gap: 24, justifyContent: 'center',
          marginTop: 28, fontSize: 13, color: '#8B8FA3'
        }}>
          {Object.entries(STATUS_COLORS).map(([status, color]) => (
            <div key={status} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: color }} />
              <span style={{ textTransform: 'capitalize' }}>{status}</span>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
};

export default SystemHealth;
