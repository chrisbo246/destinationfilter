/*old-jslint indent: 2, unparam: true, plusplus: true */
/*jslint devel: true, browser: true, node: false */
/*global $, ol */
/*global drawingVectorLayer, feature, KMLVectorLayer, map, overpassVectorLayer, projection, scoresLayer, style */

/**
 * www.destinationfilter.tk 0.7.0
 * https://github.com/christopheboisier/DestinationFinder/
 * MIT licensed
 * @author Christophe BOISIER
 *
 * Copyright (C) 2015 Christophe BOISIER
 */

console.time('optionalLayers.js script loaded');

var layers = [];

// Google __________________________________________________________________________________________

var googleTerrainLayer = new ol.layer.Tile({
    name: 'googleTerrain',
    title: 'Google terrain',
    type: 'base',
    visible: false,
    preload: Infinity,
    source: new ol.source.XYZ({
        crossOrigin: 'anonymous', // Important
        url: 'http://mts0.google.com/vt/lyrs=t@132,r@285000000&hl=en&src=app&x={x}&y={y}&z={z}&s=1'
    })
});

var googleSatelliteLayer = new ol.layer.Tile({
    name: 'googleSatellite',
    title: 'Google satellite',
    type: 'base',
    visible: true,
    preload: Infinity,
    source: new ol.source.XYZ({
        crossOrigin: 'anonymous', // Important
        //resolutions: [9784, 2446, 1223, 76.44, 9.55, 2.39],
        url: 'http://khms0.google.com/kh/v=165&src=app&x={x}&y={y}&z={z}&s=1'
    })
});


var googleBikeLayer = new ol.layer.Tile({
    name: 'googleBike',
    title: 'Google bike',
    visible: true,
    opacity: 1,
    source: new ol.source.XYZ({
        //attributions: [
        //  new ol.Attribution({
        //    html: 'Map data &copy; <a href="http://www.openstreetmap.org/">OpenStreetMap</a> and contributors <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>'
        //  }),
        //  ol.source.OSM.ATTRIBUTION
        //],
        crossOrigin: 'anonymous',
        url: 'http://mts0.google.com/vt/lyrs=h@239000000,bike&hl=en&src=app&x={x}&y={y}&z={z}&s=1'
    })
});



// Bing ____________________________________________________________________________________________

var bingRoadLayer = new ol.layer.Tile({
    name: 'bingRoad',
    title: 'Bing road',
    style: 'Road',
    visible: false,
    type: 'base',
    preload: Infinity,
    source: new ol.source.BingMaps({
        key: 'Ak-dzM4wZjSqTlzveKz5u0d4IQ4bRzVI309GxmkgSVr1ewS6iPSrOvOKhA-CJlm3',
        imagerySet: 'Road',
        maxZoom: 19
    })
});

var bingAerialLayer = new ol.layer.Tile({
    name: 'bingAerial',
    title: 'Bing aerial',
    style: 'Aerial',
    visible: false,
    type: 'base',
    preload: Infinity,
    source: new ol.source.BingMaps({
        key: 'Ak-dzM4wZjSqTlzveKz5u0d4IQ4bRzVI309GxmkgSVr1ewS6iPSrOvOKhA-CJlm3',
        imagerySet: 'Aerial',
        maxZoom: 19
    })
});

var bingAerialWithLabelsLayer = new ol.layer.Tile({
    name: 'bingAerialWithLabels',
    title: 'Bing Maps aerial w/ labels',
    style: 'Road',
    visible: false,
    type: 'base',
    preload: Infinity,
    source: new ol.source.BingMaps({
        key: 'Ak-dzM4wZjSqTlzveKz5u0d4IQ4bRzVI309GxmkgSVr1ewS6iPSrOvOKhA-CJlm3',
        imagerySet: 'AerialWithLabels',
        maxZoom: 19
    })
});

