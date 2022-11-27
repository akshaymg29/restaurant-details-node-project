var express  = require('express');

var path = require('path');
var mongoose = require('mongoose');
var app      = express();
const exphbs = require('express-handlebars');
var database = require('./config/database');
var bodyParser = require('body-parser');         // pull information from HTML POST (express4)
 
var port     = process.env.PORT || 8000;
app.use(bodyParser.urlencoded({'extended':'true'}));            // parse application/x-www-form-urlencoded
app.use(bodyParser.json());                                     // parse application/json
app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json

mongoose.connect(database.url);

var Book = require('./models/restaurant');


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
app.get('/', function(req, res) {
    res.render('index', { title: 'Restaurant' ,layout:'main.hbs'});
});


app.get('/getAllRestaurant', function(req, res) {
    res.render('getAllRestaurant', { title: 'Restaurant' ,layout:'main.hbs'});
});

app.listen(port);
console.log("App listening on port : " + port);