const Donation = require('../models/donation')
const Blood = require('../models/blood')
const catchAsyncErrors = require('../middlewares/catchAsyncErrors')
const APIFeatures = require('../utils/apiFeatures')
const ErrorHandler = require('../utils/errorHandler')
const donation = require('../models/donation')
const sort = { createdAt: -1}

exports.showDonationForm = catchAsyncErrors ( async (req,res) => {
    const bloods = await Blood.find();
    if(!bloods){
        return next(new ErrorHandler('No blood found', 404))
    }
    res.render('backend/donar/donateform',{
        user: req.user,
        bloods
    })
})
// New Donation Request => donation/new
exports.newDonation = catchAsyncErrors(async (req, res, next) => {
    address = req.user.address;
    const id = req.body.blood;
    const bloodname = await Blood.findById(id);
    if(!req.body.units){
        return next(new ErrorHandler('Please enter all fields', 400))
    }
    const donateGroup = 
        {
            name: bloodname.name,
            blood: id,
            units: req.body.units
        };
    
    
    const {
        disease,

    } = req.body;
    if(!disease){
        return next(new ErrorHandler('All fields are required', 400))
    }
    const donation = await Donation.create({
        donateGroup,
        disease,
        address: req.user.address,
        userId: req.user._id
    })
    req.flash('message','Donation request made successfully')
    res.redirect('/donations/me')
});
// get single donation => donation/:id
exports.getSingleDonation = catchAsyncErrors(async(req, res, next) => {
    const donation = await Donation.findById(req.params.id).populate('user','name email');

    if(!donation){
        return next(new ErrorHandler('Donation blood not found with this id',404))
    }
    res.status(200).json({
        success: true,
        donation
    })
});
// get loggedIn user donations => donations/me
exports.myDonations = catchAsyncErrors(async(req, res, next) => {
    const donations = await Donation.find({ userId: req.user.id }).sort(sort);

    res.render('backend/donar/donationhistory', {
        user: req.user,
        donations,
        message: req.flash('message')
    })
})
// get all donations => admin/donations
exports.allDonations = catchAsyncErrors( async(req, res, next) => {
    const donations = await Donation.find({ status:'Processing' }).populate('userId', 'name email phone address').sort(sort);
    res.render('backend/admin/donationlist',{
        donations
    })
})



// Search query
// get approved donations => donar/donations?keyword:address&blood:bloodGroup
exports.allDonationsDonar = catchAsyncErrors(async (req, res, next) => {
    const { address, blood } = req.query
    
    
    const donations =  await Donation.find({
        userId: { $ne: req.user.id },
        status: 'approved', 
        requested: false ,
        "donateGroup.name": blood,
        address: {
            $regex: address,
            $options: 'i'
        }
    }).populate({
        path:'userId',
        select: 'name address avatar' 
    })
    
    // return res.json({
    //     donations
    // })
    


    res.render('backend/donar/search', {
        donations,
        user: req.user
    })
    
})



// donation history => admin/donations/history
exports.donationHistory = catchAsyncErrors(async (req, res, next) => {
    
    const donations = await Donation.find({ status : ['rejected' , 'approved'] }).populate('userId','name email avatar phone address').sort(sort);
    res.render('backend/admin/donationhistory',{
        donations
    })
})
// update donation => admin/donation/:id
exports.updateDonation = catchAsyncErrors(async(req, res, next) => {
    const donation = await Donation.findById(req.params.id);
    if(!donation){
        return next(new ErrorHandler('Donation not found with this id', 404))
    }
    if(donation.status === 'approved'){
        return next(new ErrorHandler('You have already respond this donation request'))
    }

    if(req.body.status === 'rejected'){
        donation.status = req.body.status;
        await donation.save();
        return res.redirect('/admin/donations/history')
    }
    const  id = donation.donateGroup.blood
    const unit = donation.donateGroup.units

    updateBlood(id, unit);

    donation.status = req.body.status
    await donation.save();

    res.redirect('/admin/donations/history')
})

async function updateBlood(id, units){
    const blood = await Blood.findById(id);
    blood.units = blood.units + units

    await blood.save({
        validateBeforeSave: false
    });
}

// Delete donation request => admin/donation/:id
exports.deleteDonation = catchAsyncErrors(async (req, res, next) => {
    const donation = await Donation.findById(req.params.id);
    if(!donation){
        return next(new ErrorHandler('Donation not found', 404))
    }
    await donation.remove();
    req.flash('message','Donation Request deleted successfully')
    res.redirect('/admin/donations')
})