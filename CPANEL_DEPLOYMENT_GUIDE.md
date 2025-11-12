# 🚀 Complete cPanel Deployment Guide for CityLocal 101

This guide will walk you through deploying your CityLocal 101 business directory on cPanel hosting.

---

## 📋 Table of Contents
1. [Prerequisites](#prerequisites)
2. [Step 1: Prepare Your Files](#step-1-prepare-your-files)
3. [Step 2: Setup MongoDB Database](#step-2-setup-mongodb-database)
4. [Step 3: Upload Files to cPanel](#step-3-upload-files-to-cpanel)
5. [Step 4: Setup Node.js Application](#step-4-setup-nodejs-application)
6. [Step 5: Configure Environment Variables](#step-5-configure-environment-variables)
7. [Step 6: Install Dependencies & Start Server](#step-6-install-dependencies--start-server)
8. [Step 7: Configure Domain & SSL](#step-7-configure-domain--ssl)
9. [Troubleshooting](#troubleshooting)
10. [Post-Deployment](#post-deployment)

---

## Prerequisites

Before starting, ensure you have:
- ✅ cPanel hosting account with Node.js support (version 16.x or higher)
- ✅ MongoDB database (Atlas account or VPS MongoDB)
- ✅ Domain name pointed to your cPanel hosting
- ✅ SSH access (optional but recommended)
- ✅ FTP/SFTP credentials or File Manager access
- ✅ Your custom logo.png file ready

---

## Step 1: Prepare Your Files

### 1.1 Add Your Custom Logo

1. Navigate to `assets/images/` folder in your project
2. Add your logo as `logo.png` (dimensions: 300x60px recommended)
3. Ensure the file is optimized (under 200KB)

### 1.2 Create a ZIP Archive

**Option A: Using File Explorer (Windows)**
```
1. Select all project files and folders
2. Right-click → "Send to" → "Compressed (zipped) folder"
3. Name it: citylocal101.zip
```

**Option B: Using Command Line**
```bash
# Windows (PowerShell)
Compress-Archive -Path * -DestinationPath citylocal101.zip

# Linux/Mac
zip -r citylocal101.zip . -x "node_modules/*" ".git/*"
```

**Important:** You can exclude `node_modules` folder to reduce upload time. Dependencies will be installed on the server.

---

## Step 2: Setup MongoDB Database

### Option A: MongoDB Atlas (Recommended - Free Tier Available)

1. **Create MongoDB Atlas Account**
   - Go to https://www.mongodb.com/cloud/atlas
   - Sign up for free account
   - Create a new cluster (M0 Free tier)

2. **Configure Database Access**
   - Go to "Database Access"
   - Click "Add New Database User"
   - Create username and password (SAVE THESE!)
   - Grant "Read and write to any database" privileges

3. **Configure Network Access**
   - Go to "Network Access"
   - Click "Add IP Address"
   - Select "Allow Access from Anywhere" (0.0.0.0/0)
   - Or add your server's IP address

4. **Get Connection String**
   - Go to "Database" → "Connect"
   - Choose "Connect your application"
   - Copy the connection string
   - Example: `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/citylocal101?retryWrites=true&w=majority`
   - Replace `<password>` with your actual password
   - Replace `myFirstDatabase` with `citylocal101`

### Option B: Self-Hosted MongoDB (VPS Required)

If your hosting includes VPS with MongoDB:
```bash
# Connection string format:
mongodb://localhost:27017/citylocal101
# or
mongodb://your-vps-ip:27017/citylocal101
```

---

## Step 3: Upload Files to cPanel

### Method A: File Manager (Easy, No Software Needed)

1. **Login to cPanel**
   - Navigate to your cPanel URL (usually: yourdomain.com/cpanel)
   - Enter your cPanel username and password

2. **Navigate to File Manager**
   - Find "File Manager" in cPanel dashboard
   - Click to open

3. **Navigate to Application Directory**
   - For subdomain: `/home/username/subdomain_folder/`
   - For main domain: `/home/username/public_html/`
   - Or create a new folder: `/home/username/citylocal/`

4. **Upload ZIP File**
   - Click "Upload" button
   - Select your `citylocal101.zip` file
   - Wait for upload to complete (may take 5-15 minutes)

5. **Extract Files**
   - Return to File Manager
   - Right-click on `citylocal101.zip`
   - Click "Extract"
   - Select destination folder
   - Click "Extract Files"
   - Delete the ZIP file after extraction

### Method B: FTP/SFTP (FileZilla)

1. **Download FileZilla** (if not installed)
   - https://filezilla-project.org/

2. **Connect to Server**
   ```
   Host: ftp.yourdomain.com (or your server IP)
   Username: your_cpanel_username
   Password: your_cpanel_password
   Port: 21 (FTP) or 22 (SFTP)
   ```

3. **Upload Files**
   - Navigate to application directory on server
   - Upload all project files (or upload ZIP and extract via cPanel)

---

## Step 4: Setup Node.js Application

### 4.1 Access Node.js Selector

1. **Login to cPanel**
2. Find "Setup Node.js App" (search if not visible)
3. Click to open Node.js application manager

### 4.2 Create Node.js Application

1. **Click "Create Application"**

2. **Configure Application Settings:**
   ```
   Node.js version: 16.x or higher (18.x recommended)
   Application mode: Production
   Application root: /home/username/citylocal (your folder path)
   Application URL: yourdomain.com or subdomain.yourdomain.com
   Application startup file: server.js
   Passenger log file: (leave default)
   ```

3. **Click "Create"**
   - Wait for application to be created
   - cPanel will show application details

### 4.3 Note Important Information

After creation, you'll see:
```
- Virtual environment path
- Command to enter virtual environment
- Run NPM install command
```

Keep this information handy!

---

## Step 5: Configure Environment Variables

### 5.1 Create .env File

**Option A: Using cPanel File Manager**

1. Navigate to your application folder
2. Click "New File"
3. Name it `.env`
4. Right-click → "Edit"
5. Add the following content:

```env
# Server Configuration
NODE_ENV=production
PORT=5000

# MongoDB Configuration
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/citylocal101?retryWrites=true&w=majority

# JWT Secret (Generate a strong random string)
JWT_SECRET=your-super-secret-jwt-key-change-this-to-random-string

# Session Secret (Generate a strong random string)
SESSION_SECRET=your-super-secret-session-key-change-this-too

# Email Configuration (for contact forms)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-specific-password

# CORS Configuration
CORS_ORIGIN=https://yourdomain.com

# Rate Limiting
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX_REQUESTS=100

# Admin Configuration
ADMIN_EMAIL=admin@yourdomain.com
```

6. **Click "Save Changes"**

### 5.2 Generate Strong Secrets

Use these commands to generate secure random strings:

**Online Tool:**
- Visit: https://www.random.org/strings/
- Or use: https://randomkeygen.com/

**Command Line (if SSH access):**
```bash
# Generate JWT Secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Generate Session Secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 5.3 Setup Email (Optional but Recommended)

For Gmail:
1. Enable 2-Factor Authentication on your Google account
2. Generate App-Specific Password:
   - Go to: https://myaccount.google.com/apppasswords
   - Generate password for "Mail"
   - Use this password in `EMAIL_PASSWORD`

---

## Step 6: Install Dependencies & Start Server

### Method A: Using cPanel Terminal (Recommended)

1. **Open Terminal in cPanel**
   - Find "Terminal" in cPanel dashboard
   - Click to open

2. **Navigate to Application Directory**
   ```bash
   cd ~/citylocal
   # or
   cd ~/public_html
   ```

3. **Enter Node.js Virtual Environment**
   ```bash
   source /home/username/nodevenv/citylocal/16/bin/activate
   ```
   (Replace with your actual virtual environment path from Step 4.3)

4. **Install Dependencies**
   ```bash
   npm install --production
   ```

5. **Seed Database (First Time Only)**
   ```bash
   npm run seed
   ```

6. **Restart Application**
   - Go back to "Setup Node.js App" in cPanel
   - Click "Restart" button on your application

### Method B: Using SSH (If Available)

1. **Connect via SSH**
   ```bash
   ssh username@yourdomain.com
   ```

2. **Follow steps 2-6 from Method A**

---

## Step 7: Configure Domain & SSL

### 7.1 Point Domain to Application

**If using subdomain:**
1. Go to cPanel → "Subdomains"
2. Create subdomain (e.g., `app.yourdomain.com`)
3. Point to your application folder

**If using main domain:**
- Application should be in `/public_html/`

### 7.2 Install SSL Certificate (HTTPS)

1. **Go to cPanel → "SSL/TLS Status"**
2. Select your domain
3. Click "Run AutoSSL"
4. Wait for installation (2-5 minutes)

**Or use Let's Encrypt:**
1. Go to "SSL/TLS"
2. Click "Manage SSL sites"
3. Install Let's Encrypt certificate

### 7.3 Force HTTPS Redirect

Create/Edit `.htaccess` file in your application root:

```apache
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# Node.js Application Configuration
PassengerAppRoot /home/username/citylocal
PassengerBaseURI /
PassengerNodejs /home/username/nodevenv/citylocal/16/bin/node
PassengerAppType node
PassengerStartupFile server.js
```

---

## Step 8: Verify Deployment

### 8.1 Test Website

1. **Visit your domain**: `https://yourdomain.com`
2. **Check API health**: `https://yourdomain.com/api/health`
   - Should return: `{"status":"OK","message":"Server is running"}`

### 8.2 Test Admin Panel

1. Visit: `https://yourdomain.com/admin`
2. Login with default credentials:
   ```
   Email: admin@citylocal101.com
   Password: Admin@123
   ```
   **⚠️ IMPORTANT: Change these immediately after first login!**

### 8.3 Test Features

- ✅ Homepage loads with categories and businesses
- ✅ Search functionality works
- ✅ Business listings display
- ✅ Contact form sends emails
- ✅ User registration/login works
- ✅ Admin panel accessible

---

## Troubleshooting

### Issue: "Application Error" or 500 Error

**Solution:**
1. Check Passenger log files:
   - cPanel → Setup Node.js App → View log
2. Common causes:
   - Missing `.env` file
   - Wrong MongoDB connection string
   - Node modules not installed
   - Wrong file permissions

**Fix:**
```bash
# Reinstall dependencies
cd ~/citylocal
source /home/username/nodevenv/citylocal/16/bin/activate
npm install --production

# Restart application
```

### Issue: MongoDB Connection Failed

**Solution:**
1. Verify MongoDB Atlas IP whitelist includes your server IP
2. Test connection string:
   ```bash
   node -e "const mongoose = require('mongoose'); mongoose.connect('YOUR_MONGODB_URI').then(() => console.log('Connected!')).catch(err => console.error(err));"
   ```
3. Ensure `.env` file has correct `MONGODB_URI`

### Issue: Static Files Not Loading (CSS/JS)

**Solution:**
1. Check file permissions:
   ```bash
   chmod -R 755 ~/citylocal
   ```
2. Verify `.htaccess` configuration
3. Clear browser cache

### Issue: Port Already in Use

**Solution:**
- cPanel's Passenger manages ports automatically
- Don't specify port in Node.js app for cPanel
- Or change PORT in `.env` to different value

### Issue: Application Won't Restart

**Solution:**
1. Stop application:
   ```bash
   touch ~/citylocal/tmp/restart.txt
   ```
2. Or use cPanel interface to restart
3. Check for syntax errors in `server.js`

---

## Post-Deployment Checklist

### Security

- [ ] Change default admin password
- [ ] Generate strong JWT_SECRET and SESSION_SECRET
- [ ] Configure MongoDB Atlas IP whitelist
- [ ] Enable HTTPS/SSL
- [ ] Set up firewall rules (if VPS)
- [ ] Regular security updates

### Performance

- [ ] Enable gzip compression in .htaccess
- [ ] Configure caching headers
- [ ] Optimize images (especially logo)
- [ ] Enable CDN (optional - Cloudflare free tier)
- [ ] Set up monitoring (UptimeRobot, etc.)

### Backup

- [ ] Setup automated MongoDB backups (Atlas does this automatically)
- [ ] Backup `.env` file securely
- [ ] Regular file system backups
- [ ] Document your configuration

### Monitoring

- [ ] Setup uptime monitoring
- [ ] Configure error logging
- [ ] Monitor server resources
- [ ] Check application logs regularly

---

## Useful cPanel Commands

```bash
# Check Node.js version
node --version

# Check NPM version
npm --version

# View running processes
ps aux | grep node

# Check application logs
tail -f ~/nodevenv/citylocal/16/passenger.log

# Restart application
touch ~/citylocal/tmp/restart.txt

# Check MongoDB connection
node -e "require('mongoose').connect(process.env.MONGODB_URI).then(() => console.log('OK'))"
```

---

## Additional Resources

### Documentation
- Node.js cPanel Documentation: https://docs.cpanel.net/cpanel/software/setup-nodejs-app/
- MongoDB Atlas Docs: https://docs.atlas.mongodb.com/
- Express.js Deployment: https://expressjs.com/en/advanced/best-practice-performance.html

### Support
- cPanel Support: Contact your hosting provider
- MongoDB Atlas Support: https://support.mongodb.com/
- Project Issues: Check error logs and console

---

## Production Best Practices

1. **Never commit `.env` file to version control**
2. **Use strong passwords and secrets**
3. **Keep dependencies updated**: `npm outdated`
4. **Monitor application performance**
5. **Setup error tracking** (Sentry, LogRocket, etc.)
6. **Regular backups** of database and files
7. **Use CDN** for static assets
8. **Implement rate limiting** (already configured)
9. **Setup monitoring alerts**
10. **Document your configuration**

---

## Common cPanel Hosting Providers

These providers support Node.js applications:
- **A2 Hosting** (Recommended for Node.js)
- **Hostinger** (VPS plans)
- **SiteGround** (Cloud plans)
- **InMotion Hosting**
- **Bluehost** (VPS/Dedicated)
- **GreenGeeks**

**Note:** Shared hosting may have limitations. VPS or Cloud hosting recommended for production.

---

## Need Help?

If you encounter issues:
1. Check application logs in cPanel
2. Verify all environment variables
3. Test MongoDB connection separately
4. Check file permissions
5. Contact your hosting provider support
6. Review Node.js and MongoDB documentation

---

## 🎉 Congratulations!

Your CityLocal 101 application should now be live and fully functional on cPanel!

**Next Steps:**
- Add your custom logo
- Customize branding
- Add business listings
- Configure email notifications
- Promote your directory

---

**Last Updated:** November 2025
**Project Version:** 1.0.0

