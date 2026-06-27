const RouteResultCard = ({ routeData, onStartJourney }) => {
  if (!routeData || !routeData.safe) return null;

  const route = routeData.safe;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>Your Safest Route</h3>
      
      <div className="route-result-card" style={{ borderColor: '#22C55E', borderWidth: '2px', borderStyle: 'solid', padding: '16px', borderRadius: '12px', background: 'white' }}>
        <div className="route-header" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className="score-circle" style={{ backgroundColor: '#22C55E', color: 'white', width: '48px', height: '48px', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: 'bold' }}>
            {route.safetyScore}
          </div>
          <div className="route-info" style={{ flex: 1 }}>
            <div className="route-name" style={{ fontWeight: 'bold', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              Safest Route Found
              <span className="badge" style={{ backgroundColor: '#22C55E', color: 'white', padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold' }}>
                RECOMMENDED
              </span>
            </div>
            <div className="route-meta" style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px' }}>
              {route.distanceKm} km · {route.durationMin} min
            </div>
          </div>
        </div>

        <div className="breakdown-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '16px' }}>
          {Object.entries(route.breakdown || {}).map(([key, val]) => (
            <div key={key} className="breakdown-item">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span className="metric-name" style={{ fontSize: '12px', color: '#6b7280' }}>
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                </span>
                <span className="metric-value" style={{ fontSize: '12px', fontWeight: 'bold' }}>{val}</span>
              </div>
              <div className="metric-bar" style={{ height: '4px', background: '#e5e7eb', borderRadius: '2px', overflow: 'hidden' }}>
                <div
                  className="metric-fill"
                  style={{
                    height: '100%',
                    width: `${val}%`,
                    backgroundColor: val >= 70 ? '#22C55E' : val >= 40 ? '#FF6B00' : '#EF4444'
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        <button
          className="start-journey-btn btn btn-primary btn-block btn-lg"
          onClick={() => onStartJourney(route)}
          style={{ marginTop: '16px', width: '100%' }}
        >
          🛡️ Start This Journey
        </button>
      </div>

      {routeData.weather && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '10px 14px', background: '#f0f9ff', borderRadius: 12,
          fontSize: 13, color: '#1e40af'
        }}>
          <span>🌤</span>
          <span>{routeData.weather.condition} · {routeData.weather.temp}°C</span>
        </div>
      )}
    </div>
  );
};

export default RouteResultCard;
