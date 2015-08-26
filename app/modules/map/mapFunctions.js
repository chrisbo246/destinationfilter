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
    map: true,
    countriesSource: true;
*/
/*
exported
    centerMap,
    fitCountry
*/


/**
 * Center map at a GPS position
 */

function centerMap(longitude, latitude, zoom) {
    'use strict';
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

function fitCountry(id) {
    'use strict';
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
