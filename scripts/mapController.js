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
    countriesData: true,
    countryCodesISO2: false
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

    // postcompose callback
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
        var source = mapLayersModule.countriesSource;
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

    $.when(deferred.ready.mapControls, deferred.ready.mapInteractions, deferred.ready.mapLayers, deferred.ready.mapOverlays).done(function () {
        

        
        $(function () {
    
            // Auto save/restore form fields with cookies
            // console.time('sayt initialized for #settings_form, #position_form');
            // $('#settings_form, #position_form').sayt(options.sayt);
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
                layers: mapLayersModule.layers,
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

                    // $.when(deferred.getJSON.countriesData, deferred.ready.userProfile, deferred.ready.priorities).done(function () {
                        // alert('refresh map');
                        scoreModule.updateScores();
                        map.updateSize();
                        mapLayersModule.scoresLayer.changed();
                        mapLayersModule.destinationsLayer.changed();
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
            
            /*$.when(deferred.init.i18next).done(function () {
                // Tooltips translation
                $('#map .ol-zoom-in[data-original-title]').attr('data-original-title', i18nextInstance.t('buttons:olZoomIn.label'));
                $('#map .ol-zoom-out[data-original-title]').attr('data-original-title', i18nextInstance.t('buttons:olZoomOut.label'));
            });*/
            
            /*var $el = $('.navmenu');
            $el.on('shown.bs.offcanvas', function (e) {

            });*/

            // initBlock('[data-anchor="map"]');
            
            mapModule.map = map;
            
            deferred.ready.map.resolve();
            console.timeEnd('Map initialized');
    
        });

        
    });
    
    
    $(function () {

        $.when(deferred.ready.map).done(function () {

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
