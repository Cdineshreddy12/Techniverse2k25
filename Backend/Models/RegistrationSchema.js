import mongoose from 'mongoose';

const registrationSchema = new mongoose.Schema({
    // Student Reference
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    kindeId: {
        type: String,
        required: true
    },
    
    // Selected Items
    selectedEvents: [{
        eventId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Event',
            required: true
        },
        eventName: String,
        status: {
            type: String,
            enum: ['pending', 'confirmed', 'cancelled'],
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
            enum: ['pending', 'confirmed', 'cancelled'],
            default: 'pending'
        }
    }],

    // Combo Package Information
    combo: {
        id: String,
        name: String,
        price: Number,
        description: String
    },

    // QR Code and Validation
    qrCode: {
        dataUrl: { type: String },
        generatedAt: { type: Date },
        validUntil: { type: Date },
        metadata: {
            events: [String],
            workshops: [String]
        }
    },
    
    // Email Notification Status
    emailNotification: {
        confirmationSent: {
            type: Boolean,
            default: false
        },
        sentAt: Date,
        attempts: {
            type: Number,
            default: 0
        },
        lastAttempt: Date,
        error: String
    },

    // Payment Information
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
        juspayId: String,
        transactionId: String,
        paymentMethod: String,
        bankReferenceNumber: String,
        status: String,
        statusMessage: String,
        paymentLinks: {
            web: String,
            expiry: Date
        },
        sdkPayload: {
            requestId: String,
            clientAuthToken: String,
            clientId: String
        },
        customerDetails: {
            name: String,
            email: String,
            phone: String
        },
        merchantParams: mongoose.Schema.Types.Mixed,
        responseCode: String,
        responseMessage: String
    },

    // Timestamps
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    paymentInitiatedAt: Date,
    paymentCompletedAt: Date
});

// Update timestamps
registrationSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    next();
});

// Handle successful payment without email sending
registrationSchema.methods.handleSuccessfulPayment = async function(juspayResponse) {
    try {
        // Update payment status
        this.paymentStatus = 'completed';
        this.paymentCompletedAt = new Date();
        this.paymentDetails = {
            ...this.paymentDetails,
            status: juspayResponse.status,
            juspayId: juspayResponse.id,
            orderId: juspayResponse.order_id,
            transactionId: juspayResponse.txn_id
        };

        // Update event and workshop statuses
        this.selectedEvents.forEach(event => {
            event.status = 'confirmed';
        });
        this.selectedWorkshops.forEach(workshop => {
            workshop.status = 'confirmed';
        });

        // Generate QR code
        const qrData = await generateQRCode({
            userId: this.kindeId,
            selectedEvents: this.selectedEvents,
            selectedWorkshops: this.selectedWorkshops
        });

        this.qrCode = {
            dataUrl: qrData,
            generatedAt: new Date(),
            signature: qrData.signature,
            validUntil: new Date(Date.now() + (365 * 24 * 60 * 60 * 1000)) // Valid for 1 year
        };

        await this.save();
        return true;
    } catch (error) {
        console.error('Payment completion handling failed:', error);
        throw error;
    }
};

// Method to update payment status
registrationSchema.methods.updatePaymentStatus = async function(juspayResponse) {
    if (juspayResponse.status === 'CHARGED') {
        return this.handleSuccessfulPayment(juspayResponse);
    }

    // Handle other payment statuses
    this.paymentDetails = {
        ...this.paymentDetails,
        status: juspayResponse.status,
        juspayId: juspayResponse.id,
        orderId: juspayResponse.order_id
    };

    if (['PENDING', 'PENDING_VBV'].includes(juspayResponse.status)) {
        this.paymentStatus = 'pending';
    } else {
        this.paymentStatus = 'failed';
    }

    await this.save();
};

export const Registration = mongoose.model('Registration', registrationSchema);