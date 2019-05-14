const Hotel = require('../models/hotel'); // we require to use the 'Hotel' model in the hotel.js model file
const cloudinary = require('cloudinary');
const multer = require('multer');

cloudinary.config({ // cloudinary.config stores all the config details which have been saved in the .env file
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

const storage = multer.diskStorage({}); // the default saving directory is the temporary folder if the object is empty, indeed we don't need to set a folder since we are going to store our images into cloudinary.

const upload = multer({ storage }); //multer({storage}) is telling multer where our files will be stored.We could also for instance add some filters for the accepted file types

exports.upload = upload.single('image'); //we are telling multer that we want to upload one file at a time, we decided to call it image

exports.pushToCloudinary = (req, res, next) => {
    if(req.file) { // we are checking if there is an image, multer places this file on the request object under the name of file. We check that it exists because then we want to push it to cloudinary
        cloudinary.uploader.upload(req.file.path) // the .upload method will upload an image which we pass in, we can access it using the req.file.path
        .then((result) => { // we use now a promise (with .then) to handle what happens when the upload is succesful. The function created in the promise takes in the result. It stores the image we get back from cloudinary, which also includes a public_id which cloudinary adds to the image. We will use the public_id to reference the image in our project by set its value to req.body.image. This req.body.image is then passed to createHotelPost which is the next stage in the middleware. This image id is then saved when  we save the hotel to our mongo database
            req.body.image = result.public_id;  // after the redirection we now will see in the inspection tools that the image is the id of the image uploaded to cloudinary, we still have to pull it from cloudinary to actually see the image and not just its id
            next(); // we move to the last stage of the middleware
        })
        .catch(() => { // as we always do we need to finish off a promise by adding catch statement to handle any errors and redirect to the same page we are on
            res.redirect('/admin/add');
        })
    } else { // we want to move to the next piece of middleware if no file exists (the next middleware is the createHotelPost)
        next();
    }
}

/* exports.homePage = (req, res) => { // exports allows this code to be available in another part of the application. homePage is the name that we decided for the function to be exported
    res.render('index', { title: 'Lets travel' });
} */ // we improved this with filtering and aggregate methods with homePageFilters

//remember that req is the data coming in and res is the data coming out from the server
//we can use middleware in between to change our data or do something with it
//middleware acts like a series of functions which we pass through (for instance when a user signs up)

exports.listAllHotels = async (req, res, next) => { // async is necessary in order to let await work
    try{
        const allHotels = await Hotel.find({ available: { $eq:true }}); // we use await to be sure that all the documents inside the Hotel collection (Hotel is the name of the model exported from hotel.js) have been found before moving on to the next line of code (we want to render the  next page after finding all the hotels created). With Hotel.find({ available: { $eq:true }}) we are querying (filtering) the hotels with the available attribute set to true, so the unavailable hotels won't appear in the /all section ($eq checks forequality).
        res.render('all_hotels', { title: 'All Hotels', allHotels }); // we render all_hotels.pug, pass in the title of the html and pass in the data of the hotels from the database with allHotels
        /* res.json(allHotels); // this was just to check our data from the database in the json format */
    } catch(error) {
        next(error);
    }
}

exports.listAllCountries = async (req, res, next) => {
    try {
        const allCountries = await Hotel.distinct('country'); // it will return an array of distinct countries we can pass in in the country field. -IMPORTANT! if you remove await, you are not waiting for the data from the database, so you'll get some weird code asa response. Try to remove it..-. Thanks to distinct, now when we passed in the images of the countries in the all_countries.pug we can see just one image per country even if we have more than one hotel per country, such as Mexico Maldives and Dominican Republic.
        res.render('all_countries', { title: 'Browse my country', allCountries });
    } catch(error) {
        next(error);
    }
}

exports.homePageFilters = async (req, res, next) => {
    try {
        /* console.log(process.env.DB) */ // check what env does (it exists to store the variables mainly) and its documentation (DB is the variable we created in the .env file).
        const hotels = /* await */ Hotel.aggregate([ // check the aggregate methods on the mongodb documentation
            { $match: { available: true } }, // we look for available hotels
            { $sample: { size: 9 } } // we randomly select 9 of them (so the user and the page won't be overwhelmed)
        ]);
        const countries = /* await */ Hotel.aggregate([ // it is not a good idea to have 2 different awaits in homePageFilters, we will fix that later
            { $group: { _id: '$country' } },
            { $sample: { size: 9 } }
        ]);

        const [filteredCountries, filteredHotels] = await Promise.all([countries,hotels]); //- Promise.all() takes in multiple promises (it didn't make any sense to have 2 different awaits when in the reality they are part of the same filtering and it is not necessary to  wait for one filter in order to start the second one). In this case now we want to resolve the promises for countries and hotels at the same time, so everything has now a faster performance. countries will be unpacked and stored in a constant called filteredCountries, hotels in filteredHotels

        //-This example is pretty much the same of what we have done above
        /* const food = ['cheese', 'fish', 'rice'];
        const [a,b,c] = [food];
        res.send(a); */

        res.render('index', { /* countries */filteredCountries, filteredHotels/* hotels */ });
        // res.json(countries) This is just to check that now the id is set to be an individual country
    } catch(error) {
        next(error)
    }
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
    try{ // we put the code inside try because this way we can try to run the code and test for any error
        const hotel = new Hotel(req.body); // We created a new 'Hotel' passing in the data from the req.body (where we have the data stored)
        await hotel.save(); // with hotel.save() we want to make sure that the Hotel has finished saving, if worked we can start doing things with it. Adding await before this line we make sure this code parses and then wait this to finish before moving on to the next line. We want to make sure we await the hotel saving before moving on because we will soon use this data immediately after the save. Basically we want to make sure that the save has been completed and it is available before calling anymore lines of code which need this hotel data    
        res.redirect(`/all/${hotel._id}`) // now that the hotel has been saved for sure, we want to redirect it to our path /all/ (we used the sintax with `wantedPath${variable._id}` because we add a dynamic data with its unique id provided by the server). Indeed in the browser we should see the url /all/idOfTheHotelCreated, because we waited for the hotel to be created first before moving on to redirect (below we should see a not found error because we haven't created that route yet - we will fix this later when we create a template with the full hotel details -)
    } catch(error) { // if there are any errors we can handle them with a catch statement
        next(error); // calling next and passing in the error,we will pass the error along a middleware chain until it reaches an error handler which can deal with it correctly. (we alredy have an error handler within the express framework insideofour app.js - see error handler in app.js -)
    }
} // if everything is ok now we should have our hotel saved in the database (it also has his unique id if everything works fine, its id is a proof that we can now use it for the next line of code)

exports.editRemoveGet = (req, res) => {
    res.render('edit_remove', { title: 'Search for hotel to edit or remove' });
}

exports.editRemovePost = async (req, res, next) => {
    try {
        const hotelId = req.body.hotel_id || null; // we need to handle what will happen if we get a null value
        const hotelName = req.body.hotel_name || null;

        const hotelData = await Hotel.find({ $or: [ // check the mongodb documentation to check what $or does
            { _id: hotelId},
            { hotel_name: hotelName}
        ]}).collation({ // we are doing something different this time because we don't know if we are searching forthe hotel_id or the hotel_name. collection allows us to do language specific matches.
            locale: 'en', // english language
            strength: 2 // optional value, means it is a second level value (not case sensitive)
        });

        if(hotelData.length > 0) {
            // res.json(hotelData) this was just to check if we had the data correctly
            res.render('hotel_detail', { title: 'Add / Remove Hotel', hotelData });
            return // we don't move on to the else statement if the section is true
        } else {
            res.redirect('/admin/edit-remove') // if no data is found in the database we are redirected
        }

    } catch(errors) {
        next(errors)
    }
}

exports.updateHotelGet = async (req, res, next) => {
    try {
        const hotel = await Hotel.findOne({ _id: req.params.hotelId })
        // res.json(hotel)
        res.render('add_hotel', { title: 'Update Hotel', hotel })
    } catch(error) {
        next(error)
    }
}

exports.updateHotelPost = async (req, res, next) => {
    try {
        const hotelId = req.params.hotelId;
        const hotel = await Hotel.findByIdAndUpdate(hotelId, req.body, {new:true}); //-check the mongodb methods, this one allows us to find an object, modify it in mongo and then get it back again. The first argument is the record we are searching in the database, the second one is the data we want to use to update to it (in this case the information of the requested object stored inside body). The third argument is an object that with newset to true ensures us that the record has been updated with the new data passed in. If we don't put a res.redirect in the next line of code we will see the page loading undefinitely, even though we have already saved the new updated record in the database (you can check in mongodb)
        res.redirect(`/all/${hotelId}`)
    } catch(error) {
        next(error)
    }
}

exports.deleteHotelGet = async (req, res, next) => {
    try {
        const hotelId = req.params.hotelId;
        const hotel = await Hotel.findOne( { _id: hotelId } ); //  remember that with await we want to be sure that the record by the _id field has been found and matched to hotelId (created just above) before moving on to the next step
        res.render('add_hotel', { title: 'Delete hotel', hotel });
    } catch (error) {
        next(error)
    }
}

exports.deleteHotelPost = async (req, res, next) => {
    try {
        const hotelId = req.params.hotelId;
        const hotel = await Hotel.findByIdAndRemove({ _id: hotelId }); // very similar to findByIdAndUpdate, check documentation
        res.redirect('/') // we want to be redirected to the home page after confirming the deleting of the hotel
    } catch(error) {
        next(error)
    }
}

exports.hotelDetail = async (req,res, next) => {
    try {
        const hotelParam = req.params.hotel; // "hotel" is the name we gave it
        const hotelData = await Hotel.find( {_id: hotelParam} ); // hotelData stores the unique hotel from the dataBase
        res.render('hotel_detail', { title: 'Lets Travel', hotelData }); // remember that we are passing in to our hotel_detail template an object with the value paired title and the hotelData created above
    } catch(error) {
        next(error)
    }
}

exports.hotelsByCountry = async (req, res, next) => {
    try {
        const countryParam = req.params.country // "country" is the name we gave it
        const countryList = await Hotel.find({ country: countryParam }); // "country" is the name of that field in the database, is a coincidence  that we named it again country for the routing
        // res.json(countryList);
        res.render('hotels_by_country', { title: `Browse by country: ${countryParam}`, countryList});
    } catch(error) {
        next(error)
    }
}

exports.searchResults = async (req, res, next) => {
    try {
        const searchQuery = req.body; // the req.body stores the information passed from our post request, IE all the information which is inside of our form
        const parsedStars = parseInt(searchQuery.stars);
        const parsedSort = parseInt(searchQuery.sort);
        const searchData = await Hotel.aggregate([ // we use the aggregation pipeline like before
            { $match: { $text: {$search: `\"${searchQuery.destination}\"` } } }, // we want to match any of our records to the text entered by the user, this can be achieved using this dollar symbol text -$- which performs a text search. Here we are passing in the search, which is going to be a string, which mongo uses to query our database. \"anyField\" means that mongodb knows we are looking for the full phrase, not just for separate words, so inthis case if we write "hotel 1" we will get back just the hotel 1, not all of the hotels because it searched for the words "hotel" and "1" separately
            { $match: { available: true, star_rating: { $gte: parsedStars} }}, // the user will get just the available hotels, the preferred number of stars ($gte=greater than)( .stars is because in the layout we set name=stars)(without parsedStars we will get an error because we would try to match a string to a number -before it was directly searchQuery.stars-. the parsInt method converts our string to a number)
            { $sort: { cost_per_night: parsedSort } } // same concept of above
        ]);
        // res.json(searchData)
        // res.send(typeof searchQuery.stars); //we want to check if the data we get from the body is a string or a number (in mongo is a number)
    } catch(error) {
        next(error)
    }
}

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
// in localhost:3000/sign-up in the console I will see first 'sign up middleware' and then 'login middleware'