const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const { Business, Category } = require('../models');

// @route   GET /api/search
// @desc    Search businesses
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { q, category, city, state, minRating, sort } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const where = { isActive: true };

    // Search by name or description
    if (q) {
      where[Op.or] = [
        { name: { [Op.like]: `%${q}%` } },
        { description: { [Op.like]: `%${q}%` } }
      ];
    }

    // Filter by category
    if (category) {
      where.categoryId = category;
    }

    // Filter by location
    if (city) {
      where.city = { [Op.like]: `%${city}%` };
    }
    if (state) {
      where.state = { [Op.like]: `%${state}%` };
    }

    // Filter by rating
    if (minRating) {
      where.ratingAverage = { [Op.gte]: parseFloat(minRating) };
    }

    // Sorting
    let order = [['createdAt', 'DESC']];
    if (sort === 'rating') {
      order = [['ratingAverage', 'DESC'], ['ratingCount', 'DESC']];
    } else if (sort === 'name') {
      order = [['name', 'ASC']];
    } else if (sort === 'views') {
      order = [['views', 'DESC']];
    }

    const { count, rows: businesses } = await Business.findAndCountAll({
      where,
      include: [
        { model: Category, as: 'category', attributes: ['id', 'name', 'slug', 'icon'] }
      ],
      order,
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
    console.log('Search error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/search/suggestions
// @desc    Get search suggestions
// @access  Public
router.get('/suggestions', async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.length < 2) {
      return res.json({ success: true, suggestions: [] });
    }

    // Search in business names
    const businesses = await Business.findAll({
      where: {
        name: { [Op.like]: `%${q}%` },
        isActive: true
      },
      attributes: ['id', 'name', 'slug', 'city', 'state'],
      limit: 8
    });

    // Search in categories
    const categories = await Category.findAll({
      where: {
        name: { [Op.like]: `%${q}%` },
        isActive: true
      },
      attributes: ['id', 'name', 'slug', 'icon'],
      limit: 5
    });

    const suggestions = [
      ...categories.map(cat => ({
        type: 'category',
        name: cat.name,
        slug: cat.slug,
        icon: cat.icon,
        id: cat.id
      })),
      ...businesses.map(biz => ({
        type: 'business',
        name: biz.name,
        slug: biz.slug,
        icon: 'building',
        city: biz.city,
        state: biz.state,
        id: biz.id
      }))
    ];

    res.json({
      success: true,
      suggestions
    });
  } catch (error) {
    console.log('Suggestions error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/search/location-suggestions
// @desc    Get location suggestions (cities/states)
// @access  Public
router.get('/location-suggestions', async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.length < 2) {
      return res.json({ success: true, suggestions: [] });
    }

    const searchQuery = q.trim();

    // Get unique city/state combinations
    const businesses = await Business.findAll({
      where: {
        isActive: true,
        [Op.or]: [
          { city: { [Op.like]: `%${searchQuery}%` } },
          { state: { [Op.like]: `%${searchQuery}%` } }
        ]
      },
      attributes: ['city', 'state'],
      limit: 150,
      raw: true
    });

    // Create unique location strings
    const locationMap = new Map();
    
    businesses.forEach(b => {
      if (b.city && b.state) {
        const key = `${b.city}, ${b.state}`.toLowerCase();
        if (!locationMap.has(key)) {
          locationMap.set(key, {
            name: `${b.city}, ${b.state}`,
            city: b.city,
            state: b.state
          });
        }
      }
    });

    // Convert to array and filter/sort
    let locations = Array.from(locationMap.values())
      .filter(loc => {
        const searchLower = searchQuery.toLowerCase();
        return loc.city.toLowerCase().includes(searchLower) || 
               loc.state.toLowerCase().includes(searchLower) ||
               loc.name.toLowerCase().includes(searchLower);
      })
      .sort((a, b) => {
        // Prioritize matches at the start of city name
        const aCityStart = a.city.toLowerCase().startsWith(searchQuery.toLowerCase());
        const bCityStart = b.city.toLowerCase().startsWith(searchQuery.toLowerCase());
        if (aCityStart && !bCityStart) return -1;
        if (!aCityStart && bCityStart) return 1;
        return a.name.localeCompare(b.name);
      })
      .slice(0, 10);

    res.json({
      success: true,
      suggestions: locations.map(loc => ({
        type: 'location',
        name: loc.name,
        city: loc.city,
        state: loc.state
      }))
    });
  } catch (error) {
    console.log('Location suggestions error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;

