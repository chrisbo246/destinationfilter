/*old-jslint indent: 2, unparam: true, plusplus: true */
/*
jslint
    devel: true,
    browser: true,
    node: false
*/
/*
global
    deferred: true
*/

/**
 * www.destinationfilter.tk 0.7.0
 * https://github.com/christopheboisier/DestinationFinder/
 * MIT licensed
 * @author Christophe BOISIER
 *
 * Copyright (C) 2015 Christophe BOISIER
 */

console.time('appSettingsController.js script loaded');


'use strict';


// Auto-save / restore forms (with id) from cookies
/*$(window).on('load', function () {
    $('[data-anchor="app_settings"]').find('form[id].sayt').each(function () {
        var $el = $(this);
        $el.sayt(options.sayt);
        // $el.find(':input').trigger('change');
        $el.bootstrapValidator('validate');
        console.log('#' + $el.attr('id') + ' restored from cookies and validated');
    });

});*/

/*var $el = $('#priority_ratio');
if ($el) {
    $el.on('change', function () {
        priorityRatio = $el.val();
    });
}*/

deferred.ready.appSettings.resolve();

console.timeEnd('appSettingsController.js script loaded');
