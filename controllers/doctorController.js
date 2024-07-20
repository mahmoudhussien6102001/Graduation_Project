const Doctor = require('./../models/doctorModel');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');

// Get all doctors for a specific user
exports.getAllDoctorsByUser = catchAsync(async (req, res) => {
    const { userId } = req.params;
    
    const doctors = await Doctor.find({ user: userId }).populate('user');
    res.status(200).json({
        status: 'success',
        doctors
    });
});

// Get a doctor by ID for a specific user
exports.getDoctorByUser = catchAsync(async (req, res) => {
    const { userId, doctorId } = req.params;
    
    const user = await User.findById(userId);
    if (!user) {
        return res.status(404).json({
            status: 'failed',
            message: 'User not found'
        });
    }

    const doctor = await Doctor.findOne({ _id: doctorId, user: userId }).populate('user');
    if (!doctor) {
        return res.status(404).json({
            status: 'failed',
            message: 'Doctor not found for this user'
        });
    }

    res.status(200).json({
        status: 'success',
        doctor
    });
});

// Create a new doctor for a specific user
exports.createDoctorForUser = catchAsync(async (req, res) => {
    const { userId } = req.params;
    req.body.user = userId;
    const newDoctor = await Doctor.create(req.body);
    res.status(201).json({
        status: 'success',
        data: {
           doctors : newDoctor
        }
    });
});
       

// Update a doctor by ID for a specific user
exports.updateDoctorForUser = catchAsync(async (req, res) => {
    const { userId, doctorId } = req.params;

    const updatedDoctor = await Doctor.findOneAndUpdate(
        { _id: doctorId, user: userId },
        req.body,
        {
            new: true,
            runValidators: true
        }
    );

    if (!updatedDoctor) {
        return res.status(404).json({
            status: 'failed',
            message: 'Doctor not found for this user'
        });
    }

    res.status(200).json({
        status: 'success',
        doctor: updatedDoctor
    });
});

// Delete a doctor by ID for a specific user
exports.deleteDoctorForUser = catchAsync(async (req, res) => {
    const { userId, doctorId } = req.params;

    const deletedDoctor = await Doctor.findOneAndDelete({ _id: doctorId, user: userId });

    if (!deletedDoctor) {
        return res.status(404).json({
            status: 'failed',
            message: 'Doctor not found for this user'
        });
    }

    res.status(200).json({
        status: 'success',
        message: 'Doctor deleted successfully'
    });
});
