const express = require('express');
const router = express.Router();
const {
    getCrimeEvents,
    getCrimeEvent,
    createCrimeEvent,
    updateCrimeEvent,
    deleteCrimeEvent,
    getCrimesNearLocation,
    getCrimeStats,
} = require('../controllers/crimeController');
const { protect, authorize } = require('../middleware/auth');
const auditLogger = require('../middleware/auditLogger');

router.use(protect);

router.get('/stats/overview', getCrimeStats);
router.get('/near/:lng/:lat/:distance', getCrimesNearLocation);

router.route('/')
    .get(getCrimeEvents)
    .post(auditLogger('CREATE', 'crime'), createCrimeEvent);

router.route('/:id')
    .get(getCrimeEvent)
    .put(auditLogger('UPDATE', 'crime'), updateCrimeEvent)
    .delete(authorize('admin'), auditLogger('DELETE', 'crime'), deleteCrimeEvent);

module.exports = router;
