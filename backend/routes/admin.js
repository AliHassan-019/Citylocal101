const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const { User, Business, Review, Category, Contact, Activity, Blog } = require('../models');
const { protect, authorize } = require('../middleware/auth');
const logActivity = require('../utils/logActivity');

// All routes require admin access
router.use(protect, authorize('admin'));

// @route   GET /api/admin/stats
// @desc    Get dashboard statistics
// @access  Private (Admin only)
router.get('/stats', async (req, res) => {
  try {
    const stats = {
      users: await User.count(),
      businesses: await Business.count(),
      activeBusinesses: await Business.count({ where: { isActive: true } }),
      pendingBusinesses: await Business.count({ where: { isActive: false } }),
      reviews: await Review.count(),
      categories: await Category.count(),
      contacts: await Contact.count(),
      unreadContacts: await Contact.count({ where: { status: 'new' } }),
      recentUsers: await User.findAll({
        order: [['createdAt', 'DESC']],
        limit: 5,
        attributes: ['id', 'name', 'email', 'createdAt']
      }),
      recentBusinesses: await Business.findAll({
        order: [['createdAt', 'DESC']],
        limit: 5,
        include: [{ model: Category, as: 'category', attributes: ['name'] }]
      }),
      recentReviews: await Review.findAll({
        order: [['createdAt', 'DESC']],
        limit: 5,
        include: [
          { model: User, as: 'user', attributes: ['name'] },
          { model: Business, as: 'business', attributes: ['name'] }
        ]
      }),
      recentContacts: await Contact.findAll({
        order: [['createdAt', 'DESC']],
        limit: 5
      })
    };

    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/admin/businesses
// @desc    Get all businesses (admin)
// @access  Private (Admin only)
router.get('/businesses', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const { count, rows: businesses } = await Business.findAndCountAll({
      include: [
        { model: Category, as: 'category', attributes: ['name'] },
        { model: User, as: 'owner', attributes: ['name', 'email'] }
      ],
      order: [['createdAt', 'DESC']],
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
    console.error('Admin get businesses error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   PUT /api/admin/businesses/:id/approve
// @desc    Approve business
// @access  Private (Admin only)
router.put('/businesses/:id/approve', async (req, res) => {
  try {
    const business = await Business.findByPk(req.params.id);
    if (!business) {
      return res.status(404).json({ error: 'Business not found' });
    }

    await business.update({ isActive: true, isVerified: true });

    await logActivity({
      type: 'business_approved',
      description: `Business "${business.name}" was approved by admin`,
      userId: req.user.id,
      metadata: { businessName: business.name, businessId: business.id }
    });

    res.json({
      success: true,
      message: 'Business approved successfully',
      business
    });
  } catch (error) {
    console.error('Approve business error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   PUT /api/admin/reviews/:id/approve
// @desc    Approve review
// @access  Private (Admin only)
router.put('/reviews/:id/approve', async (req, res) => {
  try {
    const review = await Review.findByPk(req.params.id);
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    await review.update({ isApproved: true });

    res.json({
      success: true,
      message: 'Review approved successfully',
      review
    });
  } catch (error) {
    console.error('Approve review error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/admin/categories
// @desc    Get all categories (admin)
// @access  Private (Admin only)
router.get('/categories', async (req, res) => {
  try {
    const categories = await Category.findAll({
      order: [['order', 'ASC'], ['name', 'ASC']]
    });

    res.json({
      success: true,
      count: categories.length,
      categories
    });
  } catch (error) {
    console.error('Admin get categories error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;

