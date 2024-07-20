const express = require('express');
const router = express.Router();
const doctorController = require('./../controllers/doctorController');
const authController =require('../controllers/authController');
router.route('/:userId')
    .get(doctorController.getAllDoctorsByUser)
    .post(doctorController.createDoctorForUser);

router.route('/:userId/:doctorId')
    .patch(doctorController.updateDoctorForUser)
    .delete(authController.protect,authController.restrictTo('admin'),doctorController.deleteDoctorForUser)
    .get(authController.protect ,authController.restrictTo('admin'),doctorController.getDoctorByUser);

module.exports = router;
