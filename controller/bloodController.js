const Blood = require('../models/blood')
const ErrorHandler = require('../utils/errorHandler')
const catchAsyncErrors = require('../middlewares/catchAsyncErrors')

exports.showBloodForm = (req, res, next) => res.render('backend/admin/bloodstock')
// create new Blood Group
exports.newBlood = catchAsyncErrors( async (req, res, next) => {
    const { name, units } = req.body;
    if(!name || !units){
        return next(new ErrorHandler('All fields are required',400))
    }
    if(units < 0){
        return next(new ErrorHandler('Units cannot be less than zero', 400))
    }
    let blood = await Blood.findOne({ name});
    if(blood){
        return next(new ErrorHandler('Sorry dublicate entry cannot be accepted', 400))
    }
    blood = await Blood.create(req.body);
    req.flash('message','Blood Group created successfully')
    res.redirect('/admin/dashboard')
})
exports.editblood = catchAsyncErrors(async(req, res, next) => {
    const blood = await Blood.findById(req.params.id);
    if(!blood){
        return next(new ErrorHandler('Blood Not found', 404))
    }
    res.render('backend/admin/editblood',{ blood });
})

// get all blood group
exports.getAllBloods = catchAsyncErrors (async (req, res, next) => {
    const bloods = await Blood.find();
    if(!bloods){
        return next(new ErrorHandler('Blood not found', 404))
    }
    res.status(200).json({
        success: true,
        count: bloods.length,
        bloods
    })
})
// get single blood group
exports.getSingleBlood = catchAsyncErrors ( async(req, res, next) => {
    const blood = await Blood.findById(req.params.id);
    if(!blood){
       return next(new ErrorHandler('Blood not found', 404))
    }
    res.status(200).json({
        success: true,
        blood
    })
})
// update blood group
exports.updateBlood = catchAsyncErrors ( async( req, res, next) => {
    const { name, units } = req.body;
    if(!name || !units){
        return next(new ErrorHandler('All fields are required',400))
    }
    if(units < 0){
        return next(new ErrorHandler('Units cannot be less than zero', 400))
    }
    
    let blood = await Blood.findById(req.params.id);
    if(!blood){
        return next(new ErrorHandler('Blood not found', 404))
    }
    blood = await Blood.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
        useFindAndModify: false
    })
    req.flash('message','Blood Group Updated successfully')
    res.redirect('/admin/dashboard')
})
// delete blood
exports.deleteBlood = catchAsyncErrors ( async(req, res, next) => {
    const blood = await Blood.findById(req.params.id)
    if(!blood){
        return next(new ErrorHandler('Blood not found',404))
    }
    await blood.remove();
    req.flash('message','Blood group deleted successfully')
    res.redirect('/admin/dashboard')
})
