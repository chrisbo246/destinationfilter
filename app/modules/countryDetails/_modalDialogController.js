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
    showCountryDetails
*/

/**
 * www.destinationfilter.tk 0.7.0
 * https://github.com/christopheboisier/DestinationFinder/
 * MIT licensed
 * @author Christophe BOISIER
 *
 * Copyright (C) 2015 Christophe BOISIER
 */

console.time('modalDialogController.js script loaded');

// $.get('modules/countryDetails/countryDetailsModal.htm', function (template) {

    //$('body').append(template);

    $('#country_details').on('show.bs.modal', function (event) {
        'use strict';
        var button = $(event.relatedTarget),
            id = button.data('id');
        console.log('#country_details modal opened cibling country ' + id);
        showCountryDetails(id);
    });

// });

console.timeEnd('modalDialogController.htm script loaded');
