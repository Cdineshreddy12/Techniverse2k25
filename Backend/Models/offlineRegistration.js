// Modified Schema
import mongoose from 'mongoose';

const offlineRegistrationSchema = new mongoose.Schema({
  studentId: {
    type: String,
    required: true,
    uppercase: true,
    trim: true,
    set: v => v.replace(/D$/, '') // Remove trailing 'D' if present
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  branch: {
    type: String,
    required: true,
    uppercase: true,
    set: (branch) => branch.toUpperCase().replace(/\s+/g, ''),
  },
  class: {
    type: String,
    required: true,
    uppercase: true,
    set: (cls) => {
      const formatted = cls.toUpperCase().replace(/\s+/g, '');
      const [branch, section] = formatted.split('-');
      return `${branch}-${section}`;
    }
  },
  mobileNo: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        return /^[6-9]\d{9}$/.test(v);
      },
      message: props => `${props.value} is not a valid phone number!`
    }
  },
  registrationType: {
    type: String,
    enum: ['events', 'workshop', 'both'],
    required: true
  },
  registrationFee: {
    type: Number,
    required: true,
    min: 0
  },
  receivedBy: {
    type: String,
    required: true
  },
  receiptNumber: {
    type: String,
    unique: true,
    required: true,
    default: 'PENDING'
  },
  paymentStatus: {
    type: String,
    enum: ['PAID', 'PENDING'],
    default: 'PAID'
  },
  // Track event attendance separately
  eventAttendance: [{
    eventName: String,
    attendedAt: Date,
    verifiedBy: String
  }]
}, {
  timestamps: true
});

// Indexes - Remove the unique constraint on studentId and registrationType
offlineRegistrationSchema.index({ branch: 1, class: 1 });
offlineRegistrationSchema.index({ receiptNumber: 1 }, { unique: true });
offlineRegistrationSchema.index({ studentId: 1 });
offlineRegistrationSchema.index({ paymentStatus: 1 });

// Pre-validate middleware
offlineRegistrationSchema.pre('validate', function(next) {
  // Clean studentId - remove any trailing 'D'
  if (this.studentId) {
    this.studentId = this.studentId.replace(/D$/, '').toUpperCase().trim();
  }
  
  if (this.branch) {
    this.branch = this.branch.toUpperCase().trim();
  }
  
  if (this.class) {
    this.class = this.class.toUpperCase().trim();
  }
  
  if (this.class && !this.class.includes('-')) {
    const match = this.class.match(/([A-Z]+)(\d[A-Z])/);
    if (match) {
      this.class = `${match[1]}-${match[2]}`;
    }
  }

  next();
});

// Pre-save middleware for receipt number generation
offlineRegistrationSchema.pre('save', async function(next) {
  try {
    if (this.isNew || this.receiptNumber === 'PENDING') {
      const date = new Date();
      const year = date.getFullYear().toString().slice(-2);
      const random = Math.floor(Math.random() * 100);
      const count = await mongoose.model('OfflineRegistration').countDocuments() + 1 + random;
      this.receiptNumber = `TV${year}-${count.toString().padStart(4, '0')}`;
    }
    next();
  } catch (error) {
    next(error);
  }
});

offlineRegistrationSchema.methods.addEventAttendance = function(eventName, verifiedBy) {
  this.eventAttendance.push({
    eventName,
    attendedAt: new Date(),
    verifiedBy
  });
  return this.save();
};

export const OfflineRegistration = mongoose.model('OfflineRegistration', offlineRegistrationSchema);