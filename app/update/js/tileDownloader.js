
// Access Local Filesystems
window.webkitRequestFileSystem(window.TEMPORARY, 1024*1024, SaveDatFileBro);
window.webkitRequestFileSystem(window.PERSISTENT , 1024*1024, SaveDatFileBro);
// Asking the user for permission to store permanently
navigator.webkitPersistentStorage.requestQuota(1024*1024, function() {
 &nbsp;window.webkitRequestFileSystem(window.PERSISTENT , 1024*1024, SaveDatFileBro);
})

function SaveDatFileBro(localstorage) {
  
  /*
  localstorage.root.getFile("info.txt", {create: true});
  localstorage.root.getFile("info.txt", {create: false}, function(DatFile) { DatFile.remove(function() {}); })
  localstorage.root.getDirectory("demo", {create: true}, function() {});
  localstorage.root.getFile("/demo/info.txt", {create: true});
  */
  localstorage.root.getFile("info.txt", {create: true}, function(DatFile) {
    DatFile.createWriter(function(DatContent) {
      var blob = new Blob(["Lorem Ipsum"], {type: "text/plain"});
      DatContent.write(blob);
    });
  });
  
  localstorage.root.getFile("info.txt", {}, function(DatFile) {
    localstorage.root.getDirectory("demo/", {}, function(DatFolder) {
      datei.moveTo(DatFolder);
    });
  });
  
  localstorage.root.getFile("info.txt", {}, function(DatFile) {
    datei.moveTo(localstorage.root, "new.txt");
  });
}

// Accessing Files from the Browser
filesystem:http://www.example.com/persistent/info.txt
filesystem:http://www.example.com/temporary/info.txt

/*
var tile_first = ctile(bounds.left,bounds.top,zoom);       
var tile_last = ctile(bounds.right,bounds.bottom,zoom); 

ctile = function(x,y,zoom) {       
  var tile = {} 
  x = (1 + (x * Math.PI / 180)/ Math.PI)/2;         
  tile.x = Math.floor(x*Math.pow(2,zoom)); //klopt             
  tile.y = Math.floor((1-Math.log(Math.tan(y*Math.PI/180) + 1/Math.cos(y*Math.PI/180))/Math.PI)/2 *Math.pow(2,zoom)); 
  tile.path = zoom + '/'+ tile.x + '/'+ tile.y +'.png'; 
  return tile; 
} 

// And loop to create an array with all tiles 
var tiles = []; 
var x= tile_first.x; 
var y= tile_first.y; 

for(x;x <= tile_last.x;x++) { 
  y = tile_first.y; 
  tiles.push({'x':x,'y':y,'path': zoom + '/'+ x + '/'+ y +'.png'}) 
  for(y++;y <= tile_last.y;y++) { 
    tiles.push({'x':x,'y':y,'path': zoom + '/'+ x + '/'+ y +'.png'}) 
  }         
} 
*/