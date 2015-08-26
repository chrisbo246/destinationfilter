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
    countriesDatas: true,
    countryCodesISO2: false
*/
/*
exported
    centerMap,
    fitCountry
*/
/**
 * www.destinationfilter.tk 0.7.0
 * https://github.com/christopheboisier/DestinationFinder/
 * MIT licensed
 * @author Christophe BOISIER
 *
 * Copyright (C) 2015 Christophe BOISIER
 */
console.time('mapController.js script loaded');

var map;

var layerSwitcher;

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


// Features ________________________________________________________________________________________

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


// Styles __________________________________________________________________________________________

/**
 * Timezones layer style
 * See http://openlayers.org/en/v3.4.0/examples/kml-timezones.html
 */

var timezonesStyleFunction = function (feature) { // feature, resolution
    'use strict';
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
    'use strict';

    var opacity,
        score = 0,
        id = feature.getId(); // ISO2 lower case

    if (countriesDatas && countryCodesISO2[id]) {
        id = countryCodesISO2[id].toLowerCase(); // ISO3 lower case
        if (countriesDatas[id] && countriesDatas[id].percent) {
            score = countriesDatas[id].percent;
            // score = countriesDatas[id].score / countriesDatas[id].scoreMax * 100;
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
    'use strict';

    var opacity,
        missingDataPercent = 0,
        id = feature.getId(); // ISO2 lower case

    if (countriesDatas && countryCodesISO2[id]) {
        id = countryCodesISO2[id].toLowerCase(); // ISO3 lower case
        if (countriesDatas[id] && countriesDatas[id].missingDataPercent) {
            missingDataPercent = countriesDatas[id].missingDataPercent;
            // score = countriesDatas[id].score / countriesDatas[id].scoreMax * 100;
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
    'use strict';
    
    var opacity,
        intensity,
        percent,
        missingDataPercent,
        id;

    percent = 0;
    missingDataPercent = 0;
    id = feature.getId(); // ISO2 lower case
    if (countriesDatas && countryCodesISO2[id]) {
        id = countryCodesISO2[id].toLowerCase(); // ISO3 lower case
        if (countriesDatas[id] && countriesDatas[id].percent) {
            percent = countriesDatas[id].percent;
        }

        if (countriesDatas[id] && countriesDatas[id].missingDataPercent) {
            missingDataPercent = countriesDatas[id].missingDataPercent;
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



deferred.load.map.resolve();

$.when(deferred.load.map, deferred.load.mapSettings, deferred.load.data).then(function () {

    'use strict';

    // Sources _____________________________________________________________________________________

    var countriesSource = new ol.source.GeoJSON({
        projection: 'EPSG:3857',
        url: 'data/geojson/countries.geojson'
    });



    // Base layers _________________________________________________________________________________

    console.time('Map layers defined');

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
                /*,
                      '../../Datas/Tiles/osm_mapnik/{z}/{x}/{y}.png'*/
            ]
        })
    });

    var openCycleMapLayer = new ol.layer.Tile({
        name: 'openCycleMap',
        title: 'OpenCycleMap', // (offline)
        visible: false,
        type: 'base',
        preload: Infinity,
        source: new ol.source.XYZ({
            attributions: [
                new ol.Attribution({
                    html: 'All maps &copy; <a href="http://www.opencyclemap.org/">OpenCycleMap</a>'
                })
                // ol.source.OSM.DATA_ATTRIBUTION // issue
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

    // Layer groups
    var roadBaselayers = new ol.layer.Group({
        name: 'roadBaselayers',
        title: $.t('sections:roadLayers.title'),
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
        title: $.t('sections:roadWithReliefLayers.title'),
        layers: [
            // stamenTerrainWithLabelsLayer,
            arcgisLayer
        ]
    });

    var aerialBaselayers = new ol.layer.Group({
        name: 'aerialBaselayers',
        title: $.t('sections:satelliteLayers.title'),
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
        title: $.t('sections:baseLayer.title'),
        layers: [
            // variousBaselayers,
            // hybridBaselayers,
            aerialBaselayers,
            reliefBaselayers,
            roadBaselayers
        ]
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
        source: new ol.source.KML({
            extractStyles: false,
            projection: 'EPSG:3857',
            url: 'data/kml/timezones.kml'
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
        title: $.t('sections:roadLayers.title'),
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
        title: $.t('sections:infoLayers.title'),
        layers: [
            timeZonesLayer
            // gridLayer
        ]
    });

    /*var terrainOverlays = new ol.layer.Group({
        name: 'terrainOverlays',
        title: $.t('sections:reliefLayers.title'),
        layers: [
            toolserverHillShadingLayer
        ]
    });*/

    var userOverlays = new ol.layer.Group({
        name: 'userOverlays',
        title: $.t('sections:myLayers.title'),
        layers: [
            destinationsLayer,
            missingDataLayer,
            scoresLayer,
            drawingVectorLayer
        ]
    });

    var overlays = new ol.layer.Group({
        name: 'overlays',
        title: $.t('sections:overlayLayers.title'),
        layers: [
            userOverlays,
            // toolOverlays,
            // euroveloRoutesOverlay,
            informationOverlays,
            //terrainOverlays,
            roadOverlays
        ]
    });


    console.timeEnd('Map layers defined');



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
        tipLabel: $.t('buttons:olOverviewmap.label')
    });

    var attribution = new ol.control.Attribution({
        collapsible: true,
        tipLabel: $.t('buttons:olAttribution.label')
    });

    var zoomToExtentControl = new ol.control.ZoomToExtent({
        extent: extent,
        tipLabel: $.t('buttons:olZoomExtent.label')
    });

    // scale-line
    var scaleLineControl = new ol.control.ScaleLine({
        tipLabel: $.t('buttons:olScaleLine.label')
    });

    // mouse-position
    var mousePositionControl = new ol.control.MousePosition({
        coordinateFormat: ol.coordinate.createStringXY(4),
        projection: 'EPSG:4326', // infoProjection
        // comment the following two lines to have the mouse position
        // be placed within the map.
        className: 'custom-mouse-position',
        target: document.getElementById('mouse-position'),
        undefinedHTML: '&nbsp;'
    });

    // Layerswitcher
    layerSwitcher = new ol.control.LayerSwitcher({
        tipLabel: $.t('buttons:olLayerswitcher.label')
    });
    // map.addControl(layerSwitcher);

    var fullScreenControl = new ol.control.FullScreen({
        // className: 'ol-glyphicon',
        // label: '\e140',
        tipLabel: $.t('buttons:olFullScreen.label')
    });



    // Overlays ________________________________________________________________________________________

    /**
     * See http://openlayers.org/en/v3.4.0/examples/tileutfgrid.html
     */

    var infoElement = document.getElementById('country-info');
    var infoOverlay = new ol.Overlay({
        element: infoElement,
        offset: [15, 15],
        stopEvent: false
    });
    // map.addOverlay(infoOverlay);

    var popupElement = document.getElementById('popup');
    var popup = new ol.Overlay({
        element: popupElement,
        positioning: 'bottom-center',
        stopEvent: false
    });
    // map.addOverlay(popup);





    /**
     * button-title
     */


    // Tooltips translation
    // $('#map .ol-zoom-in[data-original-title]').attr('data-original-title', $.t('buttons:olZoomIn.label'));
    // $('#map .ol-zoom-out[data-original-title]').attr('data-original-title', $.t('buttons:olZoomOut.label'));

    var noWebglInfo = document.getElementById('no-webgl');

    // _________________________________________________________________________________________________


    // Auto save/restore form fields with cookies
    // console.time('sayt initialized for #settings_form, #position_form');
    // $('#settings_form, #position_form').sayt(options.sayt);
    // console.timeEnd('sayt initialized for #settings_form, #position_form');

    var mapElement = document.getElementById('map');


    // Map _____________________________________________________________________________________________

    if (!ol.has.WEBGL) {
        noWebglInfo.style.display = '';
        // var renderer = 'canvas';
    } else {
        // var renderer = 'webgl';
    }

    map = new ol.Map({
        logo: false,
        view: view,
        controls: ol.control.defaults({
            attribution: false,
            attributionOptions: /** @type {olx.control.AttributionOptions} */ ({
                collapsible: false
            }),
            zoomOptions: {
                zoomInTipLabel: $.t('buttons:olZoomIn.label'),
                zoomOutTipLabel: $.t('buttons:olZoomOut.label')
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
        layers: [
            baselayers,
            overlays
            // markerOverlays
        ],
        overlays: [
            infoOverlay,
            popup
            //marker
        ],
        // renderer: renderer, // dom webgl canvas ol.RendererHint.CANVAS
        target: mapElement,
        loadTilesWhileInteracting: true
    });


    console.info('Map initialized');

    // Tell the world that map is ready
    deferred.ready.map.resolve();

   // Manage events
   //$.getScript('modules/map/mapEvents.js');



    // _____________________________________________________________________________________________

    // Adapt map controls
    $('.ol-zoom-in, .ol-zoom-out, .ol-overviewmap button[title], .ol-zoom-extent button[title]').tooltip({
        placement: 'right'
    });
    $('.ol-rotate-reset, .ol-attribution button[title], .ol-full-screen button[title], .layer-switcher button[title]').tooltip({
        placement: 'left'
    });
    $('.layer-switcher button').addClass('ol-control');

    // Redraw the map when the map tab pane become visible
    
    $('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
        var pane_id = $(e.target).attr('href');
        // var pane_id = $(e.currentTarget).attr('href');

        console.log(pane_id + ' tab shown');
        if (pane_id === '#map_pane' && map) {
            
            $.when(deferred.load.data, deferred.ready.userProfile, deferred.ready.priorities).then(function () {
                // alert('refresh map');
                updateScores();
                map.updateSize();
                scoresLayer.changed();
                destinationsLayer.changed();
                // map.renderSync();
                // map.on('postcompose', render);
                // map.render();
                overviewMapControl.setMap(map);
                console.log('Map refreshed');
            });

        }
    });

    /*var $el = $('.navmenu');
    $el.on('shown.bs.offcanvas', function (e) {

    });*/

    // Auto-save / restore forms (with id) from cookies
    /*$(window).on('load', function () {
        $('[data-anchor="map"]').find('form[id].sayt').each(function () {
            var $el = $(this);
            $el.sayt(options.sayt);
            $el.find(':input').trigger('change');
            console.log('#' + $el.attr('id') + ' restored from cookies');
        });
    });*/

    // initBlock('[data-anchor="map"]');

    // Controls inputs _____________________________________________________________________________

        // Scale-line units
    var unitsSelect = $('#units');
    unitsSelect.on('change', function () {
        scaleLineControl.setUnits(this.value);
    });
    unitsSelect.val(scaleLineControl.getUnits());

    // Mouse projection
    var projectionSelect = $('#projection');
    projectionSelect.on('change', function () {
        mousePositionControl.setProjection(ol.proj.get(this.value));
    });
    projectionSelect.val(mousePositionControl.getProjection().getCode());

    // Mouse precision
    var precisionInput = $('#precision');
    precisionInput.on('change', function () {
        var format = ol.coordinate.createStringXY(this.valueAsNumber);
        mousePositionControl.setCoordinateFormat(format);
    });

    console.timeEnd('Map initialized');

});




console.timeEnd('mapController.js script loaded');