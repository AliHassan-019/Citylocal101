import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import './BusinessDetail.css';

const BusinessDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [business, setBusiness] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mapCoords, setMapCoords] = useState(null);
  const [mapLoading, setMapLoading] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [contactFormStatus, setContactFormStatus] = useState({ success: '', error: '' });
  const [contactFormLoading, setContactFormLoading] = useState(false);

  useEffect(() => {
    loadBusiness();
  }, [id]);

  useEffect(() => {
    if (business) {
      loadMapCoordinates();
    }
  }, [business]);

  const loadBusiness = async () => {
    try {
      const [businessRes, reviewsRes] = await Promise.all([
        api.get(`/businesses/${id}`),
        api.get(`/reviews?business=${id}`)
      ]);
      setBusiness(businessRes.data.business);
      setReviews(reviewsRes.data.reviews || []);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const loadMapCoordinates = async () => {
    // If business already has coordinates, use them
    if (business?.latitude && business?.longitude) {
      setMapCoords({
        lat: parseFloat(business.latitude),
        lng: parseFloat(business.longitude)
      });
      return;
    }

    // Otherwise, geocode the address
    if (!business?.address || !business?.city || !business?.state) {
      return;
    }

    setMapLoading(true);
    try {
      const address = `${business.address}, ${business.city}, ${business.state} ${business.zipCode || ''}`;
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`,
        {
          headers: {
            'User-Agent': 'CityLocal101/1.0'
          }
        }
      );
      const data = await response.json();
      
      if (data && data.length > 0) {
        setMapCoords({
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon)
        });
      }
    } catch (error) {
      // Silently fail - will show address link instead
    } finally {
      setMapLoading(false);
    }
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setContactFormStatus({ success: '', error: '' });
    setContactFormLoading(true);

    try {
      await api.post(`/businesses/${id}/contact`, contactForm);
      setContactFormStatus({ 
        success: 'Your message has been sent to the business. They will contact you soon!', 
        error: '' 
      });
      setContactForm({ name: '', email: '', phone: '', message: '' });
    } catch (error) {
      setContactFormStatus({ 
        success: '', 
        error: error.response?.data?.error || 'Failed to send message. Please try again.' 
      });
    } finally {
      setContactFormLoading(false);
    }
  };

  const handleClaimBusiness = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    try {
      await api.post(`/businesses/${id}/claim`);
      alert('Your claim request has been submitted. An admin will review it shortly.');
      loadBusiness();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to submit claim request.');
    }
  };

  const getMapUrl = () => {
    if (!business) return '';
    const address = `${business.address}, ${business.city}, ${business.state} ${business.zipCode}`;
    return `https://www.google.com/maps/embed/v1/place?key=YOUR_GOOGLE_MAPS_API_KEY&q=${encodeURIComponent(address)}`;
  };

  const formatHours = (hours) => {
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    
    return days.map((day, index) => {
      const dayHours = hours?.[day];
      return {
        day: dayNames[index],
        hours: dayHours?.closed ? 'Closed' : (dayHours?.open && dayHours?.close ? `${dayHours.open} - ${dayHours.close}` : 'Not specified')
      };
    });
  };

  if (loading) return <div className="loading"><div className="spinner"></div></div>;
  if (!business) return <div className="container"><p>Business not found</p></div>;

  const isOwner = user && business.ownerId === user.id;
  const canClaim = user && !business.ownerId && business.claimedAt === null;

  return (
    <div className="business-detail">
      {/* Header */}
      <div className="business-detail-header">
      <h1>{business.name}</h1>
        <div className="business-header-info">
          <div className="business-rating">
            <span className="stars">{'★'.repeat(Math.floor(parseFloat(business.ratingAverage) || 0))}</span>
            <span className="rating-value">{parseFloat(business.ratingAverage) || 0}</span>
            <span>({business.ratingCount || 0} reviews)</span>
          </div>
          {business.isVerified && (
            <div className="business-status">
              <i className="fas fa-check-circle"></i>
              <span>Verified Business</span>
            </div>
          )}
        </div>
      </div>

      {/* Claim Banner */}
      {canClaim && (
        <div className="claim-listing-banner">
          <p><i className="fas fa-info-circle"></i> Is this your business? Claim it to manage your listing and respond to reviews.</p>
          <button className="btn-claim" onClick={handleClaimBusiness}>
            <i className="fas fa-hand-paper"></i> Claim This Business
          </button>
        </div>
      )}

      {/* Main Content */}
      <div className="business-detail-content">
        {/* Left Column */}
        <div className="business-main-section">
          {/* About Section */}
          <div className="business-card">
            <h2><i className="fas fa-info-circle"></i> About</h2>
            <p className="business-description">{business.description}</p>
          </div>

          {/* Map Section */}
          <div className="business-card">
            <h2><i className="fas fa-map-marker-alt"></i> Location</h2>
            {mapLoading ? (
              <div className="map-container" style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                background: '#f8f9fa',
                minHeight: '300px'
              }}>
                <div style={{ textAlign: 'center', padding: '40px' }}>
                  <i className="fas fa-spinner fa-spin" style={{ fontSize: '48px', marginBottom: '15px', display: 'block', color: '#667eea' }}></i>
                  <p style={{ margin: 0, fontSize: '16px', color: '#7f8c8d' }}>Loading map...</p>
                </div>
              </div>
            ) : mapCoords ? (
              <div className="map-container">
                {/* Using OpenStreetMap embed as a free alternative */}
                <iframe
                  title="Business Location"
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=${mapCoords.lng-0.01},${mapCoords.lat-0.01},${mapCoords.lng+0.01},${mapCoords.lat+0.01}&layer=mapnik&marker=${mapCoords.lat},${mapCoords.lng}`}
                  style={{ border: 0, width: '100%', height: '100%', minHeight: '300px' }}
                  allowFullScreen
                  loading="lazy"
                ></iframe>
              </div>
            ) : (
              <div className="map-container" style={{ 
                display: 'flex', 
                flexDirection: 'column',
                alignItems: 'center', 
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)',
                minHeight: '300px',
                padding: '40px',
                borderRadius: '12px',
                border: '2px dashed #d1d5db'
              }}>
                <i className="fas fa-map-marker-alt" style={{ fontSize: '48px', marginBottom: '15px', display: 'block', color: '#9ca3af' }}></i>
                <p style={{ margin: '0 0 20px 0', fontSize: '16px', color: '#6b7280', textAlign: 'center', fontWeight: '500' }}>
                  Interactive map not available
                </p>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${business.address}, ${business.city}, ${business.state} ${business.zipCode || ''}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '12px 24px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    textDecoration: 'none',
                    borderRadius: '8px',
                    fontWeight: '600',
                    transition: 'all 0.3s',
                    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 6px 16px rgba(102, 126, 234, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.3)';
                  }}
                >
                  <i className="fas fa-external-link-alt"></i>
                  View on Google Maps
                </a>
              </div>
            )}
            <div style={{ marginTop: '15px', padding: '15px', background: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
              <p style={{ margin: 0, color: '#374151', fontSize: '15px', fontWeight: '500' }}>
                <i className="fas fa-map-marker-alt" style={{ color: '#667eea', marginRight: '8px' }}></i>
                {business.address}, {business.city}, {business.state} {business.zipCode}
              </p>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${business.address}, ${business.city}, ${business.state} ${business.zipCode || ''}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  marginTop: '12px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: '#667eea',
                  fontSize: '14px',
                  textDecoration: 'none',
                  fontWeight: '500',
                  transition: 'color 0.2s ease'
                }}
                onMouseEnter={(e) => e.target.style.color = '#764ba2'}
                onMouseLeave={(e) => e.target.style.color = '#667eea'}
              >
                <i className="fas fa-external-link-alt"></i> View on Google Maps
              </a>
            </div>
          </div>

          {/* Contact Form */}
          <div className="contact-form-card">
            <h3><i className="fas fa-envelope"></i> Send a Message</h3>
            <p style={{ color: '#7f8c8d', marginBottom: '20px', fontSize: '14px' }}>
              Have a question? Send a message directly to this business.
            </p>
            {contactFormStatus.success && (
              <div className="alert alert-success">
                <i className="fas fa-check-circle"></i> {contactFormStatus.success}
              </div>
            )}
            {contactFormStatus.error && (
              <div className="alert alert-error">
                <i className="fas fa-exclamation-circle"></i> {contactFormStatus.error}
              </div>
            )}
            <form onSubmit={handleContactSubmit}>
              <div className="form-group">
                <label>Your Name *</label>
                <input
                  type="text"
                  required
                  value={contactForm.name}
                  onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                  placeholder="Enter your name"
                />
              </div>
              <div className="form-group">
                <label>Your Email *</label>
                <input
                  type="email"
                  required
                  value={contactForm.email}
                  onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                  placeholder="Enter your email"
                />
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  value={contactForm.phone}
                  onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                  placeholder="Enter your phone (optional)"
                />
              </div>
              <div className="form-group">
                <label>Message *</label>
                <textarea
                  required
                  value={contactForm.message}
                  onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                  placeholder="Write your message here..."
                ></textarea>
              </div>
              <button type="submit" className="btn-submit" disabled={contactFormLoading}>
                {contactFormLoading ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i>
                    Sending...
                  </>
                ) : (
                  <>
                    <i className="fas fa-paper-plane"></i>
                    Send Message
                  </>
                )}
              </button>
            </form>
      </div>

          {/* Reviews Section */}
          <div className="reviews-section">
            <div className="business-card">
              <h2><i className="fas fa-star"></i> Customer Reviews</h2>
        {reviews.length === 0 ? (
                <div className="no-reviews">
                  <i className="fas fa-comment-slash" style={{ fontSize: '48px', marginBottom: '15px', display: 'block' }}></i>
                  <p>No reviews yet. Be the first to review this business!</p>
                </div>
        ) : (
          reviews.map((review) => (
                  <div key={review.id} className="review-card">
                    <div className="review-header">
                      <span className="review-user">
                        <i className="fas fa-user-circle"></i> {review.user?.name || 'Anonymous'}
                      </span>
                      <span className="review-stars">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</span>
                    </div>
                    <h4 className="review-title">{review.title}</h4>
                    <p className="review-comment">{review.comment}</p>
                    <p className="review-date">
                      <i className="fas fa-calendar"></i> {new Date(review.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))
              )}
              <button className="btn-write-review" onClick={() => navigate('/write-review', { state: { businessId: id, businessName: business.name } })}>
                <i className="fas fa-pen"></i>
                Write a Review
              </button>
            </div>
          </div>
        </div>

        {/* Right Column - Sidebar */}
        <div className="business-sidebar">
          {/* Contact Information */}
          <div className="contact-info-card">
            <h3><i className="fas fa-address-card"></i> Contact Info</h3>
            
            <div className="contact-item">
              <i className="fas fa-map-marker-alt"></i>
              <div className="contact-item-content">
                <p>{business.address}<br />{business.city}, {business.state} {business.zipCode}</p>
              </div>
            </div>

            <div className="contact-item">
              <i className="fas fa-phone"></i>
              <div className="contact-item-content">
                <p><a href={`tel:${business.phone}`}>{business.phone}</a></p>
              </div>
            </div>

            {business.email && (
              <div className="contact-item">
                <i className="fas fa-envelope"></i>
                <div className="contact-item-content">
                  <p><a href={`mailto:${business.email}`}>{business.email}</a></p>
                </div>
              </div>
            )}

            {business.website && (
              <div className="contact-item">
                <i className="fas fa-globe"></i>
                <div className="contact-item-content">
                  <p><a href={business.website} target="_blank" rel="noopener noreferrer">{business.website}</a></p>
                </div>
              </div>
            )}

            {business.category && (
              <div className="contact-item">
                <i className="fas fa-tag"></i>
                <div className="contact-item-content">
                  <p>{business.category.name}</p>
                </div>
              </div>
            )}

            {/* Social Links */}
            {(business.socialLinks?.facebook || business.socialLinks?.twitter || business.socialLinks?.instagram || business.socialLinks?.linkedin) && (
              <div className="contact-item" style={{ borderBottom: 'none' }}>
                <i className="fas fa-share-alt"></i>
                <div className="contact-item-content">
                  <p style={{ marginBottom: '10px' }}>Follow us:</p>
                  <div className="social-links">
                    {business.socialLinks?.facebook && (
                      <a href={business.socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="social-link facebook">
                        <i className="fab fa-facebook-f"></i>
                      </a>
                    )}
                    {business.socialLinks?.twitter && (
                      <a href={business.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="social-link twitter">
                        <i className="fab fa-twitter"></i>
                      </a>
                    )}
                    {business.socialLinks?.instagram && (
                      <a href={business.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="social-link instagram">
                        <i className="fab fa-instagram"></i>
                      </a>
                    )}
                    {business.socialLinks?.linkedin && (
                      <a href={business.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="social-link linkedin">
                        <i className="fab fa-linkedin-in"></i>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Business Hours */}
          {business.hours && Object.keys(business.hours).length > 0 && (
            <div className="contact-info-card">
              <h3><i className="fas fa-clock"></i> Business Hours</h3>
              <div className="business-hours">
                <ul className="hours-list">
                  {formatHours(business.hours).map((item, index) => (
                    <li key={index} className="hours-item">
                      <span className="hours-day">{item.day}</span>
                      <span className={`hours-time ${item.hours === 'Closed' ? 'closed' : ''}`}>
                        {item.hours}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Owner Actions */}
          {isOwner && (
            <div className="contact-info-card" style={{ background: '#2c3e50', color: 'white' }}>
              <h3 style={{ color: 'white' }}>
                <i className="fas fa-user-shield"></i> Owner Actions
              </h3>
              <button 
                onClick={() => navigate('/user-dashboard')} 
                style={{ 
                  width: '100%', 
                  padding: '12px', 
                  background: 'white', 
                  color: '#2c3e50', 
                  border: 'none', 
                  borderRadius: '8px', 
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'all 0.3s'
                }}
                onMouseEnter={(e) => e.target.style.background = '#f8f9fa'}
                onMouseLeave={(e) => e.target.style.background = 'white'}
              >
                <i className="fas fa-edit"></i>
                Manage Your Listing
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BusinessDetail;