/*
var key = 'Ak-dzM4wZjSqTlzveKz5u0d4IQ4bRzVI309GxmkgSVr1ewS6iPSrOvOKhA-CJlm3';

var imagery = new ol.layer.Tile({
  source: new ol.source.BingMaps({key: key, imagerySet: 'Aerial'})
});

var bingCollinsBartLayer = new ol.layer.Tile({
  name: 'bingCollinsBart',
  title: 'Bing collins bart',
  style: 'Aerial',
  visible: false,
  type: 'base',
  preload: Infinity,
  source: new ol.source.BingMaps({
    key: 'Ak-dzM4wZjSqTlzveKz5u0d4IQ4bRzVI309GxmkgSVr1ewS6iPSrOvOKhA-CJlm3',
    imagerySet: 'collinsBart',
    maxZoom: 19
  })
});

var bingOrdnanceSurveyLayer = new ol.layer.Tile({
  name: 'bingOrdnanceSurvey',
  title: 'Bing ordnance survey',
  style: 'Aerial',
  visible: false,
  type: 'base',
  preload: Infinity,
  source: new ol.source.BingMaps({
    key: 'Ak-dzM4wZjSqTlzveKz5u0d4IQ4bRzVI309GxmkgSVr1ewS6iPSrOvOKhA-CJlm3',
    imagerySet: 'ordnanceSurvey',
    maxZoom: 19
  })
});

var styles = [
  'Road',
  'Aerial',
  'AerialWithLabels',
  'collinsBart',
  'ordnanceSurvey'
];
var i, ii;
for (i = 0, ii = styles.length; i < ii; i = i + 1) {
  layers.push(new ol.layer.Tile({
    name: 'Bing' + styles[i],
    title: 'Bing ' + styles[i],
    style: styles[i],
    visible: false,
    type: 'base',
    preload: Infinity,
    source: new ol.source.BingMaps({
      key: 'Ak-dzM4wZjSqTlzveKz5u0d4IQ4bRzVI309GxmkgSVr1ewS6iPSrOvOKhA-CJlm3',
      imagerySet: styles[i]
        // use maxZoom 19 to see stretched tiles instead of the BingMaps
        // "no photos at this zoom level" tiles
        // maxZoom: 19
    })
  }));
}
*/



// Stamen __________________________________________________________________________________________

var stamenTonerLayer = new ol.layer.Tile({
    name: 'stamenToner',
    title: 'Stamen toner',
    style: 'Road',
    visible: false,
    type: 'base',
    preload: Infinity,
    source: new ol.source.Stamen({
        layer: 'toner'
    })
});

var stamenWatercolorLayer = new ol.layer.Tile({
    name: 'stamenWatercolor',
    title: 'Stamen watercolor',
    style: 'Road',
    visible: false,
    type: 'base',
    preload: Infinity,
    source: new ol.source.Stamen({
        layer: 'watercolor'
    })
});

/*var stamenTerrainWithLabelsLayer = new ol.layer.Tile({
  name: 'stamenTerrainLabels',
  title: 'Stamen terrain w/ labels',
  style: 'Road',
  visible: false,
  type: 'base',
  preload: Infinity,
  source: new ol.source.Stamen({
    layer: 'terrain-labels'
  })
});*/



// Mapbox __________________________________________________________________________________________

var mapboxGeographyLayer = new ol.layer.Tile({
    name: 'mapboxGeography',
    title: 'Mapbox geography',
    style: 'Road',
    visible: false,
    type: 'base',
    preload: Infinity,
    source: new ol.source.TileJSON({
        crossOrigin: 'anonymous', // Important
        url: 'http://api.tiles.mapbox.com/v3/mapbox.geography-class.json'
    })
});

var mapboxWorldLightLayer = new ol.layer.Tile({
    name: 'mapboxWorldLight',
    title: 'Mapbox world light',
    style: 'Road',
    visible: false,
    type: 'base',
    preload: Infinity,
    source: new ol.source.TileJSON({
        crossOrigin: 'anonymous',
        url: 'http://api.tiles.mapbox.com/v3/mapbox.world-bright.jsonp'
    })
});


// POI _____________________________________________________________________________________________

var iconOptions = {
    scale: 0.5,
    size: [24, 48],
    anchor: [0, 10],
    anchorXUnits: 'fraction',
    anchorYUnits: 'pixels',
    opacity: 0.75
};

