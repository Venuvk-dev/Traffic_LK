import mongoose from 'mongoose';

const fineSchema = new mongoose.Schema({
  fineNumber: {
    type: String,
    required: true,
    unique: true
  },
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
  issuedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  violation: {
    type: {
      type: String,
      required: true,
      enum: [
        'speeding',
        'parking',
        'signal_violation',
        'no_license',
        'no_insurance',
        'drunk_driving',
        'mobile_phone',
        'seat_belt',
        'helmet',
        'overloading',
        'reckless_driving',
        'lane_violation',
        'emission',
        'documentation',
        'other'
      ]
    },
    description: {
      type: String,
      required: true
    },
    location: {
      type: String,
      required: true
    },
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  // Points deduction for this violation
  pointsDeducted: {
    type: Number,
    required: true,
    default: 0,
    min: 0,
    max: 100
  },
  status: {
    type: String,
    enum: ['pending', 'paid', 'disputed', 'cancelled', 'overdue'],
    default: 'pending'
  },
  evidence: [{
    type: String, // URLs to images/documents
    description: String
  }],
  dueDate: {
    type: Date,
    required: true
  },
  issuedDate: {
    type: Date,
    default: Date.now
  },
  paidDate: Date,
  paymentMethod: String,
  paymentReference: String,
  notes: String,
  // Points processing status
  pointsProcessed: {
    type: Boolean,
    default: false
  },
  pointsProcessedDate: Date,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Generate fine number
fineSchema.pre('save', async function(next) {
  if (!this.fineNumber) {
    const year = new Date().getFullYear();
    const count = await mongoose.model('Fine').countDocuments();
    this.fineNumber = `TF${year}${String(count + 1).padStart(6, '0')}`;
  }
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model('Fine', fineSchema);