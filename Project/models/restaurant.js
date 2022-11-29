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
    grades: Array,
    name: String,
    restaurant_id: String,
    image: String
});
module.exports = mongoose.model('restaurants', RestaurantSchema);