var embassyVectorLayer = new ol.layer.Vector({
    name: 'embassy',
    title: 'Embassies & consulates',
    visible: false,
    source: new ol.source.OSMXML({
        urls: [
            'datas/osm/diplomatic.osm',
            'datas/osm/embassy.osm'
        ],
        projection: 'EPSG:3857'
    }),
    style: new ol.style.Style({
        //image: new ol.style.Icon(/ ** @type {olx.style.IconOptions} * / ({
        //  anchor: [0, 10],
        //  anchorXUnits: 'fraction',
        //  anchorYUnits: 'pixels',
        //  opacity: 0.75,
        //  src: 'images/SJJB-SVG-Icons/svg/poi/embassy.svg'
        //}))
        image: new ol.style.Icon($.extend({}, {
            src: 'images/SJJB-PNG-Icons/png/poi_embassy.p.64.png'
        }, iconOptions))
    })
});

var drinkingWaterLayer = new ol.layer.Vector({
    name: 'drinkingWater',
    title: 'Drinking water',
    visible: false,
    source: new ol.source.OSMXML({
        urls: [
            //'datas/osm/drinking_water.osm',
            'datas/osm/water_point.osm',
            'datas/osm/potable_fountain.osm',
            'datas/osm/potable_toilets_water.osm',
            'datas/osm/potable_water_well.osm'
        ],
        projection: 'EPSG:3857'
    }),
    style: new ol.style.Style({
        image: new ol.style.Icon($.extend({}, {
            src: 'images/SJJB-PNG-Icons/png/food_drinkingtap.p.64.png'
        }, iconOptions))
    })
});

var waterPointVectorLayer = new ol.layer.Vector({
    name: 'waterPoint',
    title: 'Water point',
    visible: false,
    source: new ol.source.OSMXML({
        urls: [
            'datas/osm/water_point.osm',
            'datas/osm/lavoir.osm'
        ],
        projection: 'EPSG:3857'
    }),
    style: new ol.style.Style({
        image: new ol.style.Icon($.extend({}, {
            src: 'images/SJJB-PNG-Icons/png/shopping_laundrette.p.64.png'
        }, iconOptions))
    })
});

var toiletsLayer = new ol.layer.Vector({
    name: 'toilets',
    title: 'Toilets',
    visible: false,
    source: new ol.source.OSMXML({
        urls: [
            'datas/osm/toilets.osm'
        ],
        projection: 'EPSG:3857'
    }),
    style: new ol.style.Style({
        image: new ol.style.Icon($.extend({}, {
            src: 'images/SJJB-PNG-Icons/png/amenity_toilets.p.64.png'
        }, iconOptions))
    })
});

var guestHouseLayer = new ol.layer.Vector({
    name: 'guestHouse',
    title: 'Guest house',
    visible: false,
    source: new ol.source.OSMXML({
        urls: [
            'datas/osm/guest_house.osm'
        ],
        projection: 'EPSG:3857'
    }),
    style: new ol.style.Style({
        image: new ol.style.Icon($.extend({}, {
            src: 'images/SJJB-PNG-Icons/png/accommodation_hotel.p.64.png' //lodging
        }, iconOptions))
    })
});

var freeWifiLayer = new ol.layer.Vector({
    name: 'freeWifi',
    title: 'Free wifi',
    visible: false,
    source: new ol.source.OSMXML({
        urls: [
            'datas/osm/wifi_free.osm'
        ],
        projection: 'EPSG:3857'
    }),
    style: new ol.style.Style({
        image: new ol.style.Icon($.extend({}, {
            src: 'images/SJJB-PNG-Icons/png/shopping_computer.p.64.png' //lodging
        }, iconOptions))
    })
});

var bicycleParkingLayer = new ol.layer.Vector({
    name: 'bicycleParking',
    title: 'Bicycle parking',
    visible: false,
    source: new ol.source.OSMXML({
        urls: [
            'datas/osm/bicycle_parking.osm'
        ],
        projection: 'EPSG:3857'
    }),
    style: new ol.style.Style({
        image: new ol.style.Icon($.extend({}, {
            src: 'images/SJJB-PNG-Icons/png/transport_parking_bicycle.p.64.png'
        }, iconOptions))
    })
});

var campSiteLayer = new ol.layer.Vector({
    name: 'campSite',
    title: 'Camp site',
    visible: false,
    source: new ol.source.OSMXML({
        urls: [
            'datas/osm/camp_site.osm',
            'datas/osm/picnic_table.osm'
        ],
        projection: 'EPSG:3857'
    }),
    style: new ol.style.Style({
        image: new ol.style.Icon($.extend({}, {
            src: 'images/SJJB-PNG-Icons/png/accommodation_camping.p.64.png'
        }, iconOptions))
    })
});

