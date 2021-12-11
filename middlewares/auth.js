const ErrorHandler = require('../utils/errorHandler');
const jwt = require('jsonwebtoken')
const catchAsyncErrors = require('./catchAsyncErrors')
const User = require('../models/user')
// checks if user is authenticated or not
exports.isAuthenticatedUser = catchAsyncErrors(async(req, res, next) => {
    const { token } = req.cookies;
    if(!token){
        return next(new ErrorHandler('Please login first', 401))
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = await User.findById(decoded.id);
    next();
})
// handling user roles
exports.authorizeRoles = (...roles) => {
   return  (req, res, next) => {
        if(!roles.includes(req.user.role)){
            return next(
                new ErrorHandler(`Role ${req.user.role} is not allwoed to use this resource`, 403))
        }
        next();
   }
}
