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

var mapOverlaysModule = (function () {
    'use strict';

    console.time('Map overlays initialized');
    
    /**
     * See http://openlayers.org/en/v3.4.0/examples/tileutfgrid.html
     */

    var infoOverlay = new ol.Overlay({
        //element: infoElement,
        offset: [15, 15],
        stopEvent: false
    });
    // map.addOverlay(infoOverlay);

    var popup = new ol.Overlay({
        //element: popupElement,
        positioning: 'bottom-center',
        stopEvent: false
    });
    // map.addOverlay(popup);
    
    var overlays = [
            infoOverlay,
            popup
            //marker
        ];
            
    $(function () {
            
        var infoElement = document.getElementById('country-info');
        infoOverlay.setProperties({
            element: infoElement
        });
        
        var popupElement = document.getElementById('popup');
        popup.setProperties({
            element: popupElement
        });

        /*mapOverlaysModule.overlays = overlays;
        mapOverlaysModule.infoOverlay = infoOverlay;
        mapOverlaysModule.popup = popup;  
        */
        
    });
    
    
    return {
        overlays: overlays,
        infoOverlay: infoOverlay,
        popup: popup
    };

})();

appModule.deferred.ready.mapOverlays.resolve();      
console.timeEnd('Map overlays initialized');    