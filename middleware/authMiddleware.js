const jwt = require('jsonwebtoken');
const User = require('../models/User');

const requireAuth = (req, res, next) => {
    const token = req.cookies.jwt;
    const state = {
        hideSignout: true,
        hideSignin: false,
        hideSignup: false,
        message: 'please log in'
    };

    // check json web token exists & is verified
    if (token) {
        jwt.verify(token, 'secret', (err, decodedToken) => {
            if (err) {
                console.log(err.message);
                res.render('signin', { state });
            } else {
                console.log(decodedToken);
                next();
            };
        });
    } else {
        res.render('signin', { state });
    };
};

// check current user
const checkUser = (req, res, next) => {
    const token = req.cookies.jwt;

    // check json web token exists & is verified
    if (token) {
        jwt.verify(token, 'secret', async (err, decodedToken) => {
            if (err) {
                console.log(err.message);
                res.locals.user = null;
                next();
            } else {
                console.log(decodedToken);
                let user = await User.findById(decodedToken.id);
                res.locals.user = user;
                next();
            };
        });
    } else {
        res.locals.user = null;
        next();
    };
};

module.exports = { requireAuth, checkUser };