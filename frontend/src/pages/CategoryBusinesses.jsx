import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import './CategoryBusinesses.css';

const CategoryBusinesses = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [category, setCategory] = useState(null);
  const [categories, setCategories] = useState([]);
  const [cities, setCities] = useState([]);
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const searchInputRef = useRef(null);
  const locationInputRef = useRef(null);
  
  // Applied filters (what's currently used for API calls)
  const [appliedFilters, setAppliedFilters] = useState({
    ratings: [],
    categories: [],
    cities: [],
    sort: 'rating',
    featured: false,
    search: '',
    location: ''
  });
  
  // Temporary filter states (what user is currently selecting)
  const [tempFilters, setTempFilters] = useState({
    ratings: [],
    categories: [],
    cities: [],
    sort: 'rating',
    featured: false,
    search: '',
    location: ''
  });
  
  const [showFilters, setShowFilters] = useState(false);
  const [hasUnsavedFilters, setHasUnsavedFilters] = useState(false);

  useEffect(() => {
    // Load categories first, then businesses
    loadFilterOptions();
  }, []);

  // Load businesses when categories are loaded and slug changes
  useEffect(() => {
    if (categories.length > 0) {
      loadCategoryAndBusinesses();
    }
  }, [categories, slug]);

  // Reload businesses when filters or page change
  useEffect(() => {
    if (categories.length > 0) {
      loadCategoryAndBusinesses();
    }
    // Sync search and location with applied filters
    if (appliedFilters.search !== searchQuery) {
      setSearchQuery(appliedFilters.search || '');
    }
    if (appliedFilters.location !== location) {
      setLocation(appliedFilters.location || '');
    }
  }, [page, appliedFilters]);

  // Check if temp filters differ from applied filters
  useEffect(() => {
    const filtersChanged = 
      JSON.stringify(tempFilters.ratings.sort()) !== JSON.stringify(appliedFilters.ratings.sort()) ||
      JSON.stringify(tempFilters.categories.sort()) !== JSON.stringify(appliedFilters.categories.sort()) ||
      JSON.stringify(tempFilters.cities.sort()) !== JSON.stringify(appliedFilters.cities.sort()) ||
      tempFilters.sort !== appliedFilters.sort ||
      tempFilters.featured !== appliedFilters.featured ||
      tempFilters.search !== appliedFilters.search ||
      tempFilters.location !== appliedFilters.location;
    setHasUnsavedFilters(filtersChanged);
  }, [tempFilters, appliedFilters]);

  // Handle click outside for suggestions
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchInputRef.current && !searchInputRef.current.contains(e.target)) {
        setShowSearchSuggestions(false);
      }
      if (locationInputRef.current && !locationInputRef.current.contains(e.target)) {
        setShowLocationSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadFilterOptions = async () => {
    try {
      // Load filter options (cities and categories)
      const [filterResponse, categoriesResponse] = await Promise.all([
        api.get('/businesses/filter-options'),
        api.get('/categories')
      ]);
      
      setCities(filterResponse.data.cities || []);
      setCategories(categoriesResponse.data.categories || []);
    } catch (error) {
      console.error('Error loading filter options:', error);
    }
  };

  const loadCategoryAndBusinesses = async () => {
    try {
      setLoading(true);
      
      // Find current category from slug
      const foundCategory = categories.find(c => c.slug === slug);
      
      // If we're on a category page but category not found, redirect to home
      if (!foundCategory && slug && categories.length > 0) {
        navigate('/');
        return;
      }
      
      // Set the category if found
      if (foundCategory) {
        setCategory(foundCategory);
        
        // Always filter by the current category when on a category page
        const currentCategoryId = foundCategory.id.toString();
        
        // Ensure the category is always in the applied filters when on category page
        if (!appliedFilters.categories.includes(currentCategoryId)) {
          setAppliedFilters(prev => ({ ...prev, categories: [currentCategoryId] }));
        }
        if (!tempFilters.categories.includes(currentCategoryId)) {
          setTempFilters(prev => ({ ...prev, categories: [currentCategoryId] }));
        }
      }
      
      // Load businesses with filters
      const params = {
        page,
        limit: 12
      };
      
      // Always use current category when on category page (slug exists)
      // This ensures only businesses from this category are shown
      if (foundCategory && slug) {
        // Always filter by the current category when on a category page
        params.category = [foundCategory.id];
      } else if (appliedFilters.categories.length > 0) {
        // If not on a category page, use selected categories
        params.category = appliedFilters.categories;
      }
      
      // Apply other filters
      if (appliedFilters.ratings.length > 0) {
        params.ratings = appliedFilters.ratings;
      }
      
      if (appliedFilters.cities.length > 0) {
        params.city = appliedFilters.cities;
      } else if (appliedFilters.location) {
        // Use location search if cities filter not set
        params.city = appliedFilters.location;
      }
      
      // Search should work within the category
      if (appliedFilters.search) {
        params.search = appliedFilters.search;
      }
      
      if (appliedFilters.sort) {
        params.sort = appliedFilters.sort;
      }
      
      if (appliedFilters.featured) {
        params.featured = 'true';
      }
      
      const bizResponse = await api.get('/businesses', { params });
      setBusinesses(bizResponse.data.businesses || []);
      setTotalPages(bizResponse.data.pages || 1);
    } catch (error) {
      console.error('Error loading businesses:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle search input change with suggestions
  const handleSearchInputChange = async (value) => {
    setSearchQuery(value);
    setTempFilters(prev => ({ ...prev, search: value }));
    
    if (value.length > 1) {
      try {
        const response = await api.get(`/search/suggestions?q=${encodeURIComponent(value)}`);
        setSearchSuggestions(response.data.suggestions || []);
        setShowSearchSuggestions(true);
      } catch (error) {
        console.error('Error fetching search suggestions:', error);
      }
    } else {
      setSearchSuggestions([]);
      setShowSearchSuggestions(false);
    }
  };

  // Handle location input change with suggestions
  const handleLocationInputChange = async (value) => {
    setLocation(value);
    setTempFilters(prev => ({ ...prev, location: value }));
    
    if (value.length > 1) {
      try {
        const response = await api.get(`/search/location-suggestions?q=${encodeURIComponent(value)}`);
        setLocationSuggestions(response.data.suggestions || []);
        setShowLocationSuggestions(true);
      } catch (error) {
        console.error('Error fetching location suggestions:', error);
      }
    } else {
      setLocationSuggestions([]);
      setShowLocationSuggestions(false);
    }
  };

  // Handle search suggestion selection
  const selectSearchSuggestion = (suggestion) => {
    if (suggestion.type === 'business') {
      navigate(`/businesses/${suggestion.id || suggestion.slug}`);
      setShowSearchSuggestions(false);
    } else if (suggestion.type === 'category') {
      navigate(`/category/${suggestion.slug}`);
      setShowSearchSuggestions(false);
    } else {
      setSearchQuery(suggestion.name);
      setTempFilters(prev => ({ ...prev, search: suggestion.name }));
      setShowSearchSuggestions(false);
    }
  };

  // Handle location suggestion selection
  const selectLocationSuggestion = (suggestion) => {
    const locationName = suggestion.name || `${suggestion.city}, ${suggestion.state}`;
    setLocation(locationName);
    setTempFilters(prev => ({ ...prev, location: locationName }));
    setShowLocationSuggestions(false);
  };

  // Handle search form submission
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    applyFilters();
  };

  const handleRatingToggle = (rating) => {
    setTempFilters(prev => {
      const newRatings = prev.ratings.includes(rating.toString())
        ? prev.ratings.filter(r => r !== rating.toString())
        : [...prev.ratings, rating.toString()];
      return { ...prev, ratings: newRatings };
    });
  };

  const handleCategoryToggle = (categoryId) => {
    setTempFilters(prev => {
      const newCategories = prev.categories.includes(categoryId.toString())
        ? prev.categories.filter(c => c !== categoryId.toString())
        : [...prev.categories, categoryId.toString()];
      return { ...prev, categories: newCategories };
    });
  };

  const handleCityToggle = (city) => {
    setTempFilters(prev => {
      const newCities = prev.cities.includes(city)
        ? prev.cities.filter(c => c !== city)
        : [...prev.cities, city];
      return { ...prev, cities: newCities };
    });
  };

  const applyFilters = () => {
    // If we're on a category page and a different single category is selected, navigate to that category page
    if (slug && tempFilters.categories.length === 1) {
      const selectedCategoryId = tempFilters.categories[0];
      const selectedCategory = categories.find(c => c.id.toString() === selectedCategoryId);
      if (selectedCategory && selectedCategory.slug !== slug) {
        // Navigate to the new category page
        navigate(`/category/${selectedCategory.slug}`);
        return;
      }
    }
    
    // Ensure current category is always included when on a category page
    let finalCategories = [...tempFilters.categories];
    if (category && slug) {
      // Always include current category when on category page
      const currentCategoryId = category.id.toString();
      if (!finalCategories.includes(currentCategoryId)) {
        finalCategories = [currentCategoryId, ...finalCategories];
      }
    }
    
    // Apply filters to current category page (including search and location)
    setAppliedFilters({ 
      ...tempFilters,
      categories: finalCategories,
      search: searchQuery,
      location: location
    });
    setSearchQuery(searchQuery);
    setLocation(location);
    setPage(1); // Reset to first page when filters are applied
    setShowFilters(false); // Close mobile filter sidebar after applying
    setShowSearchSuggestions(false);
    setShowLocationSuggestions(false);
  };

  const clearFilters = () => {
    // Always keep the current category when clearing filters
    const defaultCategoryId = category?.id.toString() ? [category.id.toString()] : [];
    const resetFilters = {
      ratings: [],
      categories: defaultCategoryId,
      cities: [],
      sort: 'rating',
      featured: false,
      search: '',
      location: ''
    };
    setTempFilters(resetFilters);
    setAppliedFilters(resetFilters);
    setSearchQuery('');
    setLocation('');
    setPage(1);
  };

  const renderStars = (rating) => {
    const numRating = parseFloat(rating) || 0;
    const fullStars = Math.floor(numRating);
    const hasHalfStar = numRating % 1 >= 0.5;
    const stars = [];
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<i key={`full-${i}`} className="fas fa-star"></i>);
    }
    if (hasHalfStar) {
      stars.push(<i key="half" className="fas fa-star-half-alt"></i>);
    }
    const emptyStars = 5 - Math.ceil(numRating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<i key={`empty-${i}`} className="far fa-star"></i>);
    }
    
    return stars;
  };

  if (loading && !category && categories.length === 0) {
    return <div className="loading"><div className="spinner"></div></div>;
  }

  return (
    <div className="category-businesses-page">
      <div className="category-header">
        <div className="container">
          <button onClick={() => navigate('/')} className="back-button">
            <i className="fas fa-arrow-left"></i> Back to Home
          </button>
          <div className="category-title">
            <i className={`fas fa-${category?.icon || 'briefcase'}`}></i>
            <h1>{category?.name || 'Businesses'}</h1>
          </div>
          <p className="category-description">{category?.description || 'Browse our directory of businesses'}</p>
          <div className="category-stats">
            <span><i className="fas fa-building"></i> {businesses.length} businesses found</span>
          </div>
        </div>
      </div>
      
      <div className="container">
        {/* Search Bar Section */}
        <div className="search-bar-section">
          <form onSubmit={handleSearchSubmit} className="category-search-box">
            <div className="search-input-wrapper" ref={searchInputRef}>
              <i className="fas fa-search search-icon"></i>
              <input
                type="text"
                placeholder="Search for businesses, services..."
                value={searchQuery}
                onChange={(e) => handleSearchInputChange(e.target.value)}
                onFocus={() => searchQuery.length > 1 && setShowSearchSuggestions(true)}
                className="search-input"
              />
              {showSearchSuggestions && searchSuggestions.length > 0 && (
                <div className="suggestions-dropdown">
                  {searchSuggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      className="suggestion-item"
                      onClick={() => selectSearchSuggestion(suggestion)}
                    >
                      <i className={`fas fa-${suggestion.icon || 'building'}`}></i>
                      <div className="suggestion-content">
                        <strong>{suggestion.name}</strong>
                        {suggestion.city && suggestion.state && (
                          <span>{suggestion.city}, {suggestion.state}</span>
                        )}
                        {suggestion.type && (
                          <span className="suggestion-type">{suggestion.type}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="search-input-wrapper" ref={locationInputRef}>
              <i className="fas fa-map-marker-alt location-icon"></i>
              <input
                type="text"
                placeholder="Location (City, State)"
                value={location}
                onChange={(e) => handleLocationInputChange(e.target.value)}
                onFocus={() => location.length > 1 && setShowLocationSuggestions(true)}
                className="search-input"
              />
              {showLocationSuggestions && locationSuggestions.length > 0 && (
                <div className="suggestions-dropdown">
                  {locationSuggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      className="suggestion-item"
                      onClick={() => selectLocationSuggestion(suggestion)}
                    >
                      <i className="fas fa-map-marker-alt"></i>
                      <div className="suggestion-content">
                        <strong>{suggestion.name || `${suggestion.city}, ${suggestion.state}`}</strong>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button type="submit" className="search-submit-btn">
              <i className="fas fa-search"></i>
              Search
            </button>
          </form>
        </div>

        {/* Mobile Overlay */}
        {showFilters && (
          <div 
            className="filter-overlay"
            onClick={() => setShowFilters(false)}
          ></div>
        )}
        <div className="content-layout">
          {/* Filter Sidebar */}
          <aside className={`filter-sidebar ${showFilters ? 'show' : ''}`} onClick={(e) => e.stopPropagation()}>
            <h2 className="filter-title">Filter</h2>
            
            {/* Ratings Section */}
            <div className="filter-section">
              <h3 className="filter-section-title">Ratings</h3>
              {[5, 4, 3, 2, 1].map(rating => (
                <label key={rating} className="filter-checkbox-label">
                  <input
                    type="checkbox"
                    checked={tempFilters.ratings.includes(rating.toString())}
                    onChange={() => handleRatingToggle(rating)}
                  />
                  <span className="star-rating">
                    {Array(rating).fill(0).map((_, i) => (
                      <i key={i} className="fas fa-star"></i>
                    ))}
                  </span>
                </label>
              ))}
            </div>

            {/* Services Section */}
            <div className="filter-section">
              <h3 className="filter-section-title">Services</h3>
              {categories.slice(0, 10).map(cat => (
                <label key={cat.id} className="filter-checkbox-label">
                  <input
                    type="checkbox"
                    checked={tempFilters.categories.includes(cat.id.toString())}
                    onChange={() => handleCategoryToggle(cat.id)}
                  />
                  <span>{cat.name}</span>
                </label>
              ))}
            </div>

            {/* Areas Section */}
            <div className="filter-section">
              <h3 className="filter-section-title">Areas</h3>
              {cities.slice(0, 20).map((city, index) => (
                <label key={index} className="filter-checkbox-label">
                  <input
                    type="checkbox"
                    checked={tempFilters.cities.includes(city)}
                    onChange={() => handleCityToggle(city)}
                  />
                  <span>{city}</span>
                </label>
              ))}
            </div>

            {/* Sort Options */}
            <div className="filter-section">
              <h3 className="filter-section-title">Sort By</h3>
              <select
                className="filter-select"
                value={tempFilters.sort}
                onChange={(e) => setTempFilters(prev => ({ ...prev, sort: e.target.value }))}
              >
                <option value="rating">Highest Rated</option>
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="name">Name (A-Z)</option>
                <option value="views">Most Viewed</option>
              </select>
            </div>

            {/* Featured Filter */}
            <div className="filter-section">
              <label className="filter-checkbox-label">
                <input
                  type="checkbox"
                  checked={tempFilters.featured}
                  onChange={(e) => setTempFilters(prev => ({ ...prev, featured: e.target.checked }))}
                />
                <span><i className="fas fa-crown"></i> Featured Only</span>
              </label>
            </div>

            {/* Filter Actions */}
            <div className="filter-actions">
              <button
                className={`btn-apply-filters ${hasUnsavedFilters ? 'has-changes' : ''}`}
                onClick={applyFilters}
                disabled={!hasUnsavedFilters}
              >
                Apply Filters
                {hasUnsavedFilters && <span className="filter-badge">•</span>}
              </button>
              <button
                className="btn-clear-filters"
                onClick={clearFilters}
              >
                Clear All
              </button>
            </div>

            {/* Mobile close button */}
            <button 
              className="mobile-filter-close"
              onClick={() => setShowFilters(false)}
              aria-label="Close filters"
            >
              <i className="fas fa-times"></i>
            </button>
          </aside>
          
          {/* Business Grid */}
          <main className="businesses-content">
            {/* Mobile Filter Toggle */}
            <button 
              className="mobile-filter-toggle"
              onClick={() => setShowFilters(!showFilters)}
              aria-label="Toggle filters"
            >
              <i className="fas fa-sliders-h"></i> {showFilters ? 'Hide Filters' : 'Show Filters'}
            </button>
            {loading ? (
              <div className="loading"><div className="spinner"></div></div>
            ) : businesses.length === 0 ? (
              <div className="no-results">
                <i className="fas fa-search"></i>
                <h3>No businesses found</h3>
                <p>Try adjusting your filters to see more results</p>
                <button onClick={clearFilters} className="btn-primary">
                  Clear Filters
                </button>
              </div>
            ) : (
              <>
                <div className="businesses-grid">
                  {businesses.map((business) => (
                    <div
                      key={business.id}
                      className="business-card"
                      onClick={() => navigate(`/businesses/${business.id}`)}
                    >
                      {business.isFeatured && (
                        <div className="featured-badge">
                          <i className="fas fa-crown"></i> Featured
                        </div>
                      )}
                      <h3>{business.name}</h3>
                      <div className="rating">
                        <div className="stars">{renderStars(business.ratingAverage)}</div>
                        <span className="rating-value">
                          {(parseFloat(business.ratingAverage) || 0).toFixed(1)}
                        </span>
                        <span className="rating-count">({business.ratingCount || 0} reviews)</span>
                      </div>
                      <p className="description">{business.description}</p>
                      <div className="business-info">
                        <div className="info-item">
                          <i className="fas fa-map-marker-alt"></i>
                          {business.city}, {business.state}
                        </div>
                        <div className="info-item">
                          <i className="fas fa-phone"></i>
                          {business.phone}
                        </div>
                        {business.website && (
                          <div className="info-item">
                            <i className="fas fa-globe"></i>
                            Website
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="pagination">
                    <button
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      <i className="fas fa-chevron-left"></i> Previous
                    </button>
                    <span className="page-info">
                      Page {page} of {totalPages}
                    </span>
                    <button
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                    >
                      Next <i className="fas fa-chevron-right"></i>
                    </button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default CategoryBusinesses;
