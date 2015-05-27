"user strict";


//import modules
var compression = require('compression');
var path = require('path');
var express = require('express');
var useragent = require('express-useragent');
var allinc = require('express-all-inclusive');
var bodyParser = require('body-parser');


//temporary local module, move to lib once ready
var simplePostgres = require('./simple-postgres');
var sorated = require('./sorated');


simplePostgres.setUrl(process.env.DATABASE_URL || 
  'postgres://'+process.argv[2]+'@ec2-54-247-79-142.eu-west-1.compute.amazonaws.com:5432/dhpjorquuk3uk?ssl=true'
);


//variables
var app = express();
var localhost = process.env.PORT ? false : true; //heroku specific
var STATIC = {
  version: '0.0.3',
  OK: {status: 'OK'},
  fail: function(msg){
    return {status: 'ERROR', reason: msg};
  }
};

//express app options
app.set('port', (process.env.PORT || 5000));

//express middleware
app.use(useragent.express());

// compress all requests
app.use(compression());


//set correct header for all API calls
 app.use(function(req, res, next) {
  if ((req.path||'').indexOf('api/') > -1 ){
    res.setHeader('Content-Type', 'application/json; charset=utf-8');    
  }
  next();
});



/**
 * MIDDLEWARE CONFIG
 */
app.use(bodyParser.json({limit:1024*1024*1}));


/*
 * Subdomain Support
 *
 * app.?.com -> req._app = true
 * subdomain.?.com -> req._loc = true
 * combined:
 * subdomain.app.?.com -> _app & _loc are populated
 *
 * The req._loc parameter is used as key for setting and getting data, here it is defined
 */

//allowed subdomains
var subdomains = {
  'd' : 'Düsseldorf',
  'xn--dsseldorf-q9a' : 'Düsseldorf',
  'duesseldorf' : 'Düsseldorf'
};

app.use(function(req, res, next) {
  
  req._loc = 'www'; //default is www
  req._app = false; //do not load mobile app


  //console.log('_loc: ' + req._loc.toLowerCase(), req.subdomains);

  if (req.subdomains.length > 0){
    req._loc = req.subdomains[0];
  }

  //subdomain.app.?.com will also populate the _location
  if (req._loc === 'app'){
    req._app = true;
    if (req.subdomains.length > 1){
      req._loc = req.subdomains[1];
    }
  }


  //check subdomain against whitelist
  if (subdomains[req._loc.toLowerCase()]){
    req._loc = subdomains[req._loc.toLowerCase()];
  } else {
    req._loc = 'www';
  }
  
  //if we are on the original heroku domain or on localhost, use the default: timos
  if (req.hostname.indexOf('herokuapp.com') > 0 ){ 
    req._loc = 'Düsseldorf';
  }

  //req._debug = req.hostname === 'localhost';

  next();
});




/*████╗ ██████╗ ██╗
██╔══██╗██╔══██╗██║
███████║██████╔╝██║
██╔══██║██╔═══╝ ██║
██║  ██║██║     ██║
╚═╝  ╚═╝╚═╝     ╚*/

var rateSubscribe = sorated.RateLimit('subscribe', {max:{minute:3, hour: 10, day: 20}});


//API USER REGISTER
app.post('/api/subscribe', rateSubscribe, function(req, res) {
  res.send(STATIC.OK);
  simplePostgres.simpleInsert('subscriptions_staging', {
    email:  req.body.email || 'unknown',
    data: JSON.stringify(req.body) || '{}',
    user_agent: req.headers['user-agent'] || 'not available'
  });
});

//API FEEDBACK
app.post('/api/feedback', rateSubscribe, function(req, res) {
  res.send(STATIC.OK);
  simplePostgres.simpleInsert('feedback_staging', {
    email:  req.body.email || 'unknown',
    msg: req.body.msg || 'unknown',
    user_agent: req.headers['user-agent'] || 'not available'
  });
});


/*█████╗████████╗ █████╗ ████████╗██╗ ██████╗
██╔════╝╚══██╔══╝██╔══██╗╚══██╔══╝██║██╔════╝
███████╗   ██║   ███████║   ██║   ██║██║     
╚════██║   ██║   ██╔══██║   ██║   ██║██║     
███████║   ██║   ██║  ██║   ██║   ██║╚██████╗
╚══════╝   ╚═╝   ╚═╝  ╚═╝   ╚═╝   ╚═╝ ╚════*/


allinc.addFolder('mobile', {
  version: STATIC.version
});

allinc.addFolder('desktop', {
  version: STATIC.version
});



app.get('/', function(req, res) {
  if (!req.useragent.isMobile && !req._app){
    //static landing page
    allinc.desktop.serve(req, res, {});
  } else {
    //mobile app
    allinc.mobile.serve(req, res, {
      include: [
      '/mobile/libs/geolocator.js',
      '/mobile/libs/geo.js',
      '/mobile/libs/api.js',
      '/mobile/libs/ls.js',
      '/mobile/libs/riothelper.js',
      //custom
      '/mobile/tags/app.js',
      //reusable      
      //css
      '/mobile/css/normalize.css', 
      '/mobile/css/skeleton.css', 
      '/mobile/css/app.sass.css'
      ]
    });    
  }
 }); 





app.get('/mobile/tags/*', allinc.mobile.riot()); //support for riot tags
app.get('/mobile/*', allinc.mobile.serve());
app.get('/desktop/*', allinc.desktop.serve());

app.get('/cache.appcache', allinc.mobile.serve());


//static resources like img or js files
app.use(express.static('static')); 



app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'));
});


/*
 * Localhost Debugging
 */
if (localhost){
  allinc.watch(app.get('port') + 1);
}