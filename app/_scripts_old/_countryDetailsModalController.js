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

var countryDetailsModalModule = (function () {
    'use strict';
    
    $(function () {
        
        // $.get('templates/partials/countryDetailsModal.htm', function (template) {

            // $('body').append(template);
        $.when(appModule.deferred.getJSON.countriesData).done(function () {
            $('#country_details').on('shown.bs.modal', function (event) {
                var button = $(event.relatedTarget),
                    id = button.data('id');
                console.log('#country_details modal opened cibling country ' + id);
                countryDetailsModule.showCountryDetails(id);
            });
        });

        // });
        
    });

})();

