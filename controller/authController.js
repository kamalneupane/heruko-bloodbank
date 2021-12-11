const User = require('../models/user')
const ErrorHandler = require('../utils/errorHandler')
const catchAsyncErrors = require('../middlewares/catchAsyncErrors');
const sendToken = require('../utils/jwtToken');
const sendEmail = require('../utils/sendEmail')
const crypto = require('crypto')
const Donation = require('../models/donation')
const Request = require('../models/request')
const Blood = require('../models/blood') 


exports.showLoginPage = (req, res) => res.render('frontend/login', { message: req.flash('message')})
exports.showRegisterPage = (req, res) => res.render('frontend/register')
exports.showAdminDashboard = async (req, res, next) => {
    
    const donation = await Donation.find().count();
    const total_donar = await User.find({ role:'user'}).count();
    const request = await Request.find().count();
    
    const bloods = await Blood.find();

    

    if(bloods.length > 0){
        var total = bloods.map(item => item.units).reduce((acc, cur) => acc + cur )
    }
    else{
        total = 0
    }
    res.render('backend/admin/index',{
        bloods,
        total,
        donation,
        request,
        total_donar,
        user: req.user,
        message: req.flash('message')
    })
}
exports.showDonarDashboard = async (req, res) => {
    const bloods = await Blood.find();
    res.render('backend/donar/index', { 
        bloods,
        user: req.user,
        message: req.flash('message')
    })
}
exports.registerUser = catchAsyncErrors(async(req, res, next) => {
    const { name, email, password, phone, address } = req.body;
    
    let user = await User.findOne({ email });
    if(user){
        return next(new ErrorHandler('User already registered with that email', 404))
    }
    
    user = await User.create({
        name,
        email,
        password,
        phone,
        address
    })

    sendToken(user, 200, res)
    req.flash('message','Register successfully, Please login')
    res.redirect('/login')
})
// login user
exports.loginUser = catchAsyncErrors( async (req, res, next) => {
    const { email, password } = req.body;
    if(!email || !password){
        return next(new ErrorHandler('Please fill all fields', 400))
    }
    // finding user in database
    const user = await User.findOne({ email: email}).select('+password')
    if(!user){
        return next(new ErrorHandler('Invalid email',401))
    }
    // check if password is correct or not
    const isPasswordMatch = await user.comparePassword(password);
    if(!isPasswordMatch){
        return next(new ErrorHandler('Invalid Password'))
    }
    sendToken(user, 200, res);

    if(user.role === 'admin'){
        req.flash('message','Logged successfully')
        return res.redirect('/admin/dashboard')
    }
    req.flash('message','Logged successfully')
    res.redirect('donar/dashboard')
})

exports.forgotPasswordForm = (req, res, next) => res.render('frontend/forgotpassword')

// forgot password

