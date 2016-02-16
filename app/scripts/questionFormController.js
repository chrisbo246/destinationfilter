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
    options: true
*/

var questionFormModule = (function () {
    'use strict';

    $(function () {
                
        // $.get('templates/partials/questionFormModal.htm', function (template) {

            // $('body').append(template);

            // appModule.initBlock('#question_modal');

            // Question form fields initialisation (when modal open)
            $('#question_modal').on('shown.bs.modal', function () {
                console.time('Show #question_modal');

                $.when(appModule.deferred.init.i18next).done(function () {

                    var $el = $('#ss-form-question');
                    $el
                        .bootstrapValidator(
                            $.extend({}, appModule.options.bootstrapValidator, {
                                fields: {
                                    questionContent: {
                                        selector: '#entry_1152240230',
                                        validators: {
                                            notEmpty: {
                                                message: appModule.i18n.t('fields:default.messages.notEmpty')
                                            }
                                        }
                                    }
                                }
                            })
                        )
                        // .bootstrapValidator('validate')
                        .end()
                        // $el.filter(':input')
                        .on('change', function () {
                            var $this = $(this);
                            if ($this.attr('id')) {
                                $el.bootstrapValidator('revalidateField', $this.attr('id'));
                            }
                        });

                });

                console.timeEnd('Show #question_modal');

            });

        //});
    });
    
})();

