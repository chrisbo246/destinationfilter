/*old-jslint indent: 2, unparam: true, plusplus: true */
/*jslint devel: true, browser: true, node: false */
/*global $, ol */
/*global changeInteraction */
/*global convolve */
/*global countryCodesISO2, countriesDatas*/
/*global displayCountryInfo */
/*global displayCountryFeatureInfo */
/*global getCenterWithHeading */
/*global normalize */
/*global onMoveEnd */
/*global Progress */
/*global radToDeg */
/*global setResetBrightnessButtonHTML */
/*global setResetContrastButtonHTML */
/*global setResetHueButtonHTML */
/*global setResetSaturationButtonHTML */
/*global timezonesStyleFunction */
'use strict';

/**
 * www.destinationfilter.tk 0.7.0
 * https://github.com/christopheboisier/DestinationFinder/
 * MIT licensed
 * @author Christophe BOISIER
 *
 * Copyright (C) 2015 Christophe BOISIER
 */

/*
$el = $('#layer-select');
document.getElementById('mouse-position');
var decreaseBrightness = document.getElementById('decrease-brightness');
var flagElement = document.getElementById('country-flag');
var geolocateBtn = document.getElementById('geolocate');
var increaseBrightness = document.getElementById('increase-brightness');
var info = document.getElementById('no-webgl'); //$('#info') document.getElementById('no-download')
var mapElement = document.getElementById('country-name');
var markerEl = document.getElementById('geolocation_marker');
var nameElement = document.getElementById('country-name');
var precisionInput = document.getElementById('precision');
var projectionSelect = new ol.dom.Input(document.getElementById('projection'));
var resetBrightness = document.getElementById('reset-brightness');
var resetContrast = document.getElementById('reset-contrast');
var resetHue = document.getElementById('reset-hue');
var resetSaturation = document.getElementById('reset-saturation');
var select = document.getElementById('kernel'); // null
var selectElement = document.getElementById('action_type');
var simulateBtn = document.getElementById('simulate');
var unitsSelect = new ol.dom.Input(document.getElementById('units'));
*/

/*
var coordinates, //simulationData
  d3,
  features, //topojson.feature   []
  geolocation, //new ol.Geolocation(
  gridSource, //new ol.source.TileUTFGrid({
  highlight,
  countryFeatureOverlay,  //new ol.FeatureOverlay({
  infoOverlay, //new ol.Overlay({
  layer, //map.getLayers().getArray()[0]  new ol.layer.Image({
  map, //new ol.Map({
  positions, //new ol.geom.LineString(
  prevDate, //first.timestamp
  selectClick, //new ol.interaction.Select({
  selectPointerMove, //new ol.interaction.Select({
  selectSingleClick, //new ol.interaction.Select()
  view, //new ol.View({  frameState.viewState
  // Elements
  flagElement, //document.getElementById('country-flag')
  geolocateBtn, //document.getElementById('geolocate')
  info, //$('#info') document.getElementById('no-webgl') document.getElementById('no-download')
  markerEl, //document.getElementById('geolocation_marker')
  mapElement, //document.getElementById('map')
  nameElement, //document.getElementById('map') document.getElementById('country-name')
  resetBrightness, //document.getElementById('reset-brightness')
  resetContrast, //document.getElementById('reset-contrast')
  resetHue, //document.getElementById('reset-hue')
  resetSaturation, //document.getElementById('reset-saturation')
  select, //document.getElementById('kernel')  null
  selectElement, //document.getElementById('action_type')
  simulateBtn; //document.getElementById('simulate')
*/

console.time('mapController.js script loaded');


/*var infoProjection = 'EPSG:4326';
var $el = $('#info-projection');
if ($el) {
  $el.on('change', function (e) {
    infoProjection = $el.val();
  });
}*/

// "EPSG:3857" Spherical Mercator used by Google Maps, OpenStreetMap, Bing; unit is meter (see http://epsg.io/3857)
// "EPSG:4326" World Geodetic System used in GPS; unit is longitude, latitude (see http://epsg.io/4326)
var projection = ol.proj.get('EPSG:3857'); // EPSG:3857 EPSG:4326
//var projection = view.getProjection()

//var extent = [0, 0, 180, 85];
//var extent = ol.proj.transformExtent([-180, -85, 180, 85], 'EPSG:4326', 'EPSG:3857');
//var extent = ol.proj.transformExtent([-180, -45, 180, 80], 'EPSG:4326', 'EPSG:3857');
//var extent = ol.proj.transformExtent([0, 70, 23, 38], 'EPSG:4326', 'EPSG:3857');
var extent = projection.getExtent();

//var center =  ol.proj.transform([6.4090530, 46.0780249], 'EPSG:4326', 'EPSG:3857');
var center = ol.extent.getCenter(extent);

var view = new ol.View({
    center: center,
    projection: projection,
    extent: extent,
    zoom: 0,
    /*minZoom: 4,
    maxZoom: 16*/
    maxResolution: 39135.76
        //resolutions: [65536, 32768, 16384, 8192, 4096, 2048],
        //resolutions: [9784, 2446, 1223, 76.44, 9.55, 2.39]
});

var geolocation = new ol.Geolocation( /** @type {olx.GeolocationOptions} */ ({
    projection: view.getProjection(),
    trackingOptions: {
        maximumAge: 10000,
        enableHighAccuracy: true,
        timeout: 600000
    }
}));

// ISO3 to ISO2 country codes conversion
if (countriesDatas) {
    $.each(countriesDatas, function (id, country) {
        countryCodesISO2[country.ISO3] = country.ISO;
    });
} else {
    console.warn('countriesDatas variable is not defined');   
}



// Features ________________________________________________________________________________________

// accuracy
var accuracyFeature = new ol.Feature();
accuracyFeature.bindTo('geometry', geolocation, 'accuracyGeometry');

// position
var positionFeature = new ol.Feature();
positionFeature.bindTo('geometry', geolocation, 'position')
    .transform(function () {}, function (coordinates) {
        return coordinates ? new ol.geom.Point(coordinates) : null;
    });

positionFeature.setStyle(new ol.style.Style({
    image: new ol.style.Circle({
        radius: 6,
        fill: new ol.style.Fill({
            color: '#3399CC'
        }),
        stroke: new ol.style.Stroke({
            color: '#fff',
            width: 2
        })
    })
}));



// Styles __________________________________________________________________________________________

var vectorLayerStyle = new ol.style.Style({
    fill: new ol.style.Fill({
        color: 'rgba(255, 255, 255, 0.6)'
    }),
    stroke: new ol.style.Stroke({
        color: '#319FD3',
        width: 1
    }),
    text: new ol.style.Text({
        font: '12px Calibri,sans-serif',
        fill: new ol.style.Fill({
            color: '#000'
        }),
        stroke: new ol.style.Stroke({
            color: '#fff',
            width: 3
        })
    })
});

var styles = [vectorLayerStyle];



/**
 * kml-timezones
 */

//var timezonesStyleFunction = function (feature, resolution) {
var timezonesStyleFunction = function () {
    var offset = 0,
        name = feature.get('name'), // e.g. GMT -08:30
        match = name.match(/([\-+]\d{2}):(\d{2})$/),
        date = new Date(),
        local,
        delta,
        opacity,
        hours,
        minutes;

    if (match) {
        hours = parseInt(match[1], 10);
        minutes = parseInt(match[2], 10);
        offset = 60 * hours + minutes;
    }

    local = new Date(date.getTime() + (date.getTimezoneOffset() + offset) * 60000);

    delta = Math.abs(12 - local.getHours() + (local.getMinutes() / 60));
    // offset from local noon (in hours)
    if (delta > 12) {
        delta = 24 - delta;
    }

    opacity = 0.75 * (1 - delta / 12);

    return [new ol.style.Style({
        fill: new ol.style.Fill({
            color: [0xff, 0xff, 0x33, opacity]
        }),
        stroke: new ol.style.Stroke({
            color: '#ffffff'
        })
    })];

};

var scoreStyleFunction = function (feature, resolution) {

    var opacity,
        score,
        id;

    score = 0;
    id = feature.getId();
    if (countryCodesISO2[id]) {
        id = countryCodesISO2[id].toLowerCase();
        if (countriesDatas && countriesDatas[id]) {
            score = countriesDatas[id].percent;
            //score = countriesDatas[id].score / countriesDatas[id].scoreMax * 100;
        }
    }

    opacity = (score / 100) * 0.8;
    //opacity = (1 - score / 100) * 0.8;

    //vectorLayerStyle.getText().setText(resolution < 5000 ? feature.get('name') + '\n' + score.toFixed() + '%' : '');

    var style = new ol.style.Style({
        fill: new ol.style.Fill({
            color: [0x33, 0xff, 0x00, opacity || 0]
                //color: [0xff, 0x33, 0x00, opacity]
        }),
        /*stroke: new ol.style.Stroke({
          color: '#3f0',
          width: 1
        }),*/
        text: new ol.style.Text({
            font: '1.25em bold Calibri,sans-serif',
            fill: new ol.style.Fill({
                color: '#000'
            }),
            stroke: new ol.style.Stroke({
                color: 'rgba(255,255,255,.5)',
                width: 3
            })
        })
    });

    if (score > 0) {
        style.getText().setText(resolution > 300 ? score.toFixed() + '%' : '');
    }

    return [style];
}



