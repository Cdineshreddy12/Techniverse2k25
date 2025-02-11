import mongoose from 'mongoose';

const workshopSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  departments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: true
  }],
  // Added price field
  price: {
    type: Number,
    required: true,
    min: 0,
    default: 0 // Free workshop by default
  },
  // Added duration field
  duration: {
    total: {
      type: Number,
      required: true,
      min: 1 // Minimum 1 hour
    },
    unit: {
      type: String,
      enum: ['hours', 'days'],
      default: 'hours'
    }
  },
  // Added registration configuration
  registration: {
    isOpen: {
      type: Boolean,
      default: false
    },
    totalSlots: {
      type: Number,
      required: true,
      min: 1
    },
    registeredCount: {
      type: Number,
      default: 0
    },
    startTime: {
      type: Date,
      required: true
    },
    endTime: {
      type: Date,
      required: true
    }
  },
  registrationEndTime: {
    type: Date,
    required: true
  },
  registrations: {
    type: Number,
    default: 0
  },
  lecturer: {
    name: {
      type: String,
      required: true
    },
    title: {
      type: String,
      required: true
    },
    photo: String,
    specifications: [String]
  },
  schedule: [{
    id: {
      type: String,
      required: true
    },
    time: {
      type: String,
      required: true
    },
    activity: {
      type: String,
      required: true
    }
  }],
  prerequisites: [{
    type: String
  }],
  outcomes: [{
    type: String
  }],
  status: {
    type: String,
    enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
    default: 'upcoming'
  },
  bannerDesktop: {
    type: String
  },
  bannerMobile: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual field for total learning hours
workshopSchema.virtual('totalLearningHours').get(function() {
  if (this.duration.unit === 'hours') {
    return this.duration.total;
  }
  return this.duration.total * 24; // Convert days to hours
});

// Virtual for available slots
workshopSchema.virtual('availableSlots').get(function() {
  return Math.max(0, this.registration.totalSlots - this.registration.registeredCount);
});

// Virtual for registration status
workshopSchema.virtual('registrationStatus').get(function() {
  const now = new Date();
  
  if (!this.registration.isOpen) {
    return 'closed';
  }
  
  if (now < new Date(this.registration.startTime)) {
    return 'upcoming';
  }
  
  if (now > new Date(this.registration.endTime)) {
    return 'ended';
  }
  
  if (this.registration.registeredCount >= this.registration.totalSlots) {
    return 'full';
  }
  
  return 'open';
});

// Pre-save middleware to update the status based on dates and registration
workshopSchema.pre('save', function(next) {
  const now = new Date();
  const regEndTime = new Date(this.registration.endTime);

  // Update workshop status based on dates and registration status
  if (now > regEndTime) {
    this.status = 'completed';
  } else if (this.registration.isOpen && 
             now >= new Date(this.registration.startTime) && 
             now <= regEndTime) {
    this.status = 'ongoing';
  } else if (this.status !== 'cancelled') {
    this.status = 'upcoming';
  }

  // Ensure registeredCount doesn't exceed totalSlots
  if (this.registration.registeredCount > this.registration.totalSlots) {
    this.registration.registeredCount = this.registration.totalSlots;
  }

  next();
});

// Method to check if registration is possible
workshopSchema.methods.canRegister = function() {
  const now = new Date();
  return (
    this.registration.isOpen &&
    now >= new Date(this.registration.startTime) &&
    now <= new Date(this.registration.endTime) &&
    this.registration.registeredCount < this.registration.totalSlots &&
    this.status !== 'cancelled' &&
    this.status !== 'completed'
  );
};

const Workshop = mongoose.model('Workshop', workshopSchema);

export default Workshop;