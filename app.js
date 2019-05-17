require('dotenv').config();
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const mongoose = require('mongoose'); // we are requiring our mongoose package from the node_modules folder (we can require it just typing its name instead of writing the whole path). So now we have access to mongoose.

var indexRouter = require('./routes/index');

// For sessions
const session = require('express-session');
const MongoStore = require('connect-mongo')(session); // connect-mongo returns a function, but a normal require call will not immediately execute the function: instead it would just store it inside of this constant created MongoStore. That's why at the end we need to add (session), to go ahead and execute this function along with passing in this session variable to this function. Then below we can set up our session as a middleware to run for each request with app.use and passing in again our session variable

// For flash messages
const flash = require('connect-flash');

// For passport.js:
const User = require('./models/user'); // we require the User schema
const passport = require('passport');// we require the passport module

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(session({ // This is a session middleware with options in the object
  secret: process.env.SECRET, // The SECRET is a text string of our choice which is used to sign the session id coockie
  saveUninitialized: false, // This means that a new session is not saved to the database unless the session is actually modified (useful for a visitor browsing the platform, it doesn't need to have the details saved during the session.This will save a lot of unnecessary saves to our database)
  resave: false, // The session is not saved unless it is actually modified
  store: new MongoStore({ mongooseConnection: mongoose.connection }) // This new store takes in the mongoose connection as an option. mongoose.connection is the same that we used when we set the connection to the mongodb, check the code below
}));

// Configure passport middleware
app.use(passport.initialize()); // in our express app we need to initialize the passport module in order to use it
app.use(passport.session()); // this will allow us to use sessions, to keep the user logged int

passport.use(User.createStrategy()); // this is a helper method provided by the passport-local-mongoose module, it is responsable for creating the passport local strategy for us (check documentation), to allow us to take advantage of the user and password login which we want to use from passport

passport.serializeUser(User.serializeUser()); // It gets the information from the user object and handles which information has to be store into our session
passport.deserializeUser(User.deserializeUser()); // It is responsable of getting the correct user information back from our session and then back into the user object. Therefore staying logged in between pages

// Flash messages
app.use(flash());


app.use( (req, res, next) => { // app.use middleware doesn't  have a route as a first parameter, indeed is an action which is used for every request to our application (not like the local variables that we created in our functions so far). It basically adds a layer which we pass through of each request. We can use app.use to create some middleware for all requests
  // console.log('hello'); // for each action we perform we will get a "hello" string in the console,  even though we will always see a spinning icon at the title of the page if we don't define the next call. This is because a middleware is supposed to be something which we pass through, so it needs a well defined next piece of the middleware in the chain.
  // console.log('current path is ' + req.path); // path is a property of the request that gives us the url
  res.locals.user = req.user; // the user is added to the request object by passport when a user has successfully logged in. We can nowuse this user variable inside of our template to apply some conditional rendering
  res.locals.url = req.path; // this will assign the req.path to the locals objects which is on the response (.url is the name we assigned it by our choice). So basically now we can acces this url local in any of our templates of our projects. We can use it for conditional rendering
  res.locals.flash = req.flash(), // this makes the flash functionality available as a variable inside of our templates. This is useful for conditional rendering if there are any messages to show. We can set a flash for any of our functions
  next();
});

// Set up mongoose connection
mongoose.connect(process.env.DB,{useNewUrlParser: true, useCreateIndex: true}); // We copied this from the mongoDB website of our cluster in the connection section (this is not the best way to write passwords - it is unsure - and it is not recommended to wirte the URL here, but it was in order to understand) -the second argument was right to avoid the error message in the console I was getting all the time on 15/4/2019 (DeprecationWarning: current URL string parser is deprecated, and will be removed in a future version. To use the new parser, pass option { useNewUrlParser: true } to MongoClient.connect.)- UPDATE 16/05 Added the option useCreateIndex: true because of the deprecation warning in the console all the time the server restarted (DeprecationWarning: collection.ensureIndex is deprecated. Use createIndexes instead.)
mongoose.Promise = global.Promise; // Once we start a query our database we need to deal with the information which is returned back to us, in earlier versions of mongoose we used a callback setup, but now we can use promises, a lot simpler and easier to mantain (we could set up mongo to use a promise library such as bluebird - npm module -, but with global.Promise we can use native promises in ES6 rather than installing another node module).
mongoose.connection.on('error', (error) => console.error(error.message)); // on() is a node method which adds an event listener, in our case we want to check for any errors. The second parameter is a callback function to display this error. we want to pass any error messages to the console.
// basically if an error happens (event) while connecting to mongoose we will getthe error message in the console

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser()); // it doesn't have a route as first parameter because this middleware passes through all of our routes
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter); // this middleware applies just to the route '/' because it is set as first argument

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
