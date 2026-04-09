const JourneyControls = ({ status, onPause, onResume, onEnd, onSOS, loading }) => {
  return (
    <div style={{
      display: 'flex', gap: 10, alignItems: 'center', justifyContent: 'center',
      flexWrap: 'wrap'
    }}>
      {status === 'active' ? (
        <button
          className="btn btn-outline"
          onClick={onPause}
          disabled={loading}
          id="pause-journey-btn"
          style={{ flex: 1, minWidth: 100 }}
        >
          ⏸ Pause
        </button>
      ) : status === 'paused' ? (
        <button
          className="btn btn-success"
          onClick={onResume}
          disabled={loading}
          id="resume-journey-btn"
          style={{ flex: 1, minWidth: 100 }}
        >
          ▶ Resume
        </button>
      ) : null}

      <button
        className="btn btn-primary"
        onClick={onEnd}
        disabled={loading}
        id="end-journey-btn"
        style={{ flex: 1, minWidth: 100 }}
      >
        ⬛ End Journey
      </button>

      <button
        className="btn btn-danger"
        onClick={onSOS}
        id="journey-sos-btn"
        style={{
          flex: 1, minWidth: 100,
          animation: 'pulse 2s ease-in-out infinite',
          boxShadow: '0 4px 20px rgba(220,38,38,0.3)'
        }}
      >
        🚨 SOS
      </button>
    </div>
  );
};

export default JourneyControls;
