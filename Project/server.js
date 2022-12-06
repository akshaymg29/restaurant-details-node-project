var express = require('express');
require('dotenv').config({path: __dirname+'/.env'});
var path = require('path');
var mongoose = require('mongoose');
var app = express();
const jwt=require('jsonwebtoken');
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
mongoose.set('strictQuery', true);
mongoose.connect(mongoConnectString + dbName).then(
    () => {


        var Restaurant = require('./models/restaurant');


        //HandleBar 
        //------------------------------------------------------

        app.use(express.static(path.join(__dirname, 'public')));

        app.engine('.hbs', exphbs.engine({ extname:'.hbs' }));
        //custom handlebar
        //const HBS = exphbs.create({
        //});

        //app.engine('.hbs', exphbs.engine({ extname: '.hbs' }));
        // app.engine('.hbs', exphbs.engine({
        //     extname: '.hbs',
        //     defaultLayout: 'main'
        // }));
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
        
            if(page && perPage){
                return Restaurant.find(findBy).lean().skip((page - 1) * +perPage).limit(+perPage).exec();
            }
            
            return Promise.reject(new Error('page and perPage query parameters must be valid numbers'));
        };
           

         app.get('/api/restaurants', async function (req, res) {
             // use mongoose to get all restaurants in the database
             if((!req.query.page || !req.query.perPage)) 
                res.status(400).json({message: "Missing query parameters"})
             else {
                await getAllRestaurants(req.query.page, req.query.perPage, req.query.borough)
                 .then((data) => {
                     if(data.length === 0)
                        res.status(204).json({message: "No data returned"});
                     else 
                        res.status(200).render('getAllRestaurant', { title: 'ALL Restaurant', data:data, layout:'main1.hbs'});
                 })
                 .catch((err) => { res.status(500).json({error: err}) })
          }
    });

        app.post('/api/restaurants', verifyToken, function (req, res) {
            // create mongose method to create a new record into collection
            jwt.verify(req.token, process.env.SECRETKEY, (err, decoded) => {
                if (err)
                    res.sendStatus(403)
                else {
                    let zip = req.body.zipcode;

                    let zip1 = convert.zipConvert(zip)

                    var JSONData = zip1.replace('[' ,'').replace(']','').split(',').map(x => x.trim())
                    
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
                            res.status(201).json(data);
                        },
                        (err) => {
                            res.status(500).send(err);
                        }
                    );
                }
            });           
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
        app.put('/api/restaurants/:_id', verifyToken, function (req, res) {
            // create mongose method to update an existing record into collection
            
            jwt.verify(req.token, process.env.SECRETKEY, (err, decoded) => {
                if (err)
                    res.sendStatus(403)
                else {
                    let zip = req.body.zipcode;

                    let zip1 = convert.zipConvert(zip)

                    var JSONData = zip1.replace('[' ,'').replace(']','').split(',').map(x => x.trim())
                    
                    console.log(JSONData.toString());
                    var y = parseFloat(JSONData[0].toString());
                    var x = parseFloat(JSONData[1].toString());

                    console.log(req.body);

                    let id = req.params._id;
                    var data = {
                        address: {
                            building: req.body.building,
                            coord:[x,y],
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
                            //res.render('updateRestaurant',{Restaurant:restaurant});

                        res.status(201).send('Restaurant updated successfully for ' + restaurant.name);
                        },
                        (err) => {
                            res.send(err);
                        }
                    );
                }
            });
        });

        // delete a restaurant by id
        app.delete('/api/restaurants/:_id', verifyToken, function (req, res) {

            jwt.verify(req.token, process.env.SECRETKEY, (err, decoded)=> {
                if (err)
                    res.sendStatus(403)
                else{
                    console.log(decoded)
                    console.log(req.params._id);

                    Restaurant.findByIdAndDelete(req.params._id).then(
                        ()=> {
                            res.status(204).send('Successfully! Restaurant has been Deleted.')
                        },
                        (err)=> {
                            res.status(500).send("Id not found hence not able to delete");
                        }
                    );
                }
            });
        });



        app.get('/insertRestaurant', function (req, res) {
            res.render('insertRestaurant', { title: 'Enter Restaurant Details' , layout:'main.hbs'});
        });

        app.get('/updateRestaurant', function (req, res) {
            res.render('updateRestaurant', { title: 'Update Restaurant' , layout:'main.hbs'});
        });

        app.get('/deleteRestaurant/:_id', function (req, res) {
            res.render('deleteRestaurant', { title: 'Delete Restaurant', data:req.params._id , layout:'main.hbs'});
            //res.redirect('/api/restaurants/:_id')
        });

        app.get('/login', function (req, res) {
            res.render('login', { title: 'Login Details' , layout:'main.hbs'});
        });

        app.post('/api/login', (req,res)=>{
            console.log(req)
            //Authenticated Userconst 
            username = req.body.username
            if(username===process.env.USER && req.body.password === process.env.PASS) {
                const user = { name : username , 
                    iss : 'Akshay&Dhruv'}
                const accessToken = jwt.sign(user, process.env.SECRETKEY)
                res.json({ accessToken : accessToken})
            }
            else {
                res.status(500).send("Error in username and password");
            }
        })

        function verifyToken(req,res,next){
            const bearerHeadr = req.headers['authorization']
            if(typeof bearerHeadr != 'undefined'){
                const bearer = bearerHeadr.split(' ')
                const bearerToken = bearer[1]
                req.token = bearerToken
                next()
            }
        }
        
        app.get('/posts',verifyToken,(req,res) =>{
            jwt.verify(req.token, process.env.SECRETKEY, (err, decoded)=> {
                if (err)
                    res.sendStatus(403)
                else{
                    console.log(decoded)
                    res.send("Successful")
                }
            });
        })


        app.all('*', function(req, res){
            res.send('Page not found', 404);
          });

        app.listen(port, hostname);
        console.log("App listening on port : " + port);

    },
    err => console.log('Database connection error : ' + err)
);