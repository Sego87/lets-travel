const mongoose = require('mongoose');

const orderSchema = mongoose.Schema({
    user_id: {
        type: String,
        required: true
    },
    hotel_id: {
        type: mongoose.Schema.Types.ObjectId, // we need to retreive the rest of the info of the hotel from the database. ObjectId will allow us to compare this id to the one which is stored in the database
        required: true
    },
    order_details: {
        type: Object,
        required:true
    }
})

// Export model
module.exports = mongoose.model('Order', orderSchema);