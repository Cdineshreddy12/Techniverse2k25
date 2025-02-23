// CoordinatorStats.js
import mongoose from 'mongoose';

const coordinatorStatsSchema = new mongoose.Schema({
  coordinatorId: {
    type: String,
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true
  },
  registrations: [{
    registrationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'OfflineRegistration'
    },
    amount: {
      type: Number,
      default: 0
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    studentClass: {
      type: String,
      uppercase: true
    },
    registrationType: {
      type: String,
      enum: ['events', 'workshop', 'both']
    }
  }],
  checkIns: [{
    checkInId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'OfflineCheckIn',
      required: true
    },
    type: {
      type: String,
      enum: ['event', 'workshop'],
      required: true
    },
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  totalAmount: {
    type: Number,
    default: 0
  },
  totalRegistrations: {
    type: Number,
    default: 0
  },
  totalCheckIns: {
    type: Number,
    default: 0
  },
  lastActive: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Helper function to safely get class name
const getStudentClass = (registration) => {
  try {
    const className = registration.studentClass || 
                     (registration.userId?.class) || 
                     'UNKNOWN';
    return className.toUpperCase();
  } catch (error) {
    console.error('Error getting student class:', error);
    return 'UNKNOWN';
  }
};

// Add methods to update stats
coordinatorStatsSchema.methods.addRegistration = function(registration) {
  try {
    if (!registration || !registration._id) {
      throw new Error('Invalid registration data');
    }

    const registrationData = {
      registrationId: registration._id,
      amount: registration.amount || 0,
      timestamp: new Date(),
      studentClass: getStudentClass(registration),
      registrationType: registration.registrationType
    };

    this.registrations.push(registrationData);
    this.totalAmount += registrationData.amount;
    this.totalRegistrations += 1;
    this.lastActive = new Date();
    
    return true;
  } catch (error) {
    console.error('Error adding registration:', error);
    return false;
  }
};

coordinatorStatsSchema.methods.addCheckIn = function(checkIn) {
  try {
    if (!checkIn || !checkIn._id || !checkIn.type) {
      throw new Error('Invalid check-in data');
    }

    // Verify type is valid
    if (!['event', 'workshop'].includes(checkIn.type)) {
      throw new Error(`Invalid check-in type: ${checkIn.type}`);
    }

    // Get the correct item ID based on type
    const itemId = checkIn[checkIn.type];
    if (!itemId) {
      throw new Error(`No ${checkIn.type} ID found in check-in data`);
    }

    const checkInData = {
      checkInId: checkIn._id,
      type: checkIn.type,
      itemId: itemId,
      timestamp: new Date()
    };

    this.checkIns.push(checkInData);
    this.totalCheckIns += 1;
    this.lastActive = new Date();

    return true;
  } catch (error) {
    console.error('Error adding check-in:', error);
    return false;
  }
};

// Add index for performance
coordinatorStatsSchema.index({ coordinatorId: 1, 'registrations.timestamp': -1 });
coordinatorStatsSchema.index({ coordinatorId: 1, 'checkIns.timestamp': -1 });

const CoordinatorStats = mongoose.model('CoordinatorStats', coordinatorStatsSchema);

export default CoordinatorStats;