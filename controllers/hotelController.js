exports.homePage = (req, res) => { // exports allows this code to be available in another part of the application. homePage is the name that we decided for the function to be exported
    res.render('index', { title: 'Lets travel' });
}

//remember that req is the data coming in and res is the data coming out from the server
//we can use middleware in between to change our data or do something with it
//middleware acts like a series of functions which we pass through (for instance when a user signs up)

exports.listAllHotels = (req, res) => {
    res.render('all_hotels', { title: 'All Hotels' });
}

/* MIDDLEWARE EXAMPLE */

exports.signUp = (req, res, next) => { // next inside of the body indicates when we are ready to move on to the next piece of middleware
    // validate user info
    console.log('sign up middleware');
    next(); // if I comment out this line then I won't run the next middleware, so I won't log in to the platform automatically after signing up (see this in the console)
}

exports.logIn = (req, res) => {
    //login
    console.log('login middleware');
}

// in general this is what we want when we sign up to a new platform, after signing up we want to be already logged in. So we want to run first the signUp and then the logIn
// in localhost:3000/sign-up in the console I will se first 'sign up middleware' and then 'login middleware'