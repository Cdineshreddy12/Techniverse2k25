// studentSchema.js
import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema({
  kindeId: { type: String, required: true, unique: true },
  name: { type: String, required: function() { return this.registrationComplete; } },
  email: { type: String, required: function() { return this.registrationComplete; } },
  mobileNumber: { type: String, required: function() { return this.registrationComplete; } },
  registrationType: { type: String, enum: ['student', 'other'], default: 'student' },
  collegeId: String,
  branch: String,
  collegeName: String,
  registrationComplete: { type: Boolean, default: false },
  registrations: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Registration'
  }],
  activeCombo: {
    id: String,
    optionId: Number,
    name: String,
    price: Number,
    selectedAt: Date
  },
  cart: [{
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event'
    },
    price: Number,
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
    // Workshops cart
    workshops: [{
      workshopId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Workshop',
        required: true
      },
      price: {
        type: Number,
        required: true
      }
    }],
  createdAt: { type: Date, default: Date.now }
});

export const Student = mongoose.model('Student', studentSchema);