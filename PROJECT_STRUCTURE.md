# 📁 Project Structure

This document outlines the clean, organized structure of the CityLocal 101 MERN Stack application.

## Root Directory

```
Clone/
├── backend/              # Node.js + Express + MySQL Backend
├── frontend/             # React + Vite Frontend
├── node_modules/         # Root node_modules (if any)
├── README.md             # Main project documentation
└── PROJECT_STRUCTURE.md  # This file
```

## Backend Structure

```
backend/
├── config/
│   └── database.js       # MySQL/Sequelize configuration
├── middleware/
│   └── auth.js           # Authentication & authorization middleware
├── models/               # Sequelize models
│   ├── User.js
│   ├── Business.js
│   ├── Category.js
│   ├── Review.js
│   ├── Blog.js
│   ├── Contact.js
│   ├── Activity.js
│   └── index.js          # Model associations
├── routes/               # API route handlers
│   ├── auth.js
│   ├── businesses.js
│   ├── categories.js
│   ├── reviews.js
│   ├── blogs.js
│   ├── search.js
│   ├── contact.js
│   └── admin.js
├── scripts/
│   └── seed.js           # Database seeding script
├── utils/                 # Utility functions
│   ├── generateToken.js
│   ├── logActivity.js
│   └── sendEmail.js
├── .env                   # Environment variables (not in git)
├── .gitignore
├── package.json
└── server.js              # Express server entry point
```

## Frontend Structure

```
frontend/
├── public/                # Static assets
│   └── assets/
│       └── images/
│           └── logo.png
├── src/
│   ├── components/       # Reusable React components
│   │   ├── Header.jsx
│   │   ├── Header.css
│   │   ├── Footer.jsx
│   │   ├── Footer.css
│   │   └── ProtectedRoute.jsx
│   ├── context/          # React Context providers
│   │   └── AuthContext.jsx
│   ├── pages/            # Page components
│   │   ├── Home.jsx
│   │   ├── Home.css
│   │   ├── Businesses.jsx
│   │   ├── Businesses.css
│   │   ├── BusinessDetail.jsx
│   │   ├── Blog.jsx
│   │   ├── SearchResults.jsx
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── Auth.css
│   │   ├── AddBusiness.jsx
│   │   ├── WriteReview.jsx
│   │   ├── Support.jsx
│   │   └── Admin.jsx
│   ├── services/         # API service layer
│   │   └── api.js
│   ├── App.jsx           # Main App component
│   ├── App.css
│   ├── main.jsx          # React entry point
│   └── index.css         # Global styles
├── .env                   # Environment variables (not in git)
├── .gitignore
├── index.html            # HTML template
├── package.json
└── vite.config.js        # Vite configuration
```

## Key Files

### Backend
- **server.js**: Main Express server setup and configuration
- **config/database.js**: MySQL connection and Sequelize setup
- **models/**: Database models with relationships
- **routes/**: API endpoint handlers
- **middleware/auth.js**: JWT authentication middleware

### Frontend
- **src/main.jsx**: React application entry point
- **src/App.jsx**: Main app component with routing
- **src/services/api.js**: Axios instance with interceptors
- **src/context/AuthContext.jsx**: Global authentication state
- **vite.config.js**: Vite build configuration

## Environment Files

Both backend and frontend have `.env` files (not tracked in git):
- **backend/.env**: Database credentials, JWT secret, etc.
- **frontend/.env**: API URL configuration

## Build Output

- **frontend/dist/**: Production build output (generated)
- **backend/node_modules/**: Backend dependencies
- **frontend/node_modules/**: Frontend dependencies

## Notes

- All old HTML, CSS, and JavaScript files from the previous version have been removed
- The project now follows a clean separation between backend and frontend
- Static assets (like logo) are in `frontend/public/`
- All code follows modern MERN stack best practices

