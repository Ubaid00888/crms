const Case = require('../models/Case');

// @desc    Get all cases
// @route   GET /api/cases
// @access  Private
exports.getCases = async (req, res) => {
    try {
        const { page = 1, limit = 20, status, priority } = req.query;

        const query = {};
        if (status) query.status = status;
        if (priority) query.priority = priority;

        const cases = await Case.find(query)
            .populate('leadInvestigator', 'username fullName')
            .populate('team', 'username fullName')
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ createdAt: -1 });

        const count = await Case.countDocuments(query);

        res.json({
            success: true,
            data: cases,
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

// @desc    Get single case
// @route   GET /api/cases/:id
// @access  Private
exports.getCase = async (req, res) => {
    try {
        const caseData = await Case.findById(req.params.id)
            .populate('leadInvestigator', 'username fullName')
            .populate('team', 'username fullName')
            .populate('crimes')
            .populate('suspects', 'firstName lastName photo riskScore');

        if (!caseData) {
            return res.status(404).json({ success: false, message: 'Case not found' });
        }

        res.json({ success: true, data: caseData });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Create new case
// @route   POST /api/cases
// @access  Private (Admin, Analyst)
exports.createCase = async (req, res) => {
    try {
        const caseData = {
            ...req.body,
            leadInvestigator: req.body.leadInvestigator || req.user.id,
        };

        const newCase = await Case.create(caseData);

        res.status(201).json({ success: true, data: newCase });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update case
// @route   PUT /api/cases/:id
// @access  Private
exports.updateCase = async (req, res) => {
    try {
        const caseData = await Case.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!caseData) {
            return res.status(404).json({ success: false, message: 'Case not found' });
        }

        res.json({ success: true, data: caseData });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Add timeline event to case
// @route   POST /api/cases/:id/timeline
// @access  Private
exports.addTimelineEvent = async (req, res) => {
    try {
        const caseData = await Case.findById(req.params.id);

        if (!caseData) {
            return res.status(404).json({ success: false, message: 'Case not found' });
        }

        caseData.timeline.push({
            ...req.body,
            addedBy: req.user.id,
            date: req.body.date || new Date(),
        });

        await caseData.save();

        res.json({ success: true, data: caseData });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Add update to case
// @route   POST /api/cases/:id/updates
// @access  Private
exports.addCaseUpdate = async (req, res) => {
    try {
        const caseData = await Case.findById(req.params.id);

        if (!caseData) {
            return res.status(404).json({ success: false, message: 'Case not found' });
        }

        caseData.updates.push({
            user: req.user.id,
            content: req.body.content,
            timestamp: new Date(),
        });

        await caseData.save();

        res.json({ success: true, data: caseData });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
