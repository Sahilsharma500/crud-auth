const express = require('express');
const { signUp, signIn, verifyEmail, forgetPassword, logout, resetPassword, checkAuth } = require('../controllers/authController');
const verifyToken = require('../middleware/verifytoken');

const router = express.Router()

router.post('/sign-up', signUp);
router.post('/sign-in', signIn);
router.post('/verify-email', verifyEmail);
router.post('/forget-password', forgetPassword);
router.post('/logout', logout);
router.post('/reset-password/:token', resetPassword);

router.get('/check-auth', verifyToken, checkAuth )

module.exports = router;