import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// Schema for offline users
const OfflineUserSchema = new mongoose.Schema({
  studentId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  branch: {
    type: String,
    required: true
  },
  class: {
    type: String,
    required: true
  },
  mobileNo: {
    type: String,
    required: true
  },
  isOfflineRegistered: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Pre-save hook for password hashing
OfflineUserSchema.pre('save', async function(next) {
  try {
    // Only hash if password is modified or new
    if (!this.isModified('password')) {
      return next();
    }

    // Log the original password for debugging
    console.log('Pre-save middleware - Original password:', this.password);

    // Generate new hash
    const hashedPassword = await bcrypt.hash(this.password, 10);
    
    // Log the generated hash
    console.log('Pre-save middleware - Generated hash:', hashedPassword);
    
    // Set the hashed password
    this.password = hashedPassword;
    
    next();
  } catch (error) {
    console.error('Password hashing error:', error);
    next(error);
  }
});

// Add a method to verify password
OfflineUserSchema.methods.verifyPassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};



// Schema for offline registrations
const OfflineRegistrationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'OfflineUser',
    required: true
  },
  events: [{
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event'
    },
    status: {
      type: String,
      enum: ['registered', 'attended', 'completed'],
      default: 'registered'
    },
    registeredAt: {
      type: Date,
      default: Date.now
    },
    attendedAt: {
      type: Date
    }
  }],
  workshops: [{
    workshopId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workshop'
    },
    status: {
      type: String,
      enum: ['registered', 'attended', 'completed'],
      default: 'registered'
    },
    registeredAt: {
      type: Date,
      default: Date.now
    },
    attendedAt: {
      type: Date
    }
  }],
  qrCode: {
    type: String,
    required: true
  },
  registrationType: {
    type: String,
    enum: ['events', 'workshop', 'both'],
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'completed'
  },
  amount: {
    type: Number,
    required: true
  },
  receiptNumber: {
    type: String,
    unique: true
  },
  receivedBy: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});


const OfflineUser = mongoose.model('OfflineUser', OfflineUserSchema);
const OfflineRegistration = mongoose.model('OfflineRegistration', OfflineRegistrationSchema);

export { OfflineUser, OfflineRegistration };