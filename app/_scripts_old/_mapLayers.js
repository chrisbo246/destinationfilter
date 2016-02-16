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
    
    var countriesData,
        countryCodesISO2;
        
        
    
    // Sources _____________________________________________________________________________________

    var countriesSource = new ol.source.Vector({
        url: 'data/countries.geojson',
        format: new ol.format.GeoJSON()
    });
    
    
    
    // Styles ______________________________________________________________________________________

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
    var openStreetMapLayer = mapLayersModule.create('openStreetMap');
    var openCycleMapLayer = mapLayersModule.create('openCycleMap');
    var openSeaMapLayer = mapLayersModule.create('openSeaMap');
    var mapquestOSMLayer = mapLayersModule.create('mapquestOSM');
    var mapquestSatLayer = mapLayersModule.create('mapquestSat'); 
    var arcgisLayer = mapLayersModule.create('arcgis');    
    var stamenTerrainWithLabelsLayer = mapLayersModule.create('stamenTerrainWithLabels');
    
    // Overlays ____________________________________________________________________________________

    var mapquestHybLayer = mapLayersModule.create('mapquestHyb');
    var lonviaCyclingLayer = mapLayersModule.create('lonviaCycling');
    var lonviaHikingLayer = mapLayersModule.create('lonviaHiking');
    var timeZonesLayer = mapLayersModule.create('timeZones');

    var drawingVectorLayer = new ol.layer.Tile({
        name: 'drawing',
        title: 'My drawings',
        visible: false
    });

    // Groups
    var roadOverlays = new ol.layer.Group({
        name: 'roadOverlays',
        layers: [
            mapquestHybLayer,
            lonviaHikingLayer,
            lonviaCyclingLayer
        ]
    });

    var informationOverlays = new ol.layer.Group({
        name: 'informationOverlays',
        layers: [
            timeZonesLayer
        ]
    });   

    
    var scoresLayer = new ol.layer.Vector({
        name: 'scores',
        title: 'Scores',
        visible: true,
        minResolution: 200,
        source: countriesSource
    });

    var destinationsLayer = new ol.layer.Vector({
        name: 'destinations',
        title: 'My destinations',
        visible: true,
        minResolution: 200,
        source: countriesSource
    });

    var missingDataLayer = new ol.layer.Vector({
        name: 'missingData',
        title: 'Missing data',
        visible: false,
        minResolution: 200,
        source: countriesSource
    });

    // Layer groups ________________________________________________________________________________
    
    
    // Layer groups
    var roadBaselayers = new ol.layer.Group({
        name: 'roadBaselayers',
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
        layers: [
            stamenTerrainWithLabelsLayer,
            arcgisLayer
        ]
    });

    var aerialBaselayers = new ol.layer.Group({
        name: 'aerialBaselayers',
        layers: [
            mapquestSatLayer
        ]
    });

    var baselayers = new ol.layer.Group({
        name: 'baseLayers',
        layers: [
            aerialBaselayers,
            reliefBaselayers,
            roadBaselayers
        ]
    });

    var userOverlays = new ol.layer.Group({
        name: 'userOverlays',
        layers: [
            destinationsLayer,
            missingDataLayer,
            scoresLayer
        ]
    });

    var overlays = new ol.layer.Group({
        name: 'overlays',
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
    $.when(appModule.deferred.getJSON.countriesData && appModule.deferred.getJSON.countriesData).done(function () {
        
        countriesData = appModule.countriesData;
        countryCodesISO2 = appModule.countryCodesISO2;
        
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
    $.when(appModule.deferred.init.i18next).done(function () {
        
        roadBaselayers.setProperties({
            title: appModule.i18n.t('sections:roadLayers.title')
        });

        reliefBaselayers.setProperties({
            title: appModule.i18n.t('sections:roadWithReliefLayers.title')
        });

        aerialBaselayers.setProperties({
            title: appModule.i18n.t('sections:satelliteLayers.title')
        });

        baselayers.setProperties({
            title: appModule.i18n.t('sections:baseLayer.title')
        });

        roadOverlays.setProperties({
            title: appModule.i18n.t('sections:roadLayers.title')
        });

        informationOverlays.setProperties({
            title: appModule.i18n.t('sections:infoLayers.title')
        });

        /*terrainOverlays.setProperties({
            title: appModule.i18n.t('sections:reliefLayers.title')
        });*/

        userOverlays.setProperties({
            title: appModule.i18n.t('sections:myLayers.title')
        });

        overlays.setProperties({
            title: appModule.i18n.t('sections:overlayLayers.title')
        });

        informationOverlays.setProperties({
            title: appModule.i18n.t('sections:infoLayers.title')
        });
        
        console.log('Map layers translated'); 
        
    });
    
      

    return {
        layers: layers,
        countriesSource: countriesSource,
        baselayers: baselayers,
        scoresLayer: scoresLayer,
        destinationsLayer: destinationsLayer,
        missingDataLayer: missingDataLayer
    };
    
})();

appModule.deferred.ready.mapLayers.resolve();
console.timeEnd('Map layers initialized'); 
