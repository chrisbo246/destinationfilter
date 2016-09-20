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
                
        // $.get('modules/questionForm/questionFormModal.htm', function (template) {

            // $('body').append(template);

            // initBlock('#question_modal');

            // Question form fields initialisation (when modal open)
            $('#question_modal').on('shown.bs.modal', function () {
                console.time('Show #question_modal');

                $.when(deferred.init.i18next).done(function () {

                    var $el = $('#ss-form-question');
                    $el
                        .bootstrapValidator(
                            $.extend({}, options.bootstrapValidator, {
                                fields: {
                                    questionContent: {
                                        selector: '#entry_1152240230',
                                        validators: {
                                            notEmpty: {
                                                message: i18nextInstance.t('fields:default.messages.notEmpty')
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

