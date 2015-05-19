


function Geo(){
  var geo = {};

  if (Number.prototype.toRadians === undefined) {
      Number.prototype.toRadians = function() { return this * Math.PI / 180; };
  }

  geo.distanceBetween = function(lat1, lon1, lat2, lon2){
    var R = 6371000; // metres
    var φ1 = lat1.toRadians();
    var φ2 = lat2.toRadians();
    var Δφ = (lat2-lat1).toRadians();
    var Δλ = (lon2-lon1).toRadians();

    var a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    var d = R * c;
    return Math.round(d*1.33); //ways seem longer
  }


  geo.getDuration = function(distance, walking){
    walking = typeof walking === 'undefined' ? true : walking;
    var minutes;
    if (walking){
      minutes = Math.ceil(distance/3600*60);
    } else {
      minutes = Math.ceil(distance/3600*15); //by car 4-times as fast

    }
    if (minutes < 60){
      return  minutes + ' min';
    } else {
      return  Math.floor(minutes/60) + ':' + 
              ('0' + (minutes % 60)).substr(-2) + 
              'h';
    }
  }

  geo.getReadableDistance = function(distance){
    if (distance <= 900){
      return Math.round(distance / 100) + '00m';
    } else {
      return Math.round(distance / 100)/10 + 'km';
    }
  }

  return geo;
}