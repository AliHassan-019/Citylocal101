# 🚀 Quick Start Guide - CityLocal 101

## ⚡ 3-Minute Setup (Local Development)

### Step 1: Add Your Logo (30 seconds)
1. Put your logo as `logo.png` in `assets/images/` folder
2. Recommended size: 300x60 pixels
3. That's it! Your logo will appear on all pages automatically

### Step 2: Install Dependencies (1 minute)
```bash
npm install
```

### Step 3: Setup Environment (30 seconds)
Create a `.env` file in the root folder:
```env
MONGODB_URI=mongodb://localhost:27017/citylocal101
JWT_SECRET=your-secret-key-here
SESSION_SECRET=your-session-secret-here
PORT=5000
```

### Step 4: Seed Database (30 seconds)
```bash
npm run seed
```

### Step 5: Start Server (10 seconds)
```bash
npm start
```

## 🌐 Access Your Application

- **Website:** http://localhost:5000
- **Admin Panel:** http://localhost:5000/admin
- **API Health:** http://localhost:5000/api/health

### Default Admin Credentials
```
Email: admin@citylocal101.com
Password: Admin@123
```
⚠️ Change these immediately!

---

## 🚀 Deploy to Production (cPanel)

See detailed guide: [CPANEL_DEPLOYMENT_GUIDE.md](CPANEL_DEPLOYMENT_GUIDE.md)

### Quick Deployment Steps:

1. **Prepare Files**
   - Add your logo to `assets/images/logo.png`
   - Zip entire project

2. **Setup MongoDB**
   - Create free MongoDB Atlas account
   - Get connection string

3. **Upload to cPanel**
   - Use File Manager to upload ZIP
   - Extract files

4. **Configure Node.js App**
   - cPanel → Setup Node.js App
   - Create application pointing to your folder

5. **Set Environment Variables**
   - Create `.env` file with production settings
   - Add MongoDB connection string

6. **Install & Start**
   ```bash
   npm install --production
   npm run seed
   # Restart app via cPanel
   ```

7. **Setup SSL**
   - cPanel → SSL/TLS Status
   - Run AutoSSL

✅ Done! Your site is live!

---

## 📁 Project Structure

```
├── assets/
│   └── images/
│       └── logo.png          ← PUT YOUR LOGO HERE
├── models/                   ← Database models
├── routes/                   ← API routes
├── middleware/               ← Authentication & security
├── utils/                    ← Helper functions
├── admin/                    ← Admin panel files
├── *.html                    ← Frontend pages
├── *.js                      ← Frontend scripts
├── styles.css                ← Main stylesheet
├── server.js                 ← Main server file
├── package.json              ← Dependencies
└── .env                      ← Environment config (create this)
```

---

## 🎨 Customization

### Change Logo
- Replace `assets/images/logo.png` with your logo
- Size: 300x60 pixels recommended
- Format: PNG with transparency preferred

### Change Colors
- Edit `styles.css`
- Main colors defined in `:root` section (lines 30-39)

### Add Features
- Backend: Add routes in `routes/` folder
- Frontend: Add pages and update navigation

---

## 📚 Documentation

- **Full Deployment Guide:** [CPANEL_DEPLOYMENT_GUIDE.md](CPANEL_DEPLOYMENT_GUIDE.md)
- **Logo Instructions:** [assets/images/LOGO_INSTRUCTIONS.md](assets/images/LOGO_INSTRUCTIONS.md)
- **API Documentation:** Coming soon

---

## 🆘 Common Issues

**Issue: MongoDB Connection Failed**
```bash
# Make sure MongoDB is running
# Windows: Start MongoDB service
# Mac: brew services start mongodb-community
# Linux: sudo systemctl start mongod
```

**Issue: Port Already in Use**
```bash
# Change PORT in .env file to different number (e.g., 3000, 8080)
```

**Issue: Logo Not Showing**
- Make sure file is named exactly `logo.png`
- Check file is in `assets/images/` folder
- Clear browser cache (Ctrl+Shift+R or Cmd+Shift+R)

---

## 🔧 Useful Commands

```bash
# Development with auto-reload
npm run dev

# Production start
npm start

# Seed database with sample data
npm run seed

# Check for updates
npm outdated
```

---

## 📞 Need Help?

1. Check the detailed [cPanel Deployment Guide](CPANEL_DEPLOYMENT_GUIDE.md)
2. Review error messages in terminal/console
3. Check application logs
4. Verify all environment variables are set

---

## ✨ Features

✅ Business directory with search
✅ User authentication & profiles
✅ Review system with ratings
✅ Admin panel for management
✅ Blog functionality
✅ Contact form
✅ Category management
✅ Responsive design
✅ SEO optimized
✅ Production ready

---

**Happy Building! 🎉**

