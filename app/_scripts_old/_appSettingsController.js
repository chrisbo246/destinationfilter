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

var appSettingsModule = (function () {
    'use strict';
    
    $(function () {

        // Auto-save / restore forms (with id) from cookies
        /*$(window).on('load', function () {
            $('[data-anchor="app_settings"]').find('form[id].sayt').each(function () {
                var $el = $(this);
                $el.sayt(appModule.options.sayt);
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
    });

    appModule.deferred.ready.appSettings.resolve();

})();

