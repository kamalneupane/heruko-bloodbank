const app = require('./app')

const dotenv = require('dotenv')
const connectDatabase = require('./config/database')

// handle uncaught exception
process.on('uncaughtException', err => {
    console.log(`ERROR: ${err.stack}`)
    console.log('shutting down server due to uncaught exception')
    process.exit(1)
})


// config file
dotenv.config({ path: 'config/config.env'})

// database
connectDatabase();



const server = app.listen(process.env.PORT, () => {
    console.log(`Server started on port ${process.env.PORT} in ${process.env.NODE_ENV} mode`)
})
// handle unhandled promise rejection
process.on('unhandledRejection', err => {
    console.log(`ERROR: ${err}`)
    console.log('Shutting down the server due to unhandled promise rejection')
    server.close(() => {
        process.exit(1)
    })
})
