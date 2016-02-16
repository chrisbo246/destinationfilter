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

var mapControlsModule = (function () {
    'use strict';
    
    console.time('Map controls initialized'); 

    // Controls ________________________________________________________________________________

    var attribution = new ol.control.Attribution({
        collapsible: true,
        //tipLabel: appModule.i18n.t('buttons:olAttribution.label')
    });

    //var projection = view.getProjection()
    //var extent = projection.getExtent();
    var zoomToExtentControl = new ol.control.ZoomToExtent({
        //extent: extent,
        //tipLabel: appModule.i18n.t('buttons:olZoomExtent.label')
    });

    // scale-line
    var scaleLineControl = new ol.control.ScaleLine({
        //tipLabel: appModule.i18n.t('buttons:olScaleLine.label')
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
    var layerSwitcher = new ol.control.LayerSwitcher({
        //tipLabel: appModule.i18n.t('buttons:olLayerswitcher.label')
    });
    // map.addControl(layerSwitcher);

    var fullScreenControl = new ol.control.FullScreen({
        // className: 'ol-glyphicon',
        // label: '\e140',
        //tipLabel: appModule.i18n.t('buttons:olFullScreen.label')
    });
    
    // overviewmap-custom
    var overviewMapControl = new ol.control.OverviewMap({
        // see in overviewmap-custom.html to see the custom CSS used
        className: 'ol-overviewmap ol-custom-overviewmap',
        //layers: [
        //    mapLayersModule.baselayers
        //],
        collapseLabel: '\u00AB',
        label: '\u00BB',
        collapsed: true,
        //tipLabel: appModule.i18n.t('buttons:olOverviewmap.label')
    });

    // Define overview layers once layers are defined
    $.when(appModule.deferred.ready.mapLayers).done(function () {
        overviewMapControl.setProperties({
            layers:  [mapLayersModule.baselayers]
        });
    });

    // Inputs ______________________________________________________________________________________

    $(function () {
        
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
        
    });
    
    
    
    // Controls ________________________________________________________________________________
    
    var controls = ol.control.defaults({
        attribution: false,
        attributionOptions: /** @type {olx.control.AttributionOptions} */ ({
            collapsible: false
        }),
        zoomOptions: {
        //    zoomInTipLabel: appModule.i18n.t('buttons:olZoomIn.label'),
        //    zoomOutTipLabel: appModule.i18n.t('buttons:olZoomOut.label')
        }
    }).extend([
        attribution,
        mousePositionControl,
        scaleLineControl,
        overviewMapControl,
        zoomToExtentControl,
        fullScreenControl,
        layerSwitcher
    ]);

    $.when(appModule.deferred.init.i18next).done(function () {
        
        attribution.setProperties({
            tipLabel: appModule.i18n.t('buttons:olAttribution.label')
        });
        
        zoomToExtentControl.setProperties({
            tipLabel: appModule.i18n.t('buttons:olZoomExtent.label')
        });
        
        scaleLineControl.setProperties({
            tipLabel: appModule.i18n.t('buttons:olScaleLine.label')
        });
        
        layerSwitcher.setProperties({
            tipLabel: appModule.i18n.t('buttons:olLayerswitcher.label')
        });
        
        fullScreenControl.setProperties({
            tipLabel: appModule.i18n.t('buttons:olFullScreen.label')
        });
        
        overviewMapControl.setProperties({
            tipLabel: appModule.i18n.t('buttons:olOverviewmap.label')
        });
        
        controls.setProperties({
            zoomOptions: {
                zoomInTipLabel: appModule.i18n.t('buttons:olZoomIn.label'),
                zoomOutTipLabel: appModule.i18n.t('buttons:olZoomOut.label')
            }
        });
        
        console.log('Map controls translated');
        
        appModule.deferred.ready.mapControls.resolve();
        console.timeEnd('Map controls initialized'); 
        
    });
    
        
        
    return {
        controls: controls,
        layerSwitcher: layerSwitcher,
        overviewMapControl: overviewMapControl 
    };
    
})();

