const Hotel = require('../models/hotel'); // we require to use the 'Hotel' model in the hotel.js model file

exports.homePage = (req, res) => { // exports allows this code to be available in another part of the application. homePage is the name that we decided for the function to be exported
    res.render('index', { title: 'Lets travel' });
}

//remember that req is the data coming in and res is the data coming out from the server
//we can use middleware in between to change our data or do something with it
//middleware acts like a series of functions which we pass through (for instance when a user signs up)

exports.listAllHotels = (req, res) => {
    res.render('all_hotels', { title: 'All Hotels' });
}

exports.adminPage = (req, res) => {
    res.render('admin', { title: 'Admin' });
}

exports.createHotelGet = (req, res) => {
    res.render('add_hotel', { title: 'Add new Hotel' });
}

exports.createHotelPost = async (req, res, next) => { // with async we mark this function as an async function (it is called async await,it allows us to work with asyncronous code). It allows us to parse a function until a line of code has finished running.the next is because we set a next method inside of our function
    // first thing we want to check what kind of data has been sent by the form, we can do it by using res.json to output the data as json.
    // res.json(req.body);
    try{ // we the put the code inside try because this way we can try to run the code and test for any error
        const hotel = new Hotel(req.body); // We created a new 'Hotel' passing in the date from the req.body (where we have the data stored)
        await hotel.save(); // with hotel.save() we want to make sure that that the Hotel has finished saving, if worked we can start doing things with it. Adding await before this line we make sure this code parses and then wait this to finish before moving on to the next line. We want to make sure we await the hotel saving before moving on because we will soon use this data immediately after the save. Basically we want to make sure that the save has been completed and it is available before calling anymore lines of code which need this hotel data    
        res.redirect(`/all/${hotel._id}`) // now that the hotel has been saved for sure, we want to redirect it to our path /all/ (we used the sintax with `wantedPath${variable._id}` because we add a dynamic data with its unique id provided by the server). Indeed in the browser we should see the url /all/idOfTheHotelCreated, because we waited for the hotel to be created first beforemovingon to redirect (below we should see a not found error because we haven't created that route yet - we will fix this later when we create a template with the full hotel details -)
    } catch(error) { // if there are any errors we can handlethemwith a catch statement
        next(error); // calling next and passing in the error,we will pass the error along a middleware chain until it reaches an error handler which can deal with it correctly. (we alredy have an error handler within the express framework insideofour app.js - see error handler in app.js -)
    }
} // if everything is ok now we should have our hotel saved in the database (it also has his unique id if everything works fine, its id is a proof that we can now use it for the next line of code)

/* MIDDLEWARE EXAMPLE */
/* 
exports.signUp = (req, res, next) => { // next inside of the body indicates when we are ready to move on to the next piece of middleware
    // validate user info
    console.log('sign up middleware');
    next(); // if I comment out this line then I won't run the next middleware, so I won't log in to the platform automatically after signing up (see this in the console)
}

exports.logIn = (req, res) => {
    //login
    console.log('login middleware');
}
 */
// in general this is what we want when we sign up to a new platform, after signing up we want to be already logged in. So we want to run first the signUp and then the logIn
// in localhost:3000/sign-up in the console I will se first 'sign up middleware' and then 'login middleware'