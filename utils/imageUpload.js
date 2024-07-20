const multer =require('multer');
const userStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/users');
    },
    filename: (req, file, cb) => {
        const ext = file.mimetype.split('/')[1];
        cb(null, `user-${Date.now()}.${ext}`);
    }
});

// Multer storage configuration for patient images
const patientStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/patients');
    },
    filename: (req, file, cb) => {
        const ext = file.mimetype.split('/')[1];
        cb(null, `patient-${Date.now()}.${ext}`);
    }
});

const multerFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image')) {
        cb(null, true);
    } else {
        cb(new AppError('Not an image! Please upload only images.', 400), false);
    }
};

// Create multer instances
const uploadUserImage = multer({
    storage: userStorage,
    fileFilter: multerFilter
});

const uploadPatientImages = multer({
    storage: patientStorage,
    fileFilter: multerFilter
}).fields([
    { name: 'segemented_image', maxCount: 100 },
    { name: 'Rays', maxCount: 1000 },
    { name: 'Medical_tests', maxCount: 1000 }
]);

// Export middleware functions
exports.uploadUserImage = uploadUserImage.single('image');
exports.uploadPatientImages = uploadPatientImages;