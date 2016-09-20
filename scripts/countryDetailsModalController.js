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
        
        // $.get('modules/countryDetails/countryDetailsModal.htm', function (template) {

            // $('body').append(template);

            $('#country_details').on('shown.bs.modal', function (event) {
                var button = $(event.relatedTarget),
                    id = button.data('id');
                console.log('#country_details modal opened cibling country ' + id);
                countryDetailsModule.showCountryDetails(id);
            });

        // });
        
    });

})();

