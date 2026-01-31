const mongoose = require('mongoose');

const relationshipSchema = new mongoose.Schema({
    type: {
        type: String,
        required: true,
        enum: [
            'Family', 'Associate', 'Gang Member', 'Business Partner',
            'Accomplice', 'Victim', 'Witness', 'Informant', 'Other'
        ],
    },

    // Entities (can be criminals or cases)
    entity1: {
        entityType: {
            type: String,
            enum: ['Criminal', 'Case', 'Location'],
            required: true,
        },
        entityId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            refPath: 'entity1.entityType',
        },
    },

    entity2: {
        entityType: {
            type: String,
            enum: ['Criminal', 'Case', 'Location'],
            required: true,
        },
        entityId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            refPath: 'entity2.entityType',
        },
    },

    strength: {
        type: Number,
        min: 1,
        max: 10,
        default: 5,
    },

    description: String,
    evidence: String,

    verifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },

    isActive: {
        type: Boolean,
        default: true,
    },
}, {
    timestamps: true,
});

module.exports = mongoose.model('Relationship', relationshipSchema);
