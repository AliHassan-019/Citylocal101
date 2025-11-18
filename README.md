# CityLocal 101 - MERN Stack Business Directory

A complete, production-ready business directory application built with the MERN stack (MongoDB replaced with MySQL) featuring modern UI/UX, comprehensive business listings, reviews, categories, and an admin panel.

## 🚀 Features

- **Business Directory**: Browse and search businesses by category, location, and rating
- **User Authentication**: Secure login/registration with JWT tokens
- **Business Management**: Add, edit, and manage business listings
- **Review System**: Write and manage reviews with ratings
- **Category System**: Organized business categories with icons
- **Admin Panel**: Complete admin dashboard for managing users, businesses, and reviews
- **Blog System**: Content management for blog posts
- **Search Functionality**: Advanced search with filters
- **Responsive Design**: Modern, professional UI that works on all devices
- **MySQL Database**: Robust relational database with Sequelize ORM

## 🛠️ Tech Stack

### Backend
- **Node.js** + **Express.js** - RESTful API
- **MySQL** - Relational database
- **Sequelize** - ORM for database operations
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Express Validator** - Input validation

### Frontend
- **React 18** - UI library
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Vite** - Build tool
- **Font Awesome** - Icons

## 📋 Prerequisites

- Node.js (v16 or higher)
- MySQL (v8.0 or higher)
- npm or yarn

## 🔧 Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd Clone
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory:

```env
NODE_ENV=development
PORT=5000

DB_HOST=localhost
DB_PORT=3306
DB_NAME=citylocal101
DB_USER=root
DB_PASSWORD=your_password

JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d

CORS_ORIGIN=http://localhost:3000
FRONTEND_URL=http://localhost:3000

SYNC_DB=true
```

### 3. Database Setup

Create the MySQL database:

```sql
CREATE DATABASE citylocal101;
```

### 4. Seed Database (Optional)

```bash
cd backend
npm run seed
```

This will create:
- Admin user (email: `admin@citylocal101.com`, password: `admin123`)
- Sample categories
- Sample businesses
- Sample blog posts

### 5. Frontend Setup

```bash
cd frontend
npm install
```

Create a `.env` file in the `frontend` directory (optional):

```env
VITE_API_URL=http://localhost:5000/api
```

## 🚀 Running the Application

### Development Mode

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

- Backend: http://localhost:5000
- Frontend: http://localhost:3000
- API: http://localhost:5000/api

### Production Build

**Backend:**
```bash
cd backend
npm start
```

**Frontend:**
```bash
cd frontend
npm run build
```

The built files will be in `frontend/dist`. You can serve them with the backend or a static file server.

## 📁 Project Structure

```
├── backend/
│   ├── config/
│   │   └── database.js          # Database configuration
│   ├── models/                   # Sequelize models
│   │   ├── User.js
│   │   ├── Business.js
│   │   ├── Category.js
│   │   ├── Review.js
│   │   ├── Blog.js
│   │   ├── Contact.js
│   │   ├── Activity.js
│   │   └── index.js
│   ├── routes/                   # API routes
│   │   ├── auth.js
│   │   ├── businesses.js
│   │   ├── categories.js
│   │   ├── reviews.js
│   │   ├── blogs.js
│   │   ├── search.js
│   │   ├── contact.js
│   │   └── admin.js
│   ├── middleware/
│   │   └── auth.js              # Authentication middleware
│   ├── utils/
│   │   ├── generateToken.js
│   │   ├── logActivity.js
│   │   └── sendEmail.js
│   ├── scripts/
│   │   └── seed.js              # Database seeding script
│   └── server.js                 # Express server
│
├── frontend/
│   ├── public/
│   │   └── assets/
│   │       └── images/
│   ├── src/
│   │   ├── components/          # Reusable components
│   │   │   ├── Header.jsx
│   │   │   ├── Footer.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── pages/               # Page components
│   │   │   ├── Home.jsx
│   │   │   ├── Businesses.jsx
│   │   │   ├── BusinessDetail.jsx
│   │   │   ├── Blog.jsx
│   │   │   ├── SearchResults.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── AddBusiness.jsx
│   │   │   ├── WriteReview.jsx
│   │   │   ├── Support.jsx
│   │   │   └── Admin.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx  # Authentication context
│   │   ├── services/
│   │   │   └── api.js           # API service
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   └── package.json
│
└── README.md
```

## 🔐 Default Admin Credentials

After running the seed script:
- **Email**: `admin@citylocal101.com`
- **Password**: `admin123`

⚠️ **Important**: Change the admin password in production!

## 📝 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/updateprofile` - Update profile
- `PUT /api/auth/changepassword` - Change password

### Businesses
- `GET /api/businesses` - Get all businesses
- `GET /api/businesses/:id` - Get single business
- `POST /api/businesses` - Create business (Protected)
- `PUT /api/businesses/:id` - Update business (Protected)
- `DELETE /api/businesses/:id` - Delete business (Protected)

### Categories
- `GET /api/categories` - Get all categories
- `GET /api/categories/:id` - Get single category
- `POST /api/categories` - Create category (Admin)
- `PUT /api/categories/:id` - Update category (Admin)
- `DELETE /api/categories/:id` - Delete category (Admin)

### Reviews
- `GET /api/reviews` - Get reviews
- `GET /api/reviews/:id` - Get single review
- `POST /api/reviews` - Create review (Protected)
- `PUT /api/reviews/:id` - Update review (Protected)
- `DELETE /api/reviews/:id` - Delete review (Protected)

### Search
- `GET /api/search` - Search businesses
- `GET /api/search/suggestions` - Get search suggestions

### Admin
- `GET /api/admin/stats` - Get dashboard statistics (Admin)
- `GET /api/admin/businesses` - Get all businesses (Admin)
- `PUT /api/admin/businesses/:id/approve` - Approve business (Admin)
- `PUT /api/admin/reviews/:id/approve` - Approve review (Admin)

## 🎨 Features Overview

### For Users
- Browse businesses by category
- Search businesses by name, location, or category
- View business details and reviews
- Write reviews for businesses
- Register and manage account

### For Business Owners
- Add business listing (free)
- Manage business information
- Respond to reviews
- View business statistics

### For Administrators
- Approve/reject business listings
- Approve/reject reviews
- Manage categories
- View dashboard statistics
- Manage users

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Input validation
- SQL injection protection (Sequelize)
- CORS configuration
- Rate limiting
- Helmet.js security headers

## 📱 Responsive Design

The application is fully responsive and works on:
- Desktop
- Tablet
- Mobile devices

## 🚀 Deployment

### Backend Deployment
1. Set `NODE_ENV=production` in `.env`
2. Update database credentials
3. Set secure `JWT_SECRET`
4. Configure CORS for your domain
5. Deploy to your hosting service

### Frontend Deployment
1. Build the frontend: `npm run build`
2. Serve the `dist` folder with your backend or a static file server
3. Update API URL in environment variables

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support, email support@citylocal101.com or use the support form in the application.

## 🎯 Future Enhancements

- Image upload for businesses and reviews
- Advanced filtering and sorting
- Email notifications
- Social media integration
- Business analytics dashboard
- Payment integration
- Multi-language support

---

**Built with ❤️ using the MERN Stack**
