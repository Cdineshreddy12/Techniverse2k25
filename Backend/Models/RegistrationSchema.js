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
                baseAmount: Number,
                platformFee: Number,
                totalAmount: Number,
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

    // Base amount (package price only)
    amount: {
        type: Number,
        required: true
    },
    
    // Platform fee (calculated at 2% of base amount)
    platformFee: {
        type: Number,
        default: function() {
            return Math.ceil(this.amount * 0.02);
        }
    },
    
    // Total amount (base amount + platform fee)
    totalAmount: {
        type: Number,
        default: function() {
            return this.amount + (this.platformFee || Math.ceil(this.amount * 0.02));
        }
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
        merchantParams: {
            comboId: String,
            comboName: String,
            verificationData: Object,
            selectedWorkshopIds: [String],
            baseAmount: Number,
            platformFee: Number
        },
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
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Pre-save middleware
registrationSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    
    // Calculate platformFee if not set
    if (!this.platformFee) {
        this.platformFee = Math.ceil(this.amount * 0.02);
    }
    
    // Calculate totalAmount if not set
    if (!this.totalAmount) {
        this.totalAmount = this.amount + this.platformFee;
    }
    
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

// Virtual for calculating platform fee if not set
registrationSchema.virtual('calculatedPlatformFee').get(function() {
    return this.platformFee || Math.ceil(this.amount * 0.02);
});

// Virtual for calculating total amount if not set
registrationSchema.virtual('calculatedTotalAmount').get(function() {
    return this.totalAmount || (this.amount + this.calculatedPlatformFee);
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

// Method to handle successful payment including platform fee
registrationSchema.methods.handleSuccessfulPayment = async function(razorpayResponse, paidAmount) {
    try {
        // Set payment status and details
        this.paymentStatus = 'completed';
        this.paymentCompletedAt = new Date();
        
        // Ensure platform fee is set
        if (!this.platformFee) {
            this.platformFee = Math.ceil(this.amount * 0.02);
        }
        
        // Set the total amount from the actual paid amount
        this.totalAmount = paidAmount || (this.amount + this.platformFee);
        
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

// Indices for better query performance
registrationSchema.index({ kindeId: 1 });
registrationSchema.index({ 'paymentDetails.orderId': 1 });
registrationSchema.index({ 'paymentDetails.razorpayOrderId': 1 });
registrationSchema.index({ 'paymentDetails.razorpayPaymentId': 1 });
registrationSchema.index({ paymentStatus: 1 });

export const Registration = mongoose.model('Registration', registrationSchema);