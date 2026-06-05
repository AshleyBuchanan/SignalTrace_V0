const mongoose = require('mongoose');
const { isEmail } = require('validator');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'please enter an email'],
        unique: true,
        lowercase: true,
        validate: [isEmail, 'please enter a valid email']
    },
    password: {
        type: String,
        required: [true, 'please enter a password'],
        minlength: [6, 'minimum password length is 6 characters']
    },
});

// fire a function after doc saved to db
userSchema.post('save', function (doc, next) {
    console.log('new user was created and saved', doc.email);
    return next();
});

// fire a function before doc saved to db
userSchema.pre('save', async function () {
    const salt = await bcrypt.genSalt();
    this.password = await bcrypt.hash(this.password, salt);
    console.log('saving new user to db', this.email, this.password);
    return;
});

// static method to login
userSchema.statics.login = async function (email, password) {
    const user = await this.findOne({ email });
    if (user) {
        const auth = await bcrypt.compare(password, user.password);
        if (auth) return user;
        throw Error('incorrect password')
    };
    throw Error('incorrect email');
};

const User = mongoose.model('user', userSchema);

module.exports = User;