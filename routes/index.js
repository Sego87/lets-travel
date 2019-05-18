var express = require('express');
//- we have just required the usage of the package called "express" in the node_modules. if we want to use any other file which is not in the node_modules folder I have to write the whole path
var router = express.Router();
//- we have just used the express.Router() instance stored in a variable

// require controllers:
const hotelController = require('../controllers/hotelController'); // we required the usage of the hotelController.js (the name of the const hotelController has to be exactly the name of our file in which we stored the route)
const userController = require('../controllers/userController');

/* GET home page. */
router.get('/', hotelController.homePageFilters); // it runs the function homePage in the file hotelController.js.-NEW! Updated with the new improved homePageFilters-.

/* router.get('/', function(req,res){
  if(req.session.page_views) { // this express session module makes our session data available in the request.session object and we can also make use of the page_views to see how many times the page has been visited. So we can now increment the page views total on each request. This if statement will handle if the user has already visited the page 
    req.session.page_views++; // this will increment the number of page views each time thereis a request to our homepage. For each page refresh basically we increment the number of views
    res.send(`Number of page visits: ${req.session.page_views}`); // this will show the page views
  } else { // the else statement will handle if the user is visiting for the first time
    req.session.page_views = 1;
    res.send('First visit');
  }
}); // in mongodb we will see now also a new collection called sessions with the details of each session,with a unique id at the top and some information about the coockie itself (if we want we can set the coockie options) */

router.get('/all', hotelController.listAllHotels); // same of above but with listAllHotels
router.get('/all/:hotel', hotelController.hotelDetail);
router.get('/countries', hotelController.listAllCountries);
router.get('/countries/:country', hotelController.hotelsByCountry);
router.post('/results', hotelController.searchResults);

/* 
router.get('/sign-up', hotelController.signUp, hotelController.logIn); // see middleware example in hotelController. We can pass as many as of these as we want to use, they will be run in sequence (each one of them calling the next one, needs the "next" as a parameter of the function and that parameter will be the next funtion run)
router.get('/login', hotelController.logIn); // this is for when a user wants to log in after beign logged out
 */

/* router.get('/', function(req, res, next) {
  // res.render('index', { title: 'Express' }); // we moved this route to the hotelController
  // res.send("hello mike"); // to reload the server we have to run npm start from the terminal (the root of our project),comment out the line above to try
}); */
//- req is request and res is response (these names could be anything)
//- request is an object which contains all the information from the http request (for example we can use it to access data from within the form. response is the sent back data from the server)

/* router.get('/all', function(req, res) {
  res.render('all_hotels', { title: 'All Hotels' });
  //- we want to render the file called all_hotels.pug, the object {title: 'All Hotels'} is to set the title of the document
}) */
//- router.get('/all', function(req, res) we want to apply this to the"/all" route

// router.get('/all/:name', function(req, res) {
//   //- /all/:name means that we want a dynamic section called name (we chose its name "name" and the /: means it will be a dynamic section)
//   //- we could also have '/all/:name/:age' for instance in order to nest several dynamic sections
//   //- if we have '/all/*' then it will run the code for any route with any section after '/all' (basically from the '/all' any child route that we will touch will run the code) (it works also with '/all/*/',it is saying that it will run even if after dynamic "unkown" section you will have other sections. useful for a username section for instance)
//   //- now we can access to our name data from the URL, we use the request object (it holds information from the http request)
//   const name = req.params.name;
//   //- req.params is to acces to our data in the URL parameters. then we have tu put the name "name" that we chose above (so it becomes req.params.name). then we just stored it inside of a constant called name
//   //- its data can be paste to the template to use along with the page title
//   res.render('all_hotels', { title: 'All Hotels', name }); // I can paste to the template all the data that I want within { data1, data2, data3, ... }
// })

// ADMIN Routes
router.get('/admin', userController.isAdmin, hotelController.adminPage); // we want to check before if the authenticated user is an admin for real
router.get('/admin/*', userController.isAdmin) // it will catch any path with /admin as a root
router.get('/admin/add', hotelController.createHotelGet);
router.post('/admin/add', hotelController.upload, hotelController.pushToCloudinary, hotelController.createHotelPost); // this createHotelPost middleware is a post request (the route doesn't change indeed the corresponded action is empty - see add_hotel.pug). we also before passed the file uploader before the second middleware of pushing the image to cloudinary before the last middleware of the chain, the creation of the hotel
//as soon as we confirm with the button we make a post request from this form to the /admin/add route. in this file we handle this post request in this route. This triggers in the hotelController.js the creareHotelPost function, which then will return the json through res.json, and then it will pass the req.body (it is a request) which stores the data that has been sent by the form. In the end we can see the json version of the 'Hotel' added (the date has the same format of our model).(We made a good job because the form -in the views(client)- has been set up to be the same as our model -in the models(server)- indeed the data is in the correct format). Now we know we have an object for our 'Hotel' stored in request of body (req.body), we will use this data in our model to push to the database (we need to require our 'Hotel? model at the top of our file)
router.get('/admin/edit-remove', hotelController.editRemoveGet);
router.post('/admin/edit-remove', hotelController.editRemovePost);
router.get('/admin/:hotelId/update', hotelController.updateHotelGet); // the colon is because that data is dynamic
router.post('/admin/:hotelId/update', hotelController.upload, hotelController.pushToCloudinary, hotelController.updateHotelPost);
router.get('/admin/:hotelId/delete', hotelController.deleteHotelGet);
router.post('/admin/:hotelId/delete', hotelController.deleteHotelPost);

module.exports = router;

// USER ROUTES
// ===========

router.get('/sign-up', userController.signUpGet);
router.post('/sign-up', userController.signUpPost, userController.loginPost); // after signing up we activate the next middleware to let the user be already logged in
router.get('/login', userController.loginGet);
router.post('/login', userController.loginPost);
router.get('/logout', userController.logout);
router.get('/confirmation/:data', userController.bookingConfirmation); // we use the dynamic :data to access the query string in the user controller (check the user controller)
router.get('/order-placed/:data', userController.orderPlaced);
// router.get('/my-account', userController.myAccount);

// after installing nodemon it will appear as a new devDependency in the package.json
// in order to make nodemon work I create a new script in package.json right below "start" and I call it "devstart", then the related command is "nodemon ./bin/www"
// to start correctly nodemon and the autoupdate of the server type in the console in your root: npm run devstart
// index.pug is the main homepage template
// a template is a mix of html javascript along with any dynamic data mixed in. we need a template language to put this in html, that's why we used pug
// in pug indentation is really important for the nesting
// index.js handles all of our routes