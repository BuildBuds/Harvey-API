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
var cors       = require('cors');

// Cache me out bih
// TODO update routinely to check for updated db
var allData;
var hhData;
var hiData;

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var whitelist = ['http://give.mybluemix.net', 'https://give.mybluemix.net', 'http://localhost:8080', 'http://localhost:3000'];
var corsOptions = {
  origin: function (ori, callback) {
    if (whitelist.indexOf(ori) !== -1) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  }
}

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
router.get('/', cors(corsOptions), function(req, res) {
  res.json({ message: 'hooray! welcome to our api!' });
});

// Messy, duplicate code but w/e
router.get('/all', cors(corsOptions), function(req, res) {
  if (allData !== undefined) { res.json({'res': allData}); }

  else {
    db_all.get('all', function(err, result) {
      if (err) {
        console.log(err);
      }

      else {
        allData = result['content'];
        res.json({'res': result['content']});
      }
    });
  }
});

router.get('/hh', cors(corsOptions), function(err, res) {
  if (hhData !== undefined) { res.json({'res': hhData}); }

  else {
    db_all.get('hh', function(err, result) {
      if (err) {
        console.log(err);
      }

      else {
        hhData = result['content'];
        res.json({'res': result['content']});
      }
    });
  }
});

router.get('/hi', cors(corsOptions), function(err, res) {
  if (hiData !== undefined) { res.json({'res': hiData}); }

  else {
    db_all.get('hi', function(err, result) {
      if (err) {
        console.log(err);
      }

      else {
        hiData = result['content'];
        res.json({'res': result['content']});
      }
    });
  }
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
