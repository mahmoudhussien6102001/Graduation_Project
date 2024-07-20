const express = require('express');
const router = express.Router();
const patientController = require('./../controllers/PatientController');
const authController=require('./../controllers/authController');
const imageUpload=require('../utils/imageUpload');
router.route('/:userId')
.post(authController.protect ,authController.restrictTo('doctor'),imageUpload.uploadPatientImages,patientController.createPatient)
.get(authController.protect,authController.restrictTo('admin','doctor'),patientController.getAllPatientsByUser)

router.route('/:userId/:id')
.get(authController.protect,authController.restrictTo('admin','doctor'),patientController.getPatientByIdForUser)
.delete(authController.protect,authController.restrictTo('admin'),patientController.deletePatientForUser)
.patch(authController.protect,authController.restrictTo('admin','doctor'),patientController.updatePatientForUser)

module.exports = router;
