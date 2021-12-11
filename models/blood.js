const mongoose = require('mongoose')

const bloodSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        enum: {
            values:[
                'A+',
                'A-',
                'AB+',
                'AB-',
                'O+',
                'O-',
                'B+',
                'B-'
            ],
            message: 'Please select correct blood group name'
        }
        
    },
    units: {
        type: Number,
        default: 0
    }
})
module.exports = mongoose.model('Blood',bloodSchema);