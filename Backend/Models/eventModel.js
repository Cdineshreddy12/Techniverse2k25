import mongoose from 'mongoose';

const prizeStructureSchema = new mongoose.Schema({
  position: {
    type: Number,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  description: String
});

const eventSchema = new mongoose.Schema({
  tag: String,
  title: {
    type: String,
    required: true,
    trim: true
  },
  startTime: {
    type: Date,
    required: true
  },
  registrationEndTime: {
    type: Date,
    required: true
  },
  duration: String,
  bannerMobile: String,
  bannerDesktop: String,
  registrationFee: {
    type: Number,
    default: 0,
    min: 0
  },
  departments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: true
  }],
  registeredUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  registrationCount: {
    type: Number,
    default: 0,
    min: 0
  },
  maxRegistrations: {
    type: Number,
    min: 1
  },
  details: {
    prizeStructure: [prizeStructureSchema],
    totalPrizeMoney: {
      type: Number,
      default: function() {
        return this.details.prizeStructure?.reduce((sum, prize) => sum + prize.amount, 0) || 0;
      }
    },
    maxTeamSize: {
      type: Number,
      default: 1,
      min: 1
    },
    eventDate: Date,
    duration: String,
    description: {
      type: String,
      trim: true
    },
    venue: {
      type: String,
      trim: true
    },
    requirements: [{
      type: String,
      trim: true
    }]
  },
  rounds: [{
    roundNumber: {
      type: Number,
      required: true,
      min: 1
    },
    description: {
      type: String,
      trim: true
    },
    startTime: Date,
    endTime: Date,
    venue: {
      type: String,
      trim: true
    },
    requirements: [{
      type: String,
      trim: true
    }],
    status: {
      type: String,
      enum: ['upcoming', 'ongoing', 'completed'],
      default: 'upcoming'
    }
  }],
  coordinators: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    },
    phone: {
      type: String,
      trim: true
    },
    photo: String,
    role: {
      type: String,
      trim: true
    }
  }],
  status: {
    type: String,
    enum: ['draft', 'published', 'cancelled', 'completed'],
    default: 'draft'
  },
  registrationType: {
    type: String,
    enum: ['individual', 'team'],
    default: 'individual'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
eventSchema.index({ departments: 1 });
eventSchema.index({ 'details.eventDate': 1 });
eventSchema.index({ status: 1 });
eventSchema.index({ registrationEndTime: 1 });
eventSchema.index({ registrationFee: 1 });
eventSchema.index({ registrationType: 1 });

// Virtual for remaining slots
eventSchema.virtual('remainingSlots').get(function() {
  if (!this.maxRegistrations) return null;
  return Math.max(0, this.maxRegistrations - this.registrationCount);
});

// Virtual for registration status
eventSchema.virtual('registrationStatus').get(function() {
  const now = new Date();
  if (this.status !== 'published') return 'closed';
  if (now < this.startTime) return 'upcoming';
  if (now > this.registrationEndTime) return 'closed';
  if (this.maxRegistrations && this.registrationCount >= this.maxRegistrations) return 'full';
  return 'open';
});

// Pre-save middleware to ensure valid dates
eventSchema.pre('save', function(next) {
  if (this.registrationEndTime > this.startTime) {
    const err = new Error('Registration end time must be before event start time');
    next(err);
    return;
  }
  next();
});

// Method to check if registration is allowed
eventSchema.methods.canRegister = function() {
  const now = new Date();
  return (
    this.status === 'published' &&
    now <= this.registrationEndTime &&
    (!this.maxRegistrations || this.registrationCount < this.maxRegistrations)
  );
};

export default mongoose.model('Event', eventSchema);