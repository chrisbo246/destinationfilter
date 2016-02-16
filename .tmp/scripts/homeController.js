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

'use strict';

var homeModule = (function () {
    'use strict';

    $(function () {

        // Select language
        $.when(appModule.deferred.init.i18next).done(function () {

            var $el = $('#lng');
            $el.val(appModule.i18n.language).on('change', function () {
                $el.closest('form').submit();
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
//# sourceMappingURL=homeController.js.map
