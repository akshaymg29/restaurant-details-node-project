var express = require('express');
require('dotenv').config();
var path = require('path');
var mongoose = require('mongoose');
var app = express();
const exphbs = require('express-handlebars');
var database = require('./config/database');
var bodyParser = require('body-parser');         // pull information from HTML POST (express4)

var lodash = require('lodash');


let convert = require('convert-zip-to-gps');

const hostname = process.env.HOST;
const dbName = process.env.DATABASE;

var port = process.env.PORT || 8000;
app.use(bodyParser.urlencoded({ 'extended': 'true' }));            // parse application/x-www-form-urlencoded
app.use(bodyParser.json());                                     // parse application/json
app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json

var isDBError = false;
mongoose.connect(database.url + dbName).then(
    () => {


        var Restaurant = require('./models/restaurant');


        //HandleBar 
        //------------------------------------------------------

        app.use(express.static(path.join(__dirname, 'public')));

        //custom handlebar
        const HBS = exphbs.create({
        });

        //app.engine('.hbs', exphbs.engine({ extname: '.hbs' }));
        app.engine('.hbs', exphbs.engine({
            extname: '.hbs',
            defaultLayout: 'main'
        }));
        app.set('view engine', '.hbs');

        //-------------------------------------------------------

        //Layout :'main.hbs'
        app.get('/', function (req, res) {
            res.render('index', { title: 'Restaurant', layout: 'main.hbs' });
        });


        app.get('/api/restaurants', function (req, res) {
            // use mongoose to get all restaurants in the database
            Restaurant.find(function (err, restaurants) {
                // if there is an error retrieving, send the error otherwise send data
                if (err)
                    res.send(err)
                //res.json(restaurants); // return all restaurants in JSON format
                res.render('getAllRestaurant', { title: 'Restaurant' , data:restaurants, layout:'main.hbs'});
            });
        });

        app.post('/api/restaurants', function (req, res) {
            // create mongose method to create a new record into collection

            let zip = req.body.zipcode;

            let zip1 = convert.zipConvert(zip)

            var JSONData = zip1.replace('[','').replace(']','').split(',').map(x => x.trim())
            
            console.log(JSONData.toString());
            var y = parseFloat(JSONData[0].toString());
            var x = parseFloat(JSONData[1].toString());

            console.log(req.body);

            var data = {
                address: {
                    building: req.body.building,
                    street: req.body.street,
                    coord:[x,y],
                    zipcode: req.body.zipcode
                    
                },
                borough: req.body.borough,
                cuisine: req.body.cuisine,
                grades: [
                    {
                        date: req.body.date,
                        grade: req.body.grade,
                        score: req.body.score
                    }
                ],
                name: req.body.name,
                restaurant_id: req.body.restaurant_id,
            }



            Restaurant.create(data, function (err, restaurant) {
                if (err)
                    res.send(err);

                res.json(data);
                //res.render('index', { title: 'Restaurant' , layout:'main.hbs'});
            });
        })


        // get a restaurants with _id
        app.get('/api/restaurants/:_id', function (req, res) {
            let id = req.params._id;
            Restaurant.findById(id, function (err, restaurant) {
                if (err)
                    res.send(err)

                res.json(restaurant);
            });

        });

        // update restaurant and send back restaurant name after updating
        app.put('/api/restaurants/:_id', function (req, res) {
            // create mongose method to update an existing record into collection
            console.log(req.body);

            let id = req.params._id;
            var data = {
                address: {
                    building: req.body.building,
                    coord: req.body.coord,
                    street: req.body.street,
                    zipcode: req.body.zipcode
                },
                borough: req.body.borough,
                cuisine: req.body.cuisine,
                grades: [
                    {
                        date: req.body.date,
                        grade: req.body.grade,
                        score: req.body.score
                    }
                ],
                name: req.body.name,
                restaurant_id: req.body.restaurant_id,
            }

            // save the Restaurant
            Restaurant.findByIdAndUpdate(id, data, function (err, restaurant) {
                if (err) throw err;

                res.send('Successfully! Restaurant updated - ' + restaurant.name);
            });
        });

        // delete a restaurant by id
        app.delete('/api/restaurants/:_id', function (req, res) {
            let id = req.params._id;
            console.log(id);
            Restaurant.remove({ _id: id }, function (err) {
                if (err)
                    res.send(err);
                else
                    res.send('Successfully! Restaurant has been Deleted.');
            });
        });

        app.get('/insertRestaurant', function (req, res) {
            res.render('insertRestaurant', { title: 'Enter Restaurant Details' , layout:'main.hbs'});
        });

        app.get('/updateRestaurant', function (req, res) {
            res.render('updateRestaurant', { title: 'Update Restaurant' , layout:'main.hbs'});
        });

        app.get('/deleteRestaurant', function (req, res) {
            res.render('deleteRestaurant', { title: 'Delete Restaurant' , layout:'main.hbs'});
        });


        app.listen(port, hostname);
        console.log("App listening on port : " + port);

    },
    err => console.log('Database connection error : ' + err)
);