exports.forgotPassword = catchAsyncErrors(async(req, res, next) => {
    const user = await User.findOne({ email: req.body.email })

    if(!user){
        return next(new ErrorHandler('Email not found', 404))
    }
    // get reset token
    const resetToken = user.getResetPasswordToken();

    await user.save({ validateBeforeSave: false})

    // create reset password url
    const resetUrl = `${req.protocol}://${req.get('host')}/password/reset/${resetToken}`
    const message = `Your password reset token is as follows:\n\n ${resetUrl} \n\n`

    try {
        await sendEmail({
            email: user.email,
            subject: 'Blood Bank Password Recovery',
            message
        }) 
        res.status(200).json({
            success: true,
            message: `Email send to ${user.email}`
        })
    } catch (error) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        await user.save({ validateBeforeSave: false });

        return next(new ErrorHandler(error.message,500))
    }



})
exports.resetPasswordForm = (req, res, next) => {
    const url_token = req.url;
    res.render('frontend/passwordreset', {
        link : url_token
    })
}
// reset password => password/reset/:token
exports.resetPassword = catchAsyncErrors(async( req, res, next) => {
    // hash url token
    const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex')
    const user = await User.findOne( {
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() }
    })
    if(!user){
        return next(new ErrorHandler('Password reset token is invalid or has been expires', 400))
    }
    if(req.body.password !== req.body.confirmPassword){
        return next(new ErrorHandler('Password doesnot match',400))
    }
    
    // setup new Password
    user.password = req.body.password;

    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    
    await user.save();
    
    sendToken(user, 200, res);
    res.redirect('/login')
})
// get currently logged in user details => /donar/me
exports.getUserProfile = catchAsyncErrors( async(req, res, next) => {
    const user = await User.findById(req.user.id);
    res.render('backend/donar/profile', {
        user,
        message: req.flash('message')
    })
}) 
// get currently logged in admin details => /admin/me
exports.getAdminProfile = catchAsyncErrors( async (req, res, next) => {
    const user = await User.findById(req.user.id);
    res.render('backend/admin/profile',{
        user,
        message: req.flash('message')
    })
});
// show change password form
exports.showChangePasswordForm = (req, res, next) => {
    res.render('backend/donar/changepassword',{
        user: req.user
    })
}
// show change password form Admin
exports.showChangePasswordFormAdmin = (req, res, next) => {
    res.render('backend/admin/changepassword')
}
// update/change password => /password/update
exports.updatePassword = catchAsyncErrors( async(req, res, next) => {
    const user = await User.findById(req.user.id).select('+password');
    // check previous user password
    const isMatched = await user.comparePassword(req.body.oldPassword);
    if(!isMatched){
        return next(new ErrorHandler('Old password doesnot match',400))
    }
    user.password = req.body.password;
    await user.save();

    // sendToken(user, 200, res);
    req.flash('message','Password changed successfully and')
    res.redirect('/logout');

})
// show update profile form
exports.showUpdateProfileForm = async (req, res, next) => {
    const user = await User.findById(req.user.id);
    res.render('backend/donar/updateprofile',{
        user
    });
}
// show update profile form admin
exports.showUpdateProfileFormAdmin = async(req, res, next) => {
    const user = await User.findById(req.user.id);
    res.render('backend/admin/updateprofile',{
        user
    });
}
// update user profile => /me/update
exports.updateProfile = catchAsyncErrors( async(req, res, next) => {
    
    if(req.file){
        var newUserData = {
            name: req.body.name,
            email: req.body.email,
            avatar: req.file.filename,
            phone: req.body.phone,
            address: req.body.address
         }
    }
    else{
        var newUserData = {
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
            address: req.body.address
         }
    }
    const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
        new: true,
        runValidators: true,
        useFindAndModify: false
    })
    req.flash('message','Profile updated successfully')
    res.redirect('/donar/me')
})
// update admin profile => admin/me/update
exports.updateProfileAdmin = catchAsyncErrors(async (req, res, next) => {
    if(req.file){
        var newUserData = {
            name: req.body.name,
            email: req.body.email,
            avatar: req.file.filename,
            phone: req.body.phone,
            address: req.body.phone
         }
    }
    else{
        var newUserData = {
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
            address: req.body.address
         }
    }
 
     const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
         new: true,
         runValidators: true,
         useFindAndModify: false
     })
     req.flash('message','Profile updated successfully')
     res.redirect('/admin/me');
})

// logout user => /logout
exports.logoutUser = catchAsyncErrors( async (req, res, next) => {
    res.cookie('token',null,{
        expires: new Date(Date.now()),
        httpOnly: true
    })
    req.flash('message','Logged out successfully')
    res.redirect('/');
})

// Admin routes

// Get all users
exports.getAllUsers = catchAsyncErrors( async (req, res, next) => {
    const users = await User.find({ role: "user"});

    res.render('backend/admin/donarlist',{ 
        users,
        message: req.flash('message')
     })
})

// get User details => admin/user/:id
exports.getUserDetails = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findById(req.params.id);

    if(!user) {
        return next(new ErrorHandler(`User not found with ${req.params.id}`, 400))
    }
    res.status(200).json({
        success: true,
        user
    })

})
exports.editUser = catchAsyncErrors(async(req, res, next) => {
    const user = await User.findById(req.params.id);
    if(!user){
        return next(new ErrorHandler('User not found',400))
    }
    res.render('backend/admin/updateuser',{ user })
})
// update user profile => admin/user/:id
exports.updateUser = catchAsyncErrors( async(req, res, next) => {
    const newUserData = {
       name: req.body.name,
       email: req.body.email,
       role: req.body.role,
       phone: req.body.phone,
       address: req.body.address
    }

    const user = await User.findByIdAndUpdate(req.params.id, newUserData, {
        new: true,
        runValidators: true,
        useFindAndModify: false
    })
    req.flash('message','User updated successfully')
    res.redirect('/admin/users')
})
// delete user => admin/user/:id
exports.deleteUser = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findById(req.params.id);

    if(!user) {
        return next(new ErrorHandler(`User not found with ${req.params.id}`, 400))
    }

    deleteUserDonation(req.params.id)
    // deleteUserRequest(req.params.id)


    await user.remove();

    
    req.flash('message','User Deleted successfully')
    res.redirect('/admin/users')

})

async function deleteUserDonation(id){
    const donations = await Donation.find({ user: id })
    console.log(donations)
}

// async function deleteUserRequest(id){
//     const requests = await Request.find({ user: id})
//     if(requests.length < 1 || requests === undefined) return 
//     console.log('working fine')
//     // await requests.remove()
// }