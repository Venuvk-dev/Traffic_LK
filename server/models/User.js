import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: false,
    trim: true
  },
  nic: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  address: {
    street: String,
    city: String,
    district: String,
    postalCode: String
  },
  role: {
    type: String,
    enum: ['citizen', 'police', 'admin'],
    default: 'citizen'
  },
  // Points System
  drivingPoints: {
    current: {
      type: Number,
      default: 100,
      min: 0,
      max: 100
    },
    history: [{
      date: {
        type: Date,
        default: Date.now
      },
      change: Number, // positive for restoration, negative for deduction
      reason: String,
      relatedFine: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Fine'
      },
      previousPoints: Number,
      newPoints: Number
    }],
    suspensions: [{
      startDate: Date,
      endDate: Date,
      reason: String,
      isActive: {
        type: Boolean,
        default: true
      },
      restoredDate: Date
    }],
    lastRestoration: Date,
    nextEligibleRestoration: Date
  },
  licenseStatus: {
    type: String,
    enum: ['active', 'suspended', 'revoked'],
    default: 'active'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  profileImage: String,
  lastLogin: Date,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Points management methods
userSchema.methods.deductPoints = function(points, reason, fineId) {
  const previousPoints = this.drivingPoints.current;
  const newPoints = Math.max(0, previousPoints - points);
  
  this.drivingPoints.current = newPoints;
  this.drivingPoints.history.push({
    change: -points,
    reason,
    relatedFine: fineId,
    previousPoints,
    newPoints
  });

  // Check for license suspension
  if (newPoints === 0 && this.licenseStatus === 'active') {
    this.licenseStatus = 'suspended';
    this.drivingPoints.suspensions.push({
      startDate: new Date(),
      endDate: new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000), // 6 months
      reason: 'Zero points reached'
    });
  }

  return newPoints;
};

userSchema.methods.restorePoints = function(points, reason) {
  const previousPoints = this.drivingPoints.current;
  const newPoints = Math.min(100, previousPoints + points);
  
  this.drivingPoints.current = newPoints;
  this.drivingPoints.history.push({
    change: points,
    reason,
    previousPoints,
    newPoints
  });

  this.drivingPoints.lastRestoration = new Date();
  this.drivingPoints.nextEligibleRestoration = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 1 year

  return newPoints;
};

userSchema.methods.canRestorePoints = function() {
  if (!this.drivingPoints.nextEligibleRestoration) return true;
  return new Date() >= this.drivingPoints.nextEligibleRestoration;
};

userSchema.methods.getPointsStatus = function() {
  const current = this.drivingPoints.current;
  let status = 'good';
  let message = 'Your driving record is in good standing';
  let color = 'green';

  if (current === 0) {
    status = 'suspended';
    message = 'License suspended - Zero points remaining';
    color = 'red';
  } else if (current <= 20) {
    status = 'critical';
    message = 'Critical - Risk of license suspension';
    color = 'red';
  } else if (current <= 40) {
    status = 'warning';
    message = 'Warning - Drive carefully to avoid suspension';
    color = 'orange';
  } else if (current <= 60) {
    status = 'caution';
    message = 'Caution - Monitor your driving behavior';
    color = 'yellow';
  }

  return { status, message, color, points: current };
};

// Update timestamp on save
userSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model('User', userSchema);