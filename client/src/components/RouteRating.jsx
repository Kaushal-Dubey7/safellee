import { useState } from 'react';
import api from '../services/api';

const LIKE_TAGS = ['Well-lit', 'Busy', 'Safe footpath', 'Good roads'];
const DISLIKE_TAGS = ['Dark stretch', 'Isolated', 'Suspicious activity', 'Poor lighting'];

const RouteRating = ({ journeyData, onClose }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [likes, setLikes] = useState([]);
  const [dislikes, setDislikes] = useState([]);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const toggleTag = (tag, list, setList) => {
    setList(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  const handleSubmit = async () => {
    if (rating === 0) return;
    setSubmitting(true);
    try {
      await api.post('/api/ratings', {
        routeId: `${journeyData?.source?.coordinates?.lat}-${journeyData?.destination?.coordinates?.lat}`,
        sourceCoords: journeyData?.source?.coordinates || { lat: 0, lng: 0 },
        destCoords: journeyData?.destination?.coordinates || { lat: 0, lng: 0 },
        rating,
        likes,
        dislikes,
        comment
      });
      setSubmitted(true);
      setTimeout(() => onClose?.(), 2000);
    } catch (err) {
      console.error('Rating submit error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: 40 }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
        <h3 style={{ fontSize: 20, fontWeight: 700 }}>Thank you!</h3>
        <p style={{ color: '#585F6C', marginTop: 8 }}>Your rating helps keep others safe.</p>
      </div>
    );
  }

  return (
    <div className="card" style={{ maxWidth: 480 }}>
      <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Rate This Route</h3>
      <p style={{ color: '#585F6C', fontSize: 14, marginBottom: 20 }}>
        Help other women stay safe by sharing your experience.
      </p>

      {/* Star rating */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, justifyContent: 'center' }}>
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            onClick={() => setRating(star)}
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            style={{
              fontSize: 36, background: 'none', border: 'none', cursor: 'pointer',
              transform: (hoverRating || rating) >= star ? 'scale(1.1)' : 'scale(1)',
              transition: 'transform 0.2s'
            }}
          >
            {(hoverRating || rating) >= star ? '⭐' : '☆'}
          </button>
        ))}
      </div>

      {/* Like tags */}
      <div style={{ marginBottom: 16 }}>
        <label style={{ fontSize: 13, fontWeight: 600, color: '#585F6C', textTransform: 'uppercase' }}>
          What did you like?
        </label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
          {LIKE_TAGS.map(tag => (
            <button
              key={tag}
              onClick={() => toggleTag(tag, likes, setLikes)}
              style={{
                padding: '6px 14px', borderRadius: 100, border: '1px solid',
                borderColor: likes.includes(tag) ? '#22C55E' : '#EDEDED',
                background: likes.includes(tag) ? '#dcfce7' : 'white',
                color: likes.includes(tag) ? '#15803d' : '#585F6C',
                fontSize: 13, fontWeight: 500, cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Dislike tags */}
      <div style={{ marginBottom: 16 }}>
        <label style={{ fontSize: 13, fontWeight: 600, color: '#585F6C', textTransform: 'uppercase' }}>
          What concerned you?
        </label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
          {DISLIKE_TAGS.map(tag => (
            <button
              key={tag}
              onClick={() => toggleTag(tag, dislikes, setDislikes)}
              style={{
                padding: '6px 14px', borderRadius: 100, border: '1px solid',
                borderColor: dislikes.includes(tag) ? '#EF4444' : '#EDEDED',
                background: dislikes.includes(tag) ? '#fef2f2' : 'white',
                color: dislikes.includes(tag) ? '#dc2626' : '#585F6C',
                fontSize: 13, fontWeight: 500, cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Comment */}
      <div className="input-group" style={{ marginBottom: 20 }}>
        <label className="input-label">Comment (optional)</label>
        <textarea
          className="input-field"
          rows={3}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your experience..."
          style={{ resize: 'vertical' }}
        />
      </div>

      <div style={{ display: 'flex', gap: 10 }}>
        <button className="btn btn-outline" onClick={onClose} style={{ flex: 1 }}>Skip</button>
        <button
          className="btn btn-primary"
          onClick={handleSubmit}
          disabled={rating === 0 || submitting}
          style={{ flex: 2 }}
        >
          {submitting ? 'Submitting...' : 'Submit Rating'}
        </button>
      </div>
    </div>
  );
};

export default RouteRating;
