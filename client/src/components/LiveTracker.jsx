const LiveTracker = ({ position, heading = 0 }) => {
  if (!position) return null;

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '8px 14px', background: '#f0fdf4', borderRadius: 12,
      fontSize: 13
    }}>
      <div style={{
        width: 12, height: 12, borderRadius: '50%',
        background: '#22C55E', boxShadow: '0 0 0 3px rgba(34,197,94,0.3)',
        animation: 'pulse 1.5s infinite'
      }} />
      <span style={{ fontWeight: 600, color: '#15803d' }}>Live Tracking Active</span>
      <span style={{ color: '#585F6C', marginLeft: 'auto', fontSize: 12 }}>
        {position.lat.toFixed(4)}, {position.lng.toFixed(4)}
      </span>
    </div>
  );
};

export default LiveTracker;
