var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const mongoose = require('mongoose'); // we are requiring our mongoose package from the node_modules folder (we can require it just typing its name instead of writing the whole path). So now we have access to mongoose.

var indexRouter = require('./routes/index');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use( (req, res, next) => { // app.use middleware doesn't  have a route as a first parameter, indeed is an action which is used for every request to our application (not like the local variables that we createdin our functions so far). It basically adds a layer which we pass through of each request. We can use app.use to create some middleware for all requests
  // console.log('hello'); // for each action we perform we will get a "hello" string in the console,  even though we will always see a spinning icon at the title of the page if we don't define the next call. This is because a middleware is supposed to be something which we pass through, so it needs a well defined next piece of the middleware in the chain.
  // console.log('current path is ' + req.path); // path is a property of the request that gives us the url
  res.locals.url = req.path // this will assign the req.path to the locals objects which is on the response (.url is the name we assigned it by our choice). So basically now we can acces this url local in any of our templates of our projects. We can use it for conditional rendering
  next();
});

// Set up mongoose connection
mongoose.connect('mongodb+srv://travel:travel1@lets-travel-jton2.mongodb.net/test?retryWrites=true', {useNewUrlParser: true}); // We copied this from the mongoDB website of our cluster in the connection section (this is not the best way to write passwords - it is unsure - and it is not recommended to wirte the URL here, but it was in order to understand) -the second argument was right to avoid the error message in the console I was getting all the time on 15/4/2019 (DeprecationWarning: current URL string parser is deprecated, and will be removed in a future version. To use the new parser, pass option { useNewUrlParser: true } to MongoClient.connect.)-
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
