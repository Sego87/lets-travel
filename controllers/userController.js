const User = require('../models/user');
const Hotel = require('../models/hotel'); // we need to require it for the booking confirmation page
const Order = require('../models/order');
const Passport = require('passport');

// Express validator
const { check, validationResult } = require('express-validator/check'); // the {} are used to import just a single module of the whole package (in this case we want to use just the check and validationResult modules of the validator package). validationResults runs the validation and stores the validation errors into a result object
const { sanitize } = require('express-validator/filter');

const querystring = require('querystring'); // node module to parse the json strings

exports.signUpGet = (req, res) => {
    res.render('sign_up', { title: 'User sign up' });
};

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
];

exports.loginGet = (req,res) => {
    res.render('login', { title: 'Login to continue' });
};

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
};

exports.bookingConfirmation = async (req, res, next) => { // remember that we use the async function since we are working with the database
    try {
        const data = req.params.data; // first we want to capture the query string from the url
        const searchData = querystring.parse(data); // we use this method of the querystring node module to parse our json string and display it as a real json data as usual (an object with name value pairs)
        const hotel = await Hotel.find( {_id: searchData.id} ); // Now it is clearer why we put mongoose.Schema.Types.ObjectId asa type of the hotel_id in the Order model. Wewant to retreive the _id of the hotel in the database that corresponds to the id of the searchData that we defined in the hotel mixin when we said id={hotel._id} in the url ofthe browser, with hotel._id which is the id ofthe hotel in the database
        res.render('confirmation', {title: 'Confirm your booking', hotel, searchData }); // we pass in the information of the hotel and also the inputs from  the user
        // res.json(searchData); // if we use res.json(data) we get a string, not a real json file with objects displayed
    } catch (error) {
        next(error)
    }
};

exports.orderPlaced = async (req, res, next) => {
    try {
        const data = req.params.data;
        const parsedData = querystring.parse(data);
        // res.json(parsedData);
        const order = new Order({
            user_id: req.user._id,
            hotel_id: parsedData.id,
            order_details: {
                duration: parsedData.duration,
                dateOfDeparture: parsedData.dateOfDeparture,
                numberOfGuests: parsedData.numberOfGuests
            }
        });
        await order.save();
        req.flash('info', 'Thank you, your order has been placed!');
        res.redirect('/my-account');
    } catch(error) {
        next(error);
    }
};

exports.myAccount = async (req, res, next) => {
    try {
        const orders = await Order.aggregate([
            { $match: { user_id: req.user.id } }, // this grabs any record wherethe user_id matches the current logged in user
            { $lookup: { // we use this method because we are in the users collection but we want to move to the hotels collection to return to the user the actual name of the hotel instead of its id which for the user means nothing
                from: 'hotels',
                localField: 'hotel_id', // localField is the field name from our orders collection, which is basically considered the input. hotel_id indeed is in our order.js file
                foreignField: '_id', // this is the field from the hotels collections which we want to match to. Thishotel data we want to match to will be added to our orders as an array. Now we are going to give this array a name of our choice such as 'hotel_data'
                as: 'hotel_data'
            } }
        ]); // now in the res.json(orders) we will see a new field called 'hotel_data' which is grabbing all of the information from the upper hotel_id stored in the orders collection. So basically we retreive the whole hotel information from the hotel_id string grabbed in orders collection.So now we can use all the gotten hotel data inside of our template
        // const orders = await Order.find({ user_id: req.user._id }); // we want to match the user_id to the information from the req.user._id. This line has been replaced by the new const orders above
        // res.json(orders);
        res.render('user_account', { title: 'My Account', orders });
    } catch (error) {
        next(error);
    }
};

exports.allOrders = async (req, res, next) => { // all this is for the admin to display all the orders. Is pretty much the same of above but in this case we simply don't have to match with a user id,that's why we removed it
    try {
        const orders = await Order.aggregate([
            { $lookup: {
                from: 'hotels',
                localField: 'hotel_id',
                foreignField: '_id',
                as: 'hotel_data'
            } }
        ]);
        res.render('orders', { title: 'All Orders', orders });
    } catch (error) {
        next(error);
    }
};

exports.isAdmin = (req, res, next) => {
    if(req.isAuthenticated() && req.user.isAdmin) { // we want to check that the user is authenticated and if it is an admin at the same time
        next();
        return;
    }
    res.redirect('/'); // if we are not the admin we are redirected to the home page
};