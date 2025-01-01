// model/User.js

const mongoose = require('mongoose');
const { isEmail } = require('validator');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        lowercase: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        validate: [isEmail, 'Please enter a valid email']
    },
    password: {
        type: String,
        required: [true, "Please enter a password"],
        minlength: [3, "Minimum password length is 3 characters"]
    },
    passwordResetToken: String,
    passwordResetTokenExpires: Date
});

userSchema.post('save', function (doc, next) {
    console.log("New User was created and saved", doc);
    next();
});

userSchema.pre('save', async function (next) {
    const salt = await bcrypt.genSalt();
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

userSchema.statics.login = async function (email, password) {
    const user = await this.findOne({ email });
    if (user) {
        const auth = await bcrypt.compare(password, user.password);
        if (auth) {
            return user;
        }
        throw Error('Incorrect Password');
    }
    throw Error('Incorrect Email');
};

// Assuming you have these fields in your user schema
userSchema.methods.createResetPasswordToken = function() {
    const resetToken = crypto.randomBytes(32).toString('hex');
    this.passwordResetToken = resetToken;
    this.passwordResetTokenExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    return resetToken;
};


const User = mongoose.model('user', userSchema);
module.exports = User;
