const express = require('express');
const router = express.Router();
const {
    getCriminals,
    getCriminal,
    createCriminal,
    updateCriminal,
    deleteCriminal,
    calculateRiskScore,
} = require('../controllers/criminalController');
const { protect, authorize } = require('../middleware/auth');
const auditLogger = require('../middleware/auditLogger');

// All routes require authentication
router.use(protect);

router.route('/')
    .get(getCriminals)
    .post(authorize('admin', 'analyst'), auditLogger('CREATE', 'criminal'), createCriminal);

router.route('/:id')
    .get(getCriminal)
    .put(authorize('admin', 'analyst'), auditLogger('UPDATE', 'criminal'), updateCriminal)
    .delete(authorize('admin'), auditLogger('DELETE', 'criminal'), deleteCriminal);

router.post('/:id/calculate-risk', calculateRiskScore);

module.exports = router;
