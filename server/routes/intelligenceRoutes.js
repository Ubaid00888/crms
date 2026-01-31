const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
    detectCrimePatterns,
    findSimilarCases,
    analyzeCriminalNetwork,
} = require('../services/intelligenceService');

router.use(protect);

// @desc    Detect crime patterns and hotspots
// @route   GET /api/intelligence/patterns
// @access  Private
router.get('/patterns', async (req, res) => {
    try {
        const patterns = await detectCrimePatterns();
        res.json({ success: true, data: patterns });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @desc    Find similar cases
// @route   GET /api/intelligence/similar/:caseId
// @access  Private
router.get('/similar/:caseId', async (req, res) => {
    try {
        const similarCases = await findSimilarCases(req.params.caseId);
        res.json({ success: true, data: similarCases });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @desc    Analyze criminal network
// @route   GET /api/intelligence/network/:criminalId
// @access  Private
router.get('/network/:criminalId', async (req, res) => {
    try {
        const network = await analyzeCriminalNetwork(req.params.criminalId);
        res.json({ success: true, data: network });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
