// scripts/seedAdminUsers.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://fadli:Nuln3IeyzHkZIjM2@ac-f5po0ec-shard-00-00.osofrtv.mongodb.net:27017,ac-f5po0ec-shard-00-01.osofrtv.mongodb.net:27017,ac-f5po0ec-shard-00-02.osofrtv.mongodb.net:27017/ecocropshare_db?replicaSet=atlas-1481lj-shard-0&ssl=true&authSource=admin';

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'superadmin'], default: 'user' },
  isActive: { type: Boolean, default: true },
  profile: {
    avatar: String,
    bio: String,
    phone: String,
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String
    }
  },
  stats: {
    postsCount: { type: Number, default: 0 },
    requestsCount: { type: Number, default: 0 },
    successfulTrades: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },
    totalRatings: { type: Number, default: 0 }
  },
  lastLogin: Date,
  emailVerified: { type: Boolean, default: false }
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function seedAdminUsers() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Admin users data
    const adminUsers = [
      {
        name: 'Super Administrator',
        email: 'superadmin@ecocropshare.com',
        password: 'password123',
        role: 'superadmin',
        isActive: true,
        emailVerified: true
      },
      {
        name: 'Administrator',
        email: 'admin@ecocropshare.com',
        password: 'password123',
        role: 'admin',
        isActive: true,
        emailVerified: true
      }
    ];

    for (const userData of adminUsers) {
      // Check if user already exists
      const existingUser = await User.findOne({ email: userData.email });
      
      if (existingUser) {
        console.log(`User ${userData.email} already exists, skipping...`);
        continue;
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 12);
      
      // Create user
      const user = new User({
        ...userData,
        password: hashedPassword
      });

      await user.save();
      console.log(`✅ Created ${userData.role}: ${userData.email}`);
    }

    console.log('\n🎉 Admin users seeded successfully!');
    console.log('\n📋 Login Credentials:');
    console.log('Super Admin: superadmin@ecocropshare.com / password123');
    console.log('Admin: admin@ecocropshare.com / password123');

  } catch (error) {
    console.error('❌ Error seeding admin users:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

// Run the seed function
seedAdminUsers();