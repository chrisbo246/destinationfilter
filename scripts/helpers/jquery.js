/*old-jslint indent: 2, unparam: true, plusplus: true */
/*
jslint
    devel: true,
    browser: true,
    node: false
*/
/*
global

*/


/**
 * Convert hyphen string to camelcase
 */

if (typeof String.prototype.toCamel !== 'function') {
    'use strict';
    String.prototype.toCamel = function () {
        'use strict';
        return this.replace(/[-_]([a-z])/g, function (g) {return g[1].toUpperCase();}).replace(/[\W]/g, '')
    };
}



/**
 * Function to get the Maximum value in Array
 */

Array.max = function (array) {
    'use strict';
    return Math.max.apply(Math, array);
};



/**
 * Function to get the Minimam value in Array
 */

Array.min = function (array) {
    'use strict';
    return Math.min.apply(Math, array);
};



/**
 * Array intersection
 */

/*$.intersect = function (a, b) {
    'use strict';
    return $.grep(a, function (i) {
        return $.inArray(i, b) > -1;
    });
};*/



/**
 * Convert degrees to radians
 */

var degToRad = function (deg) {
    'use strict';
    return deg * Math.PI * 2 / 360;
}



/**
 * Convert radians to degrees
 */

var radToDeg = function (rad) {
    'use strict';
    return rad * 360 / (Math.PI * 2);
}



/**
 * Modulo for negative values
 */

var mod = function (n) {
    'use strict';
    return ((n % (2 * Math.PI)) + (2 * Math.PI)) % (2 * Math.PI);
}



/**
 * Return all events binded on an element
 * The result 
 * @return string Events list separated with a space, can be used with $(element).on(result, ...
 */
 // jQuery._data(jQuery('.chosen-select')[0], 'events')
 function getAllEvents(element) {
    var result = [];
    for (var key in element) {
        if (key.indexOf('on') === 0) {
            result.push(key.slice(2));
        }
    }
    return result.join(' ');
}
