const Patient = require('./../models/patientModel');
const catchAsync = require('./../utils/catchAsync');

exports.createPatient = catchAsync(async (req, res) => {
    const { userId } = req.params;
    req.body.user = userId;
    if (req.files) {
        if (req.files.segemented_image) {
            req.body.segemented_image = req.files.segemented_image.map(file => file.filename);
        }
        if (req.files.Rays) {
            req.body.Rays = req.files.Rays.map(file => file.filename);
        }
        if(req.files.Medical_tests){
            req.body.Medical_tests = req.files.Medical_tests.map(file => file.filename);
        }
    }
    const newPatient = await Patient.create(req.body);
    res.status(201).json({
        status: 'success',
        data: {
            patient: newPatient
        }
    });
});
// Get all patients for a specific user
exports.getAllPatientsByUser = catchAsync(async (req, res) => {
    const { userId } = req.params;
    const patients = await Patient.find({ user: userId }).populate('user');
    res.status(200).json({
        status: 'success',
        data: {
            patients: patients
        }
    });
});

// Get a single patient by ID for a specific user
exports.getPatientByIdForUser = catchAsync(async (req, res) => {
    const { userId, id } = req.params;
    const patient = await Patient.findOne({ _id: id, user: userId }).populate('user');
    if (!patient) {
        return res.status(404).json({
            status: 'fail',
            message: 'Patient not found'
        });
    }
    res.status(200).json({
        status: 'success',
        data: {
            patient: patient
        }
    });
});

// Update a patient by ID for a specific user
exports.updatePatientForUser = catchAsync(async (req, res) => {
    const { userId, id } = req.params;
    const updatedPatient = await Patient.findOneAndUpdate({ _id: id, user: userId }, req.body, {
        new: true,
        runValidators: true
    });
    if (!updatedPatient) {
        return res.status(404).json({
            status: 'fail',
            message: 'Patient not found'
        });
    }
    res.status(200).json({
        status: 'success',
        data: {
            patient: updatedPatient
        }
    });
});

// Delete a patient by ID for a specific user
exports.deletePatientForUser = catchAsync(async (req, res) => {
    const { userId, id } = req.params;
    await Patient.findOneAndDelete({ _id: id, user: userId });
    res.status(200).json({
        status: 'success',
        message: 'Patient deleted successfully'
    });
});
