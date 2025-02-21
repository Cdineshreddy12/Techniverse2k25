// offlineCheckinSchema.js
import mongoose from 'mongoose';
const Schema = mongoose.Schema;

// Schema for tracking offline check-ins
const offlineCheckinSchema = new Schema({
  registrationId: {
    type: Schema.Types.ObjectId,
    ref: 'OfflineRegistration',
    required: true
  },
  eventId: {
    type: Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  studentId: {
    type: String,
    required: true
  },
  validatedBy: {
    type: String,
    required: true,
    trim: true
  },
  checkinTime: {
    type: Date,
    default: Date.now
  },
  itemType: {
    type: String,
    enum: ['event', 'workshop'],
    required: true
  },
  itemId: {
    type: Schema.Types.ObjectId,
    required: true,
    refPath: 'itemType'
  },
  status: {
    type: String,
    enum: ['valid', 'invalid', 'suspicious'],
    default: 'valid'
  },
  verificationMethod: {
    type: String,
    enum: ['qr', 'manual', 'both'],
    default: 'qr'
  },
  deviceInfo: {
    ipAddress: String,
    userAgent: String,
    location: String
  },
  receiptNumber: {
    type: String,
    required: true
  },
  eventDetails: {
    name: String,
    venue: String,
    startTime: Date
  },
  studentDetails: {
    name: String,
    branch: String,
    class: String,
    mobileNo: String
  },
  notes: String,
  retryCount: {
    type: Number,
    default: 0
  },
  lastRetryTime: Date,
  isManualOverride: {
    type: Boolean,
    default: false
  },
  manualOverrideReason: String,
  qrCodeHash: String, // Store hash of QR code used for verification
  secureKey: String,  // Secure key from registration
  previousCheckins: [{
    eventId: Schema.Types.ObjectId,
    checkinTime: Date,
    status: String
  }]
}, {
  timestamps: true
});

// Compound index to prevent duplicate check-ins
offlineCheckinSchema.index({ 
  studentId: 1, 
  eventId: 1, 
  checkinTime: 1 
}, { 
  unique: true 
});

// Index for efficient queries
offlineCheckinSchema.index({ 
  receiptNumber: 1, 
  eventId: 1 
});

// Middleware to validate check-in time
offlineCheckinSchema.pre('save', function(next) {
  if (this.isNew) {
    // Ensure check-in time is not in the future
    if (this.checkinTime > new Date()) {
      next(new Error('Check-in time cannot be in the future'));
    }
    
    // Initialize student details if not provided
    if (!this.studentDetails.name) {
      this.populate('registrationId')
        .then(() => {
          this.studentDetails = {
            name: this.registrationId.name,
            branch: this.registrationId.branch,
            class: this.registrationId.class,
            mobileNo: this.registrationId.mobileNo
          };
          next();
        })
        .catch(next);
    } else {
      next();
    }
  } else {
    next();
  }
});

// Schema for tracking suspicious check-in attempts
const suspiciousCheckinSchema = new Schema({
  checkinId: {
    type: Schema.Types.ObjectId,
    ref: 'OfflineCheckin'
  },
  studentId: String,
  eventId: {
    type: Schema.Types.ObjectId,
    ref: 'Event'
  },
  reason: {
    type: String,
    required: true,
    enum: [
      'multiple_attempts',
      'invalid_qr',
      'time_mismatch',
      'location_mismatch',
      'duplicate_attempt',
      'expired_code',
      'other'
    ]
  },
  attemptTime: {
    type: Date,
    default: Date.now
  },
  deviceInfo: {
    ipAddress: String,
    userAgent: String,
    location: String
  },
  details: Schema.Types.Mixed,
  resolved: {
    type: Boolean,
    default: false
  },
  resolvedBy: String,
  resolutionNotes: String,
  resolutionTime: Date
}, {
  timestamps: true
});

// Schema for tracking used QR codes to prevent reuse
const usedQRCodeSchema = new Schema({
  qrCodeHash: {
    type: String,
    required: true,
    unique: true
  },
  registrationId: {
    type: Schema.Types.ObjectId,
    ref: 'OfflineRegistration',
    required: true
  },
  eventId: {
    type: Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  usedAt: {
    type: Date,
    default: Date.now
  },
  checkinId: {
    type: Schema.Types.ObjectId,
    ref: 'OfflineCheckin'
  },
  validatedBy: String,
  isExpired: {
    type: Boolean,
    default: false
  },
  expiryTime: Date
});

// Statics for OfflineCheckin model
offlineCheckinSchema.statics = {
  // Find duplicate check-in attempts
  async findDuplicateAttempts(studentId, eventId, timeWindow = 5) {
    const windowStart = new Date(Date.now() - timeWindow * 60 * 1000);
    return this.find({
      studentId,
      eventId,
      checkinTime: { $gte: windowStart }
    }).sort({ checkinTime: -1 });
  },

  // Get check-in statistics for an event
  async getEventStats(eventId) {
    return this.aggregate([
      { $match: { eventId: mongoose.Types.ObjectId(eventId) } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          averageRetryCount: { $avg: '$retryCount' }
        }
      }
    ]);
  }
};

// Export models
export const OfflineCheckin = mongoose.model('OfflineCheckin', offlineCheckinSchema);
export const SuspiciousCheckin = mongoose.model('SuspiciousCheckin', suspiciousCheckinSchema);
export const UsedQRCode = mongoose.model('UsedQRCode', usedQRCodeSchema);