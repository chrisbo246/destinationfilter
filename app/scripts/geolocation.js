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
    deferred: true
    userDatas: true
*/



var geolocationModule = (function () {
    'use strict'; 

    /**
     *
     */
     
    var telizecomGeoip = function () {
        
        console.time('telize.com geolocation');
        // http://www.telize.com/geoip?callback=?
        return $.getJSON('http://www.telize.com/geoip', function (result) { 
            if (result.country_code) {
                // alert(JSON.stringify(result));
                $.when(appModule.deferred.ready.userProfile).done(function () {
                    $('#user_profile').val(result.country_code).trigger('change');
                    $('#user_country').val(result.country_code).trigger('change');
                    $('#user_address').val(result.postal_code + ' ' + result.city + ', ' + result.country).trigger('change');
                    userProfileModule.populateUserProfile(result.country_code.toLowerCase());
                });
                console.timeEnd('freegeoip.net geolocation');
            } else {
                console.warn('telize.com service returned an invalide JSON object');
            }
        }).fail(function () {
            console.warn('telize.com service unvailable');
        });
            
    };
    
    
    
    /**
     *
     */
     
    var freegeoipnetGeoip = function () {    
        
        console.time('freegeoip.net geolocation');
        return $.getJSON('http://freegeoip.net/json/', function (result) {
            if (result.country_code) {
                // alert(JSON.stringify(result));
                $.when(appModule.deferred.ready.userProfile).done(function () {
                    $('#user_profile').val(result.country_code).trigger('change');
                    $('#user_country').val(result.country_code).trigger('change');
                    $('#user_address').val(result.zip_code + ' ' + result.city + ', ' + result.country_name).trigger('change');
                    userProfileModule.populateUserProfile(result.country_code.toLowerCase());
                });
                console.timeEnd('freegeoip.net geolocation');
            } else {
                console.warn('freegeoip.net service returned an wrong data');
            }
        }).fail(function () {
            console.warn('freegeoip.net service unvailable');
        });
        
    };
    
    
            
    /**
     * recenters the view by putting the given coordinates at 3/4 from the top or the screen
     * geolocation-orientation
     */

    var _getCenterWithHeading = function (position, rotation, resolution) {
        var size = mapModule.map.getSize();
        var height = size[1];

        return [
            position[0] - Math.sin(rotation) * height * resolution * 1 / 4,
            position[1] + Math.cos(rotation) * height * resolution * 1 / 4
        ];
    }



    /**
     * geolocation-orientation
     */

    var _addPosition = function (position, heading, m, speed) {
        
        var x = position[0];
        var y = position[1];
        var fCoords = positions.getCoordinates();
        var previous = fCoords[fCoords.length - 1];
        var prevHeading = previous && previous[2];
        if (prevHeading) {
            var headingDiff = heading - mod(prevHeading);

            // force the rotation change to be less than 180°
            if (Math.abs(headingDiff) > Math.PI) {
              var sign = (headingDiff >= 0) ? 1 : -1;
              headingDiff = - sign * (2 * Math.PI - Math.abs(headingDiff));
            }
            heading = prevHeading + headingDiff;
        }
        positions.appendCoordinate([x, y, heading, m]);

        // only keep the 20 last coordinates
        positions.setCoordinates(positions.getCoordinates().slice(-20));

        // FIXME use speed instead
        if (heading && speed) {
            markerEl.src = 'images/geolocation_marker_heading.png';
        } else {
            markerEl.src = 'images/geolocation_marker.png';
        }
    }



    /**
     * Reverse geocoding using openstreetmap nominative service
     */

    var _updateUserAddress = function () { // lon, lat

        console.time(_updateUserAddress.name + ' function executed');

        var position = geolocation.getPosition();
        if (position) {
            position = ol.proj.transform(position, 'EPSG:3857', 'EPSG:4326');
            var url = 'http://nominatim.openstreetmap.org/reverse?format=json&lon=' + position[0] + '&lat=' + position[1] + '&zoom=1&addressdetails=1&format=json';

            $.ajax({
                url: url,
                dataType: 'xml',
                async: false,
                success: function (json) {
                    // var json = $.xml2json(xml);
                    if (json && json.addressparts) {
                        // console.log(JSON.stringify(json.addressparts));
                        $('#user_address').val(json.addressparts.road + ', ' + json.addressparts.postcode + ' ' + json.addressparts.town + ', ' + json.addressparts.country);
                        $('#user_profile').val(json.addressparts.country_code.toUpperCase()).trigger('change');
                        userDatas.addressparts = json.addressparts;
                    }
                }
            });

        }

        console.timeEnd(_updateUserAddress.name + ' function executed');
    }



    $.when(appModule.deferred.ready.map).then(function () { // , appModule.deferred.load.mapSettings

        var geolocation = new ol.Geolocation(/** @type {olx.GeolocationOptions} */ ({
            projection: mapModule.map.getView().getProjection(),
            trackingOptions: {
                maximumAge: 10000,
                enableHighAccuracy: true,
                timeout: 600000
            }
        }));

        // LineString to store the different geolocation positions. This LineString is time aware.
        // The Z dimension is actually used to store the rotation (heading).
        var positions = new ol.geom.LineString([], /** @type {ol.geom.GeometryLayout} */ ('XYZM'));

        var deltaMean = 500; // the geolocation sampling period mean in ms      

        var previousM = 0;
 
        // Try to define user location using a web service if there is no stored data
        /*if (jQuery.isEmptyObject(way.get())) {
            telizecomGeoip().fail(function() {
                freegeoipnetGeoip();
            });
        }*/
        
        $(function () {

            var markerEl = document.getElementById('geolocation_marker');
            
            mapModule.map.addOverlay(new ol.Overlay({
                positioning: 'center-center',
                element: markerEl,
                stopEvent: false
            }));
            
            // change center and rotation before render
            mapModule.map.beforeRender(function(map, frameState) {
                if (frameState !== null) {
                    // use sampling period to get a smooth transition
                    var m = frameState.time - deltaMean * 1.5;
                    m = Math.max(m, previousM);
                    previousM = m;
                    // interpolate position along positions LineString
                    var c = positions.getCoordinateAtM(m, true);
                    var view = frameState.viewState;
                    if (c) {
                        //if ($gpsMode.attr('checked')) {
                            view.center = _getCenterWithHeading(c, -c[2], view.resolution);
                        //}
                        //else {
                        //    view.center = c;
                        //}
                        //if ($rotateMap.attr('checked')) {
                            view.rotation = -c[2];
                        //}
                        //else {
                        //    view.rotation = 0;
                        //}
                        markerEl.setPosition(c);
                    }
                }
                return true; // Force animation to continue
            });
            
            // Start / stop geolocation
            $('#track').on('switchChange.bootstrapSwitch init', function () { // e, state
            // $('#track').on('change', function () {
                console.info((this.checked) ? '#track is checked' : '#track is not checked');
                geolocation.setTracking(this.checked);
                
                if (this.checked) {
                    $('#user_address').closest('.form-group').addClass('hidden');
                    mapModule.map.on('postcompose', render);
                    mapModule.map.render();
                    var position = geolocation.getPosition();
                    if (position) {
                        mapModule.map.getView().setCenter(position);
                    }
                } else {
                    $('#user_address').closest('.form-group').removeClass('hidden');
                }
            });
            
            // handle geolocation error.
            geolocation.on('error', function (error) {
                var info = document.getElementById('map_alert');
                info.getElementsByTagName('div').innerHTML = error.message;
                info.style.display = '';
            });

            // Listen to position changes
            geolocation.on('change', function () {
                var position = geolocation.getPosition(),
                    accuracy = geolocation.getAccuracy(),
                    heading = geolocation.getHeading() || 0,
                    speed = geolocation.getSpeed() || 0,
                    m = Date.now(),
                    altitude = geolocation.getAltitude() || 0,
                    altitudeAccuracy = geolocation.getAltitudeAccuracy() || 0,
                    coords,
                    len;

                _addPosition(position, heading, m, speed);

                coords = positions.getCoordinates();
                len = coords.length;
                if (len >= 2) {
                    deltaMean = (coords[len - 1][3] - coords[0][3]) / (len - 1);
                }

                // position = ol.proj.transform(position, 'EPSG:3857', infoProjection);

                view = mapModule.map.getView();
                projection = view.getProjection();
                var units = projection.getUnits();

                $.when(appModule.deferred.load.mapSettings).then(function () {
                    
                    // $('#position').text(position[0].toFixed(2) + ', ' + position[1].toFixed(2) + ' deg');
                    $('#longitude').text(position[0].toFixed(2) + ' ' + units);
                    $('#latitude').text(position[1].toFixed(2) + ' ' + units);
                    $('#accuracy').text(accuracy + ' ' + units);

                    $('#heading').text(Math.round(radToDeg(heading)) + ' deg');
                    $('#speed').text((speed * 3.6).toFixed(1) + ' km/h');
                    // el('speed').text(geolocation.getSpeed() + ' m/s');
                    $('#delta').text(Math.round(deltaMean) + ' ms');

                    $('#altitude').text(altitude + ' m');
                    $('#altitudeAccuracy').text(altitudeAccuracy + ' m');
                    
                });
                
            });

            // Center map on user position on button click
            $el = $('#center_map_on_user_location');
            if ($el) {
                $el.on('click', function (e) {
                    e.preventDefault();
                    var position = geolocation.getPosition();
                    if (position) {
                        mapModule.map.getView().setCenter(position);
                        console.log('Map centered on user position');
                    }

                    _updateUserAddress();

                });
            }
            
            // Show / hide marker checkbox
            var $el = $('#display_geolocation_marker');
            if ($el) {
                $el.on('switchChange.bootstrapSwitch', function () { // e, state
                    if (this.checked) {
                        $('#geolocation_marker').removeClass('hidden');
                    } else {
                        $('#geolocation_marker').addClass('hidden');
                    }
                }).trigger('switchChange.bootstrapSwitch');
            }

                
            /*
            // accuracy
            var accuracyFeature = new ol.Feature();
            accuracyFeature.bindTo('geometry', geolocation, 'accuracyGeometry');

            // position
            var positionFeature = new ol.Feature();
            positionFeature.bindTo('geometry', geolocation, 'position')
                .transform(function () {}, function (coordinates) {
                    'use strict';
                    return coordinates ? new ol.geom.Point(coordinates) : null;
                });
            */
            
            // Projection fields
            // degrees', 'ft', 'm' or 'pixels
            /*var $projection = $('#projection');
            $projection.on('change', function () {
              var projectionCode = $projection.val();
              mapModule.map.control.MousePosition.setProjection(projectionCode);
              mapModule.map.Geolocation.setProjection(projectionCode);
            });*/


            
            // Device orientation __________________________________________________________________________
            
            var deviceOrientation = new ol.DeviceOrientation();

            deviceOrientation.on('change', function () {

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
                var view = mapModule.map.getView(),
                    center = view.getCenter(),
                    resolution = view.getResolution(),
                    beta = event.target.getBeta() || 0,
                    gamma = event.target.getGamma() || 0;

                center[0] -= resolution * gamma * 25;
                center[1] += resolution * beta * 25;

                // view.setCenter(view.constrainCenter(center));

            });
        
        });
        
    });

})();