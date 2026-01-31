const express = require('express');
const router = express.Router();
const { register, login, getMe, refreshToken, qrLogin } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.post('/qr-login', qrLogin);
router.get('/me', protect, getMe);
router.post('/refresh', refreshToken);

module.exports = router;
