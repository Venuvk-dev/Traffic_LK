import mongoose from 'mongoose';

const vehicleSchema = new mongoose.Schema({
  registrationNumber: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  make: {
    type: String,
    required: true,
    trim: true
  },
  model: {
    type: String,
    required: true,
    trim: true
  },
  year: {
    type: Number,
    required: true,
    min: 1900,
    max: new Date().getFullYear() + 1
  },
  color: {
    type: String,
    required: true,
    trim: true
  },
  vehicleType: {
    type: String,
    enum: ['car', 'motorcycle', 'truck', 'bus', 'van', 'three-wheeler'],
    required: true
  },
  engineNumber: {
    type: String,
    required: true,
    trim: true
  },
  chassisNumber: {
    type: String,
    required: true,
    trim: true
  },
  insurance: {
    company: String,
    policyNumber: String,
    expiryDate: Date,
    isActive: {
      type: Boolean,
      default: true
    }
  },
  license: {
    expiryDate: Date,
    isValid: {
      type: Boolean,
      default: true
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

vehicleSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model('Vehicle', vehicleSchema);