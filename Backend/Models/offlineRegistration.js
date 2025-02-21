// offlineRegistrationSchema.js
import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const offlineRegistrationSchema = new Schema({
  receiptNumber: {
    type: String,
    required: true,
    unique: true
  },
  studentId: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  branch: {
    type: String,
    required: true,
    enum: ['CSE', 'ECE', 'CIVIL', 'MECH', 'CHEMICAL', 'PUC']
  },
  class: {
    type: String,
    required: true
  },
  mobileNo: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        return /^\d{10}$/.test(v);
      }
    }
  },
  institute: {
    type: String,
    default: 'RGUKT Srikakulam'
  },
  registrationType: {
    type: String,
    required: true,
    enum: ['events', 'workshop', 'both']
  },
  registrationFee: {
    type: Number,
    required: true
  },
  receivedBy: {
    type: String,
    required: true
  },
  selectedEvents: [{
    eventId: {
      type: Schema.Types.ObjectId,
      ref: 'Event'
    },
    status: {
      type: String,
      enum: ['registered', 'attended'],
      default: 'registered'
    },
    checkinTime: Date,
    validatedBy: String
  }],
  selectedWorkshops: [{
    workshopId: {
      type: Schema.Types.ObjectId,
      ref: 'Workshop'
    },
    status: {
      type: String,
      enum: ['registered', 'attended'],
      default: 'registered'
    },
    checkinTime: Date,
    validatedBy: String
  }],
  qrCode: String,
  secureKey: String,  // Add secureKey field
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// offlineEventValidationSchema.js
const offlineEventValidationSchema = new Schema({
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
  validatedBy: {
    type: String,
    required: true
  },
  eventName: {
    type: String,
    required: true
  },
  validationTime: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['valid', 'invalid'],
    default: 'valid'
  }
});

export const OfflineRegistration = mongoose.model('OfflineRegistration', offlineRegistrationSchema);
export const OfflineEventValidation = mongoose.model('OfflineEventValidation', offlineEventValidationSchema);