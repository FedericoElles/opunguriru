/**
 * Backend Connection
 */

function Api(ls){
  var api = {};

  api.fetchJSON = function(endpoint, cb){
    //check if cached version available
    var lsKey = 'api.' + endpoint;
    var suffix = '';

    //if cached version available, add version as suffix
    var data = ls.get(lsKey);
    data.status = 'cached';
    if (data){
      suffix = '?version='+data.version;
    }

    //if update available, it will be received, otherwise an empty answer


    var xhr = new XMLHttpRequest()  
    xhr.timeout = data ? 3000 : 10000;
    xhr.open('GET', '/api/' + endpoint + suffix);
    xhr.onload = function () {
      
      var json = JSON.parse(xhr.responseText);
      if (json.status==='update'){
        console.log('api: ' + endpoint + ' loaded & updating cache');
        ls.set(lsKey, json);
        cb(json);
      }

      if (json.status==='uptodate'){
        console.log('api: ' + endpoint + ' is up-to-date already');
        cb(data);
      }
      
    }
    xhr.ontimeout = function () { 
      console.log('api: ' + endpoint + ' not reached');
      if (data){
        data.status= 'timeout - cached'
        cb(data);  
      } else {
        cb({
          status:'error'
        });
      }
      
    }
    xhr.send();
    //TODO, if an error occurs or offline, send cached version if available
  };

  return api;
}