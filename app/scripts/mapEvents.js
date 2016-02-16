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
    infoOverlay: true
*/



var mapEventsModule = (function (mapModule) {
    'use strict';
    
    console.time('Map events initialized');
    
    var mapTooltip;
    
    
    /**
     * See http://openlayers.org/en/v3.4.0/examples/moveend.html
     */

    var _wrapLon = function (value) {
        var worlds = Math.floor((value + 180) / 360);
        return value - (worlds * 360);
    }



    /**
     * See http://openlayers.org/en/v3.4.0/examples/moveend.html
     */

    var _onMoveEnd = function (evt) {
        var map = evt.map,
            extent = mapModule.map.getView().calculateExtent(mapModule.map.getSize()),
            bottomLeft = ol.proj.transform(ol.extent.getBottomLeft(extent), 'EPSG:3857', 'EPSG:4326'),
            topRight = ol.proj.transform(ol.extent.getTopRight(extent), 'EPSG:3857', 'EPSG:4326');
        document.getElementById('left').value = _wrapLon(bottomLeft[0]).toFixed(2);
        document.getElementById('bottom').value = bottomLeft[1].toFixed(2)
        document.getElementById('right').value = _wrapLon(topRight[0]).toFixed(2);
        document.getElementById('top').value = topRight[1].toFixed(2);
    }



    /**
     * See http://openlayers.org/en/v3.4.0/examples/kml-timezones.html
     */

    var _displayFeatureTooltip = function (pixel) {
        //console.info('#map-tooltip 2:'+JSON.stringify(mapTooltip));
        mapTooltip.css({
            left: pixel[0] + 'px',
            top: (pixel[1] - 15) + 'px'
        });
        var feature = mapModule.map.forEachFeatureAtPixel(pixel, function (feature) { // feature, layer
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
    /*
    var _displayGridSourceInfoOverlay = function (coordinate) {

        var view = mapModule.map.getView();
        var viewResolution = / ** @type {number} * / (view.getResolution());
        gridSource.forDataAtCoordinateAndResolution(coordinate, viewResolution,
            function (data) {
                // If you want to use the template from the TileJSON,
                //  load the mustache.js library separately and call
                //  info.innerHTML = Mustache.render(gridSource.getTemplate(), data);
                mapElement.style.cursor = data ? 'pointer' : '';
                if (data) {
                    flagElement.src = 'data:image/png;base64,' + data.flag_png;
                    nameElement.innerHTML = data.admin;
                }
                mapOverlaysModule.infoOverlay.setPosition(data ? coordinate : undefined);

            });
    };
    */



    /**
     * Open country details modal
     */

    var _displayCountryDetails = function (pixel) { // coordinate

        var feature;

        feature = mapModule.map.forEachFeatureAtPixel(pixel, function (feature) { // feature, layer
            return feature;
        });

        if (feature) {
            var cid = feature.getId();
            console.log('Show feature ' + cid + ' "' + feature.get('name') + '"');
            
            countryDetailsModule.showCountryDetails(cid, 'ISO3');
            $('#country_details').modal('show');
        }

    };


    /**
     * http://openlayers.org/en/v3.4.0/examples/image-vector-layer.html
     */
    /*
    var highlight;
    var countryFeatureOverlay;
    
    var displayFeatureInfo = function (pixel) {

        var info,
            feature;

        feature = mapModule.map.forEachFeatureAtPixel(pixel, function (feature) { // feature, layer
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

        var features = [],
            info,
            i,
            ii;
        mapModule.map.forEachFeatureAtPixel(pixel, function (feature) { // feature, layer
            features.push(feature);
        });
        if (features.length > 0) {
            info = [];
            for (i = 0, ii = features.length; i < ii; i = i + 1) {
                info.push(features[i].get('name'));
            }
            document.getElementById('map_info').innerHTML = info.join(', ') || '(unknown)';
            mapModule.map.getTarget().style.cursor = 'pointer';
        } else {
            document.getElementById('map_info').innerHTML = '&nbsp;';
            mapModule.map.getTarget().style.cursor = '';
        }
    };*/
    
    
    /*
    var viewResolution = / ** @type {number} * / (view.getResolution());
    gridSource.forDataAtCoordinateAndResolution(coordinate, viewResolution,
        function (data) {

            console.log('Show country details');
            if (data) {
                console.log('Show country details: ' + JSON.stringify(data));
                $('#country_details').modal('show');
                var id = appModule.countryCodesISO2[data.id].toLowerCase();
                countryDetailsModule.showCountryDetails(id);
            }

        }
    );
    */



    

    $(function () {
        
        
        //var highlightStyleCache = {}; 
        
        var mapElement = document.getElementById('map');
        var popupElement = document.getElementById('popup');
        //var flagElement = document.getElementById('country-flag');
        //var nameElement = document.getElementById('country-name');

        // Tooltip
        // See http://openlayers.org/en/v3.4.0/examples/kml-timezones.html
        mapTooltip = $('#map-tooltip');
        //console.info('#map-tooltip:'+JSON.stringify(mapTooltip));
        mapTooltip.tooltip({
            animation: false,
            trigger: 'manual'
        });


        
        $.when(appModule.deferred.ready.map, appModule.countriesData).done(function () {    
            
            // Map click event
            // See http://openlayers.org/en/v3.4.0/examples/kml-timezones.html
            // See http://openlayers.org/en/v3.4.0/examples/kml.html
            // See http://openlayers.org/en/v3.4.0/examples/tileutfgrid.html
            mapModule.map.on('click', function (evt) {
                //displayFeatureInfo(evt.pixel);
                //displayKMLFeatureInfo(evt.pixel);
                _displayFeatureTooltip(evt.pixel);
                // _displayGridSourceInfoOverlay(evt.coordinate);
                _displayCountryDetails(evt.pixel);
            });

            
            
            // Pointer move
            // See http://openlayers.org/en/v3.4.0/examples/tileutfgrid.html
            // See http://openlayers.org/en/v3.4.0/examples/kml.html
            // See http://openlayers.org/en/v3.4.0/examples/image-vector-layer.html
            mapModule.map.on('pointermove', function (evt) {

                var pixel,
                    coordinate,
                    hit;

                if (evt.dragging) {
                    mapTooltip.tooltip('hide');
                    return;
                }
                pixel = mapModule.map.getEventPixel(evt.originalEvent);
                coordinate = mapModule.map.getEventCoordinate(evt.originalEvent);
                hit = mapModule.map.hasFeatureAtPixel(pixel);

                //displayFeatureInfo(pixel);
                //displayKMLFeatureInfo(pixel);
                // _displayGridSourceInfoOverlay(coordinate);

                // Popup
                if (evt.dragging) {
                    $(popupElement).popover('destroy');
                    return;
                }
                mapModule.map.getTarget().style.cursor = hit ? 'pointer' : '';

            });



            // Pointer stop
            // See http://openlayers.org/en/v3.4.0/examples/moveend.html
            mapModule.map.on('moveend', _onMoveEnd);


            var mapViewportId = mapModule.map.getViewport();
            
            // Map resize
            $(mapViewportId).resize(function () {
                mapModule.map.updateSize();
                console.log('Map size updated');
            });



            // View change
            // mapModule.map.events.fireEvent('change:view');



            // Mouse move on viewport
            // See http://openlayers.org/en/v3.4.0/examples/kml-timezones.html
            $(mapViewportId).on('mousemove', function (evt) {
                var pixel = mapModule.map.getEventPixel(evt.originalEvent);
                _displayFeatureTooltip(pixel);
            });
            
            console.timeEnd('Map events initialized');

        });
        
    });
    
    
    
    // return mapModule;

})(mapModule || {});