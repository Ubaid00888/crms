const AuditLog = require('../models/AuditLog');

const auditLogger = (action, resource) => {
    return async (req, res, next) => {
        // Store original send
        const originalSend = res.send;

        res.send = function (data) {
            // Log the action
            AuditLog.create({
                user: req.user ? req.user._id : null,
                action,
                resource,
                resourceId: req.params.id || null,
                details: {
                    method: req.method,
                    body: req.body,
                    params: req.params,
                    query: req.query,
                },
                ipAddress: req.ip,
                userAgent: req.get('user-agent'),
                status: res.statusCode < 400 ? 'Success' : 'Failed',
            }).catch(err => console.error('Audit log error:', err));

            // Call original send
            originalSend.call(this, data);
        };

        next();
    };
};

module.exports = auditLogger;
