const express = require('express');
const router = express.Router();
const {
    getCases,
    getCase,
    createCase,
    updateCase,
    addTimelineEvent,
    addCaseUpdate,
} = require('../controllers/caseController');
const { protect, authorize } = require('../middleware/auth');
const auditLogger = require('../middleware/auditLogger');

router.use(protect);

router.route('/')
    .get(getCases)
    .post(authorize('admin', 'analyst'), auditLogger('CREATE', 'case'), createCase);

router.route('/:id')
    .get(getCase)
    .put(auditLogger('UPDATE', 'case'), updateCase);

router.post('/:id/timeline', addTimelineEvent);
router.post('/:id/updates', addCaseUpdate);

module.exports = router;
