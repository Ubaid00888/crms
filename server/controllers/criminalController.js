const Criminal = require('../models/Criminal');
const AuditLog = require('../models/AuditLog');

// @desc    Get all criminals
// @route   GET /api/criminals
// @access  Private
exports.getCriminals = async (req, res) => {
    try {
        const { page = 1, limit = 20, search, status, dangerLevel } = req.query;

        const query = {};

        if (search) {
            query.$or = [
                { firstName: { $regex: search, $options: 'i' } },
                { lastName: { $regex: search, $options: 'i' } },
                { aliases: { $regex: search, $options: 'i' } },
            ];
        }

        if (status) query.status = status;
        if (dangerLevel) query.dangerLevel = dangerLevel;

        const criminals = await Criminal.find(query)
            .populate('addedBy', 'username fullName')
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ createdAt: -1 });

        const count = await Criminal.countDocuments(query);

        res.json({
            success: true,
            data: criminals,
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

// @desc    Get single criminal
// @route   GET /api/criminals/:id
// @access  Private
exports.getCriminal = async (req, res) => {
    try {
        const criminal = await Criminal.findById(req.params.id)
            .populate('addedBy', 'username fullName')
            .populate('knownAssociates', 'firstName lastName photo')
            .populate('crimes');

        if (!criminal) {
            return res.status(404).json({ success: false, message: 'Criminal not found' });
        }

        res.json({ success: true, data: criminal });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Create new criminal
// @route   POST /api/criminals
// @access  Private (Admin, Analyst)
exports.createCriminal = async (req, res) => {
    try {
        const criminalData = {
            ...req.body,
            addedBy: req.user.id,
        };

        const criminal = await Criminal.create(criminalData);

        // Emit real-time update
        if (global.emitToAll) {
            global.emitToAll('criminal-added', criminal);
        }

        res.status(201).json({ success: true, data: criminal });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update criminal
// @route   PUT /api/criminals/:id
// @access  Private (Admin, Analyst)
exports.updateCriminal = async (req, res) => {
    try {
        const criminal = await Criminal.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!criminal) {
            return res.status(404).json({ success: false, message: 'Criminal not found' });
        }

        res.json({ success: true, data: criminal });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Delete criminal
// @route   DELETE /api/criminals/:id
// @access  Private (Admin only)
exports.deleteCriminal = async (req, res) => {
    try {
        const criminal = await Criminal.findByIdAndDelete(req.params.id);

        if (!criminal) {
            return res.status(404).json({ success: false, message: 'Criminal not found' });
        }

        res.json({ success: true, message: 'Criminal deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Calculate and update risk score
// @route   POST /api/criminals/:id/calculate-risk
// @access  Private
exports.calculateRiskScore = async (req, res) => {
    try {
        const criminal = await Criminal.findById(req.params.id).populate('crimes');

        if (!criminal) {
            return res.status(404).json({ success: false, message: 'Criminal not found' });
        }

        // Simple risk calculation algorithm
        let riskScore = 0;

        // Base score from number of crimes
        riskScore += criminal.crimes.length * 5;

        // Add points for convictions
        riskScore += criminal.convictions.length * 10;

        // Add points based on crime severity
        criminal.crimes.forEach(crime => {
            if (crime.severity === 'Critical') riskScore += 20;
            else if (crime.severity === 'High') riskScore += 15;
            else if (crime.severity === 'Medium') riskScore += 10;
            else riskScore += 5;
        });

        // Cap at 100
        riskScore = Math.min(riskScore, 100);

        // Determine danger level
        let dangerLevel = 'Low';
        if (riskScore >= 75) dangerLevel = 'Critical';
        else if (riskScore >= 50) dangerLevel = 'High';
        else if (riskScore >= 25) dangerLevel = 'Medium';

        criminal.riskScore = riskScore;
        criminal.dangerLevel = dangerLevel;
        await criminal.save();

        res.json({ success: true, data: { riskScore, dangerLevel } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
