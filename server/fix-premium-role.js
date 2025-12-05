// Migration script to fix role 'premium' to accountType 'premium'
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

async function fixPremiumRole() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI;
    
    if (!mongoUri) {
      throw new Error('MONGODB_URI not found in .env file');
    }
    
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(mongoUri);

    console.log('✅ Connected to MongoDB');

    // Find all users with role 'premium'
    const usersWithPremiumRole = await User.find({ role: 'premium' });
    
    console.log(`Found ${usersWithPremiumRole.length} users with role 'premium'`);

    // Update each user
    for (const user of usersWithPremiumRole) {
      console.log(`Fixing user: ${user.email}`);
      
      // Set accountType to premium and role to user
      user.accountType = 'premium';
      user.role = 'user';
      
      await user.save({ validateBeforeSave: false });
      console.log(`✅ Fixed ${user.email}`);
    }

    console.log('🎉 Migration complete!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

fixPremiumRole();
