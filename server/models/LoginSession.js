const mongoose = require('mongoose');

const loginSessionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    token: {
        type: String,
        required: true,
    },
    deviceInfo: {
        type: String,
    },
    ipAddress: {
        type: String,
    },
    loginTime: {
        type: Date,
        default: Date.now,
    },
    expiresAt: {
        type: Date,
        required: true,
    },
    isValid: {
        type: Boolean,
        default: true,
    },
}, {
    timestamps: true,
});

// Auto-expire sessions
loginSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('LoginSession', loginSessionSchema);
