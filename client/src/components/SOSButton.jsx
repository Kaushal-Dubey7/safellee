import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSOS } from '../context/SOSContext';
import { useJourney } from '../context/JourneyContext';
import useGeolocation from '../hooks/useGeolocation';

const SOSButton = ({ size = 72, showLabel = true }) => {
  const navigate = useNavigate();
  const { activateSOS } = useSOS();
  const { activeJourney } = useJourney();
  const { getCurrentPosition } = useGeolocation();
  const [pressing, setPressing] = useState(false);

  const handleSOS = useCallback(async () => {
    try {
      let location;
      try {
        location = await getCurrentPosition();
      } catch {
        location = { lat: 28.6139, lng: 77.2090 };
      }

      await activateSOS(location, activeJourney?._id);
      navigate('/sos');
    } catch (err) {
      console.error('SOS error:', err);
      navigate('/sos');
    }
  }, [activateSOS, activeJourney, getCurrentPosition, navigate]);

  return (
    <div style={{ position: 'fixed', bottom: 32, right: 32, zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="sos-pulse" style={{
        position: 'absolute', width: size + 20, height: size + 20, borderRadius: '50%',
        background: '#FF6B00', pointerEvents: 'none'
      }}></div>
      <button
        onClick={handleSOS}
        onMouseDown={() => setPressing(true)}
        onMouseUp={() => setPressing(false)}
        onTouchStart={() => setPressing(true)}
        onTouchEnd={() => setPressing(false)}
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #f81a01ff, #fa1500ff)',
          color: 'white',
          border: 'none',
          cursor: 'pointer',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 8px 30px rgba(255,107,0,0.5)',
          transform: pressing ? 'scale(0.9)' : 'scale(1)',
          transition: 'transform 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
          zIndex: 2
        }}
        aria-label="Emergency SOS"
        id="sos-trigger-button"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width={size * 0.5} height={size * 0.5} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2v20" /><path d="M4 8l16 8" /><path d="M4 16l16-8" />
        </svg>
      </button>
    </div>
  );
};

export default SOSButton;
