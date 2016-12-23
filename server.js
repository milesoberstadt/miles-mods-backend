var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var mongodb = require('mongodb');
var ObjectID = mongodb.ObjectID;

var BLOG_COLLECTION = 'blog';

var app = express();
// Not sure if I'll host anything in public, but the route's there
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());

// Load our config, not available in the repo...
var config = require('./config.js');

// Create a database variable outside of the database connection callback to reuse the connection pool in your app.
var db;

// Connect to the database before starting the server
mongodb.MongoClient.connect(config.MONGODB_URI, function(err, database){
    if (err){
        console.log(err);
        process.exit(1);
    }

    // Save the database object from the callback
    db = database;
    console.log("Database connection ready");

    // Start the app...
    var server = app.listen(config.PORT || 4000, function(){
        var port = server.address().port;
        console.log('App now running on port ', port);
    });
});

// Allow us some CORS
app.use(function(req, res, next){
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Header", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

// Make a default route for testing...
app.get('/', function(req, res){
    res.send('App is running');
});

// Generic error handler userd by all endpoints
function handleError(res, reason, message, code){
    console.log("ERROR: "+reason);
    res.status(code || 500).json({'error':message});
}

app.get('/blogs', function(req, res){
    db.collection(BLOG_COLLECTION).find({}).toArray(function (err, docs){
        if (err)
            handleError(res, err.message, 'Failed to get blog posts.');
        else
            res.status(200).json(docs);
    })
});