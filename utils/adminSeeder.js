const User = require('../models/user')

const dotenv = require('dotenv')

const connectDatabase = require('../config/database')

const user = require('../data/admin')

// setting config file
dotenv.config({ path: 'config/config.env' })

connectDatabase()

const seedAdmin = async () => {
    try {

        await User.create(user);
        console.log('Admin created successfully')
        process.exit();
        
    } catch (error) {
        
        console.log(error)
        process.exit();

    }
}

seedAdmin()