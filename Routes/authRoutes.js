const { Router } = require('express');
const authController = require('../Controllers/authController');

const router = Router();

// Sign up routes
router.get('/signup', authController.signup_get);
router.post('/signup', authController.signup_post);

// Login and logout routes
router.get('/login', authController.login_get);
router.post('/login', authController.login_post);
router.get('/logout', authController.logout_get);

// Password reset routes
router.post('/forgotPassword', authController.forgotPassword); // POST request to initiate password reset
router.get('/resetPassword/:token', authController.resetPassword_get); // GET request to show reset password form
router.patch('/resetPassword/:token', authController.resetPassword); // PATCH request to update the password

module.exports = router;
