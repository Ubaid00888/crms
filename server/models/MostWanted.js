const mongoose = require('mongoose');

const mostWantedSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true,
        trim: true
    },
    aliases: [{
        type: String,
        trim: true
    }],
    gender: {
        type: String,
        trim: true
    },
    nationality: {
        type: String,
        trim: true
    },
    crimeDescription: {
        type: String,
        trim: true
    },
    wantedFor: [{
        type: String,
        trim: true
    }],
    reward: {
        type: String,
        trim: true
    },
    lastKnownLocation: {
        type: String,
        trim: true
    },
    status: {
        type: String,
        enum: ['At Large', 'Captured', 'Deceased', 'Archived'],
        default: 'At Large'
    },
    sourceAgency: {
        type: String,
        enum: ['FBI', 'INTERPOL', 'Local'],
        required: true
    },
    externalId: {
        type: String,
        required: true,
        unique: true
    },
    images: [{
        original: String,
        thumb: String,
        caption: String
    }],
    publishedAt: {
        type: Date,
        default: Date.now
    },
    lastSyncedAt: {
        type: Date,
        default: Date.now
    },
    detailsUrl: {
        type: String
    }
}, {
    timestamps: true
});

// Text index for search
mostWantedSchema.index({
    fullName: 'text',
    aliases: 'text',
    crimeDescription: 'text',
    nationality: 'text'
});

// Status and Agency indexes
mostWantedSchema.index({ status: 1 });
mostWantedSchema.index({ sourceAgency: 1 });

module.exports = mongoose.model('MostWanted', mostWantedSchema);
