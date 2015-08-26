/*old-jslint indent: 2, unparam: true, plusplus: true */
/*
jslint
    devel: true,
    browser: true,
    node: false
*/
/*
global
    deferred: true,
    map: true;
*/


var noDownloadInfo = document.getElementById('no-download');

// Inputs __________________________________________________________________________________________

$.when(deferred.ready.map).then(function () {
    'use strict';
    
    var view = map.getView();
    
    // View resolution and zoom
    var $resolution = $('#resolution');
    var $zoom = $('#zoom');
    view.on('change:resolution', function () {
        var resolution = this.getResolution();
        if (resolution) {
            $resolution.val(resolution);
        }
        $zoom.val(this.getZoom());
    });
    $resolution.on('change', function () {
        if ($resolution.val() || $resolution.val() === 0) {
            console.log('resolution: ' + $resolution.val());
            view.setResolution($resolution.val());
        }
    });
    $zoom.on('change', function () {
        if ($zoom.val() || $zoom.val() === 0) {
            console.log('zoom: ' + $zoom.val());
            view.setZoom($zoom.val());
        }
    });

    // View center
    var $centerX = $('#center_x');
    var $centerY = $('#center_y');
    view.on('change:center', function () {
        var lonLat = this.getCenter();
        if (lonLat) {
            $centerX.val(lonLat[0].toFixed(2)); // .toFixed(2)
            $centerY.val(lonLat[1].toFixed(2));
        }
    });
    $('#center_x, #center_y').on('change', function () {
        if (($centerX.val() || $centerX.val() === 0) && ($centerY.val() || $centerY.val() === 0)) {
            console.log('center: ' + $centerX.val() + ', ' + $centerY.val());
            view.setCenter($centerX.val(), $centerY.val());
        }
    });

    // View rotation
    var $rotation = $('#rotation');
    view.on('change:rotation', function () {
        var rotation = this.getRotation();
        $rotation.val(rotation);
    });
    $rotation.on('change', function () {
        if ($rotation.val() || $rotation.val() === 0) {
            console.log('rotation: ' + $rotation.val());
            view.setRotation($rotation.val());
        }
    });

    // GPS mode
    var $gpsMode = $('#gps_mode');
    $gpsMode.on('switchChange.bootstrapSwitch init', function () { // e, state
        if (this.checked) {
            view.setZoom(14);
            console.log('Zoom increased');
        }
    });

    // Automatic rotation
    // var $rotateMap = $('#rotate_map');

    // Export map as PNG (export-map)
    var exportPNGElement = document.getElementById('export-png');
    if ('download' in exportPNGElement) {
        exportPNGElement.addEventListener('click', function () {
            map.once('postcompose', function (event) {
                var canvas = event.context.canvas;
                exportPNGElement.href = canvas.toDataURL('image/png');
            });
            map.renderSync();
        }, false);
    } else {
        noDownloadInfo.style.display = '';
    }

});
