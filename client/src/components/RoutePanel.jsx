import { getScoreColor, getScoreLabel } from '../utils/safetyScore';
import { formatDistance, formatDuration } from '../utils/geoUtils';

const RoutePanel = ({ routes, selectedRoute, onSelectRoute, onStartJourney, loading }) => {
  if (!routes) return null;

  const routeEntries = [
    { key: 'safe', data: routes.safe, label: 'Route A', color: '#22C55E' },
    { key: 'medium', data: routes.medium, label: 'Route B', color: '#FF6B00' },
    { key: 'risky', data: routes.risky, label: 'Route C', color: '#EF4444' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>Available Routes</h3>

      {routeEntries.map(({ key, data, label, color }) => {
        if (!data) return null;
        const isSelected = selectedRoute === key;

        return (
          <div
            key={key}
            className={`route-card ${key} ${isSelected ? 'active' : ''}`}
            onClick={() => onSelectRoute(key)}
            style={{ borderColor: isSelected ? color : undefined }}
          >
            <div className="route-score">
              <div className={`score-circle ${key}`}>
                {data.score}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontWeight: 700, fontSize: 16 }}>{label}</span>
                  {key === 'safe' && (
                    <span className="badge badge-success" style={{ fontSize: 10 }}>RECOMMENDED</span>
                  )}
                </div>
                <div style={{ fontSize: 13, color: '#585F6C', marginTop: 2 }}>
                  {formatDistance(data.distance)} · {formatDuration(data.duration)}
                </div>
              </div>
              <div style={{
                width: 24, height: 24, borderRadius: '50%',
                border: `2px solid ${isSelected ? color : '#ddd'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                {isSelected && (
                  <div style={{ width: 14, height: 14, borderRadius: '50%', background: color }} />
                )}
              </div>
            </div>

            {/* Score breakdown */}
            {data.breakdown && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginTop: 8 }}>
                {[
                  { label: 'Crime Safety', value: data.breakdown.crime, weight: '35%' },
                  { label: 'Lighting', value: data.breakdown.lighting, weight: '25%' },
                  { label: 'Crowd Level', value: data.breakdown.crowd, weight: '20%' },
                  { label: 'Weather', value: data.breakdown.weather, weight: '10%' }
                ].map(item => (
                  <div key={item.label} style={{ fontSize: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                      <span style={{ color: '#585F6C' }}>{item.label}</span>
                      <span style={{ fontWeight: 600 }}>{item.value}</span>
                    </div>
                    <div className="progress-bar">
                      <div
                        className="progress-bar-fill"
                        style={{
                          width: `${item.value}%`,
                          background: getScoreColor(item.value)
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}

      {routes.weather && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '10px 14px', background: '#f0f9ff', borderRadius: 12,
          fontSize: 13, color: '#1e40af'
        }}>
          <span>🌤</span>
          <span>{routes.weather.main} · {routes.weather.temp}°C</span>
        </div>
      )}

      <button
        className="btn btn-primary btn-block btn-lg"
        onClick={onStartJourney}
        disabled={loading}
        id="start-journey-button"
        style={{ marginTop: 8 }}
      >
        {loading ? (
          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div className="loading-spinner" style={{ width: 20, height: 20, borderWidth: 2 }} />
            Starting...
          </span>
        ) : (
          '🛡️ Start Journey'
        )}
      </button>
    </div>
  );
};

export default RoutePanel;
