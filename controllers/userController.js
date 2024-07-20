const AppError = require('../utils/AppError');
const User = require('./../models/userModel');
const catchAsync =  require('./../utils/catchAsync');
const filterObj = (obj, ...allowedFields) => {
    const newObj = {};
    Object.keys(obj).forEach(el => {
        if (allowedFields.includes(el)) newObj[el] = obj[el];
    });
    return newObj;
};


exports.allUsers= async (req,res)=>{
    const Users = await User.find();
    if (!Users) {
        return res.status(404).json({
            status: 'fail',
            message: 'no user found'
        });
    }
    res.json({
        status: 'success',
        results: Users.lenguth,
        data: {
            Users : Users
        }
    });
}

exports.getUsers= (req,res)=>{
res.status(404).json({
    status:'failed',
    message :"not Found users !"
})

}
exports.createUsers=(req,res)=>{
res.status(404).json({
    status:'failed',
    message :"error router  api/v1/users/signUp"
})
}
exports.updateMe = catchAsync(async (req, res, next) => {
    // 1) Create error if user POSTs password data
    if (req.body.password || req.body.passwordConfirm) {
        return next(new AppError('This route is not for password updates. Please use /updateMyPassword.', 400));
    }

    // 2) Filter out unwanted fields names that are not allowed to be updated
    const filteredBody = filterObj(req.body, 'first_name', 'last_name', 'address', 'email', 'phone_number', 'gender', 'ssn', 'date_of_birth', 'image');

    // 3) Update user document
    const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
        new: true,
        runValidators: true
    });

    if (!updatedUser) {
        return next(new AppError('No user found with that ID.', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            user: updatedUser
        }
    });
});
exports.deleteMe= catchAsync (async(req,res ,next)=>{
    await User.findByIdAndDelete(req.body.id ,{active :false })
    res.status(200).json({
        status: 'success',
        data :null
    });


});

exports.updateUsers= (req,res)=>{
res.status(404).json({
    status:'failed',
    message :"not Found users !"
})
}
exports.deleteUsers= (req,res)=>{
res.status(404).json({
    status:'failed',
    message :"not Found users !"
})

}