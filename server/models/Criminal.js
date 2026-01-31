const mongoose = require('mongoose');

const criminalSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
        required: true,
    },
    aliases: [String],
    dateOfBirth: Date,
    gender: {
        type: String,
        enum: ['Male', 'Female', 'Other', 'Unknown'],
    },
    nationality: String,
    photo: String, // URL to photo
    fingerprints: String, // URL or hash
    dna: String,

    // Criminal Profile
    riskScore: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
    },
    dangerLevel: {
        type: String,
        enum: ['Low', 'Medium', 'High', 'Critical'],
        default: 'Low',
    },
    modusOperandi: String, // MO description
    knownAssociates: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Criminal',
    }],

    // Criminal Record
    crimes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CrimeEvent',
    }],
    convictions: [{
        charge: String,
        date: Date,
        sentence: String,
        status: {
            type: String,
            enum: ['Served', 'Ongoing', 'Parole', 'Escaped'],
        },
    }],

    // Status
    status: {
        type: String,
        enum: ['At Large', 'Incarcerated', 'Deceased', 'Unknown'],
        default: 'Unknown',
    },
    lastKnownLocation: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point',
        },
        coordinates: {
            type: [Number], // [longitude, latitude]
        },
        address: String,
        city: String,
        country: String,
    },

    notes: String,
    addedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
}, {
    timestamps: true,
});

// Index for geospatial queries
criminalSchema.index({ 'lastKnownLocation.coordinates': '2dsphere' });

// Virtual for full name
criminalSchema.virtual('fullName').get(function () {
    return `${this.firstName} ${this.lastName}`;
});

module.exports = mongoose.model('Criminal', criminalSchema);
