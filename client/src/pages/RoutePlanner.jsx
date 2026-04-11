import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useJourney } from '../context/JourneyContext';
import useGeolocation from '../hooks/useGeolocation';
import { fetchSafeRoutes, geocodeAddress, reverseGeocode } from '../services/routeService';
import Navbar from '../components/Navbar';
import MapView from '../components/MapView';
import RoutePanel from '../components/RoutePanel';
import SOSButton from '../components/SOSButton';

const RoutePlanner = () => {
  const navigate = useNavigate();
  const { setRoutes, routes, selectedRoute, setSelectedRoute, startJourney, loading } = useJourney();
  const { position, getCurrentPosition } = useGeolocation();

  const [source, setSource] = useState({ name: '', lat: null, lng: null });
  const [dest, setDest] = useState({ name: '', lat: null, lng: null });
  const [sourceQuery, setSourceQuery] = useState('');
  const [destQuery, setDestQuery] = useState('');
  const [sourceSuggestions, setSourceSuggestions] = useState([]);
  const [destSuggestions, setDestSuggestions] = useState([]);
  const [fetchingRoutes, setFetchingRoutes] = useState(false);
  const [error, setError] = useState('');
  const [mapCenter, setMapCenter] = useState([28.6139, 77.2090]);

  useEffect(() => {
    getCurrentPosition().then(pos => {
      setMapCenter([pos.lat, pos.lng]);
    }).catch(() => {});
  }, []);

  const useCurrentLocation = async (e) => {
    if (e) e.preventDefault();
    setError('');
    let pos = null;
    
    try {
      pos = await getCurrentPosition();
    } catch (err) {
      console.warn('Browser GPS failed, falling back to IP location...', err);
      try {
        const ipRes = await fetch('http://ip-api.com/json/');
        const ipData = await ipRes.json();
        if (ipData && ipData.status === 'success') {
          pos = { lat: ipData.lat, lng: ipData.lon };
        } else {
          throw new Error('IP Location failed');
        }
      } catch (fallbackErr) {
        setError('Could not get your location automatically. Please type it manually.');
        return;
      }
    }

    try {
      const name = await reverseGeocode(pos.lat, pos.lng);
      const shortName = name.split(',').slice(0, 3).join(', ');
      setSource({ name: shortName, lat: pos.lat, lng: pos.lng });
      setSourceQuery(shortName);
      setSourceSuggestions([]);
      setMapCenter([pos.lat, pos.lng]);
    } catch (err) {
      const fallbackName = `${pos.lat.toFixed(4)}, ${pos.lng.toFixed(4)}`;
      setSource({ name: fallbackName, lat: pos.lat, lng: pos.lng });
      setSourceQuery(fallbackName);
      setMapCenter([pos.lat, pos.lng]);
    }
  };

  const searchAddress = useCallback(async (query, setter) => {
    if (query.length < 3) { setter([]); return; }
    try {
      const results = await geocodeAddress(query);
      setter(results);
    } catch {
      setter([]);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => searchAddress(sourceQuery, setSourceSuggestions), 400);
    return () => clearTimeout(timer);
  }, [sourceQuery, searchAddress]);

  useEffect(() => {
    const timer = setTimeout(() => searchAddress(destQuery, setDestSuggestions), 400);
    return () => clearTimeout(timer);
  }, [destQuery, searchAddress]);

  const selectSource = (item) => {
    setSource({ name: item.display_name.split(',').slice(0, 3).join(','), lat: item.lat, lng: item.lng });
    setSourceQuery(item.display_name.split(',').slice(0, 3).join(','));
    setSourceSuggestions([]);
  };

  const selectDest = (item) => {
    setDest({ name: item.display_name.split(',').slice(0, 3).join(','), lat: item.lat, lng: item.lng });
    setDestQuery(item.display_name.split(',').slice(0, 3).join(','));
    setDestSuggestions([]);
  };

  const handleFindRoutes = async () => {
    if (!source.lat || !dest.lat) {
      setError('Please select both source and destination.');
      return;
    }
    setError('');
    setFetchingRoutes(true);
    try {
      const data = await fetchSafeRoutes(source.lat, source.lng, dest.lat, dest.lng);
      setRoutes(data);
      setSelectedRoute('safe');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to find routes. Please try again.');
    } finally {
      setFetchingRoutes(false);
    }
  };

  const handleStartJourney = async () => {
    if (!routes) return;
    try {
      const routeData = routes[selectedRoute];
      await startJourney({
        source: { name: source.name, coordinates: { lat: source.lat, lng: source.lng } },
        destination: { name: dest.name, coordinates: { lat: dest.lat, lng: dest.lng } },
        selectedRoute,
        safetyScore: routeData?.score || 0
      });
      navigate('/journey/active');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to start journey.');
    }
  };

  return (
    <div className="page-container">
      <Navbar />
      <div style={{
        maxWidth: 1200, margin: '0 auto',
        padding: '88px 24px 40px',
        display: 'grid', gridTemplateColumns: '380px 1fr', gap: 24,
        minHeight: '100vh'
      }}>
        {/* Left Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <h2 style={{ fontSize: 24, fontWeight: 800 }}>Plan Your Route</h2>

          {error && (
            <div style={{
              background: '#fef2f2', color: '#dc2626', padding: '10px 14px',
              borderRadius: 10, fontSize: 13, fontWeight: 500
            }}>
              {error}
            </div>
          )}

          {/* Source */}
          <div className="input-group" style={{ position: 'relative' }}>
            <label className="input-label">From</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                type="text"
                className="input-field"
                value={sourceQuery}
                onChange={(e) => { setSourceQuery(e.target.value); setSource({ ...source, lat: null, lng: null }); }}
                placeholder="Enter starting point"
                style={{ flex: 1 }}
                id="source-input"
              />
              <button
                className="btn btn-outline btn-sm"
                onClick={useCurrentLocation}
                title="Use current location"
                style={{ padding: '10px 14px', fontSize: 18 }}
              >
                📍
              </button>
            </div>
            {sourceSuggestions.length > 0 && (
              <div style={{
                position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 100,
                background: 'white', border: '1px solid #EDEDED', borderRadius: 10,
                boxShadow: '0 8px 24px rgba(0,0,0,0.1)', maxHeight: 200, overflow: 'auto'
              }}>
                {sourceSuggestions.map((s, i) => (
                  <div
                    key={i}
                    onClick={() => selectSource(s)}
                    style={{
                      padding: '10px 14px', cursor: 'pointer', fontSize: 13,
                      borderBottom: '1px solid #f5f5f5',
                      transition: 'background 0.2s'
                    }}
                    onMouseEnter={(e) => e.target.style.background = '#f8f9fb'}
                    onMouseLeave={(e) => e.target.style.background = 'white'}
                  >
                    📍 {s.display_name}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Destination */}
          <div className="input-group" style={{ position: 'relative' }}>
            <label className="input-label">To</label>
            <input
              type="text"
              className="input-field"
              value={destQuery}
              onChange={(e) => { setDestQuery(e.target.value); setDest({ ...dest, lat: null, lng: null }); }}
              placeholder="Enter destination"
              id="dest-input"
            />
            {destSuggestions.length > 0 && (
              <div style={{
                position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 100,
                background: 'white', border: '1px solid #EDEDED', borderRadius: 10,
                boxShadow: '0 8px 24px rgba(0,0,0,0.1)', maxHeight: 200, overflow: 'auto'
              }}>
                {destSuggestions.map((s, i) => (
                  <div
                    key={i}
                    onClick={() => selectDest(s)}
                    style={{
                      padding: '10px 14px', cursor: 'pointer', fontSize: 13,
                      borderBottom: '1px solid #f5f5f5'
                    }}
                    onMouseEnter={(e) => e.target.style.background = '#f8f9fb'}
                    onMouseLeave={(e) => e.target.style.background = 'white'}
                  >
                    📍 {s.display_name}
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            className="btn btn-primary btn-block"
            onClick={handleFindRoutes}
            disabled={!source.lat || !dest.lat || fetchingRoutes}
            id="find-routes-btn"
          >
            {fetchingRoutes ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
                <div className="loading-spinner" style={{ width: 20, height: 20, borderWidth: 2 }} />
                Analyzing routes...
              </span>
            ) : '🔍 Find Safe Routes'}
          </button>

          {/* Route panel */}
          <RoutePanel
            routes={routes}
            selectedRoute={selectedRoute}
            onSelectRoute={setSelectedRoute}
            onStartJourney={handleStartJourney}
            loading={loading}
          />
        </div>

        {/* Right: Map */}
        <div style={{ borderRadius: 32, overflow: 'hidden', position: 'sticky', top: 88, height: 'calc(100vh - 112px)' }}>
          <MapView
            center={mapCenter}
            zoom={13}
            routes={routes}
            selectedRouteKey={selectedRoute}
            showSource={source.lat ? source : null}
            showDest={dest.lat ? dest : null}
            height="100%"
          />
        </div>
      </div>

      <SOSButton />

      <style>{`
        @media (max-width: 768px) {
          div[style*="grid-template-columns: 380px"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

export default RoutePlanner;
