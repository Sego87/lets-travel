const User = require('../models/user');

// Express validator
const { check, validationResult } = require('express-validator/check'); // the {} are used to import just a single module of the whole package (in this case we want to use just the check and validationResult modules of the validator package). validationResults runs the validation and stores the validation errors into a result object
const { sanitize } = require('express-validator/filter');


exports.signUpGet = (req, res) => {
    res.render('sign_up', { title: 'User sign up' });
}

exports.signUpPost = [ // We need validation and sanitazation. Validation makes us sure that the user entered values in the correct format (similar to the models we createdfor the hotels and the users, such as respecting minimum number of characters, hyphenom data, if the passwordmatches and so on..). Sanitazation is the process that removes and replaces characters entered into the input fields which maybe used to send malicious data to the server. Express-validator contains modules to accomplish both of these tasks    // Validate user data
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

    (req, res, next) => { // now we can define our function as always
        const errors = validationResult(req);

        if(!errors.isEmpty()) { // we check if the errors array contains any errors (that's why we put the ! because !=not , this means that we activate the "if" if the errors array is not empty)
            // There are erros
            res.render('sign_up', { title: 'Please fix the following errors:' });
        } else {
            // No errors
        }
    }

]