const POIMarkers = ({ pois = {} }) => {
  const allPois = [
    ...(pois.hospital || []).map(p => ({ ...p, type: 'hospital' })),
    ...(pois.pharmacy || []).map(p => ({ ...p, type: 'pharmacy' })),
    ...(pois.police || []).map(p => ({ ...p, type: 'police' }))
  ];

  if (allPois.length === 0) return null;

  return (
    <div style={{
      display: 'flex', flexWrap: 'wrap', gap: 8,
      padding: '8px 0'
    }}>
      {[
        { type: 'hospital', emoji: '🏥', label: 'Hospitals', color: '#fef2f2' },
        { type: 'pharmacy', emoji: '💊', label: 'Pharmacies', color: '#f5f3ff' },
        { type: 'police', emoji: '👮', label: 'Police', color: '#eff6ff' }
      ].map(cat => {
        const items = allPois.filter(p => p.type === cat.type);
        if (items.length === 0) return null;
        return (
          <div key={cat.type} style={{
            background: cat.color, borderRadius: 12, padding: '8px 12px',
            fontSize: 13, display: 'flex', alignItems: 'center', gap: 6
          }}>
            <span>{cat.emoji}</span>
            <span style={{ fontWeight: 600 }}>{items.length} {cat.label}</span>
          </div>
        );
      })}
    </div>
  );
};

export default POIMarkers;
