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
    updateScores,
    deferred: true,
*/

var mapModule = (function () {
    'use strict'; 
   
    console.time('Map initialized');
    
    // Features
    /*
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
    */
    
    
    
    /**
     * geolocation-orientation
     */
    var render = function () {
        map.render();
    }
    
    
    
    /**
     * Center map at a GPS position
     */
    var centerMap = function (longitude, latitude, zoom) {
        
        var view = map.getView();
        view.setCenter(ol.proj.transform([longitude, latitude], 'EPSG:4326', 'EPSG:3857'));
        if (zoom) {
            view.setZoom(zoom);
        }
        console.log('Map centered at longitude: ' + longitude + ' latitude: ' + latitude + ' zoom: ' + zoom);
    }



    /**
     * Center the map on a country and adjust zoom
     * See http://openlayers.org/en/v3.4.0/examples/center.html
     */
    var fitCountry = function (id) {
        
        //var feature = source.getFeatures()[0];
        var source = countriesSource;
        var feature = source.getFeatureById(id);
        var polygon = /** @type {ol.geom.SimpleGeometry} */ (feature.getGeometry());
        var size = /** @type {ol.Size} */ (map.getSize());
        var view = map.getView();
        view.fitGeometry(
            polygon,
            size,
            {
              padding: [0, 0, 0, 0],
              constrainResolution: false
              // nearest: true,
              // minResolution: 50
            }
        );
    }



    /**
     * Destinations layer style
     */
    var destinationStyleFunction = function (feature) { // feature, resolution
        var opacity,
            score = 0,
            id = feature.getId(); // ISO2 lower case
        
        if (appModule.countriesData && appModule.countryCodesISO2[id]) {
            id = appModule.countryCodesISO2[id].toLowerCase(); // ISO3 lower case
            if (appModule.countriesData[id] && appModule.countriesData[id].percent) {
                score = appModule.countriesData[id].percent;
                // score = appModule.countriesData[id].score / appModule.countriesData[id].scoreMax * 100;
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

        if (appModule.countriesData && appModule.countryCodesISO2[id]) {
            id = appModule.countryCodesISO2[id].toLowerCase(); // ISO3 lower case
            if (appModule.countriesData[id] && appModule.countriesData[id].missingDataPercent) {
                missingDataPercent = appModule.countriesData[id].missingDataPercent;
                // score = appModule.countriesData[id].score / appModule.countriesData[id].scoreMax * 100;
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
        if (appModule.countriesData && appModule.countryCodesISO2[id]) {
            id = appModule.countryCodesISO2[id].toLowerCase(); // ISO3 lower case
            if (appModule.countriesData[id] && appModule.countriesData[id].percent) {
                percent = appModule.countriesData[id].percent;
            }

            if (appModule.countriesData[id] && appModule.countriesData[id].missingDataPercent) {
                missingDataPercent = appModule.countriesData[id].missingDataPercent;
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
    
    
    
    // Base layers
    var openStreetMapLayer = mapLayersModule.create('openStreetMap', {visible: true});
    var openCycleMapLayer = mapLayersModule.create('openCycleMap');
    var openSeaMapLayer = mapLayersModule.create('openSeaMap');
    var mapquestOSMLayer = mapLayersModule.create('mapquestOSM');
    var mapquestSatLayer = mapLayersModule.create('mapquestSat'); 
    var arcgisLayer = mapLayersModule.create('arcgis');    
    var stamenTerrainWithLabelsLayer = mapLayersModule.create('stamenTerrainWithLabels');
    
    // Overlays
    var mapquestHybLayer = mapLayersModule.create('mapquestHyb');
    var lonviaCyclingLayer = mapLayersModule.create('lonviaCycling');
    var lonviaHikingLayer = mapLayersModule.create('lonviaHiking');
    var timeZonesLayer = mapLayersModule.create('timeZones');
    var gpxFileLayer = mapLayersModule.create('gpxFile');
    mapLayersModule.GPXFileSource('#gpx_file_path', gpxFileLayer);

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
            timeZonesLayer,
            gpxFileLayer
        ]
    });   

    var countriesSource = new ol.source.Vector({
        url: 'data/countries.geojson',
        format: new ol.format.GeoJSON()
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
    
    // Layer groups
    var roadBaselayers = new ol.layer.Group({
        name: 'roadBaselayers',
        layers: [
            openSeaMapLayer,
            openCycleMapLayer,
            mapquestOSMLayer,
            openStreetMapLayer
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

    appModule.deferred.ready.mapLayers.resolve();

    
    
    var map;

    // "EPSG:3857" Spherical Mercator used by Google Maps, OpenStreetMap, Bing; unit is meter (see http://epsg.io/3857)
    // "EPSG:4326" World Geodetic System used in GPS; unit is longitude, latitude (see http://epsg.io/4326)
    var projection = ol.proj.get('EPSG:3857'); // EPSG:3857 EPSG:4326
    // var projection = view.getProjection()

    // var extent = [0, 0, 180, 85];
    // var extent = ol.proj.transformExtent([-180, -90, 180, 90], 'EPSG:4326', 'EPSG:3857');
    var extent = projection.getExtent();

    // var center =  ol.proj.transform([6.4090530, 46.0780249], 'EPSG:4326', 'EPSG:3857');
    var center = ol.extent.getCenter(extent);

    var view = new ol.View({
        center: center,
        extent: extent,
        maxResolution: 39135.76,
        projection: projection,
        zoom: 0
        // minZoom: 4,
        // maxZoom: 16
        // resolutions: [65536, 32768, 16384, 8192, 4096, 2048],
        // resolutions: [9784, 2446, 1223, 76.44, 9.55, 2.39]
    });

    $.when(appModule.deferred.ready.mapControls, appModule.deferred.ready.mapInteractions, appModule.deferred.ready.mapLayers, appModule.deferred.ready.mapOverlays).done(function () {
        $(function () {
    
            // Auto save/restore form fields with cookies
            // console.time('sayt initialized for #settings_form, #position_form');
            // $('#settings_form, #position_form').sayt(appModule.options.sayt);
            // console.timeEnd('sayt initialized for #settings_form, #position_form');

            var mapElement = document.getElementById('map');
            //map.setProperties({
            //    target: mapElement
            //});
            // Initialize map
            map = new ol.Map({
                logo: false,
                view: view,
                controls: mapControlsModule.controls,
                interactions: mapInteractionsModule.interactions,
                layers: layers,
                overlays: mapOverlaysModule.overlays,
                // renderer: renderer, // dom webgl canvas ol.RendererHint.CANVAS
                target: mapElement,
                loadTilesWhileInteracting: true
            });
        
            var noWebglInfo = document.getElementById('no-webgl');

            if (!ol.has.WEBGL) {
                noWebglInfo.style.display = '';
                // var renderer = 'canvas';
            } else {
                // var renderer = 'webgl';
            }
        
            // Redraw the map when the map tab pane become visible
            $('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
                var pane_id = $(e.target).attr('href');
                if (pane_id === '#map_pane') {

                    // $.when(appModule.countriesData, appModule.deferred.ready.userProfile, appModule.deferred.ready.priorities).done(function () {
                        // alert('refresh map');
                        scoreModule.updateScores();
                        map.updateSize();
                        scoresLayer.changed();
                        destinationsLayer.changed();
                        // map.renderSync();
                        // map.on('postcompose', render);
                        // map.render();
                        mapControlsModule.overviewMapControl.setMap(mapModule.map);
                        console.log('Map refreshed');
                    // });

                }
            });
            
            // Adapt map controls
            $('.ol-zoom-in, .ol-zoom-out, .ol-overviewmap button[title], .ol-zoom-extent button[title]').tooltip({
                placement: 'right'
            });
            $('.ol-rotate-reset, .ol-attribution button[title], .ol-full-screen button[title], .layer-switcher button[title]').tooltip({
                placement: 'left'
            });
            $('.layer-switcher button').addClass('ol-control');

            
            /*var $el = $('.navmenu');
            $el.on('shown.bs.offcanvas', function (e) {

            });*/

            // appModule.initBlock('[data-anchor="map"]');
            
            mapModule.map = map;
            
            appModule.deferred.ready.map.resolve();
            console.timeEnd('Map initialized');
    
        });
    });
    
    // Update some layer styles once appModule.countriesData loaded
    $.when(appModule.countriesData).then(function () {
        
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
       
        // Tooltips translation
        //$('#map .ol-zoom-in[data-original-title]').attr('data-original-title', appModule.i18n.t('buttons:olZoomIn.label'));
        //$('#map .ol-zoom-out[data-original-title]').attr('data-original-title', appModule.i18n.t('buttons:olZoomOut.label'));
            
    });
    

    
    $(function () {

        $.when(appModule.deferred.ready.map).done(function () {
            
            mapInputsModule.zoom('#zoom', mapModule.map);
            mapInputsModule.resolution('#resolution', mapModule.map);
            mapInputsModule.rotation('#rotation', mapModule.map);
            mapInputsModule.center('#center_x', '#center_y', mapModule.map);
            mapInputsModule.exportPNG('#export-png', mapModule.map);

            // GPS mode
            var $gpsMode = $('#gps_mode');
            $gpsMode.on('switchChange.bootstrapSwitch init', function () { // e, state
                if (this.checked) {
                    var view = mapModule.map.getView();
                    view.setZoom(14);
                    console.log('Zoom increased');
                }
            });

        });

    });
    
    
    
    return {
        map: map,
        render: render,
        centerMap: centerMap,
        fitCountry: fitCountry
    };
    
})();
