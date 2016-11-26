/*old-jslint indent: 2, unparam: true, plusplus: true */
/*jslint devel: true, browser: true, node: false */
/*global $ */
/*global */
'use strict';

/**
 * www.destinationfilter.tk 0.7.0
 * https://github.com/christopheboisier/DestinationFinder/
 * MIT licensed
 * @author Christophe BOISIER
 *
 * Copyright (C) 2015 Christophe BOISIER
 */
 
/*
var tour;
*/

console.time('homeController.js script loaded');

$('[data-anchor="home_jumbotron"]').load('components/home/homeView.htm', function () {

    console.time('homeView.htm view loaded');

    // Initialize home text asap
    initBlock('[data-anchor="home_jumbotron"]');
    //$('[data-anchor="home_jumbotron"]').find('[data-i18n]').i18n();
    
    // Select language
    console.log('Language is set to ' + $.i18n.lng());
    $('#setLng')
        .val($.i18n.lng())
        .on('change', function (e) {
            //e.preventDefault();
            //$.i18n.setLng($('#setLng').val());
            //$('#language_form').submit();
            $('#setLng').parent('form').submit();
            //console.log('Language changed to ' + $.i18n.lng());
        });

    // Start tour button
    $('.start-tour').click(function (e) {
        $(this).addClass('disabled');
        e.preventDefault();
        tour.end();
        tour.restart();
    });

    console.timeEnd('homeView.htm view loaded');

});

console.timeEnd('homeController.js script loaded');