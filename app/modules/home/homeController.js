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
    deferred: true,
    tour: true
*/

/**
 * www.destinationfilter.tk 0.7.0
 * https://github.com/christopheboisier/DestinationFinder/
 * MIT licensed
 * @author Christophe BOISIER
 *
 * Copyright (C) 2015 Christophe BOISIER
 */

console.time('homeController.js script loaded');

// Select language
$.when(deferred.load.i18next).done(function () {
    'use strict';
    console.log('Language is set to ' + $.i18n.lng());
    $('#setLng')
        .val($.i18n.lng())
        .on('change', function () {
            // e.preventDefault();
            // $.i18n.setLng($('#setLng').val());
            // $('#language_form').submit();
            $('#setLng').parent('form').submit();
            // console.log('Language changed to ' + $.i18n.lng());
        });
});

// Start tour button
$('.start-tour').click(function (e) {
    'use strict';
    $(this).addClass('disabled');
    e.preventDefault();
    tour.end();
    tour.restart();
});



console.timeEnd('homeController.js script loaded');
