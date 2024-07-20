const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto'); // Keep this import for creating password reset tokens

const userSchema = new mongoose.Schema({
    first_name: {
        type: String,
        required: [true, 'Please provide your first name'],
        maxlength: [40, 'First name must be at most 40 characters'],
        minlength: [3, 'First name must be at least 3 characters']
    },
    last_name: {
        type: String,
        required: [true, 'Please provide your last name'],
        maxlength: [40, 'Last name must be at most 40 characters'],
        minlength: [3, 'Last name must be at least 3 characters']
    },
    address: {
        type: String,
        required: [true, 'Please provide your address']
    },
    email: {
        type: String,
        required: [true, 'Please provide your email'],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'Please provide a valid email']
    },
    phone_number: String,
    gender: {
        type: String,
        enum: ['male', 'female', 'm', 'f', 'F', 'M'],
        message: 'Gender must be one of [male, female]'
    },
    ssn: {
        type: Number,
        required: [true, 'Please enter your national ID number'],
        minlength: [14, 'National ID number must have at least 14 digits'],
        maxlength: [14, 'National ID number must have at most 14 digits']
    },
    date_of_birth: {
        type: Date,
        default: Date.now
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minlength: [8, 'Password must be at least 8 characters'],
        maxlength: [20, 'Password must be at most 20 characters'],
        select: false // Exclude from query results by default
    },
    passwordConfirm: {
        type: String,
        required: [true, 'Please confirm your password'],
        validate: {
            validator: function (value) {
                return value === this.password;
            },
            message: 'Passwords do not match'
        }
    },
    image: {
        type: String,
        default: 'default.png'
    },
    role: {
        type: String,
        enum: ['admin', 'patient', 'doctor'],
        default: 'patient'
    },
    active: {
        type: Boolean,
        default: true,
        select: false // Exclude from query results by default
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date
});

// Virtual property for full name
userSchema.virtual('fullname').get(function () {
    return `${this.first_name} ${this.last_name}`;
});

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

    this.password = await bcrypt.hash(this.password, 12);
    this.passwordConfirm = undefined;
    next();
});

// Compare entered password with stored hashed password
userSchema.methods.correctPassword = async function (candidatePassword, userPassword) {
    return await bcrypt.compare(candidatePassword, userPassword);
};

// Create a password reset token
userSchema.methods.createPasswordResetToken = function () {
    const resetToken = crypto.randomBytes(32).toString('hex');
    this.passwordResetToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');
    this.passwordResetExpires = Date.now() + 3600000; // expires in 1 hour
    return resetToken;
};

// Check if password was changed after the token was issued
userSchema.methods.changePasswordAfter = function (tokenIssuedAt) {
    if (this.passwordChangedAt) {
        const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
        return tokenIssuedAt < changedTimestamp;
    }
    return false; // False if password was never changed
};

// Middleware to hide inactive users from query results
userSchema.pre(/^find/, function (next) {
    this.where({ active: { $ne: false } });
    next();
});

// Create User model
const User = mongoose.model('User', userSchema);

module.exports = User;
