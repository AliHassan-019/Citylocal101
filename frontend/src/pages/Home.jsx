import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');
  const [categories, setCategories] = useState([]);
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [categoriesRes, businessesRes] = await Promise.all([
        api.get('/categories'),
        api.get('/businesses?limit=6&featured=true')
      ]);
      setCategories(categoriesRes.data.categories || []);
      setBusinesses(businessesRes.data.businesses || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery) params.append('q', searchQuery);
    if (location) params.append('city', location);
    navigate(`/search?${params.toString()}`);
  };

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <h1>Discover Businesses Near You</h1>
            <p>Helping you find the best service providers in your area</p>
            <form onSubmit={handleSearch} className="search-box">
              <input
                type="text"
                placeholder="Search for businesses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <input
                type="text"
                placeholder="Location (City, State)"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
              <button type="submit" className="search-btn">
                <i className="fas fa-search"></i> Search
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="categories">
        <div className="container">
          <h2>Top Rated Categories</h2>
          {loading ? (
            <div className="loading"><div className="spinner"></div></div>
          ) : (
            <div className="categories-grid">
              {categories.slice(0, 8).map((category) => (
                <div key={category.id} className="category-card" onClick={() => navigate(`/search?category=${category.id}`)}>
                  <i className={`fas fa-${category.icon || 'briefcase'}`}></i>
                  <h3>{category.name}</h3>
                  <p>{category.businessCount || 0} businesses</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Top Businesses */}
      <section className="business-listings">
        <div className="container">
          <h2>Top Rated Business Listings</h2>
          {loading ? (
            <div className="loading"><div className="spinner"></div></div>
          ) : (
            <div className="listings-grid">
              {businesses.map((business) => (
                <div key={business.id} className="listing-card" onClick={() => navigate(`/businesses/${business.id}`)}>
                  <div className="listing-header">
                    <h3>{business.name}</h3>
                    <div className="rating">
                      <span className="stars">{'★'.repeat(Math.floor(business.ratingAverage))}</span>
                      <span className="rating-value">{business.ratingAverage}</span>
                    </div>
                  </div>
                  <p className="listing-description">{business.description?.substring(0, 100)}...</p>
                  <div className="listing-info">
                    <p><i className="fas fa-map-marker-alt"></i> {business.city}, {business.state}</p>
                    {business.category && <p><i className="fas fa-tag"></i> {business.category.name}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="view-all">
            <button className="btn-secondary" onClick={() => navigate('/businesses')}>
              View All Businesses
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;

