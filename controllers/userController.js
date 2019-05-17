const User = require('../models/user');
const Passport = require('passport');

// Express validator
const { check, validationResult } = require('express-validator/check'); // the {} are used to import just a single module of the whole package (in this case we want to use just the check and validationResult modules of the validator package). validationResults runs the validation and stores the validation errors into a result object
const { sanitize } = require('express-validator/filter');


exports.signUpGet = (req, res) => {
    res.render('sign_up', { title: 'User sign up' });
}

exports.signUpPost = [ // We need validation and sanitization. Validation makes us sure that the user entered values in the correct format (similar to the models we createdfor the hotels and the users, such as respecting minimum number of characters, hyphenom data, if the passwordmatches and so on..). Sanitization is the process that removes and replaces characters entered into the input fields which maybe used to send malicious data to the server. Express-validator contains modules to accomplish both of these tasks    // Validate user data
    check('first_name').isLength({ min: 1 }).withMessage('First name must be specified') // with the isLength validator method we want to check if we have at least 1 character in our first_name. Then we passed in an error message string in case no characters have been entered
    .isAlphanumeric().withMessage('First name must be alphanumeric'), // this line is chained with the above one, placedhere just for readability

    check('surname').isLength({ min: 1 }).withMessage('Surname must be specified')
    .isAlphanumeric().withMessage('Surname must be alphanumeric'),

    check('email').isEmail().withMessage('Invalid email adress'),
    
    check('confirm_email')
    .custom(( value, { req } ) => value === req.body.email) // we used a custom validator. The first parameter is the value we received from the field, the second value is inside of an object (an options object where we can pass in multiple values, even though in this case we only just need to access to the request object which we can also pass in -the req object stores inside all of the fields-). We basically check if the value stored in confirm_email is the same as the one written in email
    .withMessage('Email adresses do not match'),

    check('password').isLength({ min: 6 })
    .withMessage('Invalid password, password must be a minimum of 6 characters'),

    check('confirm_password')
    .custom(( value, { req } ) => value === req.body.password)
    .withMessage('Passwords do not match'),

    sanitize('*').trim().escape(), // the * means all of the fields. The trim method removes all the white spaces before and after each field (so no hacker can put maliciously and intentionally html code inside of the fields - such as first name <p> Michele </p> for instance-). The escape method removes any html characters potentially used for a hacker attack (indeed with this method in the json file we can not see the html code entered in the field if entered)

    (req, res, next) => { // now we can define our function as always
        const errors = validationResult(req);

        if(!errors.isEmpty()) { // we check if the errors array contains any errors (that's why we put the ! because !=not , this means that we activate the "if" if the errors array is not empty)
            // There are errors
            // res.json(req.body)
            res.render('sign_up', { title: 'Please fix the following errors:', errors: errors.array() }); // We pass the errors to the tamplate as an array containing all the detected errors
            return; // it will brake at this statement if there  are any errors at this stage
        } else {
            // No errors
            const newUser = new User(req.body);
            User.register(newUser, req.body.password, function(err) { // method provided by passport-local-mongoose which registers the new user. First argument is the new user that we want to register, the second one is the password, the third one is a callback function that runs one the validation method has completed
                if(err) { // if an error is present
                    console.log('error while registering!', err);
                    return next(err);
                }
                next(); //we want to activate the next middleware (the loginPost) to let the new user be already logged in after registering. It moves to loginPost (check the routing in index.js)
            });
        }
    }
]

exports.loginGet = (req,res) => {
    res.render('login', { title: 'Login to continue' });
}

exports.loginPost = Passport.authenticate('local', { // authenticate is a method from the passport module. The first argument is the local strategy to handle the login request. The second argument is an option object. The first option redirects the user when the login has been succesful, the second one if unseccesful unseccesful.
    successRedirect: '/',
    successFlash: 'You are now logged in', //We show a flash message if the login  has been successful
    failureRedirect: '/login',
    failureFlash: 'Login failed, please try again'
});

exports.logout = (req, res) => {
    req.logout(); // we can access the logout method on the request object, which is provided by passport
    req.flash('info', 'You are now logged out'); // this provides a flash message with the key: 'info' and the value: 'You are now logged out' 
    res.redirect('/');
}

exports.isAdmin = (req, res, next) => {
    if(req.isAuthenticated() && req.user.isAdmin) { // we want to check that the user is authenticated and if it is an admin at the same time
        next();
        return;
    }
    res.redirect('/'); // if we are not the admin we are redirected to the home page
}