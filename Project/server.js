var express = require('express');
require('dotenv').config({path: __dirname+'/.env'});
var path = require('path');
var mongoose = require('mongoose');
var app = express();
const exphbs = require('express-handlebars');
var bodyParser = require('body-parser');         // pull information from HTML POST (express4)

var lodash = require('lodash');


let convert = require('convert-zip-to-gps');

const hostname = process.env.HOST;
const mongoConnectString = process.env.MONGO_CONNECT_STRING;
const dbName = process.env.DATABASE;

var port = process.env.PORT || 8000;
app.use(bodyParser.urlencoded({ 'extended': 'true' }));            // parse application/x-www-form-urlencoded
app.use(bodyParser.json());                                     // parse application/json
app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json

var isDBError = false;
mongoose.connect(mongoConnectString + dbName).then(
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

        async function paginatedResults(page, perPage, borough) {
            return await Restaurant.find()
                                .sort({restaurant_id : 'asc'})
                                .skip((page-1)*perPage)
                                .limit(perPage)
                                .exec();

        }   
        function getAllRestaurants(page, perPage, borough) { 
            let findBy = borough ? { borough } : {};
        
            if(+page && +perPage){
                return Restaurant.find(findBy).skip((page - 1) * +perPage).limit(+perPage).exec();
            }
            
            return Promise.reject(new Error('page and perPage query parameters must be valid numbers'));
        };
           

        app.get('/api/restaurants', function (req, res) {
            // use mongoose to get 0all restaurants in the database
            if((!req.query.page || !req.query.perPage)) 
                res.status(500).json({message: "Missing query parameters"})
            else {
                getAllRestaurants(req.query.page, req.query.perPage, req.query.borough)
                .then((data) => {
                    if(data.length === 0) res.status(204).json({message: "No data returned"});
                    else res.status(201).json(data);
                })
                .catch((err) => { res.status(500).json({error: err}) })
            }


        //     let findBy = req.query.borough ? { borough: req.query.borough } : {};

        // if(req.query.page && req.query.perPage){
        //     var result = Restaurant.find(findBy).sort({restaurant_id: +1}).skip((req.query.page - 1) * req.query.perPage).limit(req.query.perPage).exec();
        //     res.json(result);
        // }
            /*Restaurant.find({},{}, { skip: ((req.query.page-1)*req.query.perPage), limit: req.query.perPage }, function (err, restaurants) {
                // if there is an error retrieving, send the error otherwise send data
                if (err)
                    res.send(err)
                console.log(req.query.page);
                console.log(req.query.perPage);
                console.log(req.query.borough);
                // var rest = Restaurant.find()
                //             .skip((req.query.page-1)*req.query.perPage)
                //             .limit(req.query.perPage);
                //             //.sort()
                //             //.lean();
                //             console.log(rest);
                res.json(restaurants/*paginatedResults(req.query.page, req.query.perPage, req.query.borough)*///); // return all restaurants in JSON format
                /*res.render('getAllRestaurant', { 
                    title: 'Restaurant' , 
                    data:paginatedResults(req.query.page, req.query.perPage, req.query.borough), 
                    layout:'main.hbs'
                });*/
            /*}).sort(['restaurant_id', 1], function (err, restaurants) {
                // if there is an error retrieving, send the error otherwise send data
                if (err)
                    res.send(err)
                console.log(req.query.page);
                console.log(req.query.perPage);
                console.log(req.query.borough);
                // var rest = Restaurant.find()
                //             .skip((req.query.page-1)*req.query.perPage)
                //             .limit(req.query.perPage);
                //             //.sort()
                //             //.lean();
                //             console.log(rest);
                res.json(restaurants/*paginatedResults(req.query.)*//*);
        });*/
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

            Restaurant.create(data).then(
                ()=> {
                    res.json(data);
                },
                (err) => {
                    res.send(err);
                }
            );             
                //res.render('index', { title: 'Restaurant' , layout:'main.hbs'});
        });


        // get a restaurants with _id
        app.get('/api/restaurants/:_id', function (req, res) {

            Restaurant.findById(req.params._id).then(
                (restaurant)=> {
                    res.json(restaurant);
                },
                (err)=> {
                    res.send(err);
                }
            )
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
            Restaurant.findByIdAndUpdate(id, data).then(
                (restaurant) => {
                    res.send('Successfully! Restaurant updated - ' + restaurant.name);
                },
                (err) => {
                    res.send(err);
                }
            );
        });

        // delete a restaurant by id
        app.delete('/api/restaurants/:_id', function (req, res) {

            Restaurant.findByIdAndDelete(req.params._id).then(
                ()=> {
                    res.send('Successfully! Restaurant has been Deleted.')
                },
                (err)=> {
                    res.send(err);
                }
            )
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