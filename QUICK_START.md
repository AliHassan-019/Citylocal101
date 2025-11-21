# Quick Start Guide - CityLocal 101

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- MySQL/SQLite database

---

## 📦 Installation

### 1. Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the `backend` directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration (MySQL)
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=citylocal101
DB_DIALECT=mysql

# OR use SQLite for development
# DB_DIALECT=sqlite
# DB_STORAGE=./database.sqlite

# JWT Secret
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production

# Email Configuration (Optional - emails will be simulated if not configured)
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-gmail-app-password
EMAIL_FROM=CityLocal 101 <noreply@citylocal101.com>
ADMIN_EMAIL=admin@citylocal101.com

# Frontend URL
FRONTEND_URL=http://localhost:5173

# CORS Origin
CORS_ORIGIN=http://localhost:5173
```

### 3. Initialize Database

```bash
cd backend

# The database will be created automatically on first run
# If using MySQL, create the database first:
# mysql -u root -p
# CREATE DATABASE citylocal101;

# Run the server (it will sync the database)
npm start
```

### 4. Run Database Migration

```bash
cd backend
node scripts/add-social-links-migration.js
```

### 5. Seed Database (Optional)

```bash
cd backend
node scripts/seed.js
```

This will create:
- Sample categories
- Sample businesses
- An admin user (admin@example.com / admin123)
- Sample users and reviews

---

## 🏃 Running the Application

### Start Backend Server

```bash
cd backend
npm start
```

Backend will run on: `http://localhost:5000`

### Start Frontend Development Server

```bash
cd frontend
npm run dev
```

Frontend will run on: `http://localhost:5173`

---

## 👤 Default Admin Account

After seeding, you can log in with:

- **Email**: `admin@example.com`
- **Password**: `admin123`

**⚠️ Important**: Change this password in production!

---

## 📧 Email Setup (Gmail)

### Step 1: Enable 2-Factor Authentication
1. Go to your Google Account settings
2. Enable 2-Factor Authentication

### Step 2: Generate App Password
1. Go to https://myaccount.google.com/apppasswords
2. Select "Mail" and "Other (Custom name)"
3. Name it "CityLocal 101"
4. Copy the 16-character password

### Step 3: Update .env
```env
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=the-16-character-app-password
```

---

## 🧪 Testing the Application

### Test User Journey

1. **Visit Homepage**: http://localhost:5173
2. **Register**: Create a new user account
3. **Add Business**: Submit a business listing
4. **Check Email**: Admin should receive notification email
5. **Admin Login**: Log in as admin
6. **Approve Business**: Go to Admin → Businesses → Approve
7. **Check Email**: Business owner receives approval email
8. **Business Owner Login**: Log in as the business owner
9. **Access Dashboard**: Click "My Dashboard" in header
10. **Edit Business**: Update information, add social links

### Test Admin Features

1. **Login as Admin**: admin@example.com / admin123
2. **View Dashboard**: See statistics overview
3. **Manage Businesses**: Approve/Edit/Delete
4. **Manage Users**: View/Edit/Delete users
5. **Manage Categories**: Create/Edit/Delete categories
6. **View Activities**: Check system activity log

### Test Business Profile Features

1. **View Business**: Click any business
2. **See Map**: Check Google Maps integration
3. **Submit Contact Form**: Send a message
4. **Check Email**: Business should receive the inquiry
5. **View Social Links**: Check social media icons
6. **View Business Hours**: See weekly schedule
7. **Write Review**: Submit a review

---

## 🔍 Troubleshooting

### Database Connection Issues

**MySQL Error**: "Access denied"
```bash
# Solution: Check DB credentials in .env
DB_USER=root
DB_PASSWORD=your_correct_password
```

**SQLite Error**: File permission
```bash
# Solution: Ensure write permissions
chmod 644 backend/database.sqlite
```

### Email Not Sending

**Gmail Authentication Error**
- Ensure 2FA is enabled
- Use App Password, not regular password
- Check EMAIL_USER and EMAIL_PASSWORD in .env