var benchLayer = new ol.layer.Vector({
    name: 'bench',
    title: 'Benches & tables',
    visible: false,
    source: new ol.source.OSMXML({
        urls: [
            'datas/osm/bench.osm',
            'datas/osm/picnic_table.osm'
        ],
        projection: 'EPSG:3857'
    }),
    style: new ol.style.Style({
        image: new ol.style.Icon($.extend({}, {
            src: 'images/SJJB-PNG-Icons/png/amenity_bench.p.64.png'
        }, iconOptions))
    })
});

var ferryLayer = new ol.layer.Vector({
    name: 'ferry',
    title: 'Ferry',
    visible: false,
    source: new ol.source.OSMXML({
        urls: [
            'datas/osm/ferry_terminal.osm'
        ],
        projection: 'EPSG:3857'
    }),
    style: new ol.style.Style({
        image: new ol.style.Icon($.extend({}, {
            src: 'images/SJJB-PNG-Icons/png/transport_port.p.64.png'
        }, iconOptions))
    })
});

var borderControlLayer = new ol.layer.Vector({
    name: 'borderControl',
    title: 'Border control',
    visible: false,
    source: new ol.source.OSMXML({
        urls: [
            'datas/osm/customs.osm',
            'datas/osm/border_control.osm'
        ],
        projection: 'EPSG:3857'
    }),
    style: new ol.style.Style({
        image: new ol.style.Icon($.extend({}, {
            src: 'images/SJJB-PNG-Icons/png/amenity_police2.p.64.png'
        }, iconOptions))
    })
});

var sportLayer = new ol.layer.Vector({
    name: 'sport',
    title: 'Sport',
    visible: false,
    source: new ol.source.OSMXML({
        urls: [
            'datas/osm/border_control.osm'
        ],
        projection: 'EPSG:3857'
    }),
    style: new ol.style.Style({
        image: new ol.style.Icon($.extend({}, {
            src: 'images/SJJB-PNG-Icons/png/sport_leisure_centre.p.64.png'
        }, iconOptions))
    })
});

var feedingPlaceLayer = new ol.layer.Vector({
    name: 'feedingPlaceLayer',
    title: 'Feeding place',
    visible: false,
    source: new ol.source.OSMXML({
        urls: [
            'datas/osm/feeding_place.osm'
        ],
        projection: 'EPSG:3857'
    }),
    style: new ol.style.Style({
        image: new ol.style.Icon($.extend({}, {
            src: 'images/SJJB-PNG-Icons/png/food_fastfood_pizza.p.64.png'
        }, iconOptions))
    })
});

var bicycleStationLayer = new ol.layer.Vector({
    name: 'bicycleStation',
    title: 'Bicycle station',
    visible: false,
    source: new ol.source.OSMXML({
        urls: [
            'datas/osm/bicycle_repair_station.osm',
            'datas/osm/air_filling.osm'
        ],
        projection: 'EPSG:3857'
    }),
    style: new ol.style.Style({
        image: new ol.style.Icon($.extend({}, {
            src: 'images/SJJB-PNG-Icons/png/shopping_diy.p.64.png'
        }, iconOptions))
    })
});

var mcdonaldsVectorLayer = new ol.layer.Vector({
    name: 'mcdonalds',
    title: 'McDonald\'s (Europe)',
    visible: false,
    maxResolution: 300,
    style: new ol.style.Style({
        image: new ol.style.Icon($.extend({}, {
            src: 'images/SJJB-PNG-Icons/png/food_fastfood.p.64.png'
        }, iconOptions))
    }),
    source: new ol.source.KML({
        projection: projection,
        url: 'datas/kml/McDonald\'s Europe.kml'
    })
});

var decathlonVectorLayer = new ol.layer.Vector({
    name: 'decathlon',
    title: 'Decathlon (Europe)',
    visible: false,
    style: new ol.style.Style({
        image: new ol.style.Icon($.extend({}, {
            src: 'images/SJJB-PNG-Icons/png/shopping_tackle.p.64.png'
        }, iconOptions))
    }),
    maxResolution: 300,
    source: new ol.source.KML({
        projection: projection,
        url: 'datas/kml/Decathlon Europe.kml'
    })
});

