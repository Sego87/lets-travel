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

// Set up mongoose connection
mongoose.connect('mongodb+srv://travel:travel1@lets-travel-jton2.mongodb.net/test?retryWrites=true'); // We copied this from the mongoDB website of our cluster in the connection section (this is not the best way to write passwords - it is unsure - and it is not recommended to wirte the URL here, but it was in order to understand)
mongoose.Promise = global.Promise; // Once we start a query our database we need to deal with the information which is returned back to us, in earlier versions of mongoose we used a callback setup, but now we can use promises, a lot simpler and easier to mantain (we could set up mongo to use a promise library such as bluebird - npm module -, but with global.Promise we can use native promises in ES6 rather than installing another node module).
mongoose.connection.on('error', (error) => console.error(error.message)); // on() is a node method which adds an event listener, in our case we want to check for any errors. The second parameter is a callback function to display this error. we want to pass any error messages to the console.

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
