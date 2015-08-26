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

/**
 * www.destinationfilter.tk 0.7.0
 * https://github.com/christopheboisier/DestinationFinder/
 * MIT licensed
 * @author Christophe BOISIER
 *
 * Copyright (C) 2015 Christophe BOISIER
 */

console.time('questionFormController.js script loaded');

// $.get('modules/questionForm/questionFormModal.htm', function (template) {

    // $('body').append(template);

    // initBlock('#question_modal');

    // Question form fields initialisation (when modal open)
    $('#question_modal').on('shown.bs.modal', function () {
        'use strict';

        console.time('Show #question_modal');

        var $el = $('#ss-form-question');
        $el
            .bootstrapValidator(
                $.extend({}, options.bootstrapValidator, {
                    fields: {
                        questionContent: {
                            selector: '#entry_1152240230',
                            validators: {
                                notEmpty: {
                                    message: $.t('fields:default.messages.notEmpty')
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

        console.timeEnd('Show #question_modal');

    });

// });

console.timeEnd('questionFormController.js script loaded');
