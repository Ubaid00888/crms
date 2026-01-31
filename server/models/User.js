const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Username is required'],
        unique: true,
        trim: true,
        minlength: 3,
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: 6,
        select: false,
    },
    role: {
        type: String,
        enum: ['admin', 'analyst', 'agent'],
        default: 'agent',
    },
    fullName: {
        type: String,
        required: true,
    },
    badge: {
        type: String,
        unique: true,
        sparse: true,
    },
    department: String,
    isActive: {
        type: Boolean,
        default: true,
    },
    lastLogin: Date,
    loginHistory: [{
        timestamp: Date,
        ipAddress: String,
        userAgent: String,
    }],
    qrTokenHash: String,
    qrToken: String, // Added for simulation: stores the plain token for viewing the card
    qrExpiry: Date,
    qrRotatingToken: String,
    qrRevoked: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true,
});

// Hash password before saving
userSchema.pre('save', async function () {
    if (!this.isModified('password')) {
        return;
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
