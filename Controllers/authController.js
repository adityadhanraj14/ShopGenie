const User = require('../Models/User');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer'); // Import nodemailer
const crypto = require('crypto');

const handleErrors = (err) => {
    console.log(err.message, err.code);
    let errors = { name: '', email: '', password: '' };

    if (err.message === 'Incorrect Email') {
        errors.email = "That Email is not registered!";
    }

    if (err.message === 'Incorrect Password') {
        errors.password = "That Password is incorrect!";
    }

    if (err.code === 11000) {
        errors.email = 'That email is already registered';
    }

    if (err.message && err.message.includes('User validation failed')) {
        Object.values(err.errors).forEach(({ properties }) => {
            errors[properties.path] = properties.message;
        });
    }
    return errors;
};

const maxAge = 1 * 24 * 60 * 60;

const createToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'secret', { expiresIn: maxAge });
};

// Step 1: Configure the transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',  // For Gmail. Change if you use another provider
    auth: {
        user: '',     // Replace with your email
        pass: ''             // Replace with your email password or app-specific password
    }
});

// Function to send password reset email
const sendPasswordResetEmail = async (recipientEmail, resetUrl) => {
    // Step 4: Set up the email options
    const mailOptions = {
        from: 'adityadhanraj576@gmail.com',             // Sender email
        to: recipientEmail,         // Recipient email
        subject: 'Password Reset Request',
        text: `You requested a password reset. Click this link to reset your password: ${resetUrl}` // Customize the link
    };

    // Step 5: Send the email
    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent:', info.response);
    } catch (error) {
        console.log('Error:', error);
    }
};

// Sign Up User
module.exports.signup_get = (req, res) => {
    res.render('Auth/signup', { message: '', errors: {} });
};

module.exports.signup_post = async (req, res) => {
    const { name, email, password } = req.body;

    try {
        const user = await User.create({ name, email, password });
        const token = createToken(user._id);
        res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 });
        res.status(201).json({ user: user._id });
    } catch (err) {
        const errors = handleErrors(err);
        res.status(400).render('Auth/signup', { message: '', errors });
    }
};

// Login User
module.exports.login_get = (req, res) => {
    res.render('Auth/login', { message: '', errors: {} });
};

module.exports.login_post = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.login(email, password);
        const token = createToken(user._id);
        res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 });
        res.redirect('/indexPage');
    } catch (err) {
        const errors = handleErrors(err);
        res.status(400).render('Auth/login', { message: '', errors });
    }
};

// Logout User
module.exports.logout_get = (req, res) => {
    res.cookie('jwt', '', { maxAge: 1 });
    res.redirect('/indexPage');
};

// Forgot Password
module.exports.forgotPassword = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Email not found' });
        }

        // Create a reset token
        const resetToken = user.createResetPasswordToken(); // Ensure you have this method defined
        await user.save();

        // Construct reset URL
        const resetUrl = `${req.protocol}://${req.get('host')}/auth/resetPassword/${resetToken}`;
        
        // Send email
        await sendPasswordResetEmail(user.email, resetUrl); // Pass the user's email and reset URL

        res.status(200).json({ message: 'Password reset email sent' });
    } catch (err) {
        res.status(500).json({ message: 'Error processing request. Status:500. forgotPassword' });
    }
};

// Get the reset password form
exports.resetPassword_get = (req, res) => {
    const { token } = req.params;
    // Render the reset password page with the token
    res.render('resetPassword', { token });
};

// Reset Password

module.exports.resetPassword = async (req, res) => {
    const { token } = req.params;
    const { password, confirmPassword } = req.body;

    try {
        const user = await User.findOne({
            passwordResetToken: token,
            passwordResetTokenExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired token' });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({ message: 'Passwords do not match' });
        }

        user.password = password;  // Ensure password is hashed before saving
        user.passwordResetToken = undefined; 
        user.passwordResetTokenExpires = undefined; 
        await user.save();

        res.status(200).json({ message: 'Password has been reset successfully.' });
    } catch (err) {
        console.error('Error resetting password:', err);
        res.status(500).json({ message: 'Failed to reset password. Please try again.', error: err.message });
    }
};
