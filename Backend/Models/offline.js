import mongoose from 'mongoose';
const OfflineCheckInSchema = new mongoose.Schema({
  registration: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'OfflineRegistration',
    required: true
  },
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    default: null
  },
  workshop: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Workshop',
    default: null
  },
  type: {
    type: String,
    enum: ['event', 'workshop'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'completed'
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  verificationMethod: {
    type: String,
    enum: ['qr_only', 'offline_qr', 'manual_receipt'],
    required: true
  },
  verifiedBy: String,
  receiptNumber: {
    type: String,
    required: true
  },
  studentDetails: {
    name: String,
    studentId: String,
    branch: String,
    class: String
  },
  coordinatorDetails: {
    name: String,
    id: String
  }
}, {
  timestamps: true
});

// Create a composite index for unique check-ins
OfflineCheckInSchema.index({ 
  registration: 1, 
  type: 1, 
  event: 1, 
  workshop: 1 
}, { 
  unique: true,
  partialFilterExpression: {
    $or: [
      { event: { $exists: true, $ne: null } },
      { workshop: { $exists: true, $ne: null } }
    ]
  }
});

// Pre-save middleware to validate event/workshop
OfflineCheckInSchema.pre('save', function(next) {
  if (this.type === 'event' && !this.event) {
    return next(new Error('Event ID is required for event check-ins'));
  }
  if (this.type === 'workshop' && !this.workshop) {
    return next(new Error('Workshop ID is required for workshop check-ins'));
  }
  if (this.type === 'event') {
    this.workshop = null;
  }
  if (this.type === 'workshop') {
    this.event = null;
  }
  next();
});

const OfflineCheckIn = mongoose.model('OfflineCheckIn', OfflineCheckInSchema);

export default OfflineCheckIn;