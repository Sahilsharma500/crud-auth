const express = require('express');
const { signUp, signIn, verifyEmail, forgetPassword } = require('../controllers/authController');

const router = express.Router()

router.post('/sign-up', signUp);
router.post('/sign-in', signIn);
router.post('/verify-email', verifyEmail);
router.post('/forget-password', forgetPassword);

module.exports = router;