const express = require('express');
const router = express.Router();
const { getUsers, createUser, updateUser, deleteUser, regenerateQR, revokeQR } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

// All routes here are admin only
router.use(protect);
router.use(authorize('admin'));

router.route('/users')
    .get(getUsers)
    .post(createUser);

router.route('/users/:id')
    .patch(updateUser)
    .delete(deleteUser);

router.post('/users/:id/regenerate-qr', regenerateQR);
router.post('/users/:id/revoke-qr', revokeQR);

module.exports = router;
