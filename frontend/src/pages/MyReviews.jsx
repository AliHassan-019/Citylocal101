import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import api from '../services/api';
import './MyReviews.css';

const MyReviews = () => {
  const { user } = useContext(AuthContext);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyReviews();
  }, []);

  const fetchMyReviews = async () => {
    try {
      const response = await api.get('/reviews/my-reviews');
      setReviews(response.data.reviews || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (reviewId) => {
    if (window.confirm('Are you sure you want to delete this review?')) {
      try {
        await api.delete(`/reviews/${reviewId}`);
        setReviews(reviews.filter(review => review.id !== reviewId));
        alert('Review deleted successfully!');
      } catch (error) {
        alert('Failed to delete review');
      }
    }
  };

  const renderStars = (rating) => {
    return (
      <div className="stars">
        {[1, 2, 3, 4, 5].map(star => (
          <i
            key={star}
            className={`fas fa-star ${star <= rating ? 'filled' : ''}`}
          ></i>
        ))}
      </div>
    );
  };

  const formatLastLogin = (date) => {
    if (!date) return 'Never';
    const loginDate = new Date(date);
    return loginDate.toLocaleString('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="my-reviews-container">
      <div className="reviews-header">
        <h1>Hello {user?.firstName || user?.name || 'User'}!</h1>
        <p className="last-login">
          You last logged in at: {formatLastLogin(user?.lastLogin)}
        </p>
      </div>

      <div className="reviews-content">
        <div className="reviews-title-row">
          <h2 className="section-title">
            <i className="fas fa-chevron-right"></i>
            My Reviews
          </h2>
          <Link to="/write-review" className="write-review-btn">
            <i className="fas fa-pen"></i>
            Write Review
          </Link>
        </div>

        {loading ? (
          <div className="loading-state">
            <i className="fas fa-spinner fa-spin"></i>
            <p>Loading reviews...</p>
          </div>
        ) : reviews.length === 0 ? (
          <div className="empty-state">
            <i className="fas fa-comments"></i>
            <h3>No Reviews Yet</h3>
            <p>You haven't written any reviews yet. Share your experience!</p>
            <Link to="/write-review" className="empty-state-btn">
              Write Your First Review
            </Link>
          </div>
        ) : (
          <div className="reviews-grid">
            {reviews.map(review => (
              <div key={review.id} className="review-card">
                <div className="review-header">
                  <div className="business-info">
                    {review.Business?.logo && (
                      <img 
                        src={review.Business.logo} 
                        alt={review.Business.name}
                        className="business-logo"
                      />
                    )}
                    <div>
                      <h3>{review.Business?.name || 'Unknown Business'}</h3>
                      {renderStars(review.rating)}
                    </div>
                  </div>
                  <div className="review-actions">
                    <button 
                      onClick={() => handleDelete(review.id)} 
                      className="delete-btn"
                      title="Delete Review"
                    >
                      <i className="fas fa-trash-alt"></i>
                    </button>
                  </div>
                </div>
                <p className="review-text">{review.comment}</p>
                <div className="review-footer">
                  <span className="review-date">
                    <i className="fas fa-calendar"></i>
                    {new Date(review.createdAt).toLocaleDateString()}
                  </span>
                  {review.Business?.id && (
                    <Link 
                      to={`/businesses/${review.Business.id}`} 
                      className="view-business-link"
                    >
                      View Business <i className="fas fa-arrow-right"></i>
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyReviews;

