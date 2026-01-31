const CrimeEvent = require('../models/CrimeEvent');

// @desc    Get all crime events
// @route   GET /api/crimes
// @access  Private
exports.getCrimeEvents = async (req, res) => {
    try {
        const { page = 1, limit = 20, crimeType, severity, status, startDate, endDate } = req.query;

        const query = {};

        if (crimeType) query.crimeType = crimeType;
        if (severity) query.severity = severity;
        if (status) query.status = status;

        if (startDate || endDate) {
            query.occurredAt = {};
            if (startDate) query.occurredAt.$gte = new Date(startDate);
            if (endDate) query.occurredAt.$lte = new Date(endDate);
        }

        // Only show approved crimes to public/agents, Admin sees all
        if (req.query.pending === 'true' && req.user.role === 'admin') {
            query.isApproved = false;
        } else if (req.user.role !== 'admin') {
            query.isApproved = true;
        } else if (req.query.approved === 'true') {
            query.isApproved = true;
        }

        const crimes = await CrimeEvent.find(query)
            .populate('suspects', 'firstName lastName photo')
            .populate('reportedBy', 'username fullName')
            .populate('assignedTo', 'username fullName')
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ occurredAt: -1 });

        const count = await CrimeEvent.countDocuments(query);

        res.json({
            success: true,
            data: crimes,
            pagination: {
                total: count,
                page: parseInt(page),
                pages: Math.ceil(count / limit),
            },
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get single crime event
// @route   GET /api/crimes/:id
// @access  Private
exports.getCrimeEvent = async (req, res) => {
    try {
        const crime = await CrimeEvent.findById(req.params.id)
            .populate('suspects')
            .populate('reportedBy', 'username fullName')
            .populate('assignedTo', 'username fullName')
            .populate('caseId');

        if (!crime) {
            return res.status(404).json({ success: false, message: 'Crime event not found' });
        }

        res.json({ success: true, data: crime });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Create new crime event
// @route   POST /api/crimes
// @access  Private
exports.createCrimeEvent = async (req, res) => {
    try {
        const crimeData = {
            ...req.body,
            reportedBy: req.user.id,
            isApproved: req.user.role === 'admin' || req.user.role === 'agent', // Manual reports by staff are auto-approved
        };

        const crime = await CrimeEvent.create(crimeData);

        // Emit real-time alert
        if (global.emitToAll) {
            global.emitToAll('crime-alert', {
                id: crime._id,
                title: crime.title,
                crimeType: crime.crimeType,
                severity: crime.severity,
                location: crime.location,
                occurredAt: crime.occurredAt,
            });
        }

        res.status(201).json({ success: true, data: crime });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update crime event
// @route   PUT /api/crimes/:id
// @access  Private
exports.updateCrimeEvent = async (req, res) => {
    try {
        const crime = await CrimeEvent.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!crime) {
            return res.status(404).json({ success: false, message: 'Crime event not found' });
        }

        res.json({ success: true, data: crime });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Approve/Reject intelligence report
// @route   PATCH /api/crimes/:id/approve
// @access  Private (Admin only)
exports.approveCrimeEvent = async (req, res) => {
    try {
        const { approved, severity, crimeType } = req.body;

        if (!approved) {
            await CrimeEvent.findByIdAndDelete(req.params.id);
            return res.json({ success: true, message: 'Intelligence report rejected and deleted.' });
        }

        const crime = await CrimeEvent.findByIdAndUpdate(
            req.params.id,
            { isApproved: true, severity, crimeType },
            { new: true }
        );

        if (!crime) {
            return res.status(404).json({ success: false, message: 'Crime report not found' });
        }

        // Emit real-time alert for newly approved crime
        if (global.emitToAll) {
            global.emitToAll('crime-alert', {
                id: crime._id,
                title: crime.title,
                crimeType: crime.crimeType,
                severity: crime.severity,
                location: crime.location,
                occurredAt: crime.occurredAt,
            });
        }

        res.json({ success: true, data: crime });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Delete crime event
// @route   DELETE /api/crimes/:id
// @access  Private (Admin only)
exports.deleteCrimeEvent = async (req, res) => {
    try {
        const crime = await CrimeEvent.findByIdAndDelete(req.params.id);

        if (!crime) {
            return res.status(404).json({ success: false, message: 'Crime event not found' });
        }

        res.json({ success: true, message: 'Crime event deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get crimes near location (geospatial query)
// @route   GET /api/crimes/near/:lng/:lat/:distance
// @access  Private
exports.getCrimesNearLocation = async (req, res) => {
    try {
        const { lng, lat, distance = 10000 } = req.params; // distance in meters

        const crimes = await CrimeEvent.find({
            'location.coordinates': {
                $near: {
                    $geometry: {
                        type: 'Point',
                        coordinates: [parseFloat(lng), parseFloat(lat)],
                    },
                    $maxDistance: parseInt(distance),
                },
            },
        }).limit(50);

        res.json({ success: true, data: crimes });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get crime statistics
// @route   GET /api/crimes/stats/overview
// @access  Private
exports.getCrimeStats = async (req, res) => {
    try {
        const totalCrimes = await CrimeEvent.countDocuments();

        const crimesByType = await CrimeEvent.aggregate([
            { $group: { _id: '$crimeType', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
        ]);

        const crimesBySeverity = await CrimeEvent.aggregate([
            { $group: { _id: '$severity', count: { $sum: 1 } } },
        ]);

        const crimesByStatus = await CrimeEvent.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } },
        ]);

        // Crimes per month (last 12 months)
        const twelveMonthsAgo = new Date();
        twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

        const crimesOverTime = await CrimeEvent.aggregate([
            { $match: { occurredAt: { $gte: twelveMonthsAgo } } },
            {
                $group: {
                    _id: {
                        year: { $year: '$occurredAt' },
                        month: { $month: '$occurredAt' },
                    },
                    count: { $sum: 1 },
                },
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } },
        ]);

        res.json({
            success: true,
            data: {
                totalCrimes,
                crimesByType,
                crimesBySeverity,
                crimesByStatus,
                crimesOverTime,
            },
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
