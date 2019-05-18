const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');
const mongooseBcrypt = require('mongoose-bcrypt');

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
        required: 'Password is required',
        bcrypt: true
    },
    isAdmin: {
        type: Boolean,
        default: false
    }
});

userSchema.plugin(mongooseBcrypt); // we need to add our userSchema to the plugin in order to use it. We can add the bcrypt option to our schema password field, we do this by adding bcrypt:true to the schema password field
userSchema.plugin(passportLocalMongoose, { usernameField: 'email' }); // we need to add our userSchema to the plugin in order to use it. The second parameter is an option object, check the documentation on the internet (using 'email' we are saying that we want to use the entered email as username of the user-by default it would look for the field called username, which we don't have-)

module.exports = mongoose.model('User',  userSchema);