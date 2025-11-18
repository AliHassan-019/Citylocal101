const { sequelize, User, Category, Business, Review, Blog } = require('../models');
require('dotenv').config();

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seed...\n');

    // Sync database
    await sequelize.sync({ force: false });
    console.log('✅ Database synced\n');

    // Create admin user
    const admin = await User.findOrCreate({
      where: { email: 'admin@citylocal101.com' },
      defaults: {
        name: 'Admin User',
        email: 'admin@citylocal101.com',
        password: 'admin123',
        role: 'admin',
        isActive: true
      }
    });
    console.log('✅ Admin user created/verified');

    // Create categories
    const categories = [
      { name: 'Restaurants & Dining', icon: 'utensils', description: 'Food and dining establishments' },
      { name: 'Professional Services', icon: 'briefcase', description: 'Professional and business services' },
      { name: 'Retail & Shopping', icon: 'shopping-bag', description: 'Retail stores and shopping' },
      { name: 'Health & Wellness', icon: 'heart', description: 'Health and wellness services' },
      { name: 'Home Services', icon: 'home', description: 'Home improvement and services' },
      { name: 'Auto Services', icon: 'car', description: 'Automotive services' },
      { name: 'Beauty & Spa', icon: 'spa', description: 'Beauty and spa services' },
      { name: 'Education', icon: 'graduation-cap', description: 'Educational services' }
    ];

    const createdCategories = [];
    for (const cat of categories) {
      const [category] = await Category.findOrCreate({
        where: { name: cat.name },
        defaults: cat
      });
      createdCategories.push(category);
    }
    console.log(`✅ Created ${createdCategories.length} categories`);

    // Create sample businesses
    const sampleBusinesses = [
      {
        name: 'Downtown Pizza Co.',
        description: 'Authentic Italian pizza with fresh ingredients and traditional recipes.',
        categoryId: createdCategories[0].id,
        address: '123 Main Street',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        phone: '(555) 123-4567',
        email: 'info@downtownpizza.com',
        website: 'https://downtownpizza.com',
        isActive: true,
        isFeatured: true,
        ratingAverage: 4.5,
        ratingCount: 25
      },
      {
        name: 'Tech Solutions Inc.',
        description: 'Professional IT services and consulting for businesses of all sizes.',
        categoryId: createdCategories[1].id,
        address: '456 Tech Avenue',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94102',
        phone: '(555) 234-5678',
        email: 'contact@techsolutions.com',
        website: 'https://techsolutions.com',
        isActive: true,
        isFeatured: true,
        ratingAverage: 4.8,
        ratingCount: 42
      },
      {
        name: 'Green Thumb Landscaping',
        description: 'Expert landscaping and garden design services for residential and commercial properties.',
        categoryId: createdCategories[4].id,
        address: '789 Garden Lane',
        city: 'Los Angeles',
        state: 'CA',
        zipCode: '90001',
        phone: '(555) 345-6789',
        email: 'info@greenthumb.com',
        isActive: true,
        ratingAverage: 4.3,
        ratingCount: 18
      }
    ];

    const createdBusinesses = [];
    for (const biz of sampleBusinesses) {
      const business = await Business.create(biz);
      createdBusinesses.push(business);
    }
    console.log(`✅ Created ${createdBusinesses.length} sample businesses`);

    // Create sample blog posts
    const sampleBlogs = [
      {
        title: 'How to Choose the Right Local Business',
        summary: 'Finding the perfect local business for your needs doesn\'t have to be difficult.',
        content: 'Finding the perfect local business for your needs doesn\'t have to be difficult. Here are our top tips for making the right choice...',
        author: 'CityLocal 101 Team',
        isPublished: true,
        publishedAt: new Date()
      },
      {
        title: 'The Power of Online Reviews',
        summary: 'Online reviews have become one of the most powerful tools for both businesses and consumers.',
        content: 'Online reviews have become one of the most powerful tools for both businesses and consumers. Learn how to write effective reviews...',
        author: 'CityLocal 101 Team',
        isPublished: true,
        publishedAt: new Date()
      }
    ];

    for (const blog of sampleBlogs) {
      await Blog.findOrCreate({
        where: { title: blog.title },
        defaults: blog
      });
    }
    console.log(`✅ Created sample blog posts`);

    console.log('\n🎉 Database seeding completed successfully!\n');
    console.log('📝 Login credentials:');
    console.log('   Email: admin@citylocal101.com');
    console.log('   Password: admin123\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();

