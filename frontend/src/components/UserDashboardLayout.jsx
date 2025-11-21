import React, { useState, useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './UserDashboardLayout.css';

const UserDashboardLayout = ({ children }) => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [listingsDropdown, setListingsDropdown] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className="user-dashboard-wrapper">
      <div className="user-dashboard-sidebar">
        <div className="sidebar-header">
          <Link to="/" className="sidebar-logo">
            <i className="fas fa-map-marker-alt"></i>
            <span>CityLocal 101</span>
          </Link>
        </div>

        <div className="sidebar-user-info">
          <div className="user-avatar">
            {user?.avatar ? (
              <img src={user.avatar} alt={user.name} />
            ) : (
              <i className="fas fa-user-circle"></i>
            )}
          </div>
          <div className="user-welcome">
            <span className="welcome-text">Welcome,</span>
            <span className="user-name-text">{user?.firstName || user?.name || 'User'}</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <ul>
            <li>
              <Link 
                to="/" 
                className={`nav-item ${isActive('/') ? 'active' : ''}`}
              >
                <i className="fas fa-home"></i>
                <span>Home</span>
              </Link>
            </li>

            <li>
              <Link 
                to="/user-dashboard/profile" 
                className={`nav-item ${isActive('/user-dashboard/profile') ? 'active' : ''}`}
              >
                <i className="fas fa-user"></i>
                <span>Profile</span>
              </Link>
            </li>

            <li className="nav-item-with-dropdown">
              <div 
                className={`nav-item ${listingsDropdown ? 'active' : ''}`}
                onClick={() => setListingsDropdown(!listingsDropdown)}
              >
                <i className="fas fa-list"></i>
                <span>Listings</span>
                <i className={`fas fa-chevron-${listingsDropdown ? 'down' : 'right'} dropdown-arrow`}></i>
              </div>
              {listingsDropdown && (
                <ul className={`dropdown-menu ${listingsDropdown ? 'open' : ''}`}>
                  <li>
                    <Link 
                      to="/user-dashboard/my-businesses" 
                      className={`nav-item ${isActive('/user-dashboard/my-businesses') ? 'active' : ''}`}
                      onClick={() => setListingsDropdown(false)}
                    >
                      <i className="fas fa-store"></i> My Businesses
                    </Link>
                  </li>
                  <li>
                    <Link 
                      to="/user-dashboard/my-reviews" 
                      className={`nav-item ${isActive('/user-dashboard/my-reviews') ? 'active' : ''}`}
                      onClick={() => setListingsDropdown(false)}
                    >
                      <i className="fas fa-comments"></i> My Reviews
                    </Link>
                  </li>
                </ul>
              )}
            </li>

            <li>
              <button onClick={handleLogout} className="nav-item logout-btn">
                <i className="fas fa-sign-out-alt"></i>
                <span>Logout</span>
              </button>
            </li>
          </ul>
        </nav>
      </div>

      <div className="user-dashboard-content">
        {children}
      </div>
    </div>
  );
};

export default UserDashboardLayout;

