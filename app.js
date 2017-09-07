require('dotenv').load();

// BASE SETUP
// =============================================================================
// Load the Cloudant library.
var Cloudant = require('cloudant');
var dbName = 'all';
var cloudant;
var db;

// call the packages we need
var express    = require('express');        // call express
var app        = express();                 // define our app using express
var bodyParser = require('body-parser');
var cfenv      = require('cfenv');

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


// var port = process.env.PORT || 8080;        // set our port
// var appEnv = cfenv.getAppEnv();
// load local VCAP configuration  and service credentials
var vcapLocal;
try {
  vcapLocal = require('./vcap.json');
  console.log("Loaded local VCAP", vcapLocal);
} catch (e) { console.log(e); }

var appEnvOpts = vcapLocal ? { vcap: vcapLocal} : {};
var appEnv = cfenv.getAppEnv(appEnvOpts);

if (appEnv.services['cloudantNoSQLDB']) {
  // Initialize database with credentials
  cloudant = Cloudant(appEnv.services['cloudantNoSQLDB'][0].credentials);
  db_all = cloudant.db.use(dbName);
}

else {
  var username = process.env.cloudant_username;
  var password = process.env.cloudant_password;
  cloudant = Cloudant({account:username, password:password});
  db_all = cloudant.db.use(dbName);
}


// ROUTES FOR OUR API
// =============================================================================
var router = express.Router();              // get an instance of the express Router

// middleware to use for all requests
router.use(function(req, res, next) {
    // do logging
    console.log('Something is happening.');
    next(); // make sure we go to the next routes and don't stop here
});

// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.get('/', function(req, res) {
  res.json({ message: 'hooray! welcome to our api!' });
});

// Messy, duplicate code but w/e
router.get('/all', function(req, res) {
  db_all.get('all', function(err, result) {
    if (err) {
      console.log(err);
    }

    else {
      res.json({'res': result['contents']});
    }
  });
});

router.get('/hh', function(err, res) {
  db_all.get('hh', function(err, result) {
    if (err) {
      console.log(err);
    }

    else {
      res.json({'res': result['contents']});
    }
  });
});

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/api/0.1/', router);



var appEnv = cfenv.getAppEnv();
// START THE SERVER
// =============================================================================
app.listen(appEnv.port, function() {
  // console.log("server starting on " + appEnv.url)
  console.log('Magic happens on port ' + appEnv.port);
});