var overpassStyles = {
    'amenity': {
        'parking': [
            new ol.style.Style({
                stroke: new ol.style.Stroke({
                    color: 'rgba(170, 170, 170, 1.0)',
                    width: 1
                }),
                fill: new ol.style.Fill({
                    color: 'rgba(170, 170, 170, 0.3)'
                })
            })
        ]
    },
    'building': {
        '.*': [
            new ol.style.Style({
                zIndex: 100,
                stroke: new ol.style.Stroke({
                    color: 'rgba(246, 99, 79, 1.0)',
                    width: 1
                }),
                fill: new ol.style.Fill({
                    color: 'rgba(246, 99, 79, 0.3)'
                })
            })
        ]
    },
    'highway': {
        'service': [
            new ol.style.Style({
                stroke: new ol.style.Stroke({
                    color: 'rgba(255, 255, 255, 1.0)',
                    width: 2
                })
            })
        ],
        '.*': [
            new ol.style.Style({
                stroke: new ol.style.Stroke({
                    color: 'rgba(255, 255, 255, 1.0)',
                    width: 3
                })
            })
        ]
    },
    'landuse': {
        'forest|grass|allotments': [
            new ol.style.Style({
                stroke: new ol.style.Stroke({
                    color: 'rgba(140, 208, 95, 1.0)',
                    width: 1
                }),
                fill: new ol.style.Fill({
                    color: 'rgba(140, 208, 95, 0.3)'
                })
            })
        ]
    },
    'natural': {
        'tree': [
            new ol.style.Style({
                image: new ol.style.Circle({
                    radius: 2,
                    fill: new ol.style.Fill({
                        color: 'rgba(140, 208, 95, 1.0)'
                    }),
                    stroke: null
                })
            })
        ]
    }
};



// Functions _______________________________________________________________________________________

var svgToImage = function (src, width, height) {
    var canvas = $('<canvas/>')[0],
        context,
        svgImage = new Image(),
        image = new Image();

    canvas.height = height;
    canvas.width = width;

    context = canvas.getContext('2d');

    svgImage.src = src;
    context.drawImage(svgImage, 0, 0, width, height);
    image.src = canvas.toDataURL();
    return image;
}



/**
 * geolocation-orientation
 */

// convert degrees to radians
function degToRad(deg) {
    return deg * Math.PI * 2 / 360;
}


/**
 * Reverse geocoding using openstreetmap nominative service
 */

function updateUserAddress(lon, lat) {
    console.time(updateUserAddress.name + ' function executed');

    var position = geolocation.getPosition();
    if (position) {
        position = ol.proj.transform(position, 'EPSG:3857', 'EPSG:4326');
        var url = 'http://nominatim.openstreetmap.org/reverse?format=xml&lon=' + position[0] + '&lat=' + position[1] + '&zoom=1&addressdetails=1&format=json';

        $.ajax({
            url: url,
            dataType: 'xml',
            async: false,
            success: function (xml) {
                //var json = $.xml2json(xml);
                if (json && json.addressparts) {
                    //console.log(JSON.stringify(json.addressparts));
                    $('#user_address').val(json.addressparts.road + ', ' + json.addressparts.postcode + ' ' + json.addressparts.town + ', ' + json.addressparts.country);
                    $('#user_profile').val(json.addressparts.country_code.toUpperCase()).trigger('change');
                    userDatas.addressparts = json.addressparts;
                }
            }
        });

    }

    console.timeEnd(updateUserAddress.name + ' function executed');
}



// Layers __________________________________________________________________________________________

console.time('Map layers defined');

var layers = [];

// Base layers

var openStreetMapLayer = new ol.layer.Tile({
    name: 'openStreetMap',
    title: 'OpenStreetMap', // (offline)
    style: 'Road',
    visible: true,
    type: 'base',
    preload: Infinity,
    source: new ol.source.OSM({
        //crossOrigin: null,
        urls: [
            'http://a.tile.openstreetmap.org/{z}/{x}/{y}.png'
            /*,
                  '../../Datas/Tiles/osm_mapnik/{z}/{x}/{y}.png'*/
        ]
    })
});



var openCycleMapLayer = new ol.layer.Tile({
    name: 'openCycleMap',
    title: 'OpenCycleMap', // (offline)
    style: 'Road',
    visible: false,
    type: 'base',
    preload: Infinity,
    source: new ol.source.XYZ({
        attributions: [
            new ol.Attribution({
                html: 'All maps &copy; <a href="http://www.opencyclemap.org/">OpenCycleMap</a>'
            })
            //ol.source.OSM.DATA_ATTRIBUTION //issue
        ],
        urls: [
            'http://{a-c}.tile.opencyclemap.org/cycle/{z}/{x}/{y}.png',
            'http://{a-c}.tile.thunderforest.com/cycle/{z}/{x}/{y}.png'
            /*,
                  '../../Datas/Tiles/OpenCycleMap/{z}/{x}/{y}.png'*/
        ]
    })
});

var openSeaMapLayer = new ol.layer.Tile({
    name: 'openSeaMap',
    title: 'OpenSeaMap',
    //style: 'Road',
    visible: false,
    type: 'base',
    preload: Infinity,
    source: new ol.source.OSM({
        attributions: [
            new ol.Attribution({
                html: 'All maps &copy; ' +
                    '<a href="http://www.openseamap.org/">OpenSeaMap</a>'
            }),
            ol.source.OSM.ATTRIBUTION
        ],
        crossOrigin: null,
        urls: [
            'http://tiles.openseamap.org/seamark/{z}/{x}/{y}.png',
            'http://t1.openseamap.org/seamark/{z}/{x}/{y}.png'
        ]
    })
});

/*var hikeBikeMapLayer = new ol.layer.Tile({
  name: 'hikeBikeMap',
  title: 'HikeBikeMap',
  visible: false,
  type: 'base',
  preload: Infinity,
  source: new ol.source.XYZ({
    //attributions: [
    //  new ol.Attribution({
    //    html: 'All maps &copy; <a href="http://www.opencyclemap.org/">OpenCycleMap</a>'
    //  })
    //  //ol.source.OSM.DATA_ATTRIBUTION //issue
    //],
    urls: [
      'http://a.tiles.wmflabs.org/hikebike/{z}/{x}/{y}.png',
      'http://b.tiles.wmflabs.org/hikebike/{z}/{x}/{y}.png',
      'http://c.tiles.wmflabs.org/hikebike/{z}/{x}/{y}.png'
    ]
  })
});*/

var mapquestOSMLayer = new ol.layer.Tile({
    name: 'mapquestOSM',
    title: 'MapQuest OSM',
    style: 'Road',
    visible: false,
    type: 'base',
    preload: Infinity,
    source: new ol.source.MapQuest({
        layer: 'osm'
    })
});
/*
 */

var mapquestSatLayer = new ol.layer.Tile({
    name: 'mapquestSat',
    title: 'MapQuest satellite',
    style: 'Aerial',
    visible: false,
    type: 'base',
    preload: Infinity,
    source: new ol.source.MapQuest({
        layer: 'sat'
    })
});

var arcgisLayer = new ol.layer.Tile({
    name: 'arcgis',
    title: 'ArcGIS',
    style: 'Road',
    visible: false,
    type: 'base',
    preload: Infinity,
    source: new ol.source.XYZ({
        crossOrigin: 'anonymous', // Important
        attributions: [
            new ol.Attribution({
                html: 'Tiles &copy; <a href="http://services.arcgisonline.com/ArcGIS/' +
                    'rest/services/World_Topo_Map/MapServer">ArcGIS</a>'
            })
        ],
        url: 'http://server.arcgisonline.com/ArcGIS/rest/services/' +
            'World_Topo_Map/MapServer/tile/{z}/{y}/{x}'

    })
});

// Overlays

var mapquestHybLayer = new ol.layer.Tile({
    name: 'mapquestHyb',
    title: 'MapQuest city names',
    style: 'AerialHybrid',
    visible: false,
    source: new ol.source.MapQuest({
        layer: 'hyb'
    })
});


var lonviaCyclingLayer = new ol.layer.Tile({
    name: 'lonviaCycling',
    title: 'Lonvia cycling',
    style: 'Road',
    visible: false,
    opacity: 0.8,
    source: new ol.source.OSM({
        attributions: [
            new ol.Attribution({
                html: 'Map data &copy; <a href="http://www.openstreetmap.org/">OpenStreetMap</a> and contributors <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>'
            }),
            ol.source.OSM.ATTRIBUTION
        ],
        crossOrigin: null,
        url: 'http://tile.lonvia.de/cycling/{z}/{x}/{y}.png'
            //urls: [
            //  'http://tile.waymarkedtrails.org/cycling/{z}/{x}/{y}.png',
            //  'http://tile.lonvia.de/cycling/{z}/{x}/{y}.png',
            //  '../../Datas/Tiles/lonvia_cycling/{z}/{x}/{y}.png'
            //]
    })
});

var lonviaHikingLayer = new ol.layer.Tile({
    name: 'lonviaHiking',
    title: 'Lonvia hiking',
    style: 'Road',
    visible: false,
    source: new ol.source.OSM({
        attributions: [
            new ol.Attribution({
                html: 'Map data &copy; <a href="http://www.openstreetmap.org/">OpenStreetMap</a> and contributors <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>'
            }),
            ol.source.OSM.ATTRIBUTION
        ],
        crossOrigin: null,
        url: 'http://tile.lonvia.de/hiking/{z}/{x}/{y}.png'
    })
});


