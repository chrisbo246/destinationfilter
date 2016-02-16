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
    map: false,
    layer: true,
    noWebglInfo: true,
    noDownloadInfo: true,
    exampleNS: true,
    layerSwitcher: false
*/

'use strict';

var mapSelectedLayerSettingsModule = (function (mapModule) {
    'use strict';

    console.time('Selected layer settings initialized');

    var _setResetBrightnessButtonHTML = function _setResetBrightnessButtonHTML() {

        resetBrightness.innerHTML = 'Brightness (' + layer.getBrightness().toFixed(3) + ')';
    };

    var _setResetContrastButtonHTML = function _setResetContrastButtonHTML() {

        resetContrast.innerHTML = 'Contrast (' + layer.getContrast().toFixed(3) + ')';
    };

    var _setResetHueButtonHTML = function _setResetHueButtonHTML() {

        resetHue.innerHTML = 'Hue (' + layer.getHue().toFixed(2) + ')';
    };

    var _setResetSaturationButtonHTML = function _setResetSaturationButtonHTML() {

        resetSaturation.innerHTML = 'Saturation (' + layer.getSaturation().toFixed(2) + ')';
    };

    /**
     * image-filter
     */

    var _normalize = function _normalize(kernel) {

        var len = kernel.length,
            normal = new Array(len),
            i = 0,
            sum = 0;

        for (i = 0; i < len; i = i + 1) {
            sum += kernel[i];
        }
        if (sum <= 0) {
            normal.normalized = false;
            sum = 1;
        } else {
            normal.normalized = true;
        }
        for (i = 0; i < len; i = i + 1) {
            normal[i] = kernel[i] / sum;
        }
        return normal;
    };

    /**
     * image-filter
     */

    /**
     * Apply a convolution kernel to canvas.  This works for any size kernel, but
     * performance starts degrading above 3 x 3.
     * @param {CanvasRenderingContext2D} context Canvas 2d context.
     * @param {Array.<number>} kernel Kernel.
     */
    var _convolve = function _convolve(context, kernel) {

        var canvas = context.canvas,
            width = canvas.width,
            height = canvas.height,
            size = Math.sqrt(kernel.length),
            half = Math.floor(size / 2),
            inputData = context.getImageData(0, 0, width, height).data,
            output = context.createImageData(width, height),
            outputData = output.data,
            pixelsAbove,
            pixelY,
            pixelX,
            kernelY,
            kernelX,
            weight,
            neighborY,
            neighborX,
            inputIndex,
            outputIndex,
            r,
            g,
            b,
            a;

        for (pixelY = 0; pixelY < height; pixelY = pixelY + 1) {
            pixelsAbove = pixelY * width;
            for (pixelX = 0; pixelX < width; pixelX = pixelX + 1) {
                r = 0;
                g = 0;
                b = 0;
                a = 0;
                for (kernelY = 0; kernelY < size; kernelY = kernelY + 1) {
                    for (kernelX = 0; kernelX < size; kernelX = kernelX + 1) {
                        weight = kernel[kernelY * size + kernelX];
                        neighborY = Math.min(height - 1, Math.max(0, pixelY + kernelY - half));
                        neighborX = Math.min(width - 1, Math.max(0, pixelX + kernelX - half));
                        inputIndex = (neighborY * width + neighborX) * 4;
                        r += inputData[inputIndex] * weight;
                        g += inputData[inputIndex + 1] * weight;
                        b += inputData[inputIndex + 2] * weight;
                        a += inputData[inputIndex + 3] * weight;
                    }
                }
                outputIndex = (pixelsAbove + pixelX) * 4;
                outputData[outputIndex] = r;
                outputData[outputIndex + 1] = g;
                outputData[outputIndex + 2] = b;
                outputData[outputIndex + 3] = kernel.normalized ? a : 255;
            }
        }
        context.putImageData(output, 0, 0);
    };

    /**
     *
     */

    var _selectedLayerActions = function _selectedLayerActions(layer) {

        // var raster = layer;

        mapModule.map.on('change:projection', function () {
            var projection = mapModule.map.getProjection();
            $('#projection_extent').val(layer.getExtent());
            // ol.proj.setExtent($projection.value);

            $('#projection_code').val(projection.getCode());
            $('#projection_metersperunit').val(projection.getMetersPerUnit());
            $('#projection_unit').val(projection.getUnits());
            $('#projection_global').val(projection.isGlobal());
            // update unit in input-group-addon
            $('#top, #left, #bottom, #right, #center_x, #center_y, #resolution, #longitude, #latitude').next('.input-group-addon').html(projection.getUnits());
        });

        if (!ol.has.WEBGL) {
            noWebglInfo.style.display = '';
        } else {

            /**
             * brightness-contrast
             */

            _setResetBrightnessButtonHTML();

            increaseBrightness.addEventListener('click', function () {
                layer.setBrightness(Math.min(layer.getBrightness() + 0.125, 1));
                _setResetBrightnessButtonHTML();
            }, false);
            resetBrightness.addEventListener('click', function () {
                layer.setBrightness(0);
                _setResetBrightnessButtonHTML();
            }, false);
            decreaseBrightness.addEventListener('click', function () {
                layer.setBrightness(Math.max(layer.getBrightness() - 0.125, -1));
                _setResetBrightnessButtonHTML();
            }, false);

            _setResetContrastButtonHTML();

            increaseContrast.addEventListener('click', function () {
                layer.setContrast(layer.getContrast() + 0.125);
                _setResetContrastButtonHTML();
            }, false);
            resetContrast.addEventListener('click', function () {
                layer.setContrast(1);
                _setResetContrastButtonHTML();
            }, false);
            decreaseContrast.addEventListener('click', function () {
                layer.setContrast(Math.max(layer.getContrast() - 0.125, 0));
                _setResetContrastButtonHTML();
            }, false);

            /**
             * hue-saturation
             */

            _setResetHueButtonHTML();

            increaseHue.addEventListener('click', function () {
                layer.setHue(layer.getHue() + 0.25);
                _setResetHueButtonHTML();
            }, false);
            resetHue.addEventListener('click', function () {
                layer.setHue(0);
                _setResetHueButtonHTML();
            }, false);
            decreaseHue.addEventListener('click', function () {
                layer.setHue(layer.getHue() - 0.25);
                _setResetHueButtonHTML();
            }, false);

            _setResetSaturationButtonHTML();

            increaseSaturation.addEventListener('click', function () {
                layer.setSaturation(layer.getSaturation() + 0.25);
                _setResetSaturationButtonHTML();
            }, false);
            resetSaturation.addEventListener('click', function () {
                layer.setSaturation(1);
                _setResetSaturationButtonHTML();
            }, false);
            decreaseSaturation.addEventListener('click', function () {
                layer.setSaturation(Math.max(layer.getSaturation() - 0.25, 0));
                _setResetSaturationButtonHTML();
            }, false);
        }
    };

    /**
     *
     */

    var _vectorLayerActions = function _vectorLayerActions(layer) {

        var vector = layer;

        if ('download' in exportKMLElement) {
            var vectorSource = vector.getSource();
            exportKMLElement.addEventListener('click', function () {
                if (!exportKMLElement.href) {
                    var features = [],
                        string = new ol.format.KML().writeFeatures(features),
                        base64 = exampleNS.strToBase64(string);
                    vectorSource.forEachFeature(function (feature) {
                        var clone = feature.clone(),
                            projection = mapModule.map.getProjection();
                        clone.setId(feature.getId()); // clone does not set the id
                        clone.getGeometry().transform(projection, 'EPSG:4326');
                        features.push(clone);
                    });
                    exportKMLElement.href = 'data:application/vnd.google-earth.kml+xml;base64,' + base64;
                }
            }, false);
        } else {
            noDownloadInfo.style.display = '';
        }
    };

    /**
     *
     */

    var _imageryLayerActions = function _imageryLayerActions(layer) {

        var imagery = layer;

        /**
         * Apply a filter on "postcompose" events.
         * @param {ol.render.Event} event Render event.
         */
        imagery.on('postcompose', function (event) {
            _convolve(event.context, selectedKernel);
        });

        /**
         * image-filter
         */

        var kernels = {
            none: [0, 0, 0, 0, 1, 0, 0, 0, 0],
            sharpen: [0, -1, 0, -1, 5, -1, 0, -1, 0],
            sharpenless: [0, -1, 0, -1, 10, -1, 0, -1, 0],
            blur: [1, 1, 1, 1, 1, 1, 1, 1, 1],
            shadow: [1, 2, 1, 0, 1, 0, -1, -2, -1],
            emboss: [-2, 1, 0, -1, 1, 1, 0, 1, 2],
            edge: [0, 1, 0, 1, -4, 1, 0, 1, 0]
        };

        var selectedKernel = _normalize(kernels[kernel.value]);

        /**
         * Update the kernel and re-render on change.
         */
        kernel.onchange = function () {
            selectedKernel = _normalize(kernels[kernel.value]);
            mapModule.map.render();
        };
    };

    $(function () {

        var decreaseBrightness = document.getElementById('decrease-brightness');
        var decreaseContrast = document.getElementById('decrease-contrast');
        var decreaseHue = document.getElementById('decrease-hue');
        var decreaseSaturation = document.getElementById('decrease-saturation');
        var increaseBrightness = document.getElementById('increase-brightness');
        var increaseContrast = document.getElementById('increase-contrast');
        var increaseHue = document.getElementById('increase-hue');
        var increaseSaturation = document.getElementById('increase-saturation');
        var resetBrightness = document.getElementById('reset-brightness');
        var resetContrast = document.getElementById('reset-contrast');
        var resetHue = document.getElementById('reset-hue');
        var resetSaturation = document.getElementById('reset-saturation');
        var kernel = document.getElementById('kernel');
        var exportKMLElement = document.getElementById('export-kml');
        var baseLayerInput = document.getElementById('base_layer_source');
        var overlayLayerInput = document.getElementById('overlay_layer_source');
        var vectorLayerInput = document.getElementById('vector_layer_source');

        // Populate layer selector inputs
        ol.control.LayerSwitcher.forEachRecursive(map, function (l) {
            // l, i, a

            var option;

            if (!(l instanceof ol.layer.Group)) {
                if (l.get('type') === 'base') {
                    option = document.createElement('option');
                    option.text = l.get('title');
                    option.value = l.get('name');
                    if (l.getVisible()) {
                        option.selected = true;
                    }
                    baseLayerInput.appendChild(option);
                } else {
                    option = document.createElement('option');
                    option.text = l.get('title');
                    option.value = l.get('name');
                    if (l.getVisible()) {
                        option.selected = true;
                    }
                    overlayLayerInput.appendChild(option);
                }

                if (l instanceof ol.layer.Vector) {
                    option = document.createElement('option');
                    option.text = l.get('title');
                    option.value = l.get('name');
                    if (l.getVisible()) {
                        option.selected = true;
                    }
                    vectorLayerInput.appendChild(option);
                }
            }
        });

        // Change base layer from the select input
        baseLayerInput.addEventListener('change', function () {
            ol.control.LayerSwitcher.forEachRecursive(map, function (layer) {
                // l, i, a
                if (layer.get('name') === baseLayerInput.value) {
                    mapControlsModule.layerSwitcher.setVisible_(layer, 1);
                }
            });
        }, false);

        // Change overlay layer from the select input
        overlayLayerInput.addEventListener('change', function () {
            ol.control.LayerSwitcher.forEachRecursive(map, function (layer) {
                // l, i, a
                if (layer.get('name') === overlayLayerInput.value) {
                    mapControlsModule.layerSwitcher.setVisible_(layer, 1);
                }
            });
        }, false);

        /*$('#base_layer_source, #overlay_layer_source, #vector_layer_source').on('change', function () {
            
            var $el = $(this);
            ol.control.LayerSwitcher.forEachRecursive(map, function (l, i, a) { // l, i, a
                if (l.get('name') === $el.val()) {
                    mapControlsModule.layerSwitcher.setVisible_(l, 1);
                    // if (l != lyr && l.get('type') === 'base') {
                    //  l.setVisible(true);
                    // }
                }
            });
        });*/

        $.when(appModule.deferred.ready.map).done(function () {

            // When a layer become visible
            mapModule.map.on('change:layers', function () {
                ol.control.LayerSwitcher.forEachRecursive(map, function (l) {
                    // l, i, a
                    if (!(l instanceof ol.layer.Group) && l.getVisible()) {
                        if (l.get('type') === 'base') {
                            _imageryLayerActions(l);
                        } else if (l.get('type') === 'vector') {
                            _vectorLayerActions(l);
                        } else {
                            _selectedLayerActions(l);
                        }
                    }
                });
            });

            console.timeEnd('Selected layer settings initialized');
        });
    });

    return mapModule;
})(mapModule || {});
//# sourceMappingURL=mapLayerSettings.js.map
