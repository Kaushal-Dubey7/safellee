import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useJourney } from '../context/JourneyContext';
import { useSOS } from '../context/SOSContext';
import useGeolocation from '../hooks/useGeolocation';
import useSocket from '../hooks/useSocket';
import useDeadManSwitch from '../hooks/useDeadManSwitch';
import useDeviation from '../hooks/useDeviation';
import { fetchNearbyPOIs } from '../services/poiService';
import { vibrateDeviation, vibrateCheckin } from '../utils/vibrate';
import { formatDistance, formatDuration } from '../utils/geoUtils';
import MapView from '../components/MapView';
import JourneyControls from '../components/JourneyControls';
import LiveTracker from '../components/LiveTracker';
import SafetyScoreCard from '../components/SafetyScoreCard';
import AlertBanner from '../components/AlertBanner';
import RouteRating from '../components/RouteRating';

const ActiveJourney = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    activeJourney, fetchActiveJourney,
    updateLocation, pauseJourney, resumeJourney, endJourney,
    routes, selectedRoute
  } = useJourney();
  const { activateSOS } = useSOS();
  const { connect, disconnect, emit, on, off } = useSocket();

  const [pois, setPois] = useState([]);
  const [alert, setAlert] = useState(null);
  const [showCheckinModal, setShowCheckinModal] = useState(false);
  const [checkinCountdown, setCheckinCountdown] = useState(0);
  const [showRating, setShowRating] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [controlLoading, setControlLoading] = useState(false);
  const lastPOIFetchRef = useRef(null);
  const timerRef = useRef(null);

  const journey = activeJourney;
  const routeCoords = routes?.[selectedRoute]?.coordinates || [];

  const handlePositionUpdate = useCallback((pos) => {
    if (!journey?._id) return;
    updateLocation(journey._id, pos.lat, pos.lng);
    emit('location:send', {
      journeyId: journey._id,
      lat: pos.lat,
      lng: pos.lng,
      heading: 0
    });

    // Fetch POIs every 500m
    if (!lastPOIFetchRef.current || getDistMoved(lastPOIFetchRef.current, pos) > 500) {
      fetchNearbyPOIs(pos.lat, pos.lng).then(data => {
        const all = [
          ...(data.hospital || []).map(p => ({ ...p, type: 'hospital' })),
          ...(data.pharmacy || []).map(p => ({ ...p, type: 'pharmacy' })),
          ...(data.police || []).map(p => ({ ...p, type: 'police' }))
        ];
        setPois(all);
      });
      lastPOIFetchRef.current = pos;
    }
  }, [journey, emit, updateLocation]);

  const getDistMoved = (prev, curr) => {
    if (!prev) return Infinity;
    const R = 6371000;
    const dLat = (curr.lat - prev.lat) * Math.PI / 180;
    const dLng = (curr.lng - prev.lng) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(prev.lat * Math.PI / 180) * Math.cos(curr.lat * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  const { position, heading } = useGeolocation({
    enableTracking: journey?.status === 'active',
    onPositionUpdate: handlePositionUpdate
  });

  const { isDeviated, checkDeviation } = useDeviation({
    routeCoords,
    threshold: 50,
    enabled: journey?.status === 'active',
    onDeviate: () => {
      vibrateDeviation();
      setAlert({ message: "You've left your safe route!", type: 'danger' });
    }
  });

  const { showCheckin, countdown, confirmSafe, resetTimers } = useDeadManSwitch({
    enabled: journey?.status === 'active',
    checkinMinutes: 5,
    sosMinutes: 10,
    onCheckin: () => {
      vibrateCheckin();
      setShowCheckinModal(true);
    },
    onSOS: () => {
      if (position) {
        activateSOS(position, journey?._id);
        navigate('/sos');
      }
    }
  });

  // Check deviation on position update
  useEffect(() => {
    if (position && journey?.status === 'active') {
      checkDeviation(position.lat, position.lng);
    }
  }, [position, journey?.status, checkDeviation]);

  // Elapsed time timer
  useEffect(() => {
    if (journey?.status === 'active' && journey?.startedAt) {
      timerRef.current = setInterval(() => {
        setElapsedTime(Math.round((Date.now() - new Date(journey.startedAt).getTime()) / 1000));
      }, 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [journey?.status, journey?.startedAt]);

  // Socket setup
  useEffect(() => {
    if (!journey?._id) return;
    const socket = connect();
    emit('journey:join', journey._id);

    on('journey:checkin', () => {
      vibrateCheckin();
      setShowCheckinModal(true);
    });

    on('journey:sos', (data) => {
      activateSOS(position || { lat: 28.6139, lng: 77.2090 }, journey._id);
      navigate('/sos');
    });

    on('journey:deviation', (data) => {
      vibrateDeviation();
      setAlert({ message: data.message, type: 'danger' });
    });

    return () => {
      emit('journey:leave', journey._id);
      off('journey:checkin');
      off('journey:sos');
      off('journey:deviation');
    };
  }, [journey?._id]);

  // Initial load
  useEffect(() => {
    if (!journey) {
      fetchActiveJourney().then(j => {
        if (!j) navigate('/route-planner');
      });
    }
    if (position) {
      fetchNearbyPOIs(position.lat, position.lng).then(data => {
        const all = [
          ...(data.hospital || []).map(p => ({ ...p, type: 'hospital' })),
          ...(data.pharmacy || []).map(p => ({ ...p, type: 'pharmacy' })),
          ...(data.police || []).map(p => ({ ...p, type: 'police' }))
        ];
        setPois(all);
        lastPOIFetchRef.current = position;
      });
    }
  }, []);

  const handlePause = async () => {
    setControlLoading(true);
    await pauseJourney(journey._id);
    setControlLoading(false);
  };

  const handleResume = async () => {
    setControlLoading(true);
    await resumeJourney(journey._id);
    resetTimers();
    setControlLoading(false);
  };

  const handleEnd = async () => {
    setControlLoading(true);
    await endJourney(journey._id);
    disconnect();
    setShowRating(true);
    setControlLoading(false);
  };

  const handleSOS = async () => {
    const loc = position || { lat: 28.6139, lng: 77.2090 };
    await activateSOS(loc, journey?._id);
    navigate('/sos');
  };

  const handleConfirmSafe = () => {
    setShowCheckinModal(false);
    confirmSafe();
    emit('journey:confirm_safe', journey?._id);
  };

  if (showRating) {
    return (
      <div className="page-container" style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24
      }}>
        <RouteRating journeyData={journey} onClose={() => navigate('/dashboard')} />
      </div>
    );
  }

  if (!journey) {
    return (
      <div className="loading-overlay">
        <div className="loading-spinner" />
        <p style={{ color: '#585F6C' }}>Loading journey...</p>
      </div>
    );
  }

  const mapCenter = position ? [position.lat, position.lng]
    : [journey.source.coordinates.lat, journey.source.coordinates.lng];

  return (
    <div style={{ height: '100dvh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      {/* Alerts */}
      {alert && (
        <AlertBanner
          message={alert.message}
          type={alert.type}
          onClose={() => setAlert(null)}
          action={isDeviated ? { label: 'Recalculate', onClick: () => navigate('/route-planner') } : undefined}
        />
      )}

      {/* Top bar */}
      <div style={{
        position: 'absolute', top: 16, left: 16, right: 16, zIndex: 1000,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
      }}>
        <SafetyScoreCard score={journey.safetyScore || 75} compact />
        <div style={{
          background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(10px)',
          padding: '8px 16px', borderRadius: 12,
          fontSize: 14, fontWeight: 600, boxShadow: '0 2px 12px rgba(0,0,0,0.1)'
        }}>
          ⏱ {formatDuration(elapsedTime)}
        </div>
      </div>

      {/* Full screen map */}
      <div style={{ flex: 1 }}>
        <MapView
          center={mapCenter}
          zoom={16}
          routes={routes}
          selectedRouteKey={selectedRoute}
          livePosition={position}
          pois={pois}
          showSource={{ lat: journey.source.coordinates.lat, lng: journey.source.coordinates.lng, name: journey.source.name }}
          showDest={{ lat: journey.destination.coordinates.lat, lng: journey.destination.coordinates.lng, name: journey.destination.name }}
          height="100%"
          followUser={true}
          className=""
        />
      </div>

      {/* Bottom sheet */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 1000,
        background: 'white', borderRadius: '24px 24px 0 0',
        boxShadow: '0 -4px 20px rgba(0,0,0,0.1)',
        padding: '20px 20px 32px'
      }}>
        <div style={{
          width: 40, height: 4, borderRadius: 2, background: '#ddd',
          margin: '0 auto 16px'
        }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8, fontSize: 15, fontWeight: 700,
              color: isDeviated ? '#dc2626' : '#15803d'
            }}>
              {isDeviated ? '⚠ Route Deviation' : '✓ On Safe Route'}
            </div>
            <div style={{ fontSize: 13, color: '#585F6C', marginTop: 2 }}>
              {journey.destination.name || 'Destination'}
            </div>
          </div>
          <LiveTracker position={position} heading={heading} />
        </div>

        <JourneyControls
          status={journey.status}
          onPause={handlePause}
          onResume={handleResume}
          onEnd={handleEnd}
          onSOS={handleSOS}
          loading={controlLoading}
        />
      </div>

      {/* Checkin Modal */}
      {showCheckinModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>⏰</div>
            <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>Are you okay?</h2>
            <p style={{ color: '#585F6C', marginBottom: 8 }}>
              We haven't received your location for 5 minutes.
            </p>
            <p style={{ color: '#dc2626', fontWeight: 700, fontSize: 20, marginBottom: 24 }}>
              Auto SOS in {countdown}s
            </p>
            <button
              className="btn btn-success btn-block btn-lg"
              onClick={handleConfirmSafe}
              style={{ fontSize: 20, padding: '20px 32px' }}
            >
              ✓ I'm Safe
            </button>
          </div>
        </div>
      )}

      {/* Fixed SOS */}
      <div style={{
        position: 'absolute', bottom: 160, right: 20, zIndex: 1001
      }}>
        <button
          className="sos-button"
          onClick={handleSOS}
          style={{ width: 64, height: 64, fontSize: 14 }}
        >
          SOS
        </button>
      </div>
    </div>
  );
};

export default ActiveJourney;