var toolserverHillShadingLayer = new ol.layer.Tile({
    name: 'toolserverHillShading',
    title: 'Toolserver hill shading',
    visible: false,
    source: new ol.source.XYZ({
        //crossOrigin: null,
        urls: [
            //'http://toolserver.org/~cmarqu/hill/{z}/{x}/{y}.png',
            'http://a.tiles.wmflabs.org/hillshading/{z}/{x}/{y}.png',
            'http://b.tiles.wmflabs.org/hillshading/{z}/{x}/{y}.png',
            'http://c.tiles.wmflabs.org/hillshading/{z}/{x}/{y}.png'
        ]
    })
});

var KMLVectorLayer = new ol.layer.Vector({
    name: 'KMLExampleMarkersAndRoad',
    title: 'Markers & road (KML example)',
    style: 'Vector',
    visible: false,
    source: new ol.source.KML({
        projection: projection,
        url: 'data/kml/2012-02-10.kml'
    })
});



var overpassSource = new ol.source.ServerVector({
    format: new ol.format.OSMXML(),
    loader: function (extent, resolution, projection) {
        var epsg4326Extent =
            ol.proj.transformExtent(extent, projection, 'EPSG:4326');
        //var url = 'http://overpass-api.de/api/xapi?map?bbox=' +
        //    epsg4326Extent.join(',');
        //var url = 'http://www.overpass-api.de/api/xapi?'
        var url = 'http://overpass-api.de/api/xapi?map?'
            //+ '*[amenity=toilets]'
            + 'bbox=' + epsg4326Extent.join(',') + '';
        $.ajax(url).then(function (response) {
            vectorSource.addFeatures(vectorSource.readFeatures(response));
        });
    },
    strategy: ol.loadingstrategy.createTile(new ol.tilegrid.XYZ({
        maxZoom: 19
    })),
    projection: 'EPSG:3857'
});

var overpassVectorLayer = new ol.layer.Vector({
    name: 'overpass',
    title: 'Overpass POI',
    visible: false,
    //minZoom: 17,
    maxZoom: 19,
    crossOrigin: null,
    source: overpassSource,
    style: function (feature, resolution) {
        for (var key in overpassStyles) {
            var value = feature.get(key);
            if (value !== undefined) {
                for (var regexp in overpassStyles[key]) {
                    if (new RegExp(regexp).test(value)) {
                        return overpassStyles[key][regexp];
                    }
                }
            }
        }
        return null;
    }
});

var timeZonesLayer = new ol.layer.Vector({
    name: 'timeZones',
    title: 'Time Zones',
    visible: false,
    style: timezonesStyleFunction,
    minResolution: 4891,
    source: new ol.source.KML({
        extractStyles: false,
        projection: 'EPSG:3857',
        url: 'data/kml/timezones.kml'
    })
});

var drawingVectorLayer = new ol.layer.Tile({
    name: 'drawing',
    title: 'My drawings',
    visible: false
        //,
        //    source: new ol.source.MapQuest({layer: 'sat'})
});


var gridSource = new ol.source.TileUTFGrid({
    url: 'http://api.tiles.mapbox.com/v3/mapbox.geography-class.json'
});

/*var gridLayer = new ol.layer.Tile({
  name: 'gridLayer',
  title: 'Country data',
  style: 'Grid',
  visible: false,
  source: gridSource
});*/

var scoresLayer = new ol.layer.Vector({
    name: 'scores',
    title: 'My destinations',
    style: scoreStyleFunction,
    visible: true,
    minResolution: 300,
    //maxResolution: 20000
    source: new ol.source.GeoJSON({
        //extractStyles: false,
        projection: 'EPSG:3857',
        url: 'data/geojson/countries.geojson'
    })
});



// Layer groups

var roadBaselayers = new ol.layer.Group({
    name: 'roadBaselayers',
    title: 'Road',
    layers: [
        //hikeBikeMapLayer,
        openStreetMapLayer,
        openSeaMapLayer,
        openCycleMapLayer,
        mapquestOSMLayer
    ]
});

var reliefBaselayers = new ol.layer.Group({
    name: 'reliefBaselayers',
    title: 'Road w/ relief',
    layers: [
        //stamenTerrainWithLabelsLayer,
        arcgisLayer
    ]
});

var aerialBaselayers = new ol.layer.Group({
    name: 'aerialBaselayers',
    title: 'Satellite',
    layers: [
        mapquestSatLayer
    ]
});

var hybridBaselayers = new ol.layer.Group({
    name: 'hybridBaselayers',
    title: 'Satellite w/ labels',
    layers: [
        //mapquestAerialWithLabelsLayer
    ]
});

var variousBaselayers = new ol.layer.Group({
    name: 'variousBaselayers',
    title: 'Various',
    layers: [

    ]
});

var baselayers = new ol.layer.Group({
    name: 'baseLayers',
    title: 'Map',
    layers: [
        //variousBaselayers,
        //hybridBaselayers,
        aerialBaselayers,
        reliefBaselayers,
        roadBaselayers
    ]
});

var roadOverlays = new ol.layer.Group({
    name: 'roadOverlays',
    title: 'Roads',
    layers: [
        mapquestHybLayer,
        lonviaHikingLayer,
        lonviaCyclingLayer
    ]
});

var markerOverlays = new ol.layer.Group({
    name: 'markerOverlays',
    title: 'Markers',
    layers: [

    ]
});

var informationOverlays = new ol.layer.Group({
    name: 'informationOverlays',
    title: 'Infos',
    layers: [
        timeZonesLayer
        //gridLayer
    ]
});

var terrainOverlays = new ol.layer.Group({
    name: 'terrainOverlays',
    title: 'Relief',
    layers: [
        toolserverHillShadingLayer
    ]
});



var userOverlays = new ol.layer.Group({
    name: 'userOverlays',
    title: 'My layers',
    layers: [
        scoresLayer,
        drawingVectorLayer
    ]
});

var overlays = new ol.layer.Group({
    name: 'overlays',
    title: 'Overlays',
    layers: [
        userOverlays,
        //toolOverlays,
        //euroveloRoutesOverlay,
        informationOverlays,
        terrainOverlays,
        roadOverlays
    ]
});

layers.push(
    baselayers,
    overlays
    //markerOverlays
);

/*
var baselayers = new ol.layer.Group({
  name: 'baseLayers',
  title: 'Map',
  layers: [
    mapquestSatLayer,
    openCycleMapLayer,
    openStreetMapLayer
  ]
});

var overlays = new ol.layer.Group({
  name: 'overlays',
  title: 'Overlays',
  layers: [
    gridLayer,
    drawingVectorLayer,
    scoresLayer
  ]
});

layers.push(
  baselayers,
  overlays
);
*/

console.timeEnd('Map layers defined');

$('[data-anchor="map-settings"]').load('components/map/settingsView.htm', function () {

    // Auto-save / restore forms (with id) from cookies
    $(window).on('load', function () {
        $('[data-anchor="settings"]').find('form[id].sayt').each(function () {
            var $el = $(this);
            $el.sayt(options.sayt);
            //$el.find(':input').trigger('change');
            console.log('#' + $el.attr('id') + ' restored from cookies');
        });
    });

});

