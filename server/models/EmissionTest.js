import mongoose from 'mongoose';

const emissionTestSchema = new mongoose.Schema({
  vehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
    required: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  testDate: {
    type: Date,
    required: true
  },
  expiryDate: {
    type: Date,
    required: true
  },
  certificateNumber: {
    type: String,
    required: true,
    unique: true
  },
  testCenter: {
    name: String,
    location: String,
    licenseNumber: String
  },
  results: {
    co2Level: Number,
    smokeOpacity: Number,
    noiseLevel: Number,
    passed: {
      type: Boolean,
      required: true
    }
  },
  fee: {
    type: Number,
    required: true,
    default: 2500 // Standard emission test fee in LKR
  },
  status: {
    type: String,
    enum: ['pending_payment', 'scheduled', 'completed', 'failed', 'expired'],
    default: 'pending_payment'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed'],
    default: 'pending'
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

// Generate certificate number
emissionTestSchema.pre('save', async function(next) {
  if (!this.certificateNumber) {
    const year = new Date().getFullYear();
    const count = await mongoose.model('EmissionTest').countDocuments();
    this.certificateNumber = `ET${year}${String(count + 1).padStart(6, '0')}`;
  }
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model('EmissionTest', emissionTestSchema);