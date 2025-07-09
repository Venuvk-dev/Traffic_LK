import mongoose from 'mongoose';

const disputeSchema = new mongoose.Schema({
  fine: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Fine',
    required: true
  },
  disputant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reason: {
    type: String,
    required: true,
    enum: [
      'not_owner',
      'vehicle_stolen',
      'incorrect_details',
      'evidence_dispute',
      'technical_error',
      'other'
    ]
  },
  description: {
    type: String,
    required: true,
    maxlength: 1000
  },
  evidence: [{
    type: {
      type: String,
      enum: ['image', 'document', 'video', 'other'],
      default: 'image'
    },
    url: String, // File path or URL
    originalName: String, // Original filename
    description: String
  }],
  status: {
    type: String,
    enum: ['pending', 'under_review', 'approved', 'rejected'],
    default: 'pending'
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewDate: Date,
  reviewNotes: String,
  resolution: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

disputeSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model('Dispute', disputeSchema);