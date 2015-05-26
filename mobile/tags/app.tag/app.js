  var self = this
  self.riotver = riot.version;
  self.page = 'main';

  self.info = {};

  //let the UI know which features are available already
  self.features = {
    gps:  {available: true, ready: false},
    data: {available: true, ready: false},
  };

 

  //LOAD MODULES
  var geo = new Geo();
  var ls = new LS('opengrill');
  var api = new Api(ls);
  var helper = new RiotHelper();
  



  //load data from server
  fetchData() {
    api.fetchJSON('data', function(json){
      self.data = json
      self.features.data.ready = true;
      updateSelf();
    });

  }

  function updateRecord(rec, lat, lng){
    if (typeof lat === 'undefined' && 
        typeof lng === 'undefined' && 
        typeof rec.coordinates === 'object'){
      lat = lat || rec.coordinates.lat;
      lng = lng || rec.coordinates.lng;
    }
    if (self.features.gps.ready && lat && lng){
      //used for sort
      rec.distance = geo.distanceBetween(
        self.location.coords.latitude, self.location.coords.longitude,
        lat, lng);
      //used for displaying results
      var walking = rec.distance <= self.defaults.maxWalkingDistance;
      rec.calc = {
        walking: walking, 
        duration: geo.getDuration(rec.distance, walking),
        distance: geo.getReadableDistance(rec.distance),
        srcShowMap: 'https://maps.googleapis.com/maps/api/staticmap?center='+rec.coordinates+'&markers=color:red%7Clabel:%7C'+rec.coordinates+'&zoom=16&size='+self.info.width+'x300&scale=2',
        srcNaviMap: 'https://maps.googleapis.com/maps/api/staticmap?markers=color:red%7Clabel:%7C'+rec.coordinates+'&markers=color:blue%7Clabel:P%7C'+self.info.coordinates+'&size='+self.info.width+'x300&scale=2'
      };
    }
    rec.temp = {};
  }



  function sortByKey(array, key) {
      return array.sort(function(a, b) {
          var x = a[key]; var y = b[key];
          return ((x < y) ? -1 : ((x > y) ? 1 : 0));
      });
  }


  function addWalkingHeaderFlags(records){
    if (self.features.gps.available){
      //mark first record with walking = true / false
      [true, false].forEach(function(walkingStatus){
        for (var i = 0, ii = records.length; i<ii; i+=1){
          if (records[i].calc && records[i].calc.walking === walkingStatus){
            records[i].calc[walkingStatus + 'Walking'] = true;
            //console.log('firstWalking', walkingStatus, self.currentRecs[i]);
            break;
          }
        }
      });
    }
  }


  /**
   * Whenever any new data arrives or a route is changed.
   * update the internal variables accordingly
   */
  function updateSelf(arguments){
    arguments = arguments || 
                (window.location.href.split('#')[1] || '').split('/');

    /* detecting parameters
       Example:
       Route = fk.list_cat_subcat/1/12
       params = cat:1
                subcat:12
    */
    self.params = {};
    if (arguments && arguments.length > 1){
      var names = arguments[0].split('_');
      if (names.length ===  arguments.length){
        for (var i = 1; i < arguments.length; i++){
          self.params[names[i]] = arguments[i];
        }
      }
    }

    

    switch (arguments[0]){
      case 'route1':
        //do something on route 1
        break;
      case 'route2':
        if (self.params.id){
          //do something with route 2 and parameter id
        }      
        break;
    }

    console.log('route', arguments, self.params);
    self.page = arguments[0] || 'main';
    self.update();
    document.body.scrollTop = 0;
  }

  /*
   * Routing
   */
  riot.route(function(example) {
    updateSelf.call(null, arguments);
  });

  updateSelf();

  function onGeoSuccess(location) {
      console.log('GPS OK');
      self.features.gps.available = true;
      self.features.gps.ready = true;
      self.location = location;
      onLocationAvailable(); //notify notification settings about change
      self.update();
      console.log(location);

      //test distabce
      //console.log(geo.distanceBetween(location.coords.latitude, location.coords.longitude, location.coords.latitude+1, location.coords.longitude+1));
      self.info.coordinates = location.coords.latitude + ',' + location.coords.longitude;
  }
  //The callback function executed when the location could not be fetched.
  function onGeoError(error) {
      console.log(error);
      self.features.gps.available = false;
      self.update();
  }

  //geolocator.locateByIP(onGeoSuccess, onGeoError, 2, 'map-canvas');
  var html5Options = { enableHighAccuracy: true, timeout: 60000, maximumAge: 0 };
  function updateGeo(){
    geolocator.locate(onGeoSuccess, onGeoError, false, html5Options, null);
  }
  window.onfocus = function(){  
    updateGeo(); //console.log('focused');
  }
  updateGeo();



  //notifications
  self.nf = {
    available: false,
    newLocation: false
  };

  //load settings on app start
  var notificationSettings = ls.get('nf');
  if (notificationSettings) {
    self.nf.available = true;
    helper.obj2tags(self, 'nf', notificationSettings);
    console.log('nf', notificationSettings);
  }



  self.updateLocation = function(){
    self.nf_locationText.value = self.location.formattedAddress;
    self.nf_numLocationLat.value = self.location.coords.latitude;
    self.nf_numLocationLng.value = self.location.coords.longitude;
    self.nf.newLocation  = false;
  }

  //if location gets available
  function onLocationAvailable(){
    if (!self.nf_locationText.value){
      self.updateLocation();
    } else {
      if (self.nf_locationText.value !== self.location.formattedAddress){
        self.nf.newLocation  = true;
      }
    }
  }

  //update/ save button
  self.updateNotifications = function(){
    var json = helper.tags2obj(self, 'nf');
    ls.set('nf', json);
    self.nf.available = true;
    console.log('Submitting JSON', json);
    api.postJSON('subscribe', json, function(data){
      console.log('result', data);
    })
  }