// Eurovelo GPX ____________________________________________________________________________________

/*
function euroveloStyle() { //euroveloStyle(feature, resolution)
    'use strict';
    return style[feature.getGeometry().getType()];
}
*/

var euroveloRoutesOverlay = new ol.layer.Group({
    name: 'euroveloRoutes',
    title: 'EuroVelo Routes',
    layers: [
        //options.cors + "cycling.waymarkedtrails.org/en/routebrowser/2763798/gpx",
        new ol.layer.Vector({
            name: 'Eurovelo-1',
            title: 'Eurovelo 1',
            visible: true,
            source: new ol.source.GPX({
                projection: projection,
                url: 'datas/gpx/eurovelo-1.gpx'
            }),
            style: new ol.style.Style({
                strokeColor: "#a7b71e",
                strokeWidth: 10,
                strokeOpacity: 0.25
            })
        }),
        //options.cors + "cycling.waymarkedtrails.org/en/routebrowser/2003423/gpx",
        new ol.layer.Vector({
            name: 'Eurovelo-2',
            title: 'Eurovelo 2',
            visible: true,
            source: new ol.source.GPX({
                projection: projection,
                url: 'datas/gpx/eurovelo-2.gpx'
            }),
            style: new ol.style.Style({
                strokeColor: "#82bad0",
                strokeWidth: 10,
                strokeOpacity: 0.25
            })
        }),
        //options.cors + "cycling.waymarkedtrails.org/en/routebrowser/299546/gpx",
        new ol.layer.Vector({
            name: 'Eurovelo-3',
            title: 'Eurovelo 3',
            visible: true,
            source: new ol.source.GPX({
                projection: projection,
                url: 'datas/gpx/eurovelo-3.gpx'
            }),
            style: new ol.style.Style({
                strokeColor: "#04adea",
                strokeWidth: 10,
                strokeOpacity: 0.25
            })
        }),
        //options.cors + "cycling.waymarkedtrails.org/en/routebrowser/2521076/gpx",
        new ol.layer.Vector({
            name: 'Eurovelo-4',
            title: 'Eurovelo 4',
            visible: true,
            source: new ol.source.GPX({
                projection: projection,
                url: 'datas/gpx/eurovelo-4.gpx'
            }),
            style: new ol.style.Style({
                strokeColor: "#feef01",
                strokeWidth: 10,
                strokeOpacity: 0.25
            })
        }),
        //options.cors + "cycling.waymarkedtrails.org/en/routebrowser/2764534/gpx",
        new ol.layer.Vector({
            name: 'Eurovelo-5',
            title: 'Eurovelo 5',
            visible: true,
            source: new ol.source.GPX({
                projection: projection,
                url: 'datas/gpx/eurovelo-5.gpx'
            }),
            style: new ol.style.Style({
                strokeColor: "#f3a7c8",
                strokeWidth: 10,
                strokeOpacity: 0.25
            })
        }),
        //options.cors + "cycling.waymarkedtrails.org/en/routebrowser/2938/gpx",
        new ol.layer.Vector({
            name: 'Eurovelo-6',
            title: 'Eurovelo 6',
            visible: true,
            source: new ol.source.GPX({
                projection: projection,
                url: 'datas/gpx/eurovelo-6.gpx'
            }),
            style: new ol.style.Style({
                strokeColor: "#be0675",
                strokeWidth: 10,
                strokeOpacity: 0.25
            })
        }),
        //options.cors + "cycling.waymarkedtrails.org/en/routebrowser/2749837/gpx",
        new ol.layer.Vector({
            name: 'Eurovelo-7',
            title: 'Eurovelo 7',
            visible: true,
            source: new ol.source.GPX({
                projection: projection,
                url: 'datas/gpx/eurovelo-7.gpx'
            }),
            style: new ol.style.Style({
                strokeColor: "#82bad0",
                strokeWidth: 10,
                strokeOpacity: 0.25
            })
        }),
        //options.cors + "cycling.waymarkedtrails.org/en/routebrowser/2766092/gpx",
        new ol.layer.Vector({
            name: 'Eurovelo-8',
            title: 'Eurovelo 8',
            visible: true,
            source: new ol.source.GPX({
                projection: projection,
                url: 'datas/gpx/eurovelo-8.gpx'
            }),
            style: new ol.style.Style({
                strokeColor: "#b76629",
                strokeWidth: 10,
                strokeOpacity: 0.25
            })
        }),
        //options.cors + "cycling.waymarkedtrails.org/en/routebrowser/1168027/gpx",
        new ol.layer.Vector({
            name: 'Eurovelo-9',
            title: 'Eurovelo 9',
            visible: true,
            source: new ol.source.GPX({
                projection: projection,
                url: 'datas/gpx/eurovelo-9.gpx'
            }),
            style: new ol.style.Style({
                strokeColor: "#b36eaf",
                strokeWidth: 10,
                strokeOpacity: 0.25
            })
        }),
        //options.cors + "cycling.waymarkedtrails.org/en/routebrowser/2689634/gpx",
        new ol.layer.Vector({
            name: 'Eurovelo-10',
            title: 'Eurovelo 10',
            visible: true,
            source: new ol.source.GPX({
                projection: projection,
                url: 'datas/gpx/eurovelo-10.gpx'
            }),
            style: new ol.style.Style({
                strokeColor: "#f5c714",
                strokeWidth: 10,
                strokeOpacity: 0.25
            })
        }),
        //options.cors + "cycling.waymarkedtrails.org/en/routebrowser/2766981/gpx",
        new ol.layer.Vector({
            name: 'Eurovelo-11',
            title: 'Eurovelo 11',
            visible: true,
            source: new ol.source.GPX({
                projection: projection,
                url: 'datas/gpx/eurovelo-11.gpx'
            }),
            style: new ol.style.Style({
                strokeColor: "#f7981c",
                strokeWidth: 10,
                strokeOpacity: 0.25
            }),
            projection: projection
        }),
        //options.cors + "cycling.waymarkedtrails.org/en/routebrowser/1207220/gpx",
        new ol.layer.Vector({
            name: 'Eurovelo-12',
            title: 'Eurovelo 12',
            visible: true,
            source: new ol.source.GPX({
                projection: projection,
                url: 'datas/gpx/eurovelo-12.gpx'
            }),
            style: new ol.style.Style({
                strokeColor: "#009f4a",
                strokeWidth: 10,
                strokeOpacity: 0.25
            }),
            projection: projection
        }),
        //options.cors + "cycling.waymarkedtrails.org/en/routebrowser/1664664/gpx",
        new ol.layer.Vector({
            name: 'Eurovelo-13',
            title: 'Eurovelo 13',
            visible: true,
            source: new ol.source.GPX({
                projection: projection,
                url: 'datas/gpx/eurovelo-13.gpx'
            }),
            style: new ol.style.Style({
                strokeColor: "#f24d35",
                strokeWidth: 10,
                strokeOpacity: 0.25
            })
        }),
        //options.cors + "cycling.waymarkedtrails.org/en/routebrowser/2171555/gpx",
        new ol.layer.Vector({
            name: 'Eurovelo-15',
            title: 'Eurovelo 15',
            visible: true,
            source: new ol.source.GPX({
                projection: projection,
                url: 'datas/gpx/eurovelo-15.gpx'
            }),
            style: new ol.style.Style({
                strokeColor: "#003b94",
                strokeWidth: 10,
                strokeOpacity: 0.25
            })
        }),
        //options.cors + "cycling.waymarkedtrails.org/en/routebrowser/4625716/gpx",
        new ol.layer.Vector({
            name: 'Eurovelo-16',
            title: 'Eurovelo 16',
            visible: true,
            source: new ol.source.GPX({
                projection: projection,
                url: 'datas/gpx/eurovelo-16.gpx'
            }),
            style: new ol.style.Style({
                strokeColor: "#003b94",
                strokeWidth: 10,
                strokeOpacity: 0.25
            })
        })
    ]
});



