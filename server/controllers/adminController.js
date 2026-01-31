const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getUsers = async (req, res) => {
    try {
        const users = await User.find({}).sort('-createdAt');
        res.json({ success: true, data: users });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Create a new user
// @route   POST /api/admin/users
// @access  Private/Admin
exports.createUser = async (req, res) => {
    try {
        const { username, email, fullName, role, department, password } = req.body;

        // Check if user exists
        const userExists = await User.findOne({ $or: [{ email }, { username }] });
        if (userExists) {
            return res.status(400).json({ success: false, message: 'User already exists' });
        }

        // Generate a random temporary password if not provided
        const userPassword = password || crypto.randomBytes(8).toString('hex');

        // Create user
        const user = await User.create({
            username,
            email,
            password: userPassword,
            fullName,
            role,
            department,
            isActive: true
        });

        // Generate Initial QR Token (Only for non-admin users)
        let plainToken = null;
        if (role !== 'admin') {
            const qrResult = await generateQRToken();
            plainToken = qrResult.plainToken;
            user.qrTokenHash = qrResult.hashedToken;
            user.qrToken = plainToken; // Store plain token for viewing
            user.qrExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days default
            user.qrRotatingToken = crypto.randomBytes(16).toString('hex');
            await user.save();
        }

        // Audit Log
        await AuditLog.create({
            user: req.user?._id || req.user?.id,
            action: 'CREATE',
            resource: 'User',
            resourceId: user._id,
            details: { username: user.username, role: user.role },
            ipAddress: req.ip,
            userAgent: req.get('user-agent'),
            status: 'Success'
        });

        res.status(201).json({
            success: true,
            data: user,
            qrToken: plainToken // Will be null for admin
        });
    } catch (error) {
        console.error('User creation error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update user
// @route   PATCH /api/admin/users/:id
// @access  Private/Admin
exports.updateUser = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        await AuditLog.create({
            user: req.user.id,
            action: 'UPDATE',
            resource: 'User',
            resourceId: user._id,
            details: req.body,
            status: 'Success'
        });

        res.json({ success: true, data: user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        await user.deleteOne();

        await AuditLog.create({
            user: req.user.id,
            action: 'DELETE',
            resource: 'User',
            resourceId: req.params.id,
            details: { username: user.username },
            status: 'Success'
        });

        res.json({ success: true, message: 'User removed' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Regenerate QR Code
// @route   POST /api/admin/users/:id/regenerate-qr
// @access  Private/Admin
exports.regenerateQR = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        if (user.role === 'admin') {
            return res.status(403).json({ success: false, message: 'Admins cannot have QR ID cards' });
        }

        const { plainToken, hashedToken } = await generateQRToken();
        user.qrTokenHash = hashedToken;
        user.qrToken = plainToken; // Store plain token for viewing
        user.qrExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        user.qrRotatingToken = crypto.randomBytes(16).toString('hex');
        user.qrRevoked = false;
        await user.save();

        await AuditLog.create({
            user: req.user.id,
            action: 'UPDATE',
            resource: 'User',
            resourceId: user._id,
            details: { action: 'QR_REGENERATE' },
            status: 'Success'
        });

        res.json({
            success: true,
            qrToken: plainToken,
            qrExpiry: user.qrExpiry
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Revoke QR Code
// @route   POST /api/admin/users/:id/revoke-qr
// @access  Private/Admin
exports.revokeQR = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        user.qrRevoked = true;
        await user.save();

        await AuditLog.create({
            user: req.user.id,
            action: 'UPDATE',
            resource: 'User',
            resourceId: user._id,
            details: { action: 'QR_REVOKE' },
            status: 'Success'
        });

        res.json({ success: true, message: 'QR Code revoked' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Helper function to generate QR token
async function generateQRToken() {
    const plainToken = crypto.randomBytes(32).toString('hex');
    const salt = await bcrypt.genSalt(10);
    const hashedToken = await bcrypt.hash(plainToken, salt);
    return { plainToken, hashedToken };
}
