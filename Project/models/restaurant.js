// load mongoose since we need it to define a model
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
RestaurantSchema = new Schema({
    address: {
        building: String,
        coord: [Number],
        street: String,
        zipcode: String
    },
    borough: String,
    cuisine: String,
    grades: [
        {
            date : Date,
            grade : String,
            score : Number
        }
    ],
    name: String,
    restaurant_id: String
});
module.exports = mongoose.model('restaurants', RestaurantSchema);

