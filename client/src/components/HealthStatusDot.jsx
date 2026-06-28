import { useState, useEffect } from 'react';
import api from '../services/api';

const STATUS_COLORS = { healthy: '#22C55E', degraded: '#FF6B00', down: '#EF4444' };

const HealthStatusDot = () => {
  const [status, setStatus] = useState('healthy');

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await api.get('/api/health/status');
        setStatus(res.data.overall);
      } catch {
        setStatus('down');
      }
    };
    fetchStatus();
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      title={`System status: ${status}`}
      style={{
        width: 10, height: 10, borderRadius: '50%',
        backgroundColor: STATUS_COLORS[status],
        display: 'inline-block',
        boxShadow: `0 0 0 3px ${STATUS_COLORS[status]}20`,
        animation: status !== 'healthy' ? 'healthDotPulse 2s infinite' : 'none'
      }}
    />
  );
};

export default HealthStatusDot;
