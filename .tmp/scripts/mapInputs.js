'use strict';

var mapInputsModule = (function () {
    'use strict';

    /** @private */
    var inputs = {};

    /**
     * Create a new input using predefined settings
     * @public
     * @param {string} name - Predefined input (variable name)
     * @returns {Object} OL3 layer
     */
    /*var create = function (name, selector, map) {
          if (!inputs[name]) {
            console.warn(name + ' input definition does not exists');
            return;
        }
          var input = inputs[name](selector);
          return input;
      };*/

    /**
     * Map zoom input
     * @param {string} selector - Input ID or class
     * @param {Object} map - OL3 map
     */
    inputs.zoom = function (selector, map) {
        var $input = $(selector);
        if ($input) {
            $input.val(map.getView().getZoom());
            $input.on('input change', function () {
                var val = $input.val();
                if (val || val === 0) {
                    map.getView().setZoom(val);
                }
            });
            map.getView().on('change:resolution', function () {
                $input.val(this.getZoom());
            });
        }
    };

    /**
     * Map resolution input
     * @param {string} selector - Input ID or class
     * @param {Object} map - OL3 map
     */
    inputs.resolution = function (selector, map) {
        var $input = $(selector);
        if ($input) {
            $input.val(map.getView().getResolution());
            $input.on('input change', function () {
                var val = $input.val();
                if (val || val === 0) {
                    map.getView().setResolution(val);
                }
            });
            map.getView().on('change:resolution', function () {
                $input.val(this.getResolution());
            });
        }
    };

    /**
     * Map rotation input
     * @param {string} selector - Input ID or class
     * @param {Object} map - OL3 map
     */
    inputs.rotation = function (selector, map) {
        var $input = $(selector);
        if ($input) {
            $input.val(map.getView().getRotation());
            $input.on('input change', function () {
                var val = $input.val();
                if (val || val === 0) {
                    map.getView().setRotation(val);
                }
            });
            map.getView().on('change:rotation', function () {
                $input.val(this.getRotation());
            });
        }
    };

    /**
     * Map X center input
     * @param {string} selector - Input ID or class
     * @param {Object} map - OL3 map
     */
    inputs.centerX = function (selector, map) {
        var $input = $(selector);
        if ($input) {
            var lonLat = map.getView().getCenter();
            $input.val(lonLat[0]);
            /*$input.on('input change', function () {
                var val = $input.val();
                if (val || val === 0) {
                    // map.getView().setCenter($centerX.val(), $centerY.val());
                }
            });*/
            map.getView().on('change:center', function () {
                var lonLat = this.getCenter();
                $input.val(lonLat[0]); // .toFixed(2)
            });
        }
    };

    /**
     * Map Y center input
     * @param {string} selector - Input ID or class
     * @param {Object} map - OL3 map
     */
    inputs.centerY = function (selector, map) {
        var $input = $(selector);
        if ($input) {
            var lonLat = map.getView().getCenter();
            $input.val(lonLat[1]);
            /*$input.on('input change', function () {
                var val = $input.val();
                if (val || val === 0) {
                    //map.getView().setCenter($centerX.val(), val);
                }
            });*/
            map.getView().on('change:center', function () {
                var lonLat = this.getCenter();
                $input.val(lonLat[1]); // .toFixed(2)
            });
        }
    };

    /**
     * Map XY center input
     * @param {string} selector - Input ID or class
     * @param {Object} map - OL3 map
     */
    inputs.center = function (Xselector, Yselector, map) {
        inputs.centerX(Xselector, map);
        inputs.centerY(Yselector, map);
        var $centerX = $(Xselector);
        var $centerY = $(Yselector);
        if ($centerX && $centerY) {
            $(Xselector + ', ' + Yselector).on('input change', function () {
                var x = $centerX.val();
                var y = $centerY.val();
                if ((x || x === 0) && (y || y === 0)) {
                    map.getView().setCenter(x, y);
                }
            });
        }
    };

    /**
     * Export map as PNG
     * @param {string} selector - Link ID or class
     * @param {Object} map - OL3 map
     */
    inputs.exportPNG = function (selector, map) {
        var $input = $(selector);
        if ($input) {
            $input.on('click', function () {
                map.once('postcompose', function (event) {
                    var canvas = event.context.canvas;
                    $input.attr('href', canvas.toDataURL('image/png'));
                });
                // map.renderSync();
            });
        }
    };

    return inputs;
})();
//# sourceMappingURL=mapInputs.js.map
