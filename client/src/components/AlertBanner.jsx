import { useEffect, useState } from 'react';

const AlertBanner = ({ message, type = 'danger', duration = 5000, onClose, action }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setVisible(false);
        onClose?.();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  if (!visible) return null;

  return (
    <div className={`alert-banner ${type}`}>
      <span>{type === 'danger' ? '⚠️' : type === 'warning' ? '⚡' : '✅'}</span>
      <span style={{ flex: 1 }}>{message}</span>
      {action && (
        <button
          onClick={action.onClick}
          style={{
            background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white',
            padding: '6px 14px', borderRadius: 8, fontWeight: 600, fontSize: 13,
            cursor: 'pointer'
          }}
        >
          {action.label}
        </button>
      )}
      <button
        onClick={() => { setVisible(false); onClose?.(); }}
        style={{
          background: 'none', border: 'none', color: 'white',
          fontSize: 18, cursor: 'pointer', padding: '0 4px'
        }}
      >
        ✕
      </button>
    </div>
  );
};

export default AlertBanner;
