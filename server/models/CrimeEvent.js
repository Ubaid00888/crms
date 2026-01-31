const mongoose = require('mongoose');

const crimeEventSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    crimeType: {
        type: String,
        required: true,
        enum: [
            'Homicide', 'Assault', 'Robbery', 'Burglary', 'Theft',
            'Fraud', 'Cybercrime', 'Drug Trafficking', 'Terrorism',
            'Human Trafficking', 'Kidnapping', 'Arson', 'Vandalism',
            'Sexual Assault', 'Other'
        ],
    },
    severity: {
        type: String,
        enum: ['Low', 'Medium', 'High', 'Critical'],
        default: 'Medium',
    },

    // Location (GeoJSON)
    location: {
        type: {
            type: String,
            enum: ['Point'],
            required: true,
            default: 'Point',
        },
        coordinates: {
            type: [Number], // [longitude, latitude]
            required: true,
        },
        address: String,
        city: String,
        state: String,
        country: String,
    },

    // Temporal Data
    occurredAt: {
        type: Date,
        required: true,
    },
    reportedAt: {
        type: Date,
        default: Date.now,
    },

    // Relationships
    suspects: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Criminal',
    }],
    victims: [{
        name: String,
        age: Number,
        gender: String,
    }],
    witnesses: [{
        name: String,
        contact: String,
        statement: String,
    }],

    // Case Association
    caseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Case',
    },

    // Evidence
    evidence: [{
        evidenceType: String,
        description: String,
        url: String,
    }],

    // Status
    status: {
        type: String,
        enum: ['Reported', 'Under Investigation', 'Solved', 'Cold Case', 'Closed'],
        default: 'Reported',
    },
    isApproved: {
        type: Boolean,
        default: false,
    },
    contentHash: {
        type: String,
        unique: true,
        sparse: true,
    },

    // Source (for global feed)
    source: {
        type: String,
        enum: ['Manual', 'API', 'News', 'External', 'Intelligence'],
        default: 'Manual',
    },
    sourceUrl: String,

    reportedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },

    tags: [String],
    notes: String,
}, {
    timestamps: true,
});

// Geospatial index
crimeEventSchema.index({ 'location.coordinates': '2dsphere' });

// Text index for search
crimeEventSchema.index({ title: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model('CrimeEvent', crimeEventSchema);
