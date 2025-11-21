import React, { useState, useEffect } from 'react';
import api from '../services/api';
import './AdminEditBusiness.css';

const AdminEditBusiness = ({ business, onClose, onUpdate }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
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
    socialLinks: { facebook: '', twitter: '', instagram: '', linkedin: '' },
    isActive: false,
    isVerified: false,
    isFeatured: false
  });

  useEffect(() => {
    if (business) {
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
        socialLinks: business.socialLinks || { facebook: '', twitter: '', instagram: '', linkedin: '' },
        isActive: business.isActive || false,
        isVerified: business.isVerified || false,
        isFeatured: business.isFeatured || false
      });
    }
    loadCategories();
  }, [business]);

  const loadCategories = async () => {
    try {
      const response = await api.get('/categories');
      setCategories(response.data.categories || []);
    } catch (error) {
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await api.put(`/admin/businesses/${business.id}`, formData);
      setSuccess('Business updated successfully!');
      setTimeout(() => {
        onUpdate();
        onClose();
      }, 1500);
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to update business');
    } finally {
      setLoading(false);
    }
  };

  if (!business) return null;

  return (
    <div className="admin-edit-modal-overlay" onClick={onClose}>
      <div className="admin-edit-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2><i className="fas fa-edit"></i> Edit Business: {business.name}</h2>
          <button className="close-btn" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="modal-body">
          {error && <div className="alert alert-error"><i className="fas fa-exclamation-circle"></i> {error}</div>}
          {success && <div className="alert alert-success"><i className="fas fa-check-circle"></i> {success}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Business Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Category *</label>
                <select
                  required
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                >
                  <option value="">Select category</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Description *</label>
              <textarea
                required
                rows="4"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Address *</label>
              <input
                type="text"
                required
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>City *</label>
                <input
                  type="text"
                  required
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>State *</label>
                <input
                  type="text"
                  required
                  maxLength="2"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value.toUpperCase() })}
                />
              </div>

              <div className="form-group">
                <label>Zip Code</label>
                <input
                  type="text"
                  value={formData.zipCode}
                  onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Phone *</label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Website</label>
              <input
                type="url"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              />
            </div>

            <h3 className="section-title">Social Media Links</h3>
            <div className="form-row">
              <div className="form-group">
                <label><i className="fab fa-facebook"></i> Facebook</label>
                <input
                  type="url"
                  value={formData.socialLinks?.facebook || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    socialLinks: { ...formData.socialLinks, facebook: e.target.value }
                  })}
                />
              </div>

              <div className="form-group">
                <label><i className="fab fa-twitter"></i> Twitter</label>
                <input
                  type="url"
                  value={formData.socialLinks?.twitter || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    socialLinks: { ...formData.socialLinks, twitter: e.target.value }
                  })}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label><i className="fab fa-instagram"></i> Instagram</label>
                <input
                  type="url"
                  value={formData.socialLinks?.instagram || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    socialLinks: { ...formData.socialLinks, instagram: e.target.value }
                  })}
                />
              </div>

              <div className="form-group">
                <label><i className="fab fa-linkedin"></i> LinkedIn</label>
                <input
                  type="url"
                  value={formData.socialLinks?.linkedin || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    socialLinks: { ...formData.socialLinks, linkedin: e.target.value }
                  })}
                />
              </div>
            </div>

            <h3 className="section-title">Status Settings</h3>
            <div className="checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                />
                <span>Active (Published)</span>
              </label>

              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.isVerified}
                  onChange={(e) => setFormData({ ...formData, isVerified: e.target.checked })}
                />
                <span>Verified</span>
              </label>

              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.isFeatured}
                  onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                />
                <span>Featured</span>
              </label>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn-cancel" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn-save" disabled={loading}>
                {loading ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i> Saving...
                  </>
                ) : (
                  <>
                    <i className="fas fa-save"></i> Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminEditBusiness;