**Emails Being Simulated**
- If EMAIL_USER or EMAIL_PASSWORD is not set, emails are simulated
- Check console for "Email simulated" messages

### Frontend Not Loading

**Port Already in Use**
```bash
# Solution: Change port in vite.config.js or kill the process
# Windows:
netstat -ano | findstr :5173
taskkill /PID <PID> /F

# Linux/Mac:
lsof -ti:5173 | xargs kill
```

### API Connection Failed

**CORS Error**
```bash
# Solution: Check CORS_ORIGIN in backend .env
CORS_ORIGIN=http://localhost:5173
```

**Wrong API URL**
- Check `frontend/src/services/api.js`
- Should be: `http://localhost:5000/api`

---

## 📱 Production Deployment

### Build Frontend

```bash
cd frontend
npm run build
```

Files will be in `frontend/dist/`

### Production Environment Variables

Update `.env` for production:

```env
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://yourdomain.com
CORS_ORIGIN=https://yourdomain.com
JWT_SECRET=generate_a_strong_random_secret
DB_DIALECT=mysql
# Use MySQL in production, SQLite only for development
```

### Deploy Backend
- Use PM2 or similar process manager
- Set up reverse proxy (nginx)
- Enable HTTPS with Let's Encrypt
- Set up database backups

### Deploy Frontend
- Serve from nginx or Vercel/Netlify
- Update API endpoint in `api.js`
- Enable HTTPS

---

## 🎯 Key Features to Test

### ✅ User Features
- [ ] Search with autocomplete
- [ ] Filter businesses by category
- [ ] View business profiles with maps
- [ ] Submit contact forms
- [ ] Write reviews
- [ ] Claim businesses

### ✅ Business Owner Features
- [ ] Register business
- [ ] Access dashboard
- [ ] Edit business information
- [ ] Add social media links
- [ ] View statistics

### ✅ Admin Features
- [ ] View dashboard statistics
- [ ] Approve businesses
- [ ] Manage users
- [ ] Create categories
- [ ] View activity logs
- [ ] Receive email notifications

---

## 📚 API Endpoints

### Public Routes
- `GET /api/categories` - Get all categories
- `GET /api/businesses` - Get businesses (with filters)
- `GET /api/businesses/:id` - Get single business
- `POST /api/businesses/:id/contact` - Send inquiry
- `GET /api/reviews` - Get reviews
- `POST /api/contact` - Support form

### Protected Routes (Require Login)
- `POST /api/businesses` - Create business
- `PUT /api/businesses/:id` - Update business
- `POST /api/businesses/:id/claim` - Claim business
- `POST /api/reviews` - Create review

### Admin Routes (Admin Only)
- `GET /api/admin/stats` - Dashboard statistics
- `PUT /api/admin/businesses/:id/approve` - Approve business
- `GET /api/admin/users` - Get all users
- `POST /api/admin/categories` - Create category
- And more...

---

## 🎨 Customization

### Colors
Edit colors in CSS files:
- Primary: `#667eea`
- Secondary: `#764ba2`
- Success: `#4cd964`
- Warning: `#ffc107`

### Logo
Replace `frontend/public/assets/images/logo.png`

### Email Templates
Edit email HTML in:
- `backend/routes/businesses.js`
- `backend/routes/admin.js`
- `backend/routes/contact.js`

---

## 💡 Tips

1. **Development**: Use SQLite for faster setup
2. **Production**: Use MySQL (SQLite only for development)
3. **Email**: Configure in production for real notifications
4. **Security**: Change JWT_SECRET and admin password
5. **Backup**: Regular database backups in production

---

## 📞 Support

For issues or questions:
1. Check `FEATURES.md` for feature documentation
2. Check `IMPLEMENTATION_SUMMARY.md` for implementation details
3. Review console logs for error messages
4. Check network tab for API errors

---

## ✅ Success!

If you can:
- ✅ See the homepage with categories
- ✅ Search and filter businesses
- ✅ Register and login
- ✅ Add a business
- ✅ Access admin dashboard
- ✅ View business profiles with maps

**Your CityLocal 101 platform is ready!** 🎉

