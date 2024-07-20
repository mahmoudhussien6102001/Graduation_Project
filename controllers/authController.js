const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/AppError');
const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const sendEmail = require('./../utils/email');
const crypto = require('crypto'); // Added to handle password reset token

const JWT_SECRET = 'my_ultra_secure_and_awad_long_secret';
const JWT_EXPIRES_IN = '50d';
const JWT_COOKIE_EXPIRES_IN = 90; // days

// JWT token signing
const signToken = id => {
    return jwt.sign({ id }, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN
    });
};

// Send token and set up cookie
const createSendToken = (user, statusCode, res) => {
    const token = signToken(user._id);

    const cookieOptions = {
        expires: new Date(Date.now() + JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production'
    };

    res.cookie('jwt', token, cookieOptions);
    user.password = undefined;

    res.status(statusCode).json({
        status: 'success',
        token,
        data: {
            user
        }
    });
};

// Middleware to protect routes and set req.user
exports.protect = catchAsync(async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return next(new AppError('You are not logged in! Please log in to get access.', 401));
    }

    const decoded = await promisify(jwt.verify)(token, JWT_SECRET);
    const currentUser = await User.findById(decoded.id);

    if (!currentUser) {
        return next(new AppError('The user belonging to this token no longer exists.', 401));
    }

    if (currentUser.changePasswordAfter(decoded.iat)) {
        return next(new AppError('User recently changed password! Please log in again.', 401));
    }

    req.user = currentUser;
    next();
});

// Middleware to restrict access to specific roles
exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                status: 'fail',
                message: 'You are not authorized to access this resource'
            });
        }
        next();
    };
};

// User signup handler
exports.signUp = catchAsync(async (req, res, next) => {
    let image='';
    if(req.file){
        image = req.file.filename;
    }
    const newUser = await User.create({ ...req.body, image: image });
    createSendToken(newUser, 200, res);
});

// User login handler
exports.login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.correctPassword(password, user.password))) {
        return res.status(400).json({ message: 'Incorrect email or password' });
    }

    createSendToken(user, 200, res);
});

// Forgot password handler
exports.forgetPassword = catchAsync(async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
        return res.status(404).json({
            status: 'fail',
            message: 'User not found'
        });
    }

    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;
    const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetUrl}.\nIf you didn't forget your password, please ignore this email!`;

    try {
        await sendEmail({
            email: user.email,
            subject: 'Your Password Reset Token (Valid for 10 Minutes)',
            message
        });

        res.status(200).json({
            status: 'success',
            message: 'Reset token sent to email'
        });
    } catch (err) {
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({ validateBeforeSave: false });

        console.error('Error sending email:', err);

        res.status(500).json({
            status: 'fail',
            message: 'Failed to send email. Please try again later.'
        });
    }
});

// Reset password handler
exports.resetPassword = catchAsync(async (req, res, next) => {
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() }
    });

    if (!user) {
        return res.status(400).json({
            status: 'fail',
            message: 'Password reset token is invalid or has expired'
        });
    }

    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    createSendToken(user, 200, res);
});

// Update password handler
exports.updatePassword = catchAsync(async (req, res, next) => {
    const user = await User.findById(req.user.id).select('+password');

    if (!(await user.correctPassword(req.body.passwordConfirm, user.password))) {
        return next(new AppError('Your current password is incorrect.', 401));
    }

    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    await user.save();

    createSendToken(user, 200, res);
});
