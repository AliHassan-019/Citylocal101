import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import './UserBusinesses.css';

const UserBusinesses = () => {
  const { user } = useContext(AuthContext);
  const [businesses, setBusinesses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    categoryId: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    phone: '',
    email: '',
    website: '',
    hours: '',
    facebook: '',
    instagram: '',
    twitter: ''
  });

  useEffect(() => {
    fetchBusinesses();
    fetchCategories();
  }, []);

  const fetchBusinesses = async () => {
    try {
      setLoading(true);
      // Use my-businesses endpoint
      const response = await api.get('/businesses/my-businesses');
      setBusinesses(response.data.businesses || []);
    } catch (error) {
      console.error('Error fetching businesses:', error);
      // Set empty array on error
      setBusinesses([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories');
      setCategories(response.data.categories || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      categoryId: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      phone: '',
      email: '',
      website: '',
      hours: '',
      facebook: '',
      instagram: '',
      twitter: ''
    });
  };

  const handleOpenCreate = () => {
    resetForm();
    setShowCreateModal(true);
    setMessage({ type: '', text: '' });
  };

  const handleOpenEdit = (business) => {
    setSelectedBusiness(business);
    setFormData({
      name: business.name || '',
      description: business.description || '',
      categoryId: business.categoryId || '',
      address: business.address || '',
      city: business.city || '',
      state: business.state || '',
      zipCode: business.zipCode || '',
      phone: business.phone || '',
      email: business.email || '',
      website: business.website || '',
      hours: business.hours || '',
      facebook: business.socialLinks?.facebook || '',
      instagram: business.socialLinks?.instagram || '',
      twitter: business.socialLinks?.twitter || ''
    });
    setShowEditModal(true);
    setMessage({ type: '', text: '' });
  };

  const handleOpenDelete = (business) => {
    setSelectedBusiness(business);
    setShowDeleteModal(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const submitData = {
        ...formData,
        socialLinks: {
          facebook: formData.facebook,
          instagram: formData.instagram,
          twitter: formData.twitter
        }
      };
      delete submitData.facebook;
      delete submitData.instagram;
      delete submitData.twitter;

      await api.post('/businesses', submitData);
      setMessage({ type: 'success', text: 'Business created successfully! Pending admin approval.' });
      setShowCreateModal(false);
      fetchBusinesses();
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.error || 'Failed to create business' 
      });
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const submitData = {
        ...formData,
        socialLinks: {
          facebook: formData.facebook,
          instagram: formData.instagram,
          twitter: formData.twitter
        }
      };
      delete submitData.facebook;
      delete submitData.instagram;
      delete submitData.twitter;

      await api.put(`/businesses/${selectedBusiness.id}`, submitData);
      setMessage({ type: 'success', text: 'Business updated successfully!' });
      setShowEditModal(false);
      fetchBusinesses();
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.error || 'Failed to update business' 
      });
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/businesses/${selectedBusiness.id}`);
      setMessage({ type: 'success', text: 'Business deleted successfully!' });
      setShowDeleteModal(false);
      fetchBusinesses();
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.error || 'Failed to delete business' 
      });
    }
  };

  const handleResubmit = async (businessId) => {
    try {
      await api.post(`/businesses/${businessId}/resubmit`);
      setMessage({ type: 'success', text: 'Business resubmitted for review!' });
      fetchBusinesses();
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.error || 'Failed to resubmit business' 
      });
    }
  };

  const getStatusBadge = (business) => {
    if (business.rejectedAt) {
      return <span className="status-badge status-rejected"><i className="fas fa-times-circle"></i> Rejected</span>;
    } else if (business.approvedAt) {
      return <span className="status-badge status-approved"><i className="fas fa-check-circle"></i> Approved</span>;
    } else {
      return <span className="status-badge status-pending"><i className="fas fa-clock"></i> Pending</span>;
    }
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
    <div className="user-businesses-container">
      {/* Header */}
      <div className="businesses-header-card">
        <div className="businesses-header-content">
          <div>
            <h1>Hello, {user?.firstName || user?.name || 'User'}!</h1>
            <p className="last-login">
              <i className="fas fa-clock"></i>
              Last login: {formatLastLogin(user?.lastLogin)}
            </p>
          </div>
          <button onClick={handleOpenCreate} className="btn-create-business">
            <i className="fas fa-plus-circle"></i>
            Create New Business
          </button>
        </div>
      </div>

      {/* Alert Message */}
      {message.text && (
        <div className={`alert-modern alert-${message.type}`}>
          <i className={`fas fa-${message.type === 'success' ? 'check-circle' : 'exclamation-circle'}`}></i>
          <span>{message.text}</span>
          <button onClick={() => setMessage({ type: '', text: '' })} className="alert-close">
            <i className="fas fa-times"></i>
          </button>
        </div>
      )}

      {/* Businesses List */}
      <div className="businesses-content-card">
        <div className="content-header">
          <h2>
            <i className="fas fa-store"></i>
            My Businesses
          </h2>
          <p>Manage all your business listings</p>
        </div>

        {loading ? (
          <div className="loading-state">
            <i className="fas fa-spinner fa-spin"></i>
            <p>Loading businesses...</p>
          </div>
        ) : businesses.length === 0 ? (
          <div className="empty-state">
            <i className="fas fa-store-slash"></i>
            <h3>No Businesses Yet</h3>
            <p>Start by creating your first business listing</p>
            <button onClick={handleOpenCreate} className="btn-empty-action">
              <i className="fas fa-plus-circle"></i>
              Create Your First Business
            </button>
          </div>
        ) : (
          <div className="businesses-grid">
            {businesses.map(business => (
              <div key={business.id} className="business-card-modern">
                <div className="business-card-header">
                  <div className="business-logo-container">
                    {business.logo ? (
                      <img src={business.logo} alt={business.name} />
                    ) : (
                      <i className="fas fa-building"></i>
                    )}
                  </div>
                  {getStatusBadge(business)}
                </div>

                <div className="business-card-body">
                  <h3>{business.name}</h3>
                  <p className="business-category">
                    <i className="fas fa-tag"></i>
                    {business.category?.name || 'Uncategorized'}
                  </p>
                  <p className="business-location">
                    <i className="fas fa-map-marker-alt"></i>
                    {business.city}, {business.state}
                  </p>
                  <p className="business-rating">
                    <i className="fas fa-star"></i>
                    {business.ratingAverage && typeof business.ratingAverage === 'number' 
                      ? business.ratingAverage.toFixed(1) 
                      : 'N/A'} ({business.ratingCount || 0} reviews)
                  </p>

                  {business.rejectedAt && business.rejectionReason && (
                    <div className="rejection-notice">
                      <i className="fas fa-info-circle"></i>
                      <strong>Reason:</strong> {business.rejectionReason}
                    </div>
                  )}
                </div>

                <div className="business-card-actions">
                  <Link to={`/businesses/${business.id}`} className="btn-action btn-view">
                    <i className="fas fa-eye"></i>
                    View
                  </Link>
                  <button onClick={() => handleOpenEdit(business)} className="btn-action btn-edit">
                    <i className="fas fa-edit"></i>
                    Edit
                  </button>
                  {business.rejectedAt && (
                    <button onClick={() => handleResubmit(business.id)} className="btn-action btn-resubmit">
                      <i className="fas fa-redo"></i>
                      Resubmit
                    </button>
                  )}
                  <button onClick={() => handleOpenDelete(business)} className="btn-action btn-delete">
                    <i className="fas fa-trash"></i>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content-modern" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2><i className="fas fa-plus-circle"></i> Create New Business</h2>
              <button onClick={() => setShowCreateModal(false)} className="modal-close">
                <i className="fas fa-times"></i>
              </button>
            </div>
            <form onSubmit={handleCreate} className="modal-form">
              <div className="form-grid">
                <div className="form-field full-width">
                  <label>Business Name <span className="required">*</span></label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter business name"
                    required
                  />
                </div>

                <div className="form-field full-width">
                  <label>Description <span className="required">*</span></label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Describe your business"
                    rows="4"
                    required
                  />
                </div>

                <div className="form-field">
                  <label>Category <span className="required">*</span></label>
                  <select
                    name="categoryId"
                    value={formData.categoryId}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-field">
                  <label>Phone <span className="required">*</span></label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+1 (555) 000-0000"
                    required
                  />
                </div>

                <div className="form-field">
                  <label>Email <span className="required">*</span></label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="business@example.com"
                    required
                  />
                </div>

                <div className="form-field">
                  <label>Website</label>
                  <input
                    type="url"
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                    placeholder="https://example.com"
                  />
                </div>

                <div className="form-field full-width">
                  <label>Address <span className="required">*</span></label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Street address"
                    required
                  />
                </div>

                <div className="form-field">
                  <label>City <span className="required">*</span></label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="City"
                    required
                  />
                </div>

                <div className="form-field">
                  <label>State <span className="required">*</span></label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    placeholder="State"
                    required
                  />
                </div>

                <div className="form-field">
                  <label>Zip Code <span className="required">*</span></label>
                  <input
                    type="text"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleChange}
                    placeholder="Zip code"
                    required
                  />
                </div>

                <div className="form-field">
                  <label>Business Hours</label>
                  <input
                    type="text"
                    name="hours"
                    value={formData.hours}
                    onChange={handleChange}
                    placeholder="e.g., Mon-Fri 9AM-5PM"
                  />
                </div>

                <div className="form-field">
                  <label>Facebook URL</label>
                  <input
                    type="url"
                    name="facebook"
                    value={formData.facebook}
                    onChange={handleChange}
                    placeholder="https://facebook.com/..."
                  />
                </div>

                <div className="form-field">
                  <label>Instagram URL</label>
                  <input
                    type="url"
                    name="instagram"
                    value={formData.instagram}
                    onChange={handleChange}
                    placeholder="https://instagram.com/..."
                  />
                </div>

                <div className="form-field">
                  <label>Twitter URL</label>
                  <input
                    type="url"
                    name="twitter"
                    value={formData.twitter}
                    onChange={handleChange}
                    placeholder="https://twitter.com/..."
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" onClick={() => setShowCreateModal(false)} className="btn-cancel">
                  Cancel
                </button>
                <button type="submit" className="btn-submit">
                  <i className="fas fa-check"></i>
                  Create Business
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content-modern" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2><i className="fas fa-edit"></i> Edit Business</h2>
              <button onClick={() => setShowEditModal(false)} className="modal-close">
                <i className="fas fa-times"></i>
              </button>
            </div>
            <form onSubmit={handleUpdate} className="modal-form">
              <div className="form-grid">
                <div className="form-field full-width">
                  <label>Business Name <span className="required">*</span></label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-field full-width">
                  <label>Description <span className="required">*</span></label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="4"
                    required
                  />
                </div>

                <div className="form-field">
                  <label>Category <span className="required">*</span></label>
                  <select
                    name="categoryId"
                    value={formData.categoryId}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-field">
                  <label>Phone <span className="required">*</span></label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-field">
                  <label>Email <span className="required">*</span></label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-field">
                  <label>Website</label>
                  <input
                    type="url"
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-field full-width">
                  <label>Address <span className="required">*</span></label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-field">
                  <label>City <span className="required">*</span></label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-field">
                  <label>State <span className="required">*</span></label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-field">
                  <label>Zip Code <span className="required">*</span></label>
                  <input
                    type="text"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-field">
                  <label>Business Hours</label>
                  <input
                    type="text"
                    name="hours"
                    value={formData.hours}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-field">
                  <label>Facebook URL</label>
                  <input
                    type="url"
                    name="facebook"
                    value={formData.facebook}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-field">
                  <label>Instagram URL</label>
                  <input
                    type="url"
                    name="instagram"
                    value={formData.instagram}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-field">
                  <label>Twitter URL</label>
                  <input
                    type="url"
                    name="twitter"
                    value={formData.twitter}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" onClick={() => setShowEditModal(false)} className="btn-cancel">
                  Cancel
                </button>
                <button type="submit" className="btn-submit">
                  <i className="fas fa-save"></i>
                  Update Business
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal-content-modern modal-small" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2><i className="fas fa-exclamation-triangle"></i> Confirm Delete</h2>
              <button onClick={() => setShowDeleteModal(false)} className="modal-close">
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to delete <strong>{selectedBusiness?.name}</strong>?</p>
              <p className="warning-text">This action cannot be undone.</p>
            </div>
            <div className="modal-actions">
              <button onClick={() => setShowDeleteModal(false)} className="btn-cancel">
                Cancel
              </button>
              <button onClick={handleDelete} className="btn-delete-confirm">
                <i className="fas fa-trash"></i>
                Delete Business
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserBusinesses;

