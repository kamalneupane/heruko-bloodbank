const mongoose = require('mongoose')

const donationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    donateGroup: {
        name: {
        type: String,
        required: true
        },
        units: {
        type: Number,
        required: true
        },
        blood: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Blood'
        }
    },
    disease: {
        type: String,
        required: true
    },
    status: {
        type: String,
        required: true,
        default: 'Processing'
    },
    requested: {
        type: Boolean,
        default: false
    },
    address: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Donation',donationSchema)