$('[data-anchor="map"]').load('components/map/mapView.htm', function () {

    console.time('Map initialized');

    // Auto-save / restore forms (with id) from cookies
    $(window).on('load', function () {
        $('[data-anchor="map"]').find('form[id].sayt').each(function () {
            var $el = $(this);
            $el.sayt(options.sayt);
            $el.find(':input').trigger('change');
            console.log('#' + $el.attr('id') + ' restored from cookies');
        });
    });

    // Controls ________________________________________________________________________________________

    // overviewmap-custom
    var overviewMapControl = new ol.control.OverviewMap({
        // see in overviewmap-custom.html to see the custom CSS used
        className: 'ol-overviewmap ol-custom-overviewmap',
        layers: [
            baselayers
        ],
        collapseLabel: '\u00AB',
        label: '\u00BB',
        collapsed: true,
        tipLabel: $.t('map.openlayers.controls.ol-overviewmap')
    });

    var attribution = new ol.control.Attribution({
        collapsible: true,
        tipLabel: $.t('map.openlayers.controls.ol-attribution')
    });

    var zoomToExtentControl = new ol.control.ZoomToExtent({
        extent: extent,
        tipLabel: $.t('map.openlayers.controls.ol-zoom-extent')
    });

    // scale-line
    var scaleLineControl = new ol.control.ScaleLine({
        tipLabel: $.t('map.openlayers.controls.ol-scale-line')
    });

    // mouse-position
    var mousePositionControl = new ol.control.MousePosition({
        coordinateFormat: ol.coordinate.createStringXY(4),
        projection: 'EPSG:4326', //infoProjection
        // comment the following two lines to have the mouse position
        // be placed within the map.
        className: 'custom-mouse-position',
        target: document.getElementById('mouse-position'),
        undefinedHTML: '&nbsp;'
    });

    // Layerswitcher
    var layerSwitcher = new ol.control.LayerSwitcher({
        tipLabel: $.t('map.openlayers.controls.layerswitcher')
    });
    //map.addControl(layerSwitcher);

    var fullScreenControl = new ol.control.FullScreen({
        //className: 'ol-glyphicon',
        //label: '\e140',
        tipLabel: $.t('map.openlayers.controls.ol-full-screen')
    });



    $('.layer-switcher button').addClass('ol-control');


    // Overlays ________________________________________________________________________________________

    /**
     * tileutfgrid
     */

    var infoElement = document.getElementById('country-info');
    var infoOverlay = new ol.Overlay({
        element: infoElement,
        offset: [15, 15],
        stopEvent: false
    });
    //map.addOverlay(infoOverlay);

    var popupElement = document.getElementById('popup');
    var popup = new ol.Overlay({
        element: popupElement,
        positioning: 'bottom-center',
        stopEvent: false
    });
    //map.addOverlay(popup);

    /**
     * geolocation-orientation
     */

    var markerEl = document.getElementById('geolocation_marker');
    var marker = new ol.Overlay({
        positioning: 'center-center',
        element: markerEl,
        stopEvent: false
    });
    //map.addOverlay(marker);



    /**
     * button-title
     */

    $('.ol-zoom-in, .ol-zoom-out, .ol-overviewmap button[title], .ol-zoom-extent button[title]').tooltip({
        placement: 'right'
    });
    $('.ol-rotate-reset, .ol-attribution button[title], .ol-full-screen button, .layer-switcher button[title]').tooltip({
        placement: 'left'
    });


    // Tooltips translation
    //$('#map .ol-zoom-in[data-original-title]').attr('data-original-title', $.t('map.openlayers.controls.ol-zoom-in'));
    //$('#map .ol-zoom-out[data-original-title]').attr('data-original-title', $.t('map.openlayers.controls.ol-zoom-out'));

    // _________________________________________________________________________________________________



    /**
     * kml-timezones
     */

    var mapTooltip = $('#map-tooltip');
    mapTooltip.tooltip({
        animation: false,
        trigger: 'manual'
    });

    // Auto save/restore form fields with cookies
    //console.time('sayt initialized for #settings_form, #position_form');
    //$('#settings_form, #position_form').sayt(options.sayt);
    //console.timeEnd('sayt initialized for #settings_form, #position_form');

    // Convert checkboxes into switches
    console.time('bootstrapSwitch initialized on #map-offcanvas checkboxes');
    $('[data-anchor="map"]').find(':checkbox').bootstrapSwitch();
    console.timeEnd('bootstrapSwitch initialized on #map-offcanvas checkboxes');


    var mapElement = document.getElementById('map');


    // Map _____________________________________________________________________________________________

    if (!ol.has.WEBGL) {
        var info = document.getElementById('no-webgl');
        info.style.display = '';
        var renderer = 'canvas';
    } else {
        var renderer = 'webgl';
    }

    var map = new ol.Map({
        logo: false,
        view: view,
        controls: ol.control.defaults({
            attribution: false,
            attributionOptions: /** @type {olx.control.AttributionOptions} */ ({
                collapsible: false
            }),
            zoomOptions: {
                zoomInTipLabel: $.t('map.openlayers.controls.ol-zoom-in'),
                zoomOutTipLabel: $.t('map.openlayers.controls.ol-zoom-out')
            }
        }).extend([
            attribution,
            mousePositionControl,
            scaleLineControl,
            overviewMapControl,
            zoomToExtentControl,
            fullScreenControl,
            layerSwitcher
        ]),
        interactions: ol.interaction.defaults({

        }).extend([
            new ol.interaction.DragRotateAndZoom()
        ]),
        layers: layers,
        overlays: [
            infoOverlay,
            popup,
            marker
        ],
        //renderer: renderer, // dom webgl canvas ol.RendererHint.CANVAS exampleNS.getRendererFromQueryString()
        target: mapElement,
        loadTilesWhileInteracting: true
    });


    // Layer
    var layer,
        raster, // kml select-features
        imagery, // image-filter : bingAerialLayer;
        vector; //kml select-features : KMLVectorLayer selectFeaturesCountriesLayer
    //var layer = map.getLayers().getArray()[0]; // brightness-contrast
    //var lyrs = map.getLayers().getArray().slice().reverse();

    ol.control.LayerSwitcher.forEachRecursive(map, function (l, i, a) {

        var option,
            select;

        if (!(l instanceof ol.layer.Group)) {
            //console.log(JSON.stringify(l));
            if (l.get('type') === 'base') {
                option = document.createElement('option');
                option.text = l.get('title');
                option.value = l.get('name');
                if (l.getVisible()) {
                    option.selected = true;
                    layer = l;
                    raster = l;
                    imagery = l;
                }
                select = document.getElementById('base_layer_source');
                select.appendChild(option);

            } else {
                option = document.createElement('option');
                option.text = l.get('title');
                option.value = l.get('name');
                if (l.getVisible()) {
                    option.selected = true;
                    raster = l;
                }
                select = document.getElementById('overlay_layer_source');
                select.appendChild(option);
            }

            if (l instanceof ol.layer.Vector) {
                option = document.createElement('option');
                option.text = l.get('title');
                option.value = l.get('name');
                if (l.getVisible()) {
                    option.selected = true;
                    vector = l;
                }
                select = document.getElementById('vector_layer_source');
                select.appendChild(option);
            }

        }
    });

    $('#base_layer_source, #overlay_layer_source, #vector_layer_source').on('change', function (e) {
        var $el = $(this);
        ol.control.LayerSwitcher.forEachRecursive(map, function (l, i, a) {
            if (l.get('name') === $el.val()) {
                layerSwitcher.setVisible_(l, 1);
                //if (l != lyr && l.get('type') === 'base') {
                //  l.setVisible(true);
                //}
            }
        });
    });


    // Optional layers _______________________________________________________________________________

    // Load optional layers only when user open the map tab
    /*
    $('a[data-toggle="tab"]').one('shown.bs.tab', function (e) {
        console.log('Map tab opened');
        var pane_id = $(e.target).attr('href');
        if (pane_id === '#map_pane') {
            console.log('Load optionalLayers.js');
            $.getScript('components/map/optionalLayers.js', function (data, textStatus, jqxhr) {

            });

        }
    });
    */

    // Select layer __________________________________________________________________________________

    // Populate #layer-select
    /*
    var $el = $('#layer-select');
    if ($el) {
      $el.find('option').remove();
      map.getLayers().forEach(function (layer, i) {
        $el.append(layerOption(layer));
      });

      // Selected layer
      $el.on('change', function (e) {
        var selected = $el.find(':selected').val();
        map.getLayers().forEach(function (lyr, i) {
          if (lyr.get('name') === selected) {
            alert('Layer ' + lyr.get('name') + ' selected');
            layer = lyr;
          }
        });
      });

    }
    */

    // var layerType = (lyr instanceof ol.layer.Vector ? 'vector' : '');
    //var layerType = lyr.layer_type;

    //var layer = map.getLayers().a[0];
    //var layer = map.getLayers().getArray().shift();
    //var layerType = layer.layer_type;
    //alert(layerType);




    // Draw the map when the map tab pane become visible
    $('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
        var pane_id = $(e.target).attr('href');
        //var pane_id = $(e.currentTarget).attr('href');

        console.log(pane_id + ' tab shown');
        if (pane_id === '#map_pane' && map) {

            //alert('refresh map');
            updateScores();
            map.updateSize();
            map.renderSync();
            //map.on('postcompose', render);
            //map.render();
            overviewMapControl.setMap(map);
            console.log('Map refreshed');

        }
    });

    /*var $el = $('.navmenu');
    $el.on('shown.bs.offcanvas', function (e) {

    });*/


    // Feature overlay _________________________________________________________________________________

    var featuresOverlay = new ol.FeatureOverlay({
        map: map,
        features: [accuracyFeature, positionFeature]
    });



    /**
     * image-vector-layer
     */

    var countryFeatureOverlay = new ol.FeatureOverlay({
        map: map,
        minResolution: 300,
        style: new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: '#f00',
                width: 1
            }),
            fill: new ol.style.Fill({
                color: 'rgba(255,0,0,0.1)'
            })
        })
    });



    // Geolocation _____________________________________________________________________________________



    /**
     * geolocation-orientation
     */

    // postcompose callback
    function render() {
        map.render();
    }

    var geolocateBtn = document.getElementById('geolocate');
    var simulateBtn = document.getElementById('simulate');

    /*function disableButtons() {
      geolocateBtn.disabled = 'disabled';
      simulateBtn.disabled = 'disabled';
    }*/

    // geolocate device
    geolocateBtn.addEventListener('click', function () {
        geolocation.setTracking(true); // Start position tracking

        map.on('postcompose', render);
        map.render();

        var position = geolocation.getPosition();
        if (position) {
            map.getView().setCenter(position);
        }

        //disableButtons();
    }, false);


    $('#track').on('switchChange.bootstrapSwitch init', function (e, state) {
        var $el = $('#user_address').closest('.form-group');
        if (this.checked) {
            $el.addClass('hidden');
            geolocation.setTracking(true);
            map.on('postcompose', render);
            map.render();
            var position = geolocation.getPosition();
            if (position) {
                map.getView().setCenter(position);
            }
        } else {
            $el.removeClass('hidden');
            geolocation.setTracking(false);
        }
    });

    /*$('#track').on('change click', function () {
      console.log('track clicked');
      if (this.checked) {
        console.log('track is checked');
      }
    });*/

    $('#gps_mode').on('switchChange.bootstrapSwitch init', function (e, state) {
        if (this.checked) {
            view.setZoom(14);
            console.log('Zoom increased');
        }
    });

    // simulate device move

    function simulatePositionChange(position) {
        var coords = position.coords,
            newPosition = [coords.longitude, coords.latitude],
            projectedPosition = ol.proj.transform(newPosition, 'EPSG:4326', 'EPSG:3857');

        geolocation.set('accuracy', coords.accuracy);
        geolocation.set('heading', degToRad(coords.heading));
        geolocation.set('position', projectedPosition);
        geolocation.set('speed', coords.speed);
        geolocation.changed();
    }

    var simulationData;
    $.getJSON('data/geolocation-orientation.json', function (data) {
        simulationData = data.data;
    });

    simulateBtn.addEventListener('click', function () {
        var coordinates = simulationData,
            first = coordinates.shift(),
            prevDate = first.timestamp;

        simulatePositionChange(first);
        geolocate();

        map.on('postcompose', render);
        map.render();

        disableButtons();
    }, false);



    /**
     * geolocation-orientation
     */

    function geolocate() {
        var position = coordinates.shift(),
            newDate,
            prevDate;

        if (!position) {
            return;
        }
        newDate = position.timestamp;
        simulatePositionChange(position);
        window.setTimeout(function () {
            prevDate = newDate;
            geolocate();
        }, (newDate - prevDate) / 0.5);
    }




    // Before functions ________________________________________________________________________________



    /**
     * select-features
     */

    //var raster = mapquestSatLayer;
    //var vector = selectFeaturesCountriesLayer;

    var select = null; // ref to currently selected interaction

    // select interaction working on "singleclick"
    var selectSingleClick = new ol.interaction.Select();

    // select interaction working on "click"
    var selectClick = new ol.interaction.Select({
        condition: ol.events.condition.click
    });

    // select interaction working on "pointermove"
    var selectPointerMove = new ol.interaction.Select({
        condition: ol.events.condition.pointerMove
    });

    var selectElement = document.getElementById('action_type');


    /**
     * tileutfgrid
     */

    //var infoElement = document.getElementById('country-info');
    var flagElement = document.getElementById('country-flag');
    var nameElement = document.getElementById('country-name');

    /*
    map.on('pointermove', function (evt) {
      if (evt.dragging) {
        return;
      }
      var coordinate = map.getEventCoordinate(evt.originalEvent);
      displayCountryInfo(coordinate);
    });

    map.on('click', function (evt) {
      displayCountryInfo(evt.coordinate);
    });
    */

    // Functions (after map initialization) ____________________________________________________________

    /**
     * image-vector-layer
     */

    var highlight;

    var displayCountryFeatureInfo = function (pixel) {

        var info,
            feature;

        feature = map.forEachFeatureAtPixel(pixel, function (feature, layer) {
            return feature;
        });

        info = document.getElementById('info');
        if (feature) {
            info.innerHTML = feature.getId() + ': ' + feature.get('name');
        } else {
            info.innerHTML = '&nbsp;';
        }

        if (feature !== highlight) {
            if (highlight) {
                countryFeatureOverlay.removeFeature(highlight);
            }
            if (feature) {
                countryFeatureOverlay.addFeature(feature);
            }
            highlight = feature;
        }

    };



    /**
     * custom
     */

    function layerOption(layer) {
        var option;
        if (layer instanceof ol.layer.Group) {
            option = document.createElement('optgroup');
            option.label = layer.get('title');
            layer.getLayers().forEach(function (sublayer, j) {
                option.appendChild(layerOption(sublayer));
            });
        } else {
            option = new Option(layer.get('title'), layer.get('name'));
        }
        return option;
    }



    /**
     * exampleNS
     */

    var exampleNS = {};

    exampleNS.getRendererFromQueryString = function () {
        var obj = {},
            queryString = location.search.slice(1),
            re = /([^&=]+)=([^&]*)/g,
            m;

        while (m = re.exec(queryString)) {
            obj[decodeURIComponent(m[1])] = decodeURIComponent(m[2]);
        }
        if ('renderers' in obj) {
            return obj.renderers.split(',');
        } else if ('renderer' in obj) {
            return [obj.renderer];
        } else {
            return undefined;
        }
    };



    /**
     * kml-timezones
     */

    var displayTimezonesFeatureInfo = function (pixel) {

        var feature;

        mapTooltip.css({
            left: pixel[0] + 'px',
            top: (pixel[1] - 15) + 'px'
        });

        feature = map.forEachFeatureAtPixel(pixel, function (feature, layer) {
            return feature;
        });

        if (feature) {
            mapTooltip.tooltip('hide')
                .attr('data-original-title', feature.get('name'))
                .tooltip('fixTitle')
                .tooltip('show');
        } else {
            mapTooltip.tooltip('hide');
        }
    };



    /**
     * image-filter
     */

    function normalize(kernel) {
        var len = kernel.length,
            normal = new Array(len),
            i = 0,
            sum = 0;

        for (i = 0; i < len; i = i + 1) {
            sum += kernel[i];
        }
        if (sum <= 0) {
            normal.normalized = false;
            sum = 1;
        } else {
            normal.normalized = true;
        }
        for (i = 0; i < len; i = i + 1) {
            normal[i] = kernel[i] / sum;
        }
        return normal;
    }



    /**
     * image-filter
     */

    /**
     * Apply a convolution kernel to canvas.  This works for any size kernel, but
     * performance starts degrading above 3 x 3.
     * @param {CanvasRenderingContext2D} context Canvas 2d context.
     * @param {Array.<number>} kernel Kernel.
     */
    function convolve(context, kernel) {
        var canvas = context.canvas,
            width = canvas.width,
            height = canvas.height,
            size = Math.sqrt(kernel.length),
            half = Math.floor(size / 2),
            inputData = context.getImageData(0, 0, width, height).data,
            output = context.createImageData(width, height),
            outputData = output.data,
            pixelsAbove,
            pixelY,
            pixelX,
            kernelY,
            kernelX,
            weight,
            neighborY,
            neighborX,
            inputIndex,
            outputIndex,
            r,
            g,
            b,
            a;

        for (pixelY = 0; pixelY < height; pixelY = pixelY + 1) {
            pixelsAbove = pixelY * width;
            for (pixelX = 0; pixelX < width; pixelX = pixelX + 1) {
                r = 0;
                g = 0;
                b = 0;
                a = 0;
                for (kernelY = 0; kernelY < size; kernelY = kernelY + 1) {
                    for (kernelX = 0; kernelX < size; kernelX = kernelX + 1) {
                        weight = kernel[kernelY * size + kernelX];
                        neighborY = Math.min(height - 1, Math.max(0, pixelY + kernelY - half));
                        neighborX = Math.min(width - 1, Math.max(0, pixelX + kernelX - half));
                        inputIndex = (neighborY * width + neighborX) * 4;
                        r += inputData[inputIndex] * weight;
                        g += inputData[inputIndex + 1] * weight;
                        b += inputData[inputIndex + 2] * weight;
                        a += inputData[inputIndex + 3] * weight;
                    }
                }
                outputIndex = (pixelsAbove + pixelX) * 4;
                outputData[outputIndex] = r;
                outputData[outputIndex + 1] = g;
                outputData[outputIndex + 2] = b;
                outputData[outputIndex + 3] = kernel.normalized ? a : 255;
            }
        }
        context.putImageData(output, 0, 0);
    }




    /**
     * select-features
     */

    var changeInteraction = function () {
        if (select !== null) {
            map.removeInteraction(select);
        }
        var value = selectElement.value;
        if (value === 'singleclick') {
            select = selectSingleClick;
        } else if (value === 'click') {
            select = selectClick;
        } else if (value === 'pointermove') {
            select = selectPointerMove;
        } else {
            select = null;
        }
        if (select !== null) {
            map.addInteraction(select);
            select.on('select', function (e) {
                if (e.selected) {
                    $('#status').html('&nbsp;' + e.target.getFeatures().getLength() +
                        ' selected features (last operation selected ' + e.selected.length +
                        ' and deselected ' + e.deselected.length + ' features)');
                }

            });
        }
    };



    /**
     * tile-load-events
     */

    /**
     * Renders a progress bar.
     * @param {Element} el The target element.
     * @constructor
     */
    function Progress(el) {
        this.el = el;
        this.loading = 0;
        this.loaded = 0;
    }



    /**
     * Increment the count of loading tiles.
     */

    Progress.prototype.addLoading = function () {
        if (this.loading === 0) {
            this.show();
        }
        ++this.loading;
        this.update();
    };



    /**
     * Increment the count of loaded tiles.
     */
    Progress.prototype.addLoaded = function () {
        setTimeout(function () {
            ++this.loaded;
            this.update();
        }.bind(this), 100);
    };



    /**
     * Update the progress bar.
     */

    Progress.prototype.update = function () {
        var width = (this.loaded / this.loading * 100).toFixed(1) + '%';
        this.el.style.width = width;
        if (this.loading === this.loaded) {
            this.loading = 0;
            this.loaded = 0;
            setTimeout(this.hide.bind(this), 500);
        }
    };



    /**
     * Show the progress bar.
     */
    Progress.prototype.show = function () {
        this.el.style.visibility = 'visible';
    };



    /**
     * Hide the progress bar.
     */

    Progress.prototype.hide = function () {
        if (this.loading === this.loaded) {
            this.el.style.visibility = 'hidden';
            this.el.style.width = 0;
        }
    };



    /**
     * tileutfgrid
     */

    var displayCountryInfo = function (coordinate) {
        var viewResolution = /** @type {number} */ (view.getResolution());
        gridSource.forDataAtCoordinateAndResolution(coordinate, viewResolution,
            function (data) {
                // If you want to use the template from the TileJSON,
                //  load the mustache.js library separately and call
                //  info.innerHTML = Mustache.render(gridSource.getTemplate(), data);
                mapElement.style.cursor = data ? 'pointer' : '';
                if (data) {
                    /* jshint -W069 */
                    flagElement.src = 'data:image/png;base64,' + data.flag_png;
                    nameElement.innerHTML = data.admin;
                    /* jshint +W069 */
                }
                infoOverlay.setPosition(data ? coordinate : undefined);

            });
    };



    var displayCountryDetails = function (pixel) { //coordinate

        var feature;

        /*mapTooltip.css({
            left: pixel[0] + 'px',
            top: (pixel[1] - 15) + 'px'
        });*/

        feature = map.forEachFeatureAtPixel(pixel, function (feature, layer) {
            return feature;
        });

        if (feature) {
            if (countryCodesISO2) {
                console.log('Show country details for ' + feature.get('name') + ' (' + feature.getId() + ')');
                console.info('countryCodesISO2 = ' + JSON.stringify(countryCodesISO2));
                var cid = countryCodesISO2[feature.getId()];
                if (cid) {
                    $('#country_details').modal('show');
                    showCountryDetails(cid.toLowerCase());
                } else {
                    console.warn('Country clicked but ISO3(' + feature.getId() + ') to ISO2(' + cid + ') conversion has failed');
                }
            } else {
                console.warn('countryCodesISO2 array is not defined');
            }
        }

        /*
        var viewResolution = / ** @type {number} * / (view.getResolution());
        gridSource.forDataAtCoordinateAndResolution(coordinate, viewResolution,
            function (data) {

                console.log('Show country details');
                if (data) {
                    console.log('Show country details: ' + JSON.stringify(data));
                    $('#country_details').modal('show');
                    var id = countryCodesISO2[data.id].toLowerCase();
                    showCountryDetails(id);
                }

            }
        );
        */

    };



    /**
     * moveend
     */

    function display(id, value) {
        document.getElementById(id).value = value.toFixed(2);
    }



    /**
     * moveend
     */

    function wrapLon(value) {
        var worlds = Math.floor((value + 180) / 360);
        return value - (worlds * 360);
    }



    /**
     * moveend
     */

    function onMoveEnd(evt) {
        var map = evt.map,
            extent = map.getView().calculateExtent(map.getSize()),
            bottomLeft = ol.proj.transform(ol.extent.getBottomLeft(extent), 'EPSG:3857', 'EPSG:4326'),
            topRight = ol.proj.transform(ol.extent.getTopRight(extent), 'EPSG:3857', 'EPSG:4326');
        display('left', wrapLon(bottomLeft[0]));
        display('bottom', bottomLeft[1]);
        display('right', wrapLon(topRight[0]));
        display('top', topRight[1]);
    }



    /**
     * kml
     */

    //var raster = bingAerialLayer; //map.getTarget();
    //var vector = KMLVectorLayer;

    var displayKMLFeatureInfo = function (pixel) {
        var features = [],
            info,
            i,
            ii;
        map.forEachFeatureAtPixel(pixel, function (feature, layer) {
            features.push(feature);
        });
        if (features.length > 0) {
            info = [];
            for (i = 0, ii = features.length; i < ii; i = i + 1) {
                info.push(features[i].get('name'));
            }
            document.getElementById('info').innerHTML = info.join(', ') || '(unknown)';
            map.getTarget().style.cursor = 'pointer';
        } else {
            document.getElementById('info').innerHTML = '&nbsp;';
            map.getTarget().style.cursor = '';
        }
    };

    /*
    map.on('pointermove', function (evt) {
      if (evt.dragging) {
        return;
      }
      var pixel = map.getEventPixel(evt.originalEvent);
      displayKMLFeatureInfo(pixel);
    });

    map.on('click', function (evt) {
      displayKMLFeatureInfo(evt.pixel);
    });
    */

    var exportKMLElement = document.getElementById('export-kml');
    if ('download' in exportKMLElement) {
        var vectorSource = vector.getSource();
        exportKMLElement.addEventListener('click', function (e) {
            if (!exportKMLElement.href) {
                var features = [],
                    string = new ol.format.KML().writeFeatures(features),
                    base64 = exampleNS.strToBase64(string);
                vectorSource.forEachFeature(function (feature) {
                    var clone = feature.clone();
                    clone.setId(feature.getId()); // clone does not set the id
                    clone.getGeometry().transform(projection, 'EPSG:4326');
                    features.push(clone);
                });
                exportKMLElement.href = 'data:application/vnd.google-earth.kml+xml;base64,' + base64;
            }
        }, false);
    } else {
        var info = document.getElementById('no-download');
        info.style.display = '';
    }



    /*
    map.on('pointermove', function (evt) {
      if (evt.dragging) {
        return;
      }
      var pixel = map.getEventPixel(evt.originalEvent);
      displayCountryFeatureInfo(pixel);
    });

    map.on('click', function (evt) {
      displayCountryFeatureInfo(evt.pixel);
    });
    */


    /**
     * geolocation-orientation
     */

    // convert radians to degrees
    function radToDeg(rad) {
        return rad * 360 / (Math.PI * 2);
    }



    /**
     * geolocation-orientation
     */

    // modulo for negative values
    function mod(n) {
        return ((n % (2 * Math.PI)) + (2 * Math.PI)) % (2 * Math.PI);
    }



    /**
     * geolocation-orientation
     */

    // recenters the view by putting the given coordinates at 3/4 from the top or
    // the screen
    function getCenterWithHeading(position, rotation, resolution) {
        var size = map.getSize(),
            height = size[1];

        return [
            position[0] - Math.sin(rotation) * height * resolution * (1 / 4),
            position[1] + Math.cos(rotation) * height * resolution * (1 / 4)
        ];
    }




    // Show / hide marker checkbox
    var $el = $('#display_geolocation_marker');
    if ($el) {
        $el.on('switchChange.bootstrapSwitch', function (e, state) {
            if (this.checked) {
                $('#geolocation_marker').removeClass('hidden');
            } else {
                $('#geolocation_marker').addClass('hidden');
            }
        }).trigger('switchChange.bootstrapSwitch');
    }

    // LineString to store the different geolocation positions. This LineString
    // is time aware.
    // The Z dimension is actually used to store the rotation (heading).
    var positions = new ol.geom.LineString([],
        /** @type {ol.geom.GeometryLayout} */
        ('XYZM'));

    // Geolocation Control
    /*
    var geolocation = new ol.Geolocation(/ ** @type {olx.GeolocationOptions} * / ({
      projection: view.getProjection(),
      trackingOptions: {
        maximumAge: 10000,
        enableHighAccuracy: true,
        timeout: 600000
      }
    }));
    */

    var deltaMean = 500; // the geolocation sampling period mean in ms

    // Listen to position changes
    geolocation.on('change', function (evt) {
        var position = geolocation.getPosition(),
            accuracy = geolocation.getAccuracy(),
            heading = geolocation.getHeading() || 0,
            speed = geolocation.getSpeed() || 0,
            m = Date.now(),
            altitude = geolocation.getAltitude() || 0,
            altitudeAccuracy = geolocation.getAltitudeAccuracy() || 0,
            coords,
            len;

        addPosition(position, heading, m, speed);

        coords = positions.getCoordinates();
        len = coords.length;
        if (len >= 2) {
            deltaMean = (coords[len - 1][3] - coords[0][3]) / (len - 1);
        }


        /*
        var html = [
          'Position: ' + position[0].toFixed(2) + ', ' + position[1].toFixed(2),
          'Accuracy: ' + accuracy,
          'Heading: ' + Math.round(radToDeg(heading)) + '&deg;',
          'Speed: ' + (speed * 3.6).toFixed(1) + ' km/h',
          'Delta: ' + Math.round(deltaMean) + 'ms'
        ].join('<br />');

        document.getElementById('info').innerHTML = html;
        */

        //position = ol.proj.transform(position, 'EPSG:3857', infoProjection);

        view = map.getView();
        projection = view.getProjection();
        var units = projection.getUnits();

        //$('#position').text(position[0].toFixed(2) + ', ' + position[1].toFixed(2) + ' deg');
        $('#longitude').text(position[0].toFixed(2) + ' ' + units);
        $('#latitude').text(position[1].toFixed(2) + ' ' + units);
        $('#accuracy').text(accuracy + ' ' + units);

        $('#heading').text(Math.round(radToDeg(heading)) + ' deg');
        $('#speed').text((speed * 3.6).toFixed(1) + ' km/h');
        //$('#speed').text(geolocation.getSpeed() + ' m/s');
        $('#delta').text(Math.round(deltaMean) + ' ms');

        $('#altitude').text(altitude + ' m');
        $('#altitudeAccuracy').text(altitudeAccuracy + ' m');


    });

    // Center map on user position on button click
    $el = $('#center_map_on_user_location');
    if ($el) {
        $el.on('click', function (e) {

            var position = geolocation.getPosition();
            if (position) {
                map.getView().setCenter(position);
                console.log('Map centered on user position');
            }

            updateUserAddress();

        });
    }

    /*
    geolocation.on('error', function () {
      alert('geolocation error');
      // FIXME we should remove the coordinates in positions
    });
    */

    var previousM = 0;
    // change center and rotation before render
    map.beforeRender(function (map, frameState) {
        if (frameState !== null) {
            // use sampling period to get a smooth transition
            var m = frameState.time - deltaMean * 1.5,
                c,
                view;

            m = Math.max(m, previousM);
            previousM = m;
            // interpolate position along positions LineString
            c = positions.getCoordinateAtM(m, true);
            view = frameState.viewState;
            if (c) {

                // Stay centered on user position if GPS mode is enabled
                if ($('#gps_mode').bootstrapSwitch('state') === true) {
                    //console.log('GPS mode is enabled');
                    view.center = getCenterWithHeading(c, -c[2], view.resolution);
                    view.rotation = -c[2];
                    marker.setPosition(c);
                }

            }
        }
        return true; // Force animation to continue
    });



    /**
     * geolocation-orientation
     */

    function addPosition(position, heading, m, speed) {
        var x = position[0],
            y = position[1],
            fCoords = positions.getCoordinates(),
            previous = fCoords[fCoords.length - 1],
            prevHeading = previous && previous[2],
            sign,
            headingDiff;
        if (prevHeading) {
            headingDiff = heading - mod(prevHeading);

            // force the rotation change to be less than 180°
            if (Math.abs(headingDiff) > Math.PI) {
                sign = (headingDiff >= 0) ? 1 : -1;
                headingDiff = -sign * (2 * Math.PI - Math.abs(headingDiff));
            }
            heading = prevHeading + headingDiff;
        }
        positions.appendCoordinate([x, y, heading, m]);

        // only keep the 20 last coordinates
        positions.setCoordinates(positions.getCoordinates().slice(-20));

        // FIXME use speed instead
        if (heading && speed) {
            markerEl.src = 'data/geolocation_marker_heading.png';
        } else {
            markerEl.src = 'data/geolocation_marker.png';
        }
    }


    /**
     * geolocation
     */
    /*
    var geolocation = new ol.Geolocation(/ ** @type {olx.GeolocationOptions} * /({
      projection: view.getProjection(),
      trackingOptions: {
        maximumAge: 10000,
        enableHighAccuracy: true,
        timeout: 600000
      }
    }));
    */
    /*var track = new ol.dom.Input(document.getElementById('track'));
    track.bindTo('checked', geolocation, 'tracking');*/

    // update the HTML page when the position changes.
    /*
    geolocation.on('change', function () {
      $('#accuracy').text(geolocation.getAccuracy() + ' m');
      $('#altitude').text(geolocation.getAltitude() + ' m');
      $('#altitudeAccuracy').text(geolocation.getAltitudeAccuracy() + ' m');
      $('#heading').text(geolocation.getHeading() + ' rad');
      $('#speed').text(geolocation.getSpeed() + ' m/s');
    });
    */

    // handle geolocation error.
    geolocation.on('error', function (error) {
        var info = document.getElementById('info');
        info.getElementsByTagName('div').innerHTML = error.message;
        info.style.display = '';
    });



    /**
     * device-orientation
     */

    var deviceOrientation = new ol.DeviceOrientation();

    /*var track = new ol.dom.Input(document.getElementById('track'));
    track.bindTo('checked', deviceOrientation, 'tracking');*/

    deviceOrientation.on('change', function (event) {

        var alpha = deviceOrientation.getAlpha(),
            beta = deviceOrientation.getBeta(),
            gamma = deviceOrientation.getGamma(),
            heading = deviceOrientation.getHeading();

        $('#alpha').text(alpha);
        $('#alpha').text((alpha) ? radToDeg(alpha) + ' deg' : '-');
        $('#beta').text((beta) ? radToDeg(beta) + ' deg' : '-');
        $('#gamma').text((gamma) ? radToDeg(gamma) + ' deg' : '-');
        $('#heading').text((heading) ? radToDeg(heading) + ' deg' : '-');
    });

    // tilt the map
    deviceOrientation.on(['change:beta', 'change:gamma'], function (event) {
        var center = view.getCenter(),
            resolution = view.getResolution(),
            beta = event.target.getBeta() || 0,
            gamma = event.target.getGamma() || 0;

        center[0] -= resolution * gamma * 25;
        center[1] += resolution * beta * 25;

    });


    // Map events ______________________________________________________________________________________

    // tileutfgrid kml
    map.on('click', function (evt) {
        displayCountryFeatureInfo(evt.pixel);
        displayKMLFeatureInfo(evt.pixel);
        displayTimezonesFeatureInfo(evt.pixel);
        displayCountryInfo(evt.coordinate);
        //displayCountryDetails(evt.coordinate);
        displayCountryDetails(evt.pixel);

        // Display popup
        /*var feature = map.forEachFeatureAtPixel(evt.pixel, function (feature, layer) {
            return feature;
        });
        if (feature) {
            var geometry = feature.getGeometry();
            var coord = geometry.getCoordinates();
            popup.setPosition(coord);
            $(popupElement).popover({
                'placement': 'top',
                'html': true,
                'content': (feature.get('name:en') || feature.get('int_name') || feature.get('name')) + ' ' + feature.get('amenity') + ' ' + feature.get('country') + ' ' + feature.get('diplomatic') + ' in ' + feature.get('is_in') + ' address: ' + feature.get('addr:housenumber') + ' ' + feature.get('addr:postcode') + ' ' + feature.get('addr:street') + ' ' + feature.get('addr:city') + ' ' + feature.get('addr:state') + ' ' + feature.get('addr:country') + ' website: ' + feature.get('website') + ' wikipedia: ' + feature.get('wikipedia') + ' phone: ' + feature.get('phone')
            });
            $(popupElement).popover('show');
        } else {
            $(popupElement).popover('destroy');
        }*/

    });

    $(map.getViewport()).on('mousemove', function (evt) {
        var pixel = map.getEventPixel(evt.originalEvent);
        displayTimezonesFeatureInfo(pixel);
    });

    // image-vector-layer kml tileutfgrid
    map.on('pointermove', function (evt) {

        var pixel,
            coordinate,
            hit;

        if (evt.dragging) {
            mapTooltip.tooltip('hide');
            return;
        }
        pixel = map.getEventPixel(evt.originalEvent);
        coordinate = map.getEventCoordinate(evt.originalEvent);
        hit = map.hasFeatureAtPixel(pixel);

        displayCountryFeatureInfo(pixel);
        displayKMLFeatureInfo(pixel);
        displayCountryInfo(coordinate);

        // Popup
        if (evt.dragging) {
            $(popupElement).popover('destroy');
            return;
        }
        map.getTarget().style.cursor = hit ? 'pointer' : '';

    });


    // moveend
    map.on('moveend', onMoveEnd);

    // Window resize
    $(window).resize(function () {
        var height = $(window).height() - parseInt($('body').css('padding-top'), 10) - parseInt($('body').css('padding-bottom'), 10);
        $('#map').css('height', height);
        if (map) {
            map.updateSize();
            console.log('Map size updated');
        }
    });

    // View fields
    var $resolution = $('#resolution');
    var $zoom = $('#zoom');
    map.getView().on('change:resolution', function () {
        var resolution = this.getResolution();
        //var resolution = ol.proj.transform(resolution, 'EPSG:4326', 'EPSG:3857');//.toFixed(2)
        if (resolution) {
            $resolution.val(resolution.toFixed(2));
        }
        $zoom.val(this.getZoom());
    });
    $resolution.on('change', function () {
        view.setResolution($resolution.val())
    });
    $zoom.on('change', function () {
        view.setZoom($zoom.val())
    });

    var $centerX = $('#center_x');
    var $centerY = $('#center_y');
    map.getView().on('change:center', function () {
        var lonLat = this.getCenter();
        //var lonLat = ol.proj.transform(lonLat, 'EPSG:3857', infoProjection);
        if (lonLat) {
            $centerX.val(lonLat[0].toFixed(2)); //.toFixed(2)
            $centerY.val(lonLat[1].toFixed(2));
        }
    });
    $('#center_x, #center_y').on('change', function () {
        view.setCenter($centerX.val(), $centerY.val())
    });

    var $rotation = $('#rotation');
    map.getView().on('change:rotation', function () {
        var rotation = this.getRotation();
        //var rotation = ol.proj.transform(rotation, 'EPSG:3857', infoProjection);
        $rotation.val(rotation);
    });
    $rotation.on('change', function () {
        view.setRotation($rotation.val())
    });

    //map.events.fireEvent('change:view');

    // Projection fields
    //degrees', 'ft', 'm' or 'pixels
    /*var $projection = $('#projection');
    $projection.on('change', function () {
      var projectionCode = $projection.val();
      map.control.MousePosition.setProjection(projectionCode);
      map.Geolocation.setProjection(projectionCode);
    });*/

    map.on('change:projection', function () {
        projection = map.getProjection();
        $('#projection_extent').val(layer.getExtent());
        //ol.proj.setExtent($projection.value);

        $('#projection_code').val(projection.getCode());
        $('#projection_metersperunit').val(projection.getMetersPerUnit());
        $('#projection_unit').val(projection.getUnits());
        $('#projection_global').val(projection.isGlobal());
        // update unit in input-group-addon
        $('#top, #left, #bottom, #right, #center_x, #center_y, #resolution, #longitude, #latitude').next('.input-group-addon').html(projection.getUnits());
    });


    /*var $extent.innerHTML = ol.proj.getExtent();
    $extent.on('change', function () {
      ol.proj.setExtent($extent.value);
    });*/



    /*
    $select
      .change(function () {
        var selected = $(this).find(':selected').val();
        var i, ii;
        for (i = 0, ii = layers.length; i < ii; i = i + 1) {
          layers[i].setVisible(layers[i].get('name') == selected);
        }
      })
      .trigger('change');
    */




    // Inputs __________________________________________________________________________________________

    // scale-line
    var unitsSelect = new ol.dom.Input(document.getElementById('units'));
    unitsSelect.bindTo('value', scaleLineControl, 'units');

    // geolocation device-orientation
    var track = new ol.dom.Input(document.getElementById('track'));
    track.bindTo('checked', geolocation, 'tracking');


    // mouse-position
    var projectionSelect = new ol.dom.Input(document.getElementById('projection'));
    projectionSelect.bindTo('value', mousePositionControl, 'projection')
        .transform(
            function (code) {
                // projectionSelect.value -> mousePositionControl.projection
                return ol.proj.get( /** @type {string} */ (code));
            },
            function (projection) {
                // mousePositionControl.projection -> projectionSelect.value
                return projection.getCode();
            }
        );

    projectionSelect.bindTo('value', geolocation, 'projection')
        .transform(
            function (code) {
                // projectionSelect.value -> mousePositionControl.projection
                return ol.proj.get( /** @type {string} */ (code));
            },
            function (projection) {
                // mousePositionControl.projection -> projectionSelect.value
                return projection.getCode();
            }
        );


    // Elements ________________________________________________________________________________________




    // _________________________________________________________________________________________________


    //var layer = map.getLayers().getArray()[0];

    /**
     * brightness-contrast
     */

    var increaseBrightness = document.getElementById('increase-brightness');
    var resetBrightness = document.getElementById('reset-brightness');
    var decreaseBrightness = document.getElementById('decrease-brightness');

    function setResetBrightnessButtonHTML() {
        resetBrightness.innerHTML = 'Brightness (' + layer.getBrightness().toFixed(3) + ')';
    }

    var increaseContrast = document.getElementById('increase-contrast');
    var resetContrast = document.getElementById('reset-contrast');
    var decreaseContrast = document.getElementById('decrease-contrast');

    function setResetContrastButtonHTML() {
        resetContrast.innerHTML = 'Contrast (' + layer.getContrast().toFixed(3) + ')';
    }



    /**
     * hue-saturation
     */

    var increaseHue = document.getElementById('increase-hue');
    var resetHue = document.getElementById('reset-hue');
    var decreaseHue = document.getElementById('decrease-hue');

    function setResetHueButtonHTML() {
        resetHue.innerHTML = 'Hue (' + layer.getHue().toFixed(2) + ')';
    }

    var increaseSaturation = document.getElementById('increase-saturation');
    var resetSaturation = document.getElementById('reset-saturation');
    var decreaseSaturation = document.getElementById('decrease-saturation');

    function setResetSaturationButtonHTML() {
        resetSaturation.innerHTML = 'Saturation (' + layer.getSaturation().toFixed(2) + ')';
    }

    if (!ol.has.WEBGL) {
        var info = document.getElementById('no-webgl');
        info.style.display = '';
    } else {

        /**
         * brightness-contrast
         */

        setResetBrightnessButtonHTML();

        increaseBrightness.addEventListener('click', function () {
            layer.setBrightness(Math.min(layer.getBrightness() + 0.125, 1));
            setResetBrightnessButtonHTML();
        }, false);
        resetBrightness.addEventListener('click', function () {
            layer.setBrightness(0);
            setResetBrightnessButtonHTML();
        }, false);
        decreaseBrightness.addEventListener('click', function () {
            layer.setBrightness(Math.max(layer.getBrightness() - 0.125, -1));
            setResetBrightnessButtonHTML();
        }, false);

        setResetContrastButtonHTML();

        increaseContrast.addEventListener('click', function () {
            layer.setContrast(layer.getContrast() + 0.125);
            setResetContrastButtonHTML();
        }, false);
        resetContrast.addEventListener('click', function () {
            layer.setContrast(1);
            setResetContrastButtonHTML();
        }, false);
        decreaseContrast.addEventListener('click', function () {
            layer.setContrast(Math.max(layer.getContrast() - 0.125, 0));
            setResetContrastButtonHTML();
        }, false);

        /**
         * hue-saturation
         */

        setResetHueButtonHTML();

        increaseHue.addEventListener('click', function () {
            layer.setHue(layer.getHue() + 0.25);
            setResetHueButtonHTML();
        }, false);
        resetHue.addEventListener('click', function () {
            layer.setHue(0);
            setResetHueButtonHTML();
        }, false);
        decreaseHue.addEventListener('click', function () {
            layer.setHue(layer.getHue() - 0.25);
            setResetHueButtonHTML();
        }, false);

        setResetSaturationButtonHTML();

        increaseSaturation.addEventListener('click', function () {
            layer.setSaturation(layer.getSaturation() + 0.25);
            setResetSaturationButtonHTML();
        }, false);
        resetSaturation.addEventListener('click', function () {
            layer.setSaturation(1);
            setResetSaturationButtonHTML();
        }, false);
        decreaseSaturation.addEventListener('click', function () {
            layer.setSaturation(Math.max(layer.getSaturation() - 0.25, 0));
            setResetSaturationButtonHTML();
        }, false);

    }



    /**
     * image-filter
     */

    var kernels = {
        none: [0, 0, 0, 0, 1, 0, 0, 0, 0],
        sharpen: [0, -1, 0, -1, 5, -1, 0, -1, 0],
        sharpenless: [0, -1, 0, -1, 10, -1, 0, -1, 0],
        blur: [1, 1, 1, 1, 1, 1, 1, 1, 1],
        shadow: [1, 2, 1, 0, 1, 0, -1, -2, -1],
        emboss: [-2, 1, 0, -1, 1, 1, 0, 1, 2],
        edge: [0, 1, 0, 1, -4, 1, 0, 1, 0]
    };

    var kernel = document.getElementById('kernel');
    var selectedKernel = normalize(kernels[kernel.value]);

    /**
     * Update the kernel and re-render on change.
     */
    kernel.onchange = function () {
        selectedKernel = normalize(kernels[kernel.value]);
        map.render();
    };

    /**
     * Apply a filter on "postcompose" events.
     * @param {ol.render.Event} event Render event.
     */
    imagery.on('postcompose', function (event) {
        convolve(event.context, selectedKernel);
    });



    /**
     * export-map
     */

    var exportPNGElement = document.getElementById('export-png');

    if ('download' in exportPNGElement) {
        exportPNGElement.addEventListener('click', function (e) {
            map.once('postcompose', function (event) {
                var canvas = event.context.canvas;
                exportPNGElement.href = canvas.toDataURL('image/png');
            });
            map.renderSync();
        }, false);
    } else {
        var info = document.getElementById('no-download');
        info.style.display = '';
    }



    /**
     * onchange callback on the select element.
     */
    selectElement.onchange = changeInteraction;
    changeInteraction();



    /**
     * tile-load-events
     */

    var progress = new Progress(document.getElementById('progress'));

    var source = new ol.source.TileJSON({
        url: 'http://api.tiles.mapbox.com/v3/mapbox.world-bright.jsonp',
        crossOrigin: 'anonymous'
    });

    source.on('tileloadstart', function (event) {
        progress.addLoading();
    });

    source.on('tileloadend', function (event) {
        progress.addLoaded();
    });
    source.on('tileloaderror', function (event) {
        progress.addLoaded();
    });



    /**
     * moveend
     */

    //map.on('moveend', onMoveEnd);



    /**
     * mouse-position
     */

    /*var projectionSelect = new ol.dom.Input(document.getElementById('projection'));
    projectionSelect.bindTo('value', mousePositionControl, 'projection')
      .transform(
        function (code) {
          // projectionSelect.value -> mousePositionControl.projection
          return ol.proj.get(/ ** @type {string} * /(code));
        },
        function (projection) {
          // mousePositionControl.projection -> projectionSelect.value
          return projection.getCode();
        }
      );*/

    var precisionInput = document.getElementById('precision');
    precisionInput.addEventListener('change', function () {
        var format = ol.coordinate.createStringXY(precisionInput.valueAsNumber);
        mousePositionControl.setCoordinateFormat(format);
    }, false);



    console.timeEnd('Map initialized');

});



console.timeEnd('mapController.js script loaded');