/*old-jslint indent: 2, unparam: true, plusplus: true */
/*
jslint
    devel: true,
    browser: true,
    node: false
*/
/*
global
    $,
    ol,
    deferred: true,
    map: false
*/

var mapLayersModule = (function () {
    'use strict';
    
    console.time('Map layers initialized');
    
    // Sources _____________________________________________________________________________________

    /*var countriesSource = new ol.source.GeoJSON({
        projection: 'EPSG:3857',
        url: 'data/geojson/countries.geojson'
    });*/
    var countriesSource = new ol.source.Vector({
        url: 'data/geojson/countries.geojson',
        format: new ol.format.GeoJSON()
    });
    
    
    
    // Styles ______________________________________________________________________________________

    /**
     * Timezones layer style
     * See http://openlayers.org/en/v3.4.0/examples/kml-timezones.html
     */

    var timezonesStyleFunction = function (feature) { // feature, resolution
        var offset = 0;
        var name = feature.get('name'); // e.g. GMT -08:30
        var match = name.match(/([\-+]\d{2}):(\d{2})$/);
        if (match) {
            var hours = parseInt(match[1], 10);
            var minutes = parseInt(match[2], 10);
            offset = 60 * hours + minutes;
        }
        var date = new Date();
        var local = new Date(date.getTime() +
            (date.getTimezoneOffset() + offset) * 60000);
        // offset from local noon (in hours)
        var delta = Math.abs(12 - local.getHours() + (local.getMinutes() / 60));
        if (delta > 12) {
            delta = 24 - delta;
        }
        var opacity = 0.75 * (1 - delta / 12);
        return [new ol.style.Style({
            fill: new ol.style.Fill({
                color: [0x55, 0x55, 0x55, opacity]
                //color: [0xff, 0xff, 0x33, opacity]
            }),
            stroke: new ol.style.Stroke({
                color: '#ffffff'
            })
        })];

    };



    /**
     * Destinations layer style
     */

    var destinationStyleFunction = function (feature) { // feature, resolution
        var opacity,
            score = 0,
            id = feature.getId(); // ISO2 lower case
            
        if (countriesData && countryCodesISO2[id]) {
            id = countryCodesISO2[id].toLowerCase(); // ISO3 lower case
            if (countriesData[id] && countriesData[id].percent) {
                score = countriesData[id].percent;
                // score = countriesData[id].score / countriesData[id].scoreMax * 100;
            }
        }

        opacity = ((score || 0) / 100) * 0.8;

        var style = new ol.style.Style({
            fill: new ol.style.Fill({
                color: [0x33, 0xff, 0x00, opacity]
                // color: [0xff, 0x33, 0x00, opacity]
            })/*,
            stroke: new ol.style.Stroke({
                color: '#319FD3',
                width: 1
            })*/
        });

        return [style];
        
    };



    /**
     * Missing data layer style
     */

    var missingDataStyleFunction = function (feature) { // feature, resolution
        var opacity,
            missingDataPercent = 0,
            id = feature.getId(); // ISO2 lower case

        if (countriesData && countryCodesISO2[id]) {
            id = countryCodesISO2[id].toLowerCase(); // ISO3 lower case
            if (countriesData[id] && countriesData[id].missingDataPercent) {
                missingDataPercent = countriesData[id].missingDataPercent;
                // score = countriesData[id].score / countriesData[id].scoreMax * 100;
            }
        }

        opacity = ((missingDataPercent || 0) / 100) * 0.8;

        var style = new ol.style.Style({
            fill: new ol.style.Fill({
                color: [0x88, 0x88, 0x88, opacity]
            })/*,
            stroke: new ol.style.Stroke({
                color: '#319FD3',
                width: 1
            })*/
        });

        return [style];
    };



    /**
     * Score layer style
     */

    var scoreStyleFunction = function (feature, resolution) {
        var opacity,
            intensity,
            percent,
            missingDataPercent,
            id;

        percent = 0;
        missingDataPercent = 0;
        id = feature.getId(); // ISO2 lower case
        if (countriesData && countryCodesISO2[id]) {
            id = countryCodesISO2[id].toLowerCase(); // ISO3 lower case
            if (countriesData[id] && countriesData[id].percent) {
                percent = countriesData[id].percent;
            }

            if (countriesData[id] && countriesData[id].missingDataPercent) {
                missingDataPercent = countriesData[id].missingDataPercent;
            }
        }

        opacity = ((percent || 0) / 100) * 0.6 + 0.4;
        intensity =  ((missingDataPercent || 0) / 100) * 1;

        var style = new ol.style.Style({
            text: new ol.style.Text({
                font: '1.25em bold Calibri,sans-serif',
                fill: new ol.style.Fill({
                    color: [168 * intensity, 84 * intensity, 0, opacity]
                }),
                stroke: new ol.style.Stroke({
                    color: [255, 255, 255, opacity * 0.5],
                    width: 1
                })
            })
        });

        if (percent >= 0) {
            style.getText().setText(resolution > 300 ? percent.toFixed() + '%' : '');
        }

        return [style];
    };
    


    // Base layers _________________________________________________________________________________

    var openStreetMapLayer = new ol.layer.Tile({
        name: 'openStreetMap',
        title: 'OpenStreetMap', // (offline)
        visible: true,
        type: 'base',
        preload: Infinity,
        source: new ol.source.OSM({
            // crossOrigin: null,
            urls: [
                'http://a.tile.openstreetmap.org/{z}/{x}/{y}.png'
                //'../../Datas/Tiles/osm_mapnik/{z}/{x}/{y}.png'
            ]
        })
    });

    var openCycleMapLayer = new ol.layer.Tile({
        name: 'openCycleMap',
        title: 'OpenCycleMap', // (offline)
        visible: false,
        type: 'base',
        preload: Infinity,
        source: new ol.source.OSM({ //XYZ
            attributions: [
              new ol.Attribution({
                html: 'All maps &copy; ' +
                    '<a href="http://www.opencyclemap.org/">OpenCycleMap</a>'
              }),
              ol.source.OSM.ATTRIBUTION
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

    var mapquestOSMLayer = new ol.layer.Tile({
        name: 'mapquestOSM',
        title: 'MapQuest OSM',
        visible: false,
        type: 'base',
        preload: Infinity,
        source: new ol.source.MapQuest({
            layer: 'osm'
        })
    });

    var mapquestSatLayer = new ol.layer.Tile({
        name: 'mapquestSat',
        title: 'MapQuest satellite',
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

    
    
    // Overlays ____________________________________________________________________________________

    var mapquestHybLayer = new ol.layer.Tile({
        name: 'mapquestHyb',
        title: 'MapQuest city names',
        visible: false,
        source: new ol.source.MapQuest({
            layer: 'hyb'
        })
    });


    var lonviaCyclingLayer = new ol.layer.Tile({
        name: 'lonviaCycling',
        title: 'Lonvia cycling',
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
            // urls: [
            //  'http://tile.waymarkedtrails.org/cycling/{z}/{x}/{y}.png',
            //  'http://tile.lonvia.de/cycling/{z}/{x}/{y}.png',
            //  '../../Datas/Tiles/lonvia_cycling/{z}/{x}/{y}.png'
            // ]
        })
    });

    var lonviaHikingLayer = new ol.layer.Tile({
        name: 'lonviaHiking',
        title: 'Lonvia hiking',
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

    /*var toolserverHillShadingLayer = new ol.layer.Tile({
        name: 'toolserverHillShading',
        title: 'Toolserver hill shading',
        visible: false,
        minZoom: 2,
        maxZoom: 15,
        source: new ol.source.XYZ({
            // crossOrigin: null,
            urls: [
                // 'http://toolserver.org/~cmarqu/hill/{z}/{x}/{y}.png',
                'http://a.tiles.wmflabs.org/hillshading/{z}/{x}/{y}.png',
                'http://b.tiles.wmflabs.org/hillshading/{z}/{x}/{y}.png',
                'http://c.tiles.wmflabs.org/hillshading/{z}/{x}/{y}.png'
            ]
        })
    });*/
    
    // if (map && map.getView()) {
    //    map.addLayer(scoresLayer);
    // } else {
    //    userOverlays.push(scoresLayer);
    // }

    // See http://openlayers.org/en/v3.4.0/examples/kml-timezones.html
    var timeZonesLayer = new ol.layer.Vector({
        name: 'timeZones',
        title: 'Time Zones',
        visible: false,
        style: timezonesStyleFunction,
        minResolution: 4891,
        source: new ol.source.Vector({
            extractStyles: false,
            projection: 'EPSG:3857',
            url: 'data/kml/timezones.kml',
            format: new ol.format.KML()
        })
        //source: new ol.source.Vector({
        //    url: 'data/kml/timezones.kml',
        //    format: new ol.format.KML({
        //        extractStyles: false
        //    })
        //})
    });

    var drawingVectorLayer = new ol.layer.Tile({
        name: 'drawing',
        title: 'My drawings',
        visible: false
        // ,
        //    source: new ol.source.MapQuest({layer: 'sat'})
    });

    //var gridLayer = new ol.layer.Tile({
    //  name: 'gridLayer',
    //  title: 'Country data',
    //  style: 'Grid',
    //  visible: false,
    //  source: gridSource
    //});

    // Groups
    var roadOverlays = new ol.layer.Group({
        name: 'roadOverlays',
        //title: i18nextInstance.t('sections:roadLayers.title'),
        layers: [
            mapquestHybLayer,
            lonviaHikingLayer,
            lonviaCyclingLayer
        ]
    });

    //var markerOverlays = new ol.layer.Group({
    //    name: 'markerOverlays',
    //    title: 'Markers',
    //    layers: [
    //    ]
    //});

    var informationOverlays = new ol.layer.Group({
        name: 'informationOverlays',
        //title: i18nextInstance.t('sections:infoLayers.title'),
        layers: [
            timeZonesLayer
            // gridLayer
        ]
    });

    /*var terrainOverlays = new ol.layer.Group({
        name: 'terrainOverlays',
        //title: i18nextInstance.t('sections:reliefLayers.title'),
        layers: [
            toolserverHillShadingLayer
        ]
    });*/
    

    
    var scoresLayer = new ol.layer.Vector({
        name: 'scores',
        title: 'Scores',
        style: scoreStyleFunction,
        visible: true,
        minResolution: 200,
        // maxResolution: 20000
        source: countriesSource
        //source: new ol.source.Vector({
        //    url: 'data/geojson/countries.geojson',
        //    format: new ol.format.GeoJSON({
        //      extractStyles: false
        //    })
        //})
    });

    var destinationsLayer = new ol.layer.Vector({
        name: 'destinations',
        title: 'My destinations',
        style: destinationStyleFunction,
        visible: true,
        minResolution: 200,
        // maxResolution: 20000
        source: countriesSource
        //source: new ol.source.Vector({
        //    url: 'data/geojson/countries.geojson',
        //    format: new ol.format.GeoJSON({
        //      extractStyles: false
        //    })
        //})
    });

    var missingDataLayer = new ol.layer.Vector({
        name: 'missingData',
        title: 'Missing data',
        style: missingDataStyleFunction,
        visible: false,
        minResolution: 200,
        // maxResolution: 20000
        source: countriesSource
        //source: new ol.source.Vector({
        //    url: 'data/geojson/countries.geojson',
        //    format: new ol.format.GeoJSON({
        //      extractStyles: false
        //    })
        //})
    });

    // Layer groups ________________________________________________________________________________
    
    
    // Layer groups
    var roadBaselayers = new ol.layer.Group({
        name: 'roadBaselayers',
        //title: i18nextInstance.t('sections:roadLayers.title'),
        layers: [
            // hikeBikeMapLayer,
            openStreetMapLayer,
            openSeaMapLayer,
            openCycleMapLayer,
            mapquestOSMLayer
        ]
    });

    var reliefBaselayers = new ol.layer.Group({
        name: 'reliefBaselayers',
        //title: i18nextInstance.t('sections:roadWithReliefLayers.title'),
        layers: [
            // stamenTerrainWithLabelsLayer,
            arcgisLayer
        ]
    });

    var aerialBaselayers = new ol.layer.Group({
        name: 'aerialBaselayers',
        //title: i18nextInstance.t('sections:satelliteLayers.title'),
        layers: [
            mapquestSatLayer
        ]
    });

    /*
    var hybridBaselayers = new ol.layer.Group({
        name: 'hybridBaselayers',
        title: 'Satellite w/ labels',
        layers: [
            // mapquestAerialWithLabelsLayer
        ]
    });

    var variousBaselayers = new ol.layer.Group({
        name: 'variousBaselayers',
        title: 'Various',
        layers: [

        ]
    });
    */

    var baselayers = new ol.layer.Group({
        name: 'baseLayers',
        //title: i18nextInstance.t('sections:baseLayer.title'),
        layers: [
            // variousBaselayers,
            // hybridBaselayers,
            aerialBaselayers,
            reliefBaselayers,
            roadBaselayers
        ]
    });

    var userOverlays = new ol.layer.Group({
        name: 'userOverlays',
        //title: i18nextInstance.t('sections:myLayers.title'),
        layers: [
            destinationsLayer,
            missingDataLayer,
            scoresLayer,
            drawingVectorLayer
        ]
    });

    var overlays = new ol.layer.Group({
        name: 'overlays',
        //title: i18nextInstance.t('sections:overlayLayers.title'),
        layers: [
            userOverlays,
            // toolOverlays,
            // euroveloRoutesOverlay,
            informationOverlays,
            // terrainOverlays,
            roadOverlays
        ]
    });
    
    var layers = [
            baselayers,
            overlays
            // markerOverlays
        ];

        
        
    // _____________________________________________________________________________________________
        
    // Update some layer styles once countriesData loaded
    $.when(deferred.getJSON.countriesData).done(function () {
        
        scoresLayer.setProperties({
            style: scoreStyleFunction
        });

        destinationsLayer.setProperties({
            style: destinationStyleFunction
        });

        missingDataLayer.setProperties({
            style: missingDataStyleFunction
        });
        
        console.log('Map styles updated'); 
        
    });
    
    // Translate layer and group titles once i18next plugin initialized
    $.when(deferred.init.i18next).done(function () {
        
        roadBaselayers.setProperties({
            title: i18nextInstance.t('sections:roadLayers.title')
        });

        reliefBaselayers.setProperties({
            title: i18nextInstance.t('sections:roadWithReliefLayers.title')
        });

        aerialBaselayers.setProperties({
            title: i18nextInstance.t('sections:satelliteLayers.title')
        });

        baselayers.setProperties({
            title: i18nextInstance.t('sections:baseLayer.title')
        });

        roadOverlays.setProperties({
            title: i18nextInstance.t('sections:roadLayers.title')
        });

        informationOverlays.setProperties({
            title: i18nextInstance.t('sections:infoLayers.title')
        });

        /*terrainOverlays.setProperties({
            title: i18nextInstance.t('sections:reliefLayers.title')
        });*/

        userOverlays.setProperties({
            title: i18nextInstance.t('sections:myLayers.title')
        });

        overlays.setProperties({
            title: i18nextInstance.t('sections:overlayLayers.title')
        });

        informationOverlays.setProperties({
            title: i18nextInstance.t('sections:infoLayers.title')
        });
        
        console.log('Map layers translated'); 
        
    });
    
      
    // Public variables and functions
    /*mapLayersModule.layers = layers;
    mapLayersModule.countriesSource = countriesSource;
    mapLayersModule.baselayers = baselayers;
    mapLayersModule.drawingVectorLayer = drawingVectorLayer;
    mapLayersModule.scoresLayer = scoresLayer;
    mapLayersModule.destinationsLayer = destinationsLayer;
    mapLayersModule.missingDataLayer = missingDataLayer;
      
    deferred.ready.mapLayers.resolve();
    console.timeEnd('Map layers initialized');   
        
    return mapModule;
    */
    
    return {
        layers: layers,
        countriesSource: countriesSource,
        baselayers: baselayers,
        drawingVectorLayer: drawingVectorLayer,
        scoresLayer: scoresLayer,
        destinationsLayer: destinationsLayer,
        missingDataLayer: missingDataLayer
    };
    
})();

deferred.ready.mapLayers.resolve();
console.timeEnd('Map layers initialized');  





/*
var roadOverlays = new ol.layer.Group({
    name: 'roadOverlays',
    //title: i18nextInstance.t('sections:roadLayers.title'),
    layers: [
        layers.overlay.mapquestHyb,
        layers.overlay.lonviaHiking,
        layers.overlay.lonviaCycling
    ]
});

var informationOverlays = new ol.layer.Group({
    name: 'informationOverlays',
    //title: i18nextInstance.t('sections:infoLayers.title'),
    layers: [
        layers.overlay.timeZones
        // layers.overlay.grid
    ]
});

var roadBaselayers = new ol.layer.Group({
    name: 'roadBaselayers',
    //title: i18nextInstance.t('sections:roadLayers.title'),
    layers: [
        // layers.base.hikeBikeMap,
        layers.base.openStreetMap,
        layers.base.openSeaMap,
        layers.base.openCycleMap,
        layers.base.mapquestOSM
    ]
});

var reliefBaselayers = new ol.layer.Group({
    name: 'reliefBaselayers',
    //title: i18nextInstance.t('sections:roadWithReliefLayers.title'),
    layers: [
        // layers.base.stamenTerrainWithLabels,
        layers.base.arcgis
    ]
});

var aerialBaselayers = new ol.layer.Group({
    name: 'aerialBaselayers',
    //title: i18nextInstance.t('sections:satelliteLayers.title'),
    layers: [
        layers.base.mapquestSat
    ]
});

var baselayers = new ol.layer.Group({
    name: 'baseLayers',
    //title: i18nextInstance.t('sections:baseLayer.title'),
    layers: [
        // variousBaselayers,
        // hybridBaselayers,
        aerialBaselayers,
        reliefBaselayers,
        roadBaselayers
    ]
});

var userOverlays = new ol.layer.Group({
    name: 'userOverlays',
    //title: i18nextInstance.t('sections:myLayers.title'),
    layers: [
        layers.overlay.destinations,
        layers.overlay.missingData,
        layers.overlay.scores,
        layers.overlay.drawingVector
    ]
});

var overlays = new ol.layer.Group({
    name: 'overlays',
    //title: i18nextInstance.t('sections:layers.overlay.title'),
    layers: [
        userOverlays,
        // toolOverlays,
        // euroveloRoutesOverlay,
        informationOverlays,
        // terrainOverlays,
        roadOverlays
    ]
});

var layers = [
    baselayers,
    overlays
    // markerOverlays
];
*/

/*
var hybridBaselayers = new ol.layer.Group({
    name: 'hybridBaselayers',
    title: 'Satellite w/ labels',
    layers: [
        // layers.base.mapquestAerialWithLabels
    ]
});

var variousBaselayers = new ol.layer.Group({
    name: 'variousBaselayers',
    title: 'Various',
    layers: [

    ]
});

var markerOverlays = new ol.layer.Group({
    name: 'markerOverlays',
    title: 'Markers',
    layers: [
    ]
});

var terrainOverlays = new ol.layer.Group({
    name: 'terrainOverlays',
    //title: i18nextInstance.t('sections:reliefLayers.title'),
    layers: [
        layers.overlay.toolserverHillShading
    ]
});
*/