// DISABLED ________________________________________________________________________________________

/*
var mapquestAerialWithLabelsLayer = new ol.layer.Group({
  name: 'mapquestAerialWithLabels',
  title: 'MapQuest aerial w/ labels',
  style: 'AerialWithLabels',
  visible: false,
  //type: 'base',
  layers: [
    new ol.layer.Tile({
      source: new ol.source.MapQuest({
        layer: 'sat'
      })
    }),
    new ol.layer.Tile({
      source: new ol.source.MapQuest({
        layer: 'hyb'
      })
    })
  ]
});

var onlineCommunitiesImageStatic = new ol.source.ImageStatic({
  name: 'Static image',
  title: 'Static image',
  style: 'Road',
  visible: false,
  type: 'base',
  attributions: [
    new ol.Attribution({
      html: '&copy; <a href="http://xkcd.com/license.html">xkcd</a>'
    })
  ],
  url: 'http://imgs.xkcd.com/comics/online_communities.png',
  projection: projection,
  imageExtent: extent
});

var embassyVectorLayer = new ol.layer.Vector({
  name: 'consulates',
  title: 'Embassies & consulates',
  visible: false,
  style: new ol.style.Style({
    image: new ol.style.Icon(/ ** @type {olx.style.IconOptions} * / ({
      anchor: [0, 10],
      anchorXUnits: 'fraction',
      anchorYUnits: 'pixels',
      opacity: 0.75,
      src: 'images/SJJB-PNG-Icons/png/poi_embassy.p.64.png'
    }))
  }),
  source: new ol.source.KML({
    projection: projection,
    url: 'datas/kml/embassy.kml'
  })
});

var vectorSource = new ol.source.ServerVector({
  format: new ol.format.OSMXML(),
  loader: function (extent, resolution, projection) {
    var epsg4326Extent =
        ol.proj.transformExtent(extent, projection, 'EPSG:4326');
    var url = 'http://overpass-api.de/api/xapi?map?bbox=' +
        epsg4326Extent.join(',');
    $.ajax(url).then(function (response) {
      vectorSource.addFeatures(vectorSource.readFeatures(response));
    });
  },
  strategy: ol.loadingstrategy.createTile(new ol.tilegrid.XYZ({
    maxZoom: 19
  })),
  projection: 'EPSG:3857'
});

var vectorOSMTileLayer = new ol.layer.Vector({
  name: 'OSMVector',
  title: 'OSM vector',
  style: 'Road',
  visible: false,
  source: vectorSource,
  style: function (feature, resolution) {
    for (var key in vectorOSMstyles) {
      var value = feature.get(key);
      if (value !== undefined) {
        for (var regexp in vectorOSMstyles[key]) {
          if (new RegExp(regexp).test(value)) {
            return vectorOSMstyles[key][regexp];
          }
        }
      }
    }
    return null;
  }
});

var style = {
  'Point': [new ol.style.Style({
    image: new ol.style.Circle({
      fill: new ol.style.Fill({
        color: 'rgba(255,255,0,0.4)'
      }),
      radius: 5,
      stroke: new ol.style.Stroke({
        color: '#ff0',
        width: 1
      })
    })
  })],
  'LineString': [new ol.style.Style({
    stroke: new ol.style.Stroke({
      color: '#f00',
      width: 3
    })
  })],
  'MultiLineString': [new ol.style.Style({
    stroke: new ol.style.Stroke({
      color: '#0f0',
      width: 3
    })
  })]
};

*/

