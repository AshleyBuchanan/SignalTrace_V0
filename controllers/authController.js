const User = require('../models/User');
const Article = require('../models/Article');
const jwt = require('jsonwebtoken');

const maxAge = 3 * 24 * 60 * 60 * 1000;
const state = {
    hideSignout: false,
    hideSignin: false,
    hideSignup: false,
    message: null
};

// helpers
const handleErrors = err => {
    let errors = { email: '', password: '' };
    console.log(err)

    // login or password incorrect
    if (err.message.includes('incorrect')) errors.password = "these credentials don't work";
    
    // duplicate error code
    if (err.code === 11000) errors.email = 'that email is already registered';

    // validation errors
    if (err.message.includes('user validation failed')) {
        Object.values(err.errors).forEach( ({ properties }) => {
            errors[properties.path] = properties.message
        });
    };

    return errors;
};

const createToken = (id) => {
    return jwt.sign({ id }, 'secret', { expiresIn: maxAge });
};


// actual controllers
module.exports.welcome_get = (req, res) => {
    state.hideSignout = true;
    state.hideSignin = false;
    state.hideSignup = false;
    state.message = null;
    res.render('welcome', { state });
};

module.exports.dashboard_get = async (req, res) => {
    const startOfToday = new Date();
    startOfToday.setUTCHours(0, 0, 0, 0);
    const endOfToday = new Date(startOfToday);
    endOfToday.setUTCHours(23, 59, 59, 999);

    state.hideSignout = false;
    state.hideSignin = true;
    state.hideSignup = true;
    state.message = null;
    state.payload = await Article.find({ traceStatus: 'fetched'})
    .select(' _id source title author link publishedAt traceStatus')
    .sort({ publishedAt: -1, createdAt: -1 })
    .limit(500);
    res.render('dashboard', { state });
};

module.exports.signup_get = (req, res) => {

    state.hideSignout = true;
    state.hideSignin = false;
    state.hideSignup = true;
    state.message = null;
    res.render('signup', { state });
};

module.exports.signup_post = async (req, res) => {
    const { email, password } = req.body;
    console.log(email, password)

    try {
        const user = await User.create({ email, password });
        const token = createToken(user._id);
        res.cookie('jwt', token, { httpOnly: true, maxAge:maxAge });
        res.status(201).json({user: user._id});
    } catch(err) {
        const errors = handleErrors(err);
        res.status(400).json({ errors });
    };
};

module.exports.signin_get = (req, res) => {
    state.hideSignout = true;
    state.hideSignin = true;
    state.hideSignup = false;
    state.message = 'welcome back';
    res.render('signin', { state });
};

module.exports.signin_post = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.login(email, password);
        const token = createToken(user._id);
        res.cookie('jwt', token, { httpOnly: true, maxAge:maxAge });
        res.status(200).json({ user });
    } catch (err) {
        const errors = handleErrors(err);
        res.status(400).json({ errors })
    };
};

module.exports.signout_get = (req, res) => {
    state.hideSignout = true;
    state.hideSignin = true;
    state.hideSignup = false;
    state.message = 'good bye, maybe?'
    res.cookie('jwt', '', { maxAge: 1 });
    res.status(200).render('signin', { state });
};

