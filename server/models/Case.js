const mongoose = require('mongoose');

const caseSchema = new mongoose.Schema({
    caseNumber: {
        type: String,
        required: true,
        unique: true,
    },
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },

    // Case Classification
    caseType: {
        type: String,
        required: true,
    },
    priority: {
        type: String,
        enum: ['Low', 'Medium', 'High', 'Urgent'],
        default: 'Medium',
    },

    // Status
    status: {
        type: String,
        enum: ['Open', 'Under Investigation', 'Pending', 'Solved', 'Closed', 'Cold'],
        default: 'Open',
    },

    // Timeline
    openedAt: {
        type: Date,
        default: Date.now,
    },
    closedAt: Date,

    // Relationships
    crimes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CrimeEvent',
    }],
    suspects: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Criminal',
    }],

    // Team
    leadInvestigator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    team: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],

    // Evidence & Documentation
    evidence: [{
        type: String,
        description: String,
        collectedAt: Date,
        collectedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        url: String,
    }],

    documents: [{
        title: String,
        type: String,
        url: String,
        uploadedAt: Date,
    }],

    // Timeline Events
    timeline: [{
        date: Date,
        event: String,
        description: String,
        addedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
    }],

    // Notes & Updates
    notes: String,
    updates: [{
        timestamp: Date,
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        content: String,
    }],

    tags: [String],
}, {
    timestamps: true,
});

// Auto-generate case number
caseSchema.pre('validate', async function () {
    if (!this.caseNumber) {
        const year = new Date().getFullYear();
        const count = await this.constructor.countDocuments();
        this.caseNumber = `CASE-${year}-${String(count + 1).padStart(6, '0')}`;
    }
});

module.exports = mongoose.model('Case', caseSchema);
