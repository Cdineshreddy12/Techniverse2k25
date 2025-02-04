import mongoose from "mongoose";
const registrationSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true,
  },
  combo: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  },
  selectedEvents: [{
    eventId: String,
    eventName: String,
    status: String
  }],
  selectedWorkshops: [{
    workshopId: String,
    workshopName: String,
    status: String
  }],
  qrCode: String,
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed']
  },
  transactionId: String,
  amount: Number,
  createdAt: { type: Date, default: Date.now },
  updatedAt: Date
 });

 export const Registration = mongoose.model('Registration', registrationSchema);