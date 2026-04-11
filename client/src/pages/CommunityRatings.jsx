import { useState, useEffect } from 'react';
import api from '../services/api';
import Navbar from '../components/Navbar';
import SOSButton from '../components/SOSButton';

const CommunityRatings = () => {
  const [myRatings, setMyRatings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRatings();
  }, []);

  const loadRatings = async () => {
    try {
      // Load both global feed and personal stats
      const [globalRes, myRes] = await Promise.all([
        api.get('/api/ratings'),
        api.get('/api/ratings/my')
      ]);
      // set global ratings for the feed
      setMyRatings(globalRes.data || []);
    } catch (err) {
      console.error('Load ratings error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <Navbar />
      <div style={{ maxWidth: 700, margin: '0 auto', padding: '96px 24px 40px' }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>Community Ratings</h1>
        <p style={{ color: '#585F6C', marginBottom: 32 }}>
          Your route reviews help keep other women safe.
        </p>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 32 }}>
          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 32, fontWeight: 800, color: '#FF6B00' }}>{myRatings.length}</div>
            <div style={{ fontSize: 13, color: '#585F6C', marginTop: 4 }}>Routes Rated</div>
          </div>
          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 32, fontWeight: 800, color: '#22C55E' }}>
              {myRatings.length > 0
                ? (myRatings.reduce((s, r) => s + r.rating, 0) / myRatings.length).toFixed(1)
                : '0'
              }
            </div>
            <div style={{ fontSize: 13, color: '#585F6C', marginTop: 4 }}>Avg Rating</div>
          </div>
          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 32, fontWeight: 800, color: '#3B82F6' }}>
              {new Set(myRatings.flatMap(r => r.likes || [])).size}
            </div>
            <div style={{ fontSize: 13, color: '#585F6C', marginTop: 4 }}>Positive Tags</div>
          </div>
        </div>

        {/* Ratings list */}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 120, borderRadius: 16 }} />)}
          </div>
        ) : myRatings.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: 48 }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>⭐</div>
            <h3 style={{ fontSize: 18, fontWeight: 700 }}>No ratings yet</h3>
            <p style={{ color: '#585F6C', marginTop: 8 }}>
              Complete a journey and rate the route to help others.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {myRatings.map((rating, i) => (
              <div key={rating._id} className="card animate-fadeSlideUp" style={{ animationDelay: `${i * 0.1}s` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 12 }}>
                  <div>
                    <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
                      {[1, 2, 3, 4, 5].map(star => (
                        <span key={star} style={{ fontSize: 20 }}>
                          {star <= rating.rating ? '⭐' : '☆'}
                        </span>
                      ))}
                    </div>
                    {/* Bug 1 Fix: Display Address Fields */}
                    <div style={{ fontWeight: 600, fontSize: 16, marginTop: 8, color: '#191C1E' }}>
                      📍 {rating.routeLabel || 'Unknown Route'}
                    </div>
                    {rating.city && (
                      <div style={{ fontSize: 13, color: '#FF6B00', fontWeight: 500, marginBottom: 8 }}>
                        {rating.city}
                      </div>
                    )}
                    <div style={{ fontSize: 13, color: '#585F6C', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span>👤 {rating.userName || 'Anonymous'}</span>
                      <span>·</span>
                      <span>{new Date(rating.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                {rating.comment && (
                  <p style={{ fontSize: 14, color: '#191C1E', marginBottom: 10, lineHeight: 1.5, padding: '10px 14px', background: '#F8F9FA', borderRadius: 8 }}>
                    "{rating.comment}"
                  </p>
                )}

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {(rating.likes || []).map(tag => (
                    <span key={tag} className="badge badge-success">{tag}</span>
                  ))}
                  {(rating.dislikes || []).map(tag => (
                    <span key={tag} className="badge badge-danger">{tag}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <SOSButton />
    </div>
  );
};

export default CommunityRatings;
