const getMetricColor = (value) => {
  if (value >= 70) return '#22C55E';  // green — safe/good
  if (value >= 40) return '#FF6B00';  // orange — moderate
  return '#EF4444';                   // red — risky/poor
};

const getWeatherLabel = (score) => {
  if (score >= 80) return { label: 'Good',   color: '#22C55E' };
  if (score >= 50) return { label: 'Normal', color: '#FF6B00' };
  return { label: 'Bad', color: '#EF4444' };
};

const RouteResultCard = ({ routeData, onStartJourney }) => {
  if (!routeData || !routeData.safe) return null;

  const route = routeData.safe;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>Your Safest Route</h3>
      
      <div 
        className="route-card-entrance soft-shadow soft-shadow-hover" 
        style={{ 
          borderColor: '#22C55E', borderWidth: '2px', borderStyle: 'solid', padding: '16px', borderRadius: '12px', background: 'white',
        }}
      >
        <div className="route-header" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className="score-circle-pop" style={{ backgroundColor: '#22C55E', color: 'white', width: '48px', height: '48px', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: 'bold' }}>
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
          {Object.entries(route.breakdown || {}).map(([key, val]) => {
            if (key === 'weather') return null;
            const color = getMetricColor(val);
            return (
              <div key={key} className="breakdown-item">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span className="metric-name" style={{ fontSize: '12px', color: '#6b7280', textTransform: 'capitalize' }}>
                    {key === 'crime' ? 'Crime Safety' :
                     key === 'lighting' ? 'Lighting' :
                     key === 'crowd' ? 'Crowd Level' :
                     key === 'efficiency' ? 'Route Efficiency' :
                     key === 'community' ? 'Community Rating' :
                     key}
                  </span>
                  <span className="metric-value" style={{ fontSize: '12px', fontWeight: 'bold', color: color }}>{val}</span>
                </div>
                <div className="metric-bar-track" style={{ width: '100%', height: '8px', background: '#f3f4f6', borderRadius: '9999px', overflow: 'hidden' }}>
                  <div
                    className="metric-bar-fill"
                    style={{
                      height: '100%',
                      width: `${val}%`,
                      backgroundColor: color,
                      borderRadius: '9999px',
                      transition: 'width 0.8s cubic-bezier(0.16, 1, 0.3, 1)'
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {route.breakdown?.weather !== undefined && (() => {
          const weatherObj = getWeatherLabel(route.breakdown.weather);
          return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderTop: '1px solid #f3f4f6', marginTop: '12px' }}>
              <span style={{ fontSize: '14px', color: '#4b5563' }}>Weather Condition</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {routeData.weather && (
                  <span style={{ fontSize: '12px', color: '#6b7280' }}>
                    {routeData.weather.condition} · {routeData.weather.temp}°C
                  </span>
                )}
                <span
                  style={{
                    fontSize: '12px', fontWeight: 'bold', padding: '2px 10px', borderRadius: '9999px',
                    backgroundColor: weatherObj.color + '1A', color: weatherObj.color
                  }}
                >
                  {weatherObj.label}
                </span>
              </div>
            </div>
          );
        })()}

        <button
          className="start-journey-btn btn btn-primary btn-block btn-lg"
          onClick={() => onStartJourney(route)}
          style={{ marginTop: '16px', width: '100%' }}
        >
          🛡️ Start This Journey
        </button>
      </div>
    </div>
  );
};

export default RouteResultCard;
