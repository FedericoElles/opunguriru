function RiotHelper(){
  riothelper = {};

  riothelper.tags2obj =  function(self, prefix){
    var obj = {};
    var name;
    var value;
    var tag;
    for (x in self){
      if (x.substr(0, prefix.length) === prefix){
        name = x.substr(prefix.length+1);
        tag = self[x];

        switch (tag.type){
          case 'checkbox':
            value = tag.checked;
            break;
          default:
            value = tag.value;
        }

        if (name.substr(0,3) === 'num'){
          value = parseFloat(value, 10);
        }    

        obj[name]  = value;
      }
    }
    return obj;
  }


  riothelper.obj2tags = function(self, prefix, obj){
    var name;
    var value;
    var tag;
    for (x in obj){
      name = prefix + '_' + x;
      tag = self[name];

      if (tag){
        switch (tag.type){
          case 'checkbox':
            tag.checked = obj[x];
            break;
          default:
            tag.value = obj[x];
        }
      }
    }
    self.update();
  }


  return riothelper;
}