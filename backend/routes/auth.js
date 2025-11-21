const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const { body, validationResult } = require('express-validator');
const { User } = require('../models');
const generateToken = require('../utils/generateToken');
const { protect } = require('../middleware/auth');
const logActivity = require('../utils/logActivity');

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        errors: errors.array() 
      });
    }

    const { name, email, password } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ where: { email } });
    if (userExists) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role: 'user'
    });

    // Log activity
    await logActivity({
      type: 'user_registered',
      description: `New user "${user.name}" registered`,
      userId: user.id,
      metadata: { userName: user.name, userEmail: user.email }
    });

    // Generate token
    const token = generateToken(user.id);

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error during registration' });
  }
});

// @route   POST /api/auth/login
// @desc    Login user (NO ADMIN - use /api/auth/admin/login)
// @access  Public
router.post('/login', [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        errors: errors.array() 
      });
    }

    const { email, password } = req.body;

    // Check for user (include password for comparison)
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // BLOCK ADMIN LOGIN ON MAIN SITE - Return generic error
    if (user.role === 'admin') {
      return res.status(401).json({ 
        error: 'Invalid credentials' 
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({ error: 'Account is deactivated' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Update last login
    await user.updateLastLogin();

    // Generate token
    const token = generateToken(user.id);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        avatar: user.avatar,
        lastLogin: user.lastLogin
      }
    });
  } catch (error) {
    console.log('Login error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
});

// @route   POST /api/auth/admin/login
// @desc    Admin login (ONLY ADMIN)
// @access  Public (Admin only)
router.post('/admin/login', [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        errors: errors.array() 
      });
    }

    const { email, password } = req.body;

    // Check for user
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid admin credentials' });
    }

    // ONLY ALLOW ADMIN ROLE
    if (user.role !== 'admin') {
      return res.status(403).json({ 
        error: 'This is an admin login. Regular users should login at /login' 
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({ error: 'Admin account is deactivated' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid admin credentials' });
    }

    // Update last login
    await user.updateLastLogin();

    // Generate token
    const token = generateToken(user.id);

    res.json({
      success: true,
      message: 'Admin login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        avatar: user.avatar,
        lastLogin: user.lastLogin
      }
    });
  } catch (error) {
    console.log('Admin login error:', error);
    res.status(500).json({ error: 'Server error during admin login' });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });
    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar,
        firstName: user.firstName,
        lastName: user.lastName,
        gender: user.gender,
        username: user.username,
        secondEmail: user.secondEmail,
        address: user.address,
        city: user.city,
        state: user.state,
        country: user.country,
        zipCode: user.zipCode,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.log('Get user error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   PUT /api/auth/updateprofile
// @desc    Update user profile
// @access  Private
router.put('/updateprofile', protect, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    
    // Check for username uniqueness if username is being changed
    if (req.body.username && req.body.username !== user.username) {
      const existingUser = await User.findOne({ 
        where: { 
          username: req.body.username,
          id: { [Op.ne]: user.id }
        } 
      });
      
      if (existingUser) {
        return res.status(400).json({ 
          error: 'Username already taken. Please choose another.' 
        });
      }
    }
    
    // Update allowed fields
    const allowedFields = [
      'name', 'phone', 'firstName', 'lastName', 'gender', 
      'username', 'secondEmail', 'address', 'city', 
      'state', 'country', 'zipCode'
    ];
    
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined && req.body[field] !== null) {
        user[field] = req.body[field];
      }
    });
    
    // Handle avatar separately with validation
    if (req.body.avatar !== undefined) {
      if (req.body.avatar === '' || req.body.avatar === null) {
        user.avatar = null;
      } else if (typeof req.body.avatar === 'string' && req.body.avatar.startsWith('data:image')) {
        // Validate base64 size (max 500KB after encoding)
        if (req.body.avatar.length > 500000) {
          return res.status(400).json({ 
            error: 'Image is too large. Please use a smaller image (max 500KB).' 
          });
        }
        user.avatar = req.body.avatar;
      }
    }
    
    await user.save();

    // Log activity
    await logActivity({
      type: 'profile_updated',
      description: `User "${user.name}" updated their profile`,
      userId: user.id,
      metadata: { userName: user.name }
    });

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        firstName: user.firstName,
        lastName: user.lastName,
        gender: user.gender,
        username: user.username,
        secondEmail: user.secondEmail,
        address: user.address,
        city: user.city,
        state: user.state,
        country: user.country,
        zipCode: user.zipCode,
        avatar: user.avatar,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    
    // Handle specific database errors
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ 
        error: 'Username already exists. Please choose another.' 
      });
    }
    
    if (error.name === 'SequelizeDatabaseError' && error.message.includes('Data too long')) {
      return res.status(400).json({ 
        error: 'Image data is too large for database. Please use a smaller image.' 
      });
    }
    
    res.status(500).json({ 
      error: 'Failed to update profile. Please try again.' 
    });
  }
});

// @route   PUT /api/auth/changepassword
// @desc    Change password
// @access  Private
router.put('/changepassword', protect, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);

    // Check current password
    if (!(await user.comparePassword(req.body.currentPassword))) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    user.password = req.body.newPassword;
    await user.save();

    const token = generateToken(user.id);

    res.json({
      success: true,
      message: 'Password changed successfully',
      token
    });
  } catch (error) {
    console.log('Change password error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   POST /api/auth/logout
// @desc    Logout user
// @access  Private
router.post('/logout', protect, (req, res) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });

  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

module.exports = router;