// Various layers __________________________________________________________________________________


var countryBordersImageLayer = new ol.layer.Image({
    name: 'countryImageOverlay',
    title: 'Country image overlay',
    style: 'Image',
    visible: false,
    source: new ol.source.ImageVector({
        source: new ol.source.GeoJSON({
            projection: 'EPSG:3857',
            url: 'data/geojson/countries.geojson'
        }),
        style: new ol.style.Style({
            fill: new ol.style.Fill({
                color: 'rgba(255, 255, 255, 0.6)'
            }),
            stroke: new ol.style.Stroke({
                color: '#319FD3',
                width: 6
            })
        })
    })
});


var countriesVectorLayer = new ol.layer.Vector({
    name: 'countryVectorOverlay',
    title: 'Country borders w/ labels',
    visible: false,
    source: new ol.source.GeoJSON({
        projection: 'EPSG:3857',
        url: 'data/geojson/countries.geojson'
    }),
    style: function (feature, resolution) {
        vectorLayerStyle.getText().setText(resolution < 5000 ? feature.get('name') : '');
        return styles;
    }
});

var selectFeaturesCountriesLayer = new ol.layer.Vector({
    name: 'countryBorders',
    title: 'Country borders',
    visible: false,
    source: new ol.source.GeoJSON({
        projection: 'EPSG:3857',
        url: 'data/geojson/countries.geojson'
    })
});



