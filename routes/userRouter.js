const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');
const imageUpload=require('../utils/imageUpload')
router.post('/signup', imageUpload.uploadUserImage,authController.signUp);
router.post('/login', authController.login);
router.post('/forgetPassword', authController.forgetPassword);
router.patch('/resetPassword/:token', authController.resetPassword); 
router.patch('/updateMe',authController.protect,userController.updateMe);
router.delete('/deleteMe',authController.protect,userController.deleteMe);
 

router.route('/')
    .get(authController.protect ,authController.restrictTo('admin'),userController.allUsers)
    .post(userController.createUsers);

router.route('/:id')
    .get(authController.protect ,authController.restrictTo('admin'),userController.getUsers)
    .patch(userController.updateUsers)
    .delete(authController.protect ,authController.restrictTo('admin'),userController.deleteUsers);

module.exports = router;
