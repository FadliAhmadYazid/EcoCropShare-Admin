import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true, // This already creates a unique index
    lowercase: true,
    trim: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please enter a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false // Don't include password in queries by default
  },
  role: {
    type: String,
    enum: {
      values: ['user', 'admin', 'superadmin'],
      message: 'Role must be either user, admin, or superadmin'
    },
    default: 'user'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  profile: {
    avatar: {
      type: String,
      default: null
    },
    bio: {
      type: String,
      maxlength: [500, 'Bio cannot exceed 500 characters']
    },
    phone: {
      type: String,
      trim: true
    },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: [0, 0]
      }
    }
  },
  preferences: {
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      push: {
        type: Boolean,
        default: true
      }
    },
    privacy: {
      showProfile: {
        type: Boolean,
        default: true
      },
      showEmail: {
        type: Boolean,
        default: false
      }
    }
  },
  stats: {
    postsCount: {
      type: Number,
      default: 0
    },
    requestsCount: {
      type: Number,
      default: 0
    },
    successfulTrades: {
      type: Number,
      default: 0
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    totalRatings: {
      type: Number,
      default: 0
    }
  },
  lastLogin: {
    type: Date,
    default: null
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: {
    type: String,
    default: null
  },
  passwordResetToken: {
    type: String,
    default: null
  },
  passwordResetExpires: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Indexes for better performance
// REMOVED: UserSchema.index({ email: 1 }, { unique: true }); // ← This was the duplicate!
UserSchema.index({ role: 1 });
UserSchema.index({ isActive: 1 });
UserSchema.index({ 'profile.location': '2dsphere' }); // For geospatial queries
UserSchema.index({ createdAt: -1 });

// Virtual for full name (if needed)
UserSchema.virtual('fullName').get(function() {
  return this.name;
});

// Virtual for user URL
UserSchema.virtual('url').get(function() {
  return `/users/${this._id}`;
});

// Method to check if user is admin or superadmin
UserSchema.methods.isAdmin = function() {
  return this.role === 'admin' || this.role === 'superadmin';
};

// Method to check if user is superadmin
UserSchema.methods.isSuperAdmin = function() {
  return this.role === 'superadmin';
};

// Method to update user stats
UserSchema.methods.updateStats = function(statType: string, increment: number = 1) {
  if (this.stats && this.stats[statType] !== undefined) {
    this.stats[statType] += increment;
    return this.save();
  }
  return Promise.resolve(this);
};

// Static method to find by role
UserSchema.statics.findByRole = function(role: string) {
  return this.find({ role, isActive: true });
};

// Static method to find active users
UserSchema.statics.findActive = function() {
  return this.find({ isActive: true });
};

// Pre-save middleware
UserSchema.pre('save', function(next) {
  // Initialize stats if it doesn't exist when role changes
  if (this.isModified('role') && !this.stats) {
    this.stats = {
      postsCount: 0,
      requestsCount: 0,
      successfulTrades: 0,
      rating: 0,
      totalRatings: 0
    };
  }
  next();
});

// Post-save middleware for logging
UserSchema.post('save', function(doc) {
  console.log(`User ${doc.email} was saved with role: ${doc.role}`);
});

// Export the model
export default mongoose.models.User || mongoose.model('User', UserSchema);