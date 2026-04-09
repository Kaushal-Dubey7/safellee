import { getScoreColor, getScoreLabel, getScoreBg } from '../utils/safetyScore';

const SafetyScoreCard = ({ score, breakdown, compact = false }) => {
  const color = getScoreColor(score);
  const label = getScoreLabel(score);
  const bg = getScoreBg(score);

  if (compact) {
    return (
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 8,
        padding: '6px 14px', borderRadius: 100, background: bg,
        fontWeight: 700, fontSize: 14, color
      }}>
        <span style={{ fontSize: 18 }}>{score}</span>
        <span style={{ fontSize: 12, textTransform: 'uppercase' }}>{label}</span>
      </div>
    );
  }

  return (
    <div className="card" style={{ textAlign: 'center' }}>
      <div style={{
        width: 100, height: 100, borderRadius: '50%',
        background: `conic-gradient(${color} ${score * 3.6}deg, #eee ${score * 3.6}deg)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 16px'
      }}>
        <div style={{
          width: 76, height: 76, borderRadius: '50%', background: 'white',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
        }}>
          <span style={{ fontSize: 28, fontWeight: 800, color }}>{score}</span>
          <span style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', color: '#585F6C' }}>
            {label}
          </span>
        </div>
      </div>

      <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>Safety Score</h3>

      {breakdown && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, textAlign: 'left' }}>
          {[
            { label: 'Crime Safety', value: breakdown.crime },
            { label: 'Street Lighting', value: breakdown.lighting },
            { label: 'Crowd Level', value: breakdown.crowd },
            { label: 'Weather', value: breakdown.weather },
            { label: 'Community Rating', value: breakdown.community }
          ].map(item => (
            <div key={item.label}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                <span style={{ color: '#585F6C' }}>{item.label}</span>
                <span style={{ fontWeight: 600 }}>{item.value}/100</span>
              </div>
              <div className="progress-bar">
                <div
                  className="progress-bar-fill"
                  style={{ width: `${item.value}%`, background: getScoreColor(item.value) }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SafetyScoreCard;
