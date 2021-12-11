const Request = require('../models/request')
const Blood = require('../models/blood')
const Donation = require('../models/donation')
const catchAsyncErrors = require('../middlewares/catchAsyncErrors')
const ErrorHandler = require('../utils/errorHandler')

exports.showRequestForm = catchAsyncErrors ( async (req,res) => {
    const bloods = await Blood.find();
    if(!bloods){
        return next(new ErrorHandler('No blood found', 404))
    }
    res.render('backend/donar/requestform',{ 
        user: req.user,
        bloods
    })
})

// create new request => request/new
exports.newRequest = catchAsyncErrors(async(req, res, next) => {
    const donation = req.params.id
    
    const requrest = await Request.create({
        donation,
        user: req.user._id
    })
    updateDonation(donation);
    req.flash('message','Blood request made successfully')
    res.redirect('/requests/me')
});

async function updateDonation(id){
    const donation = await Donation.findById(id);
    donation.requested = true
    await donation.save({
        validateBeforeSave: false
    });
}
// get single request => request/:id
exports.getSingleRequest = catchAsyncErrors( async (req, res, next) => {
    const request = await Request.findById(req.params.id).populate('user','name email')

    if(!request){
        return next( new ErrorHandler('No request made with this ID', 404))
    }
    res.status(200).json({
        success: true,
        request
    })
})
// get logged in user request => requests/me
exports.myRequest = catchAsyncErrors( async (req, res, next) => {
    const requests = await Request.find({ user: req.user.id })
        .populate({ 
        path: 'donation',
        model: 'Donation',
        populate:{ path: 'userId', model: 'User', select: 'name avatar phone'}
    })
    
    
    res.render('backend/donar/requesthistory', {
        user: req.user,
        requests, 
        message: req.flash('message')
    })
})
// get all request => admin/requests
exports.allRequest = catchAsyncErrors( async (req, res, next) => {
    // const requests = await Request.find({ status: 'Processing'}).populate('user','name id').populate('donation','user')
    const requests = await Request.find({ status: 'Processing'})
                        .populate({ 
                            path: 'donation',
                            model: 'Donation',
                            populate:{ path: 'userId', model: 'User', select: 'name phone avatar'}
                        }).populate({path: 'user', select:'name avatar'})
    res.render('backend/admin/requestlist', {
        requests
    })
})
// request history => admin/requests/history
exports.requestHistory = catchAsyncErrors(async (req, res, next) => {
    const requests = await Request.find({ status: ['approved','rejected']}).populate({ 
                                            path: 'donation',
                                            model: 'Donation',
                                            populate:{ path: 'userId', model: 'User', select: 'name phone avatar'}
                                        }).populate({path: 'user', select:'name avatar'})
    res.render('backend/admin/requesthistory',{
        requests
    })
})

// update/process request => admin/order/:id
exports.updateRequest = catchAsyncErrors( async( req, res, next) => {
    const request = await Request.findById(req.params.id);
    if(!request){
        return next(new ErrorHandler('Request not found with that id',404))
    }
    if(request.status === 'approved'){
        return next(new ErrorHandler('You have already respond this request',400))
    }
    if(req.body.status === 'rejected'){
        request.status = req.body.status;
        await request.save();
        return res.redirect('/admin/requests/history')
    }
    // const  id = request.requestGroup.blood
    // const unit = request.requestGroup.units

    // updateBlood(id, unit)

    // request.requestGroup.forEach(async item => {
    //     await updateBlood(item.blood, item.units);
    // })

    request.status = req.body.status

    await request.save();

    res.redirect('/admin/requests/history')
})

// async function updateBlood(id, units){
//     const blood = await Blood.findById(id);
//     blood.units = blood.units - units

//     await blood.save({
//         validateBeforeSave: false
//     });
// }

// Delete Request => admin/request/:id
exports.deleteRequest = catchAsyncErrors(async (req, res, next) => {
    const request = await Request.findById(req.params.id);
    if(!request){
        return next( new ErrorHandler('Request Not found', 404))
    }
    await request.remove();

    res.redirect('/admin/requests')
})