// _________________________________________________________________________________________________

/*
map.getLayers().forEach(function (layer, i) {
  //bindInputs('#layer' + i, layer);
  if (layer instanceof ol.layer.Group) {

    //layer.getLayers().forEach(function (sublayer, j) {
    //  bindInputs('#layer' + i + j, sublayer);
    //});
  }
});
*/


// Layer groups

/*var toolOverlays = new ol.layer.Group({
  name: 'toolOverlays',
  title: 'Tools',
  layers: [
    //countryBordersImageLayer,
    //countriesVectorLayer,
    //selectFeaturesCountriesLayer
  ]
});*/

var roadBaselayers = new ol.layer.Group({
    name: 'roadBaselayers',
    title: 'Road',
    layers: [
        bingRoadLayer
    ]
});

var reliefBaselayers = new ol.layer.Group({
    name: 'reliefBaselayers',
    title: 'Road w/ relief',
    layers: [
        googleTerrainLayer
    ]
});

var aerialBaselayers = new ol.layer.Group({
    name: 'aerialBaselayers',
    title: 'Satellite',
    layers: [
        googleSatelliteLayer,
        bingAerialLayer
    ]
});

var hybridBaselayers = new ol.layer.Group({
    name: 'hybridBaselayers',
    title: 'Satellite w/ labels',
    layers: [
        bingAerialWithLabelsLayer
    ]
});

var variousBaselayers = new ol.layer.Group({
    name: 'variousBaselayers',
    title: 'Various',
    layers: [
        stamenWatercolorLayer,
        stamenTonerLayer,
        mapboxWorldLightLayer,
        mapboxGeographyLayer
        //onlineCommunitiesImageStatic
        //bingCollinsBartLayer,
        //bingOrdnanceSurveyLayer
    ]
});

var baselayers = new ol.layer.Group({
    name: 'baseLayers',
    title: 'Map',
    layers: [
        variousBaselayers,
        hybridBaselayers,
        aerialBaselayers,
        reliefBaselayers,
        roadBaselayers
    ]
});

var roadOverlays = new ol.layer.Group({
    name: 'roadOverlays',
    title: 'Roads',
    layers: [
        googleBikeLayer
    ]
});

var markerOverlays = new ol.layer.Group({
    name: 'markerOverlays',
    title: 'Markers',
    layers: [
        KMLVectorLayer,
        decathlonVectorLayer,
        mcdonaldsVectorLayer,
        overpassVectorLayer,
        sportLayer,
        benchLayer,
        campSiteLayer,
        ferryLayer,
        bicycleParkingLayer,
        bicycleStationLayer,
        toiletsLayer,
        waterPointVectorLayer,
        drinkingWaterLayer,
        feedingPlaceLayer,
        borderControlLayer,
        freeWifiLayer,
        guestHouseLayer,
        embassyVectorLayer
    ]
});

var informationOverlays = new ol.layer.Group({
    name: 'informationOverlays',
    title: 'Infos',
    layers: [

    ]
});

var terrainOverlays = new ol.layer.Group({
    name: 'terrainOverlays',
    title: 'Relief',
    layers: [

    ]
});

/*var toolOverlays = new ol.layer.Group({
  name: 'toolOverlays',
  title: 'Tools',
  layers: [
    //countryBordersImageLayer,
    //countriesVectorLayer,
    //selectFeaturesCountriesLayer
  ]
});*/

var userOverlays = new ol.layer.Group({
    name: 'userOverlays',
    title: 'My layers',
    layers: [
        scoresLayer,
        drawingVectorLayer
    ]
});

var overlays = new ol.layer.Group({
    name: 'overlays2',
    title: 'Overlays2',
    layers: [
        userOverlays,
        //toolOverlays,
        euroveloRoutesOverlay,
        informationOverlays,
        terrainOverlays,
        roadOverlays
    ]
});

layers.push(
    baselayers,
    overlays,
    markerOverlays
);

map.addLayer(layers);
ol.control.LayerSwitcher.renderPanel();

console.timeEnd('optionalLayers.js script loaded');