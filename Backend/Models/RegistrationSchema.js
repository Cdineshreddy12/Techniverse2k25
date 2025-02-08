// Models/RegistrationSchema.js
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

    // Event Details
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
        orderId: String,  // Juspay order_id
        juspayId: String, // Juspay's internal id (like ordeh_...)
        transactionId: String,
        paymentMethod: String,
        bankReferenceNumber: String,
        status: String,  // Raw status from Juspay
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

// Method to update payment status
registrationSchema.methods.updatePaymentStatus = async function(juspayResponse) {
    const {
        status,
        id: juspayId,
        order_id: orderId,
        payment_links,
        sdk_payload
    } = juspayResponse;

    this.paymentDetails = {
        orderId,
        juspayId,
        status,
        paymentLinks: {
            web: payment_links?.web,
            expiry: payment_links?.expiry
        },
        sdkPayload: {
            requestId: sdk_payload?.requestId,
            clientAuthToken: sdk_payload?.payload?.clientAuthToken,
            clientId: sdk_payload?.payload?.clientId
        }
    };

    if (status === 'CHARGED') {
        this.paymentStatus = 'completed';
        this.paymentCompletedAt = new Date();
        
        // Update event statuses
        this.selectedEvents.forEach(event => {
            event.status = 'confirmed';
        });
    } else if (['PENDING', 'PENDING_VBV'].includes(status)) {
        this.paymentStatus = 'pending';
    } else {
        this.paymentStatus = 'failed';
    }

    await this.save();
};

// Method to handle webhook updates
registrationSchema.methods.handleWebhook = async function(webhookData) {
    const {
        status,
        txn_id,
        payment_method,
        bank_reference,
        response_code,
        response_message
    } = webhookData;

    this.paymentDetails = {
        ...this.paymentDetails,
        transactionId: txn_id,
        paymentMethod: payment_method,
        bankReferenceNumber: bank_reference,
        responseCode: response_code,
        responseMessage: response_message,
        status
    };

    await this.save();
};

export const Registration = mongoose.model('Registration', registrationSchema);