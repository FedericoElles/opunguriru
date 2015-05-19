/**
 * Save Local Data
 */

function LS(prefix){
  var ls = {};

  prefix = prefix || '_';

  ls.get = function(key){
    var data = localStorage.getItem(prefix + '.' + key);
    if (data){
      return JSON.parse(data);
    } else {
      return false;
    }
  };

  ls.set = function(key, data){
    localStorage.setItem(prefix + '.' + key, JSON.stringify(data));
  }

  return ls;
}