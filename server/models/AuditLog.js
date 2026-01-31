const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false,
    },
    action: {
        type: String,
        required: true,
        enum: [
            'LOGIN', 'LOGOUT', 'CREATE', 'READ', 'UPDATE', 'DELETE',
            'EXPORT', 'SEARCH', 'ACCESS_DENIED', 'PASSWORD_CHANGE'
        ],
    },
    resource: {
        type: String,
        required: true,
    },
    resourceId: mongoose.Schema.Types.ObjectId,
    details: mongoose.Schema.Types.Mixed,

    ipAddress: String,
    userAgent: String,

    status: {
        type: String,
        enum: ['Success', 'Failed'],
        default: 'Success',
    },

    timestamp: {
        type: Date,
        default: Date.now,
    },
}, {
    timestamps: false,
});

// TTL index - auto-delete logs older than 90 days
auditLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 7776000 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
