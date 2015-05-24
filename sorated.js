
'use strict';

var sorated = {};


//Store hits per minute
var hits = {};

//each minute, clean up hits store
var cleanup = setInterval(function(){
  for (var x in hits){
    hits[x].minute = {};
    if (new Date().getMinutes() === 0){
      hits[x].minute = {};
    }
    if (new Date().getHours() === 0){
      hits[x].day = {};
    }    
  }
}, 1000*60);


/**
 * Very simple in-memory rate limiting
 *
 * options = {max: {minute: 10, hour: 100}}
 *
 */
sorated.RateLimit = function(key, options) {
  if (typeof hits[key] === 'undefined'){
    hits[key] = {
      minute: {},
      hour: {},
      day: {}
    };
  }

  return function rateLimit(req, res, next) {
    var ip = options.global ? 'global' : req.ip;
    var rejected = '';

    for (var prop in hits[key]){
      if (typeof hits[key][prop][ip] !== "number") {
        hits[key][prop][ip] = 0; 
      } else {
        hits[key][prop][ip]++;
      }  

      if (hits[key][prop][ip] >= options.max[prop] && !rejected) {
          // 429 status = Too Many Requests (RFC 6585)
          res.status(429).send('Too many requests, please try again later.');
          rejected = prop;
      }      
    }
    if (rejected){
      console.log('rejected because of: ' + rejected + ' via ' + ip);
    } else {
      next();
    }    
  };
};


module.exports = sorated;