const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const { sequelize } = require('../config/database');
const { Business, Category, User } = require('../models');
const { protect, optionalAuth } = require('../middleware/auth');
const logActivity = require('../utils/logActivity');

// Helper function to build order from sort query
const buildOrderFromQuery = (sort) => {
  switch (sort) {
    case 'rating':
      return [
        ['isFeatured', 'DESC'],
        ['ratingAverage', 'DESC'],
        ['ratingCount', 'DESC'],
        ['createdAt', 'DESC']
      ];
    case 'name':
      return [['name', 'ASC']];
    case 'views':
      return [['views', 'DESC']];
    case 'newest':
      return [['createdAt', 'DESC']];
    case 'oldest':
      return [['createdAt', 'ASC']];
    default:
      return [
        ['isFeatured', 'DESC'],
        ['ratingAverage', 'DESC'],
        ['ratingCount', 'DESC'],
        ['createdAt', 'DESC']
      ];
  }
};

// @route   GET /api/businesses
// @desc    Get all businesses
// @access  Public
router.get('/', optionalAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Check if user is authenticated and is a business owner or admin
    const isBusinessOwner = req.user && (req.user.role === 'business_owner' || req.user.role === 'admin');
    
    // Build base where clause
    const baseWhere = {};

    // Search by name or description
    if (req.query.search) {
      baseWhere[Op.or] = [
        { name: { [Op.like]: `%${req.query.search}%` } },
        { description: { [Op.like]: `%${req.query.search}%` } }
      ];
    }

    // Filter by category - support multiple categories
    if (req.query.category) {
      const categories = Array.isArray(req.query.category) ? req.query.category : [req.query.category];
      if (categories.length > 0) {
        baseWhere.categoryId = { [Op.in]: categories.map(c => parseInt(c)) };
      }
    }

    // Filter by city - support multiple cities
    if (req.query.city) {
      const cities = Array.isArray(req.query.city) ? req.query.city : [req.query.city];
      if (cities.length > 0) {
        baseWhere.city = {
          [Op.or]: cities.map(city => ({ [Op.like]: `%${city}%` }))
        };
      }
    }
    
    // Filter by state
    if (req.query.state) {
      baseWhere.state = req.query.state;
    }

    // Filter by rating - support multiple ratings (any rating from selected)
    // Ratings should match ranges: 1 (1.0-1.9), 2 (2.0-2.9), 3 (3.0-3.9), 4 (4.0-4.9), 5 (5.0)
    if (req.query.ratings) {
      const ratings = Array.isArray(req.query.ratings) ? req.query.ratings : [req.query.ratings];
      if (ratings.length > 0) {
        const ratingConditions = ratings.map(rating => {
          const numRating = parseFloat(rating);
          if (numRating === 5) {
            return { ratingAverage: { [Op.gte]: 5 } };
          } else {
            return {
              ratingAverage: {
                [Op.and]: [
                  { [Op.gte]: numRating },
                  { [Op.lt]: numRating + 1 }
                ]
              }
            };
          }
        });
        
        // Add rating conditions to baseWhere
        if (baseWhere[Op.or] && Array.isArray(baseWhere[Op.or])) {
          // If search exists, combine with AND
          baseWhere[Op.and] = [
            { [Op.or]: baseWhere[Op.or] },
            { [Op.or]: ratingConditions }
          ];
          delete baseWhere[Op.or];
        } else {
          baseWhere[Op.or] = ratingConditions;
        }
      }
    } else if (req.query.minRating) {
      // Legacy support for single minRating
      baseWhere.ratingAverage = { [Op.gte]: parseFloat(req.query.minRating) };
    }

    // Featured only
    if (req.query.featured === 'true') {
      baseWhere.isFeatured = true;
    }

    // Build final where clause
    let whereClause;
    if (isBusinessOwner && !req.query.publicOnly) {
      // For business owners/admins: show all their businesses (any status) OR active public businesses
      whereClause = {
        [Op.or]: [
          { ...baseWhere, ownerId: req.user.id }, // All businesses owned by user (any status)
          { ...baseWhere, isActive: true } // Active public businesses
        ]
      };
    } else {
      // For non-business owners or public-only requests: only show active businesses
      whereClause = { ...baseWhere, isActive: true };
    }

    const { count, rows: businesses } = await Business.findAndCountAll({
      where: whereClause,
      include: [
        { model: Category, as: 'category', attributes: ['id', 'name', 'slug', 'icon'] },
        { model: User, as: 'owner', attributes: ['id', 'name', 'email'] }
      ],
      order: buildOrderFromQuery(req.query.sort),
      limit,
      offset
    });

    res.json({
      success: true,
      count: businesses.length,
      total: count,
      page,
      pages: Math.ceil(count / limit),
      businesses
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/businesses/filter-options
// @desc    Get filter options (cities, categories, etc.)
// @access  Public
router.get('/filter-options', async (req, res) => {
  try {
    // Get unique cities using Sequelize.literal for DISTINCT
    const cityResults = await Business.findAll({
      attributes: [
        [sequelize.fn('DISTINCT', sequelize.col('city')), 'city']
      ],
      where: { 
        city: { [Op.ne]: null },
        isActive: true 
      },
      order: [[sequelize.literal('city'), 'ASC']],
      raw: true
    });

    // Extract unique cities and filter out null/empty values
    const uniqueCities = [...new Set(cityResults.map(c => c.city).filter(c => c && c.trim()))].sort();

    // Get all active categories
    const categories = await Category.findAll({
      where: { isActive: true },
      attributes: ['id', 'name', 'slug', 'icon'],
      order: [['name', 'ASC']]
    });

    res.json({
      success: true,
      cities: uniqueCities,
      categories
    });
  } catch (error) {
    console.log('Get filter options error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/businesses/my-businesses
// @desc    Get current user's businesses
// @access  Private
router.get('/my-businesses', protect, async (req, res) => {
  try {
    const businesses = await Business.findAll({
      where: { ownerId: req.user.id },
      include: [
        { model: Category, as: 'category', attributes: ['id', 'name', 'slug', 'icon'] }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      businesses
    });
  } catch (error) {
    console.log('Get my businesses error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/businesses/:id
// @desc    Get single business
// @access  Public
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const business = await Business.findByPk(req.params.id, {
      include: [
        { model: Category, as: 'category', attributes: ['id', 'name', 'slug', 'icon'] },
        { model: User, as: 'owner', attributes: ['id', 'name', 'email'] }
      ]
    });

    if (!business) {
      return res.status(404).json({ error: 'Business not found' });
    }

    // Increment views
    await business.incrementViews();

    res.json({
      success: true,
      business
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   POST /api/businesses
// @desc    Create a business
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    // Validate category exists
    if (!req.body.categoryId) {
      return res.status(400).json({ 
        success: false,
        error: 'Please select a valid category' 
      });
    }
    
    const category = await Category.findByPk(req.body.categoryId);
    if (!category) {
      return res.status(400).json({ 
        success: false,
        error: 'Selected category does not exist' 
      });
    }
    
    // Validate required fields
    if (!req.body.name || !req.body.description) {
      return res.status(400).json({ 
        success: false,
        error: 'Business name and description are required' 
      });
    }
    
    if (!req.body.address || !req.body.city || !req.body.state) {
      return res.status(400).json({ 
        success: false,
        error: 'Address, city, and state are required' 
      });
    }
    
    if (!req.body.phone) {
      return res.status(400).json({ 
        success: false,
        error: 'Phone number is required' 
      });
    }
    
    // Generate slug from business name
    const generateSlug = (name) => {
      return name
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim() + '-' + Date.now();
    };
    
    const slug = generateSlug(req.body.name);
    
    // Create business
    const business = await Business.create({
      name: req.body.name,
      slug: slug,
      description: req.body.description,
      categoryId: req.body.categoryId,
      ownerId: req.user.id,
      address: req.body.address,
      city: req.body.city,
      state: req.body.state,
      zipCode: req.body.zipCode || null,
      country: req.body.country || 'USA',
      phone: req.body.phone,
      email: req.body.email || null,
      website: req.body.website || null,
      hours: req.body.hours || null,
      isActive: false, // New businesses need approval
      isVerified: false,
      tags: req.body.tags || null
    });

    // Update user role to business_owner (but don't change admin role)
    if (req.user.role !== 'admin') {
      await User.update(
        { role: 'business_owner', businessId: business.id },
        { where: { id: req.user.id } }
      );
    } else {
      // Admin adding a business - just link it but keep admin role
      await User.update(
        { businessId: business.id },
        { where: { id: req.user.id } }
      );
    }

    // Log activity
    await logActivity({
      type: 'business_submitted',
      description: `New business "${business.name}" was submitted for approval`,
      userId: req.user.id,
      metadata: { businessName: business.name, ownerName: req.user.name, businessId: business.id }
    });

    // Send notification email to admin
    const sendEmail = require('../utils/sendEmail');
    await sendEmail({
      to: process.env.ADMIN_EMAIL || 'admin@citylocal101.com',
      subject: `New Business Listing Submission: ${business.name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
          <div style="background-color: #667eea; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h2 style="margin: 0; font-size: 24px;">New Business Submission</h2>
            <p style="margin: 10px 0 0 0; font-size: 14px;">CityLocal 101 Admin Panel</p>
          </div>
          <div style="background-color: white; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <p style="color: #333; margin-bottom: 20px;">A new business listing has been submitted and is awaiting approval:</p>
            <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin: 0 0 15px 0; color: #2c3e50;">${business.name}</h3>
              <p style="margin: 5px 0; color: #555;"><strong>Category:</strong> ${category.name}</p>
              <p style="margin: 5px 0; color: #555;"><strong>Location:</strong> ${business.city}, ${business.state}</p>
              <p style="margin: 5px 0; color: #555;"><strong>Owner:</strong> ${req.user.name} (${req.user.email})</p>
              <p style="margin: 5px 0; color: #555;"><strong>Phone:</strong> ${business.phone}</p>
            </div>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/admin/businesses" 
                 style="display: inline-block; background: #667eea; color: white; 
                        padding: 12px 30px; text-decoration: none; border-radius: 8px; 
                        font-weight: 600;">
                Review in Admin Panel
              </a>
            </div>
          </div>
        </div>
      `
    }).catch(() => {});

    res.status(201).json({
      success: true,
      message: 'Business created successfully. It will be reviewed and approved soon.',
      business
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: error.message || 'Failed to create business'
    });
  }
});

// @route   PUT /api/businesses/:id
// @desc    Update business
// @access  Private (Owner or Admin)
router.put('/:id', protect, async (req, res) => {
  try {
    const business = await Business.findByPk(req.params.id);

    if (!business) {
      return res.status(404).json({ error: 'Business not found' });
    }

    // Check ownership
    if (business.ownerId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to update this business' });
    }

    // Prepare update data
    const updateData = { ...req.body };
    
    // If business was rejected and owner is updating, clear rejection fields and set to pending
    if (business.rejectionReason && business.ownerId === req.user.id && req.user.role !== 'admin') {
      updateData.rejectionReason = null;
      updateData.rejectedAt = null;
      updateData.isActive = false; // Set back to pending for review
      
      // Log activity for resubmission
      await logActivity({
        type: 'business_resubmitted',
        description: `Business "${business.name}" was resubmitted for review after rejection`,
        userId: req.user.id,
        metadata: { businessName: business.name, businessId: business.id }
      });
    }

    // Update business
    await business.update(updateData);
    
    // Reload business with associations
    const updatedBusiness = await Business.findByPk(business.id, {
      include: [
        { model: Category, as: 'category', attributes: ['id', 'name', 'slug', 'icon'] },
        { model: User, as: 'owner', attributes: ['id', 'name', 'email'] }
      ]
    });

    res.json({
      success: true,
      message: business.rejectionReason && business.ownerId === req.user.id 
        ? 'Business updated and resubmitted for review' 
        : 'Business updated successfully',
      business: updatedBusiness
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   DELETE /api/businesses/:id
// @desc    Delete business
// @access  Private (Owner or Admin)
router.delete('/:id', protect, async (req, res) => {
  try {
    const business = await Business.findByPk(req.params.id);

    if (!business) {
      return res.status(404).json({ error: 'Business not found' });
    }

    // Check ownership
    if (business.ownerId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to delete this business' });
    }

    await business.destroy();

    res.json({
      success: true,
      message: 'Business deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   POST /api/businesses/:id/contact
// @desc    Send contact message to business
// @access  Public
router.post('/:id/contact', async (req, res) => {
  try {
    const business = await Business.findByPk(req.params.id);
    
    if (!business) {
      return res.status(404).json({ error: 'Business not found' });
    }
    
    const { name, email, phone, message } = req.body;
    
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Name, email, and message are required' });
    }
    
    // Send email to business
    const sendEmail = require('../utils/sendEmail');
    await sendEmail({
      to: business.email || process.env.ADMIN_EMAIL,
      subject: `New inquiry for ${business.name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
          <div style="background-color: #667eea; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h2 style="margin: 0; font-size: 24px;">New Customer Inquiry</h2>
            <p style="margin: 10px 0 0 0; font-size: 14px;">${business.name}</p>
          </div>
          <div style="background-color: white; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <p style="color: #333; margin-bottom: 20px;">You have received a new inquiry from a potential customer:</p>
            <div style="margin-bottom: 20px;">
              <strong style="color: #333; display: block; margin-bottom: 5px;">Name:</strong>
              <span style="color: #666;">${name}</span>
            </div>
            <div style="margin-bottom: 20px;">
              <strong style="color: #333; display: block; margin-bottom: 5px;">Email:</strong>
              <span style="color: #666;">${email}</span>
            </div>
            ${phone ? `
            <div style="margin-bottom: 20px;">
              <strong style="color: #333; display: block; margin-bottom: 5px;">Phone:</strong>
              <span style="color: #666;">${phone}</span>
            </div>
            ` : ''}
            <div style="margin-bottom: 20px;">
              <strong style="color: #333; display: block; margin-bottom: 5px;">Message:</strong>
              <div style="color: #666; background-color: #f5f5f5; padding: 15px; border-radius: 4px; margin-top: 10px; line-height: 1.6;">
                ${message.replace(/\n/g, '<br>')}
              </div>
            </div>
            <p style="color: #7f8c8d; font-size: 14px; margin-top: 30px;">
              Please respond to this inquiry as soon as possible.
            </p>
          </div>
        </div>
      `
    });
    
    // Log activity
    await logActivity({
      type: 'business_contact',
      description: `Contact inquiry sent to ${business.name}`,
      metadata: { businessId: business.id, businessName: business.name, senderEmail: email }
    });
    
    res.json({
      success: true,
      message: 'Your message has been sent to the business'
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// @route   POST /api/businesses/:id/claim
// @desc    Claim a business listing
// @access  Private
router.post('/:id/claim', protect, async (req, res) => {
  try {
    const business = await Business.findByPk(req.params.id);
    
    if (!business) {
      return res.status(404).json({ error: 'Business not found' });
    }
    
    if (business.ownerId) {
      return res.status(400).json({ error: 'This business has already been claimed' });
    }
    
    // Update business with claim info
    await business.update({
      ownerId: req.user.id,
      claimedAt: new Date(),
      isActive: false // Requires admin approval
    });
    
    // Update user role (but don't change admin role)
    if (req.user.role !== 'admin') {
      await User.update(
        { role: 'business_owner', businessId: business.id },
        { where: { id: req.user.id } }
      );
    } else {
      // Admin claiming a business - just link it but keep admin role
      await User.update(
        { businessId: business.id },
        { where: { id: req.user.id } }
      );
    }
    
    // Log activity
    await logActivity({
      type: 'business_claimed',
      description: `Business "${business.name}" was claimed by ${req.user.name}`,
      userId: req.user.id,
      metadata: { businessName: business.name, businessId: business.id, claimerName: req.user.name }
    });
    
    // Send email to admin
    const sendEmail = require('../utils/sendEmail');
    await sendEmail({
      to: process.env.ADMIN_EMAIL || 'admin@citylocal101.com',
      subject: `Business Claim Request: ${business.name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2>Business Claim Request</h2>
          <p><strong>${req.user.name}</strong> (${req.user.email}) has claimed the business listing:</p>
          <h3>${business.name}</h3>
          <p>${business.address}, ${business.city}, ${business.state}</p>
          <p>Please review and approve this claim in the admin dashboard.</p>
        </div>
      `
    });
    
    res.json({
      success: true,
      message: 'Claim request submitted successfully. An admin will review it shortly.'
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to claim business' });
  }
});

// @route   POST /api/businesses/:id/resubmit
// @desc    Resubmit rejected business for review
// @access  Private (Owner only)
router.post('/:id/resubmit', protect, async (req, res) => {
  try {
    const business = await Business.findByPk(req.params.id);
    
    if (!business) {
      return res.status(404).json({ error: 'Business not found' });
    }
    
    // Check ownership
    if (business.ownerId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to resubmit this business' });
    }
    
    // Check if business is actually rejected
    if (!business.rejectedAt) {
      return res.status(400).json({ error: 'Business is not rejected' });
    }
    
    // Reset rejection status
    await business.update({
      isActive: false,
      approvedAt: null,
      rejectedAt: null,
      rejectionReason: null,
      resubmittedAt: new Date()
    });
    
    // Log activity
    await logActivity({
      type: 'business_resubmitted',
      description: `Business "${business.name}" was resubmitted for review`,
      userId: req.user.id,
      metadata: { businessName: business.name, businessId: business.id }
    });
    
    res.json({
      success: true,
      message: 'Business resubmitted successfully. Awaiting admin approval.',
      business
    });
  } catch (error) {
    console.log('Resubmit business error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;

