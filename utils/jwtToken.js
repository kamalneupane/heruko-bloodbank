// create and send and save in the cookie
const sendToken = (user, statusCode, res) => {

    // create jwt token
    const token = user.getJwtToken();

    const options = {
        expires : new Date (
            Date.now + process.env.COOKIE_EXPRES_TIME * 24 * 60 * 60 *1000
        ),
        httpOnly: true
    }
    res.status(statusCode).cookie('token', token, options);
}

module.exports = sendToken