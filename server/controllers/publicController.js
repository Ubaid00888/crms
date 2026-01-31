const CrimeEvent = require('../models/CrimeEvent');

// @desc    Get latest crimes for public landing page
// @route   GET /api/public/crimes/latest
// @access  Public
exports.getLatestCrimes = async (req, res) => {
    try {
        const crimes = await CrimeEvent.find()
            .sort({ occurredAt: -1 })
            .limit(10)
            .select('title description crimeType severity location occurredAt');

        res.json({
            success: true,
            count: crimes.length,
            data: crimes
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get global crime stats for public landing page
// @route   GET /api/public/crimes/stats/global
// @access  Public
exports.getGlobalStats = async (req, res) => {
    try {
        const stats = await CrimeEvent.aggregate([
            {
                $group: {
                    _id: null,
                    totalCrimes: { $sum: 1 },
                    activeInvestigations: {
                        $sum: { $cond: [{ $eq: ["$status", "Under Investigation"] }, 1, 0] }
                    },
                    uniqueRegions: { $addToSet: "$location.country" }
                }
            },
            {
                $project: {
                    _id: 0,
                    totalCrimes: 1,
                    activeInvestigations: 1,
                    affectedRegions: { $size: "$uniqueRegions" }
                }
            }
        ]);

        res.json({
            success: true,
            data: stats[0] || { totalCrimes: 0, activeInvestigations: 0, affectedRegions: 0 }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get crime map data for public landing page
// @route   GET /api/public/crimes/map
// @access  Public
exports.getMapData = async (req, res) => {
    try {
        const crimes = await CrimeEvent.find()
            .select('title crimeType severity location.coordinates location.city');

        res.json({
            success: true,
            data: crimes
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get single crime details for public viewing
// @route   GET /api/public/crimes/:id
// @access  Public
exports.getCrimeDetails = async (req, res) => {
    try {
        const crime = await CrimeEvent.findById(req.params.id)
            .select('title description crimeType severity location occurredAt status');

        if (!crime) {
            return res.status(404).json({ success: false, message: 'Crime not found' });
        }

        res.json({
            success: true,
            data: crime
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
