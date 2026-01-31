const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const AuditLog = require('../models/AuditLog');
const LoginSession = require('../models/LoginSession');

// Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE,
    });
};

// Generate Refresh Token
const generateRefreshToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, {
        expiresIn: process.env.JWT_REFRESH_EXPIRE,
    });
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public (or Admin only in production)
exports.register = async (req, res) => {
    try {
        const { username, email, password, fullName, role, department } = req.body;

        // Check if user exists
        const userExists = await User.findOne({ $or: [{ email }, { username }] });
        if (userExists) {
            return res.status(400).json({ success: false, message: 'User already exists' });
        }

        // Create user
        const user = await User.create({
            username,
            email,
            password,
            fullName,
            role: role || 'agent',
            department,
        });

        // Generate tokens
        const token = generateToken(user._id);
        const refreshToken = generateRefreshToken(user._id);

        res.status(201).json({
            success: true,
            data: {
                user: {
                    id: user._id,
                    username: user.username,
                    email: user.email,
                    role: user.role,
                    fullName: user.fullName,
                },
                token,
                refreshToken,
            },
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;

        // Validate input
        if (!username || !password) {
            return res.status(400).json({ success: false, message: 'Please provide username and password' });
        }

        // Check for user (include password)
        const user = await User.findOne({ username }).select('+password');
        if (!user) {
            await AuditLog.create({
                action: 'LOGIN',
                resource: 'auth',
                status: 'Failed',
                details: { username },
                ipAddress: req.ip,
                userAgent: req.get('user-agent'),
            });
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        // Check if user is active
        if (!user.isActive) {
            return res.status(403).json({ success: false, message: 'Account is deactivated' });
        }

        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            await AuditLog.create({
                user: user._id,
                action: 'LOGIN',
                resource: 'auth',
                status: 'Failed',
                ipAddress: req.ip,
                userAgent: req.get('user-agent'),
            });
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        // Update login history
        user.lastLogin = new Date();
        user.loginHistory.push({
            timestamp: new Date(),
            ipAddress: req.ip,
            userAgent: req.get('user-agent'),
        });
        await user.save();

        // Log successful login
        await AuditLog.create({
            user: user._id,
            action: 'LOGIN',
            resource: 'auth',
            status: 'Success',
            ipAddress: req.ip,
            userAgent: req.get('user-agent'),
        });

        // Generate tokens
        const token = generateToken(user._id);
        const refreshToken = generateRefreshToken(user._id);

        res.json({
            success: true,
            data: {
                user: {
                    id: user._id,
                    username: user.username,
                    email: user.email,
                    role: user.role,
                    fullName: user.fullName,
                    department: user.department,
                },
                token,
                refreshToken,
            },
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        res.json({ success: true, data: user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Refresh token
// @route   POST /api/auth/refresh
// @access  Public
exports.refreshToken = async (req, res) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(401).json({ success: false, message: 'No refresh token provided' });
        }

        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        const user = await User.findById(decoded.id);

        if (!user || !user.isActive) {
            return res.status(401).json({ success: false, message: 'Invalid refresh token' });
        }

        const newToken = generateToken(user._id);
        const newRefreshToken = generateRefreshToken(user._id);

        res.json({
            success: true,
            data: {
                token: newToken,
                refreshToken: newRefreshToken,
            },
        });
    } catch (error) {
        res.status(401).json({ success: false, message: 'Invalid refresh token' });
    }
};

// @desc    Login via QR Code
// @route   POST /api/auth/qr-login
// @access  Public
exports.qrLogin = async (req, res) => {
    try {
        const { userId, token, deviceInfo } = req.body;

        if (!userId || !token) {
            return res.status(400).json({ success: false, message: 'Invalid QR payload' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(401).json({ success: false, message: 'Unauthorized device' });
        }

        // Check if role is allowed for QR login (Analyst and User roles only as per prompt)
        // Adjusting role check based on existing roles: analyst, agent
        // Prompt says "Analyst and Users", existing has "analyst", "agent". Assuming "agent" is the "User".
        if (user.role === 'admin') {
            return res.status(403).json({ success: false, message: 'Admin must use standard login' });
        }

        if (!user.isActive) {
            return res.status(403).json({ success: false, message: 'Access revoked' });
        }

        if (user.qrRevoked) {
            return res.status(401).json({ success: false, message: 'ID Card has been revoked' });
        }

        // Check expiry
        if (user.qrExpiry && new Date() > user.qrExpiry) {
            return res.status(401).json({ success: false, message: 'ID Card has expired' });
        }

        // Compare token
        const isMatch = await bcrypt.compare(token, user.qrTokenHash);
        if (!isMatch) {
            await AuditLog.create({
                user: user._id,
                action: 'ACCESS_DENIED',
                resource: 'auth/qr-login',
                status: 'Failed',
                details: { reason: 'Token mismatch' },
                ipAddress: req.ip,
                userAgent: req.get('user-agent')
            });
            return res.status(401).json({ success: false, message: 'Invalid or manipulated ID' });
        }

        // Potential token rotation here if one-time use is required
        // For simplicity in academic project, we allow reuse until expiry or manual revocation

        // Update login stats
        user.lastLogin = new Date();
        user.loginHistory.push({
            timestamp: new Date(),
            ipAddress: req.ip,
            userAgent: req.get('user-agent')
        });
        await user.save();

        // Generate tokens
        const jwtToken = generateToken(user._id);
        const refreshToken = generateRefreshToken(user._id);

        // Create Session Record
        await LoginSession.create({
            userId: user._id,
            token: jwtToken,
            deviceInfo: deviceInfo || req.get('user-agent'),
            ipAddress: req.ip,
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // Match JWT expiry
        });

        // Audit Log
        await AuditLog.create({
            user: user._id,
            action: 'LOGIN',
            resource: 'auth/qr',
            status: 'Success',
            ipAddress: req.ip,
            userAgent: req.get('user-agent')
        });

        res.json({
            success: true,
            data: {
                user: {
                    id: user._id,
                    username: user.username,
                    email: user.email,
                    role: user.role,
                    fullName: user.fullName
                },
                token: jwtToken,
                refreshToken
            }
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    register: exports.register,
    login: exports.login,
    getMe: exports.getMe,
    refreshToken: exports.refreshToken,
    qrLogin: exports.qrLogin
};
