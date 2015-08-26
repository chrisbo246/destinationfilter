/*old-jslint indent: 2, unparam: true, plusplus: true */
/*
jslint
    devel: true,
    browser: true,
    node: false
*/
/*
global
    ol,
    showCountryDetails,
    deferred: true,
    map: true,
    popupElement: true,
    infoOverlay: true,
    countryCodesISO2: true;
*/



var countryFeatureOverlay;



// Elements ________________________________________________________________________________________

var mapElement = document.getElementById('map');

// var flagElement = document.getElementById('country-flag');
// var nameElement = document.getElementById('country-name');

// Tooltip
// See http://openlayers.org/en/v3.4.0/examples/kml-timezones.html
var mapTooltip = $('#map-tooltip');
mapTooltip.tooltip({
    animation: false,
    trigger: 'manual'
});



// Sources _________________________________________________________________________________________

// See http://openlayers.org/en/v3.4.0/examples/tileutfgrid.html
/*var gridSource = new ol.source.TileUTFGrid({
    url: 'http://api.tiles.mapbox.com/v3/mapbox.geography-class.json'
});*/



// Events functions ____________________________________________________________________________



/**
 * See http://openlayers.org/en/v3.4.0/examples/moveend.html
 */

function wrapLon(value) {
    'use strict';
    var worlds = Math.floor((value + 180) / 360);
    return value - (worlds * 360);
}



/**
 * See http://openlayers.org/en/v3.4.0/examples/moveend.html
 */

function onMoveEnd(evt) {
    'use strict';
    var map = evt.map,
        extent = map.getView().calculateExtent(map.getSize()),
        bottomLeft = ol.proj.transform(ol.extent.getBottomLeft(extent), 'EPSG:3857', 'EPSG:4326'),
        topRight = ol.proj.transform(ol.extent.getTopRight(extent), 'EPSG:3857', 'EPSG:4326');
    document.getElementById('left').value = wrapLon(bottomLeft[0]).toFixed(2);
    document.getElementById('bottom').value = bottomLeft[1].toFixed(2)
    document.getElementById('right').value = wrapLon(topRight[0]).toFixed(2);
    document.getElementById('top').value = topRight[1].toFixed(2);
}



/**
 * http://openlayers.org/en/v3.4.0/examples/image-vector-layer.html
 */

var highlight;

/*var displayFeatureInfo = function (pixel) {
    'use strict';

    var info,
        feature;

    feature = map.forEachFeatureAtPixel(pixel, function (feature) { // feature, layer
        return feature;
    });

    info = document.getElementById('map_info');
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

};*/



/**
 *
 * See http://openlayers.org/en/v3.4.0/examples/kml.html
 */

/*var displayKMLFeatureInfo = function (pixel) {
    'use strict';
    
    var features = [],
        info,
        i,
        ii;
    map.forEachFeatureAtPixel(pixel, function (feature) { // feature, layer
        features.push(feature);
    });
    if (features.length > 0) {
        info = [];
        for (i = 0, ii = features.length; i < ii; i = i + 1) {
            info.push(features[i].get('name'));
        }
        document.getElementById('map_info').innerHTML = info.join(', ') || '(unknown)';
        map.getTarget().style.cursor = 'pointer';
    } else {
        document.getElementById('map_info').innerHTML = '&nbsp;';
        map.getTarget().style.cursor = '';
    }
};*/



/**
 * See http://openlayers.org/en/v3.4.0/examples/kml-timezones.html
 */

