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
    <div className="sos-button-container">
      <button
        className="sos-button"
        onClick={handleSOS}
        onMouseDown={() => setPressing(true)}
        onMouseUp={() => setPressing(false)}
        onTouchStart={() => setPressing(true)}
        onTouchEnd={() => setPressing(false)}
        style={{
          width: size,
          height: size,
          transform: pressing ? 'scale(0.9)' : 'scale(1)',
          fontSize: size < 60 ? 12 : 16
        }}
        aria-label="Emergency SOS"
        id="sos-trigger-button"
      >
        SOS
      </button>
    </div>
  );
};

export default SOSButton;
