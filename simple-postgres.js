var pg = require('pg');
var Q = require("q");

var POSTGRESQL = {};

var simplePostgres = {};

var STATIC = {
  OK: {status: 'OK'},
  fail: function(msg){
    return {status: 'ERROR', reason: msg};
  }
};

function isUndef(obj){
  return typeof obj === 'undefined';
}


simplePostgres.setUrl = function(url){
  POSTGRESQL.url = url;
}

simplePostgres.getUrl = function(url){
  return POSTGRESQL.url;
}


/**
 * Returning promises
 */

simplePostgres.promiseQuery = function(sql, params){
  var deferred = Q.defer();
  pg.connect(POSTGRESQL.url, function(err, client, done) {
    if (err){
      deferred.reject(err);
    }
    client.query(sql, params || [], function(err, result) {
      done();
      if (err){
        deferred.reject(err);
      } else {
        deferred.resolve(result.rows);
      }
    });
  });
  return deferred.promise;
}


/** 
 * Processing including response
 */

simplePostgres.simpleQuery = function(res, sql, params){
  this.promiseQuery(sql, params).then(function(data){
    res.send(data);
  }).fail(function(err){
    res.send(STATIC.fail(err))
  });
}


simplePostgres.simpleInsert = function(table, obj){
  var fields = [], values = [], params = [], i = 0 ;
  for (var x in obj){
    fields.push(x);
    values.push('$' + (++i));
    params.push(obj[x]);
  }
  var sql = 'INSERT INTO '+table+'('+fields.join(',')+') VALUES('+values.join(',')+')';

  this.promiseQuery(sql, params).then(function(data){
  }).fail(function(err){
    console.error('simplePostgres.simpleInsert', err);
  }); 
}


simplePostgres.simpleExec = function(proc, parray){
  var values = [], params = [], i = 0 ;
  parray.forEach(function(x){
    values.push('$' + (++i));
    params.push(x);
  });
  var sql = 'SELECT '+proc+'('+values.join(',')+')';

  this.promiseQuery(sql, params).then(function(data){
  }).fail(function(err){
    console.error('simplePostgres.simpleExec', err);
  });
}


simplePostgres.simpleUpdate = function(table, updates, wheres, suffix){
  var updateStats = [],
      wheresStats = [],
      params = [],
      i = 0,
      sql,
      x;

  for (x in updates){
    updateStats.push(x + ' = '+ '$' + (++i));
    params.push(updates[x]);
  }

  for (x in wheres){
    wheresStats.push(x + ' = ' + '$' + (++i));
    params.push(wheres[x]);
  }

  sql = 'UPDATE ' + table + ' SET ' + updateStats.join(',') + ' WHERE ' + 
        wheresStats.join(' AND ') + ' ' + suffix;

  this.promiseQuery(sql, params).then(function(data){
  }).fail(function(err){
    console.error('simplePostgres.simpleExec', err);
  }); 

  return 'OK';
}

module.exports = simplePostgres;