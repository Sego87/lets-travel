const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

const userSchema = new mongoose.Schema({
    first_name: {
        type: String,
        required: 'First name is required',
        trim: true,
        max: 30
    },
    surname: {
        type: String,
        required: 'Surname is required',
        trim: true,
        max: 30
    },
    email: {
        type: String,
        required: 'Email adress is required',
        trim: true,
        unique: true,
        lowercase: true
    },
    password: {
        type: String,
        required: 'Password is required'
    },
    isAdmin: {
        type: Boolean,
        default: false
    }
});

userSchema.plugin(passportLocalMongoose, { usernameField: 'email' }); // we need to add our userSchema to the plugin in order to use it. The second parameter is an option object, check the documentation on the internet (using 'email' we are saying that we want to use the entered email as username of the user-by default it would look for the field called username, which we don't have-)

module.exports = mongoose.model('User',  userSchema);