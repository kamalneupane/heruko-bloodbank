const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const userScheam = new mongoose.Schema({
    name : {
        type: String,
        required: [true, 'Please enter your name'],
        maxlength:[25,'Name cannot be greater than 25 characters'],
        minlength:[3, 'Name cannot be less than 3 characters']
    },
    email : {
        type: String,
        required: [true, 'Please enter email address'],
        validate: [validator.isEmail,'Please enter valid email address']
    },
    password : {
        type: String,
        required: [true, 'Please enter password'],
        minlength: [6, 'Password cannot be less than 6 characters'],
        select: false
    },
    phone : {
        type: Number,
        required: [true, 'Please enter number']
    },
    address: {
        type: String,
        required: [true,'Please enter address']
    },
    avatar : {
        type: String
    },
    role : {
        type: String,
        default: 'user'
    },
    createdAt : {
        type: Date,
        default: Date.now
    },
    resetPasswordToken : String,
    resetPasswordExpire: Date
});


userScheam.pre('save', async function (next){
    if(!this.isModified('password')){
        next();
    }
    this.password = await bcrypt.hash(this.password, 10)
})
// comapre user password
userScheam.methods.comparePassword = async function (enteredPassword){
    return await bcrypt.compare(enteredPassword, this.password);
}
// return jwt token
userScheam.methods.getJwtToken = function ()  {
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_TIME
    });
}
// generate password reset token
userScheam.methods.getResetPasswordToken = function () {
    const resetToken = crypto.randomBytes(20).toString('hex');
    // Hash and set to reset password token
    this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex')

    // set token expire time
    this.resetPasswordExpire = Date.now() + 30 * 60 * 1000;
    
    return resetToken

}


module.exports = mongoose.model('User',userScheam)