// models/OfflineRegistration.js
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
    trim: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  branch: {
    type: String,
    required: true,
    uppercase: true,
    enum: ['CSE', 'ECE', 'CIVIL', 'MECH', 'CHEMICAL', 'PUC']
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
      validator: v => /^[6-9]\d{9}$/.test(v),
      message: 'Invalid mobile number'
    }
  },
  registrationType: {
    type: String,
    enum: ['events', 'workshop', 'both'],
    required: true
  },
  selectedEvents: [{
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event'
    },
    eventName: String,
    departmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department'
    },
    status: {
      type: String,
      enum: ['registered', 'checked-in'],
      default: 'registered'
    },
    checkedInAt: Date,
    checkedInBy: String
  }],
  selectedWorkshops: [{
    workshopId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workshop'
    },
    workshopName: String,
    departmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department'
    },
    status: {
      type: String,
      enum: ['registered', 'checked-in'],
      default: 'registered'
    },
    checkedInAt: Date,
    checkedInBy: String
  }],
  registrationFee: {
    type: Number,
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['PENDING', 'PAID'],
    default: 'PAID'
  },
  receivedBy: {
    type: String,
    required: true
  },
  receiptNumber: {
    type: String,
    unique: true
  },
  qrCode: String,
  // For tracking event attendance
  eventAttendance: [{
    eventName: String,
    attendedAt: {
      type: Date,
      default: Date.now
    },
    verifiedBy: String
  }],
  // Excel upload tracking
  excelUploadId: String,
  excelRowNumber: Number,
  // For validation at events
  validated: {
    type: Boolean,
    default: false
  },
  validatedBy: String,
  validatedAt: Date
}, {
  timestamps: true
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

// Validate and format data before saving
offlineRegistrationSchema.pre('validate', function(next) {
  // Clean studentId
  if (this.studentId) {
    this.studentId = this.studentId.replace(/D$/, '').toUpperCase().trim();
  }
  
  // Format branch
  if (this.branch) {
    this.branch = this.branch.toUpperCase().trim();
  }
  
  // Format class
  if (this.class) {
    this.class = this.class.toUpperCase().trim();
    if (!this.class.includes('-')) {
      const match = this.class.match(/([A-Z]+)(\d[A-Z])/);
      if (match) {
        this.class = `${match[1]}-${match[2]}`;
      }
    }
  }

  // Set registration fee based on type
  if (this.registrationType) {
    this.registrationFee = this.registrationType === 'both' ? 299 : 199;
  }

  next();
});

// Method to add event attendance
offlineRegistrationSchema.methods.addEventAttendance = function(eventName, verifiedBy) {
  this.eventAttendance.push({
    eventName,
    attendedAt: new Date(),
    verifiedBy
  });
  return this.save();
};

// Static method for bulk upload processing
offlineRegistrationSchema.statics.processExcelUpload = async function(data, uploadId) {
  const results = {
    successful: [],
    failed: []
  };

  for (let i = 0; i < data.length; i++) {
    try {
      const row = data[i];
      const registration = new this({
        studentId: row.studentId,
        name: row.name,
        email: row.email,
        branch: row.branch,
        class: row.class,
        mobileNo: row.mobileNo,
        registrationType: row.registrationType,
        receivedBy: row.receivedBy,
        excelUploadId: uploadId,
        excelRowNumber: i + 2 // Account for header row
      });

      await registration.save();
      results.successful.push({
        studentId: row.studentId,
        receiptNumber: registration.receiptNumber
      });
    } catch (error) {
      results.failed.push({
        studentId: row.studentId || `Row ${i + 2}`,
        error: error.message
      });
    }
  }

  return results;
};

export const OfflineRegistration = mongoose.model('OfflineRegistration', offlineRegistrationSchema);