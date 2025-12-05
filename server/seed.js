require('dotenv').config();
const mongoose = require('mongoose');
const { User, Room } = require('./models');

const seedData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected');

    // Clear existing data
    await User.deleteMany();
    await Room.deleteMany();
    console.log('Cleared existing data');

    // Create admin user
    const admin = await User.create({
      name: 'Admin User',
      email: process.env.ADMIN_EMAIL || 'admin@example.com',
      password: process.env.ADMIN_PASSWORD || 'Admin@123',
      role: 'admin',
      accountType: 'enterprise',
      status: 'active'
    });

    console.log('Admin user created:', admin.email);

    // Create sample users
    const users = await User.create([
      {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        role: 'user',
        accountType: 'free'
      },
      {
        name: 'Jane Smith',
        email: 'jane@example.com',
        password: 'password123',
        role: 'user',
        accountType: 'premium'
      },
      {
        name: 'Bob Wilson',
        email: 'bob@example.com',
        password: 'password123',
        role: 'moderator',
        accountType: 'premium'
      }
    ]);

    console.log(`Created ${users.length} sample users`);

    // Create sample rooms
    const rooms = await Room.create([
      {
        roomId: 'demo-room-1',
        name: 'Demo Public Room',
        host: users[0]._id,
        type: 'public',
        status: 'active',
        participants: [
          { user: users[0]._id, role: 'host' }
        ]
      },
      {
        roomId: 'demo-room-2',
        name: 'Team Meeting',
        host: users[1]._id,
        type: 'private',
        password: 'meeting123',
        status: 'waiting',
        participants: [
          { user: users[1]._id, role: 'host' }
        ]
      }
    ]);

    console.log(`Created ${rooms.length} sample rooms`);

    console.log('\n✅ Database seeded successfully!');
    console.log('\nLogin credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Admin:');
    console.log(`  Email: ${admin.email}`);
    console.log(`  Password: ${process.env.ADMIN_PASSWORD || 'Admin@123'}`);
    console.log('\nSample Users:');
    users.forEach(user => {
      console.log(`  ${user.name}: ${user.email} / password123`);
    });
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedData();
