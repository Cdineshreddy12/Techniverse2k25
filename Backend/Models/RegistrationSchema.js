import mongoose from 'mongoose';

const registrationSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    kindeId: {
        type: String,
        required: true
    },
    qrCode: {
        dataUrl: String,
        generatedAt: Date,
        metadata: {
            events: [String],
            workshops: [String],
            verificationData: {
                amount: Number,
                paymentId: String,
                timestamp: Date,
                verificationHash: String
            }
        },
        validUntil: Date
    },
    
    selectedEvents: [{
        eventId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Event',
            required: true
        },
        eventName: String,
        status: {
            type: String,
            enum: ['pending', 'completed', 'cancelled', 'refunded'],
            default: 'pending'
        },
        registrationType: {
            type: String,
            enum: ['individual', 'team'],
            default: 'individual'
        },
        maxTeamSize: {
            type: Number,
            default: 1
        }
    }],

    selectedWorkshops: [{
        workshopId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Workshop',
            required: true
        },
        workshopName: String,
        status: {
            type: String,
            enum: ['pending', 'completed', 'cancelled', 'refunded'],
            default: 'pending'
        }
    }],

    amount: {
        type: Number,
        required: true
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'completed', 'failed', 'cancelled', 'refunded'],
        default: 'pending'
    },
    paymentDetails: {
        orderId: String,
        razorpayOrderId: String,
        razorpayPaymentId: String,
        razorpaySignature: String,
        paymentMethod: String,
        status: String,
        customerDetails: {
            name: String,
            email: String,
            phone: String
        },
        merchantParams: mongoose.Schema.Types.Mixed,
        refund: {
            id: String,
            amount: Number,
            status: String,
            reason: String,
            createdAt: Date
        }
    },

    paymentInitiatedAt: Date,
    paymentCompletedAt: Date,

    version: {
        type: Number,
        default: 1
    },

    updateHistory: [{
        version: Number,
        updatedAt: Date,
        changes: mongoose.Schema.Types.Mixed
    }],

    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Pre-save middleware
registrationSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    if (this.isModified('selectedEvents') || this.isModified('selectedWorkshops')) {
        this.version += 1;
        this.updateHistory.push({
            version: this.version,
            updatedAt: new Date(),
            changes: {
                events: this.selectedEvents.map(e => ({
                    eventId: e.eventId,
                    status: e.status
                })),
                workshops: this.selectedWorkshops.map(w => ({
                    workshopId: w.workshopId,
                    status: w.status
                }))
            }
        });
    }
    next();
});

// Method to update registration with new items
registrationSchema.methods.addItems = async function(newEvents = [], newWorkshops = []) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // Validate payment status
        if (this.paymentStatus !== 'completed') {
            throw new Error('Cannot update registration: Payment not completed');
        }

        // Add new events
        if (newEvents.length > 0) {
            const eventUpdates = newEvents.map(event => ({
                eventId: event.eventInfo.id,
                eventName: event.eventInfo.title,
                status: 'completed',
                registrationType: 'individual',
                maxTeamSize: 1
            }));
            this.selectedEvents.push(...eventUpdates);
        }

        // Add new workshops
        if (newWorkshops.length > 0) {
            const workshopUpdates = newWorkshops.map(workshop => ({
                workshopId: workshop.id,
                workshopName: workshop.title,
                status: 'completed'
            }));
            this.selectedWorkshops.push(...workshopUpdates);
        }

        await this.save({ session });
        await session.commitTransaction();
        return true;
    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        session.endSession();
    }
};

// Method to handle successful payment
registrationSchema.methods.handleSuccessfulPayment = async function(razorpayResponse) {
    try {
        this.paymentStatus = 'completed';
        this.paymentCompletedAt = new Date();
        this.paymentDetails = {
            ...this.paymentDetails,
            status: 'completed',
            razorpayPaymentId: razorpayResponse.razorpay_payment_id,
            razorpayOrderId: razorpayResponse.razorpay_order_id,
            razorpaySignature: razorpayResponse.razorpay_signature
        };

        // Update event and workshop statuses
        this.selectedEvents.forEach(event => {
            event.status = 'completed';
        });
        this.selectedWorkshops.forEach(workshop => {
            workshop.status = 'completed';
        });

        await this.save();
        return true;
    } catch (error) {
        console.error('Payment completion handling failed:', error);
        throw error;
    }
};

// Method to handle refunds
registrationSchema.methods.handleRefund = async function(refundData) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        this.paymentStatus = 'refunded';
        this.selectedEvents.forEach(event => {
            event.status = 'refunded';
        });
        this.selectedWorkshops.forEach(workshop => {
            workshop.status = 'refunded';
        });

        this.paymentDetails.refund = {
            id: refundData.id,
            amount: refundData.amount,
            status: refundData.status,
            reason: refundData.reason,
            createdAt: new Date()
        };

        await this.save({ session });
        await session.commitTransaction();
        return true;
    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        session.endSession();
    }
};

export const Registration = mongoose.model('Registration', registrationSchema);