var displayFeatureTooltip = function (pixel) {
    'use strict';
    
    mapTooltip.css({
        left: pixel[0] + 'px',
        top: (pixel[1] - 15) + 'px'
    });
    var feature = map.forEachFeatureAtPixel(pixel, function(feature) { // feature, layer
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
 * Display country name and flag
 * See http://openlayers.org/en/v3.4.0/examples/tileutfgrid.html
 */

var displayGridSourceInfoOverlay = function (coordinate) {
    'use strict';
    
    var view = map.getView();
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



/**
 * Open country details modal
 */

var displayCountryDetails = function (pixel) { // coordinate
    'use strict';
    
    var feature;

    feature = map.forEachFeatureAtPixel(pixel, function (feature) { // feature, layer
        return feature;
    });

    if (feature) {
        if (countryCodesISO2) {
            console.log('Show country details for ' + feature.get('name') + ' (' + feature.getId() + ')');
            // console.info('countryCodesISO2 = ' + JSON.stringify(countryCodesISO2));
            var fid = feature.getId();
            var cid = countryCodesISO2[fid];
            if (cid) {
                $('#country_details').modal('show');
                showCountryDetails(cid.toLowerCase());
            } else {
                console.warn('Country clicked but ISO3:' + fid + ' to ISO2:' + cid + ' conversion has failed'); /* RemoveLogging:skip */
            }
        } else {
            console.warn('countryCodesISO2 array is not defined'); /* RemoveLogging:skip */
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



$.when(deferred.ready.map).then(function () {
    'use strict';

    // Feature overlay _____________________________________________________________________________

    /**
     * See http://openlayers.org/en/v3.4.0/examples/image-vector-layer.html
     * See http://openlayers.org/en/v3.4.0/examples/vector-layer.js
     */

    var highlightStyleCache = {};

    countryFeatureOverlay = new ol.FeatureOverlay({
        map: map,
        style: function(feature, resolution) {
            var text = ''; // resolution < 5000 ? feature.get('name') : '';
            if (!highlightStyleCache[text]) {
                highlightStyleCache[text] = [new ol.style.Style({
                    stroke: new ol.style.Stroke({
                      color: '#f00',
                      width: 1
                    }),
                    fill: new ol.style.Fill({
                      color: 'rgba(255,0,0,0.1)'
                    }),
                    text: new ol.style.Text({
                      font: '12px Calibri,sans-serif',
                      text: text,
                      fill: new ol.style.Fill({
                        color: '#000'
                      }),
                      stroke: new ol.style.Stroke({
                        color: '#f00',
                        width: 3
                      })
                    })
                })];
            }
            return highlightStyleCache[text];
        }
    });
        
        
    
    // Events ______________________________________________________________________________________

    // Map click event
    // See http://openlayers.org/en/v3.4.0/examples/kml-timezones.html
    // See http://openlayers.org/en/v3.4.0/examples/kml.html
    // See http://openlayers.org/en/v3.4.0/examples/tileutfgrid.html
    map.on('click', function (evt) {
        //displayFeatureInfo(evt.pixel);
        //displayKMLFeatureInfo(evt.pixel);
        displayFeatureTooltip(evt.pixel);
        // displayGridSourceInfoOverlay(evt.coordinate);
        displayCountryDetails(evt.pixel);
    });



    // Pointer move
    // See http://openlayers.org/en/v3.4.0/examples/tileutfgrid.html
    // See http://openlayers.org/en/v3.4.0/examples/kml.html
    // See http://openlayers.org/en/v3.4.0/examples/image-vector-layer.html
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

        //displayFeatureInfo(pixel);
        //displayKMLFeatureInfo(pixel);
        // displayGridSourceInfoOverlay(coordinate);

        // Popup
        if (evt.dragging) {
            $(popupElement).popover('destroy');
            return;
        }
        map.getTarget().style.cursor = hit ? 'pointer' : '';

    });



    // Pointer stop
    // See http://openlayers.org/en/v3.4.0/examples/moveend.html
    map.on('moveend', onMoveEnd);



    // Map resize
    $('#map').resize(function () {
        map.updateSize();
        console.log('Map size updated');
    });



    // View change
    // map.events.fireEvent('change:view');



    // Mouse move on viewport
    // See http://openlayers.org/en/v3.4.0/examples/kml-timezones.html
    $(map.getViewport()).on('mousemove', function (evt) {
        var pixel = map.getEventPixel(evt.originalEvent);
        displayFeatureTooltip(pixel);
    });

});
