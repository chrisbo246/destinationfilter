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
var options;
*/

console.time('questionFormController.js script loaded');

$.get('components/questionForm/questionFormModal.htm', function (template) {

    console.time('questionFormModal.htm view loaded');

    $('body').append(template);

    // Question form fields initialisation (when modal open)
    $('#question_modal').on('shown.bs.modal', function (e) {

        console.time('Show #question_modal');

        var $el = $('#ss-form-question');
        $el
            .bootstrapValidator(
                $.extend({}, options.bootstrapValidator, {
                    fields: {
                        question_content: {
                            selector: '#entry_1152240230',
                            validators: {
                                notEmpty: {
                                    message: $.t('help.question.question_form.entry_1152240230.messages.not_empty')
                                }
                            }
                        }
                    }
                })
            )
            .bootstrapValidator('validate')
            .end()
            //$el.filter(':input')
            .on('change', function (e) {
                var $this = $(this);
                if ($this.attr('id')) {
                    $el.bootstrapValidator('revalidateField', $this.attr('id'));
                }
            });

        console.timeEnd('Show #question_modal');

    });

    console.timeEnd('questionFormModal.htm view loaded');

});

console.timeEnd('questionFormController.js script loaded');