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

var homeModule = (function () {
    'use strict';
    
    $(function () {
        
        // Select language
        $.when(deferred.init.i18next).done(function () {

            console.log('Language is set to ' + i18nextInstance.language);
            $('#setLng')
                .val(i18nextInstance.language)
                .on('change', function () {
                    // e.preventDefault();
                    // $.i18n.setLng($('#setLng').val());
                    // $('#language_form').submit();
                    $('#setLng').closest('form').submit();
                    // console.log('Language changed to ' + $.i18n.lng());
                });
        });

        // Start tour button
        $('.start-tour').on('click', function (e) {
            e.preventDefault();
            $(this).addClass('disabled');
            tour.end();
            tour.restart();
        });
        
    });

})();

