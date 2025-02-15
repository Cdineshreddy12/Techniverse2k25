import mongoose from 'mongoose';

const checkInSchema = new mongoose.Schema({
    registration: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Registration',
        required: true
    },
    event: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event',
        required: true
    },
    status: {
        type: String,
        enum: ['completed', 'failed'],
        default: 'completed'
    },
    timestamp: {
        type: Date,
        required: true
    },
    verificationMethod: {
        type: String,
        enum: ['qr_only', 'qr_and_student_id'],
        required: true
    }
}, {
    timestamps: true
});

// Index for quick lookups and preventing duplicate check-ins
checkInSchema.index({ registration: 1, event: 1 }, { unique: true });

export const CheckIn = mongoose.model('CheckIn', checkInSchema);