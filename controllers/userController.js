const User = require('../models/user');

exports.signUpGet = (req, res) => {
    res.render('sign_up', { title: 'User sign up' });
}