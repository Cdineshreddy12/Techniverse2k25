// studentSchema.js
import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema({
 kindeId: { type: String, required: true, unique: true },
 name:{type: String, required: true},
 email: { type: String, required: true },
 registrationType: { type: String, enum: ['student', 'other'], required: true,default: 'student' },
 collegeId: String,
 branch: String, 
 collegeName: String,
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
 createdAt: { type: Date, default: Date.now }
});


export const Student = mongoose.model('Student', studentSchema);
