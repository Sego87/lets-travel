const mongoose = require('mongoose');

const hotelSchema = new mongoose.Schema({
    // We are creating the structure of our hotel model, it is an object with its properties and its values.
    hotel_name: {
        type: String,
        required: 'Hotel name is required',
        max: 32, // Number of maximum characters
        trim: true // You will see just the written text
    },
    hotel_description: {
        type: String,
        required: 'Hotel description is required',
        trim: true
    },
    image: String, // to be fixed later on in the course
    star_rating: {
        type: Number,
        required: 'Hotel star rating is required',
        max: 5 // max value for the stars
    },
    country: {
        type: String,
        required: 'Country is required',
        trim: true
    },
    cost_per_night: {
        type: Number,
        required: 'Cost per night is required'
    },
    available: {
        type: Boolean,
        required: 'Availability is required'
    }
}); // This schema will map or match to the data inside of our database. Now we shaped how our database data will be constructed.

hotelSchema.index({  // .index will allow us to index the fields we want to search from our model -we need it to use searchResult-. In this case we want to index andsearch for the name of the hotel and the country. We set them to be text strings
    hotel_name: 'text',
    country: 'text'
}) // now we have also in mongodb a new system collection (system.indexes) with our indexed fields

// Export model
module.exports = mongoose.model('Hotel', hotelSchema); // We want to export this model to the database. We decided now to call it 'Hotel' and we also decided to pass the hotelSchema

// We now have a strict set of rules to construct any new 'Hotel' instance