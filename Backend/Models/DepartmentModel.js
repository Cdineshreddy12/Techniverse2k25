import mongoose from 'mongoose';

const departmentSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    unique: true 
  },
  shortName: { 
    type: String, 
    required: true,
    unique: true 
  },
  icon: { 
    type: String, 
    required: true 
  },
  description: { 
    type: String, 
    required: true 
  },
  color: {
    type: String,
    required: true
  },
  hoverColor: {
    type: String,
    required: true
  },
  totalEvents: {
    type: Number,
    default: 0
  },
  registrationDeadline: {
    type: Date,
    required: true
  },
  events: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event'
  }],
  coordinators: [{
    name: String,
    email: String,
    phone: String,
    role: {
      type: String,
      enum: ['head', 'co-head', 'coordinator'],
      default: 'coordinator'
    }
  }],
  stats: {
    totalRegistrations: {
      type: Number,
      default: 0
    },
    totalPrizeMoney: {
      type: Number,
      default: 0
    },
    activeEvents: {
      type: Number,
      default: 0
    },
    completedEvents: {
      type: Number,
      default: 0
    }
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
departmentSchema.index({ name: 1, shortName: 1 });
departmentSchema.index({ status: 1 });

// Virtual for active events - now with proper population check
departmentSchema.virtual('activeEventCount').get(function() {
  // Check if events exist and are populated
  if (!this.events || !Array.isArray(this.events)) {
    return 0;
  }

  // Check if events are populated by checking first event's properties
  const isPopulated = this.events.length > 0 && 
    typeof this.events[0] === 'object' && 
    'status' in this.events[0];

  if (!isPopulated) {
    return this.stats.activeEvents; // Fallback to stored stats
  }

  return this.events.filter(event => 
    event.status === 'published' && 
    event.registrationEndTime > new Date()
  ).length;
});

// Pre-save middleware to update stats
departmentSchema.pre('save', async function(next) {
  if (this.isModified('events')) {
    try {
      // Populate events if they aren't already
      if (this.events.length > 0 && !this.populated('events')) {
        await this.populate('events');
      }

      // Update stats based on populated events
      if (this.events && Array.isArray(this.events)) {
        const now = new Date();
        
        this.stats.activeEvents = this.events.filter(event => 
          event.status === 'published' && 
          event.registrationEndTime > now
        ).length;

        this.stats.completedEvents = this.events.filter(event => 
          event.status === 'completed'
        ).length;

        this.stats.totalRegistrations = this.events.reduce((sum, event) => 
          sum + (event.registrationCount || 0), 0);

        this.stats.totalPrizeMoney = this.events.reduce((sum, event) => {
          if (event.details && Array.isArray(event.details.prizeStructure)) {
            return sum + event.details.prizeStructure.reduce((prizeSum, prize) => 
              prizeSum + (prize.amount || 0), 0);
          }
          return sum;
        }, 0);
      }
    } catch (error) {
      console.error('Error updating department stats:', error);
    }
  }
  next();
});

// Static method to get department with populated events
departmentSchema.statics.findByIdWithEvents = function(id) {
  return this.findById(id)
    .populate({
      path: 'events',
      select: 'status registrationEndTime registrationCount details'
    });
};

export const Department = mongoose.model('Department', departmentSchema);