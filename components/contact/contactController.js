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

console.time('contactController.js script loaded');

$('[data-anchor="contact"]').load('components/contact/contactView.htm', function () {

    console.time('contactView.htm view loaded');

    var $el;

    // Contact form fields initialization
    $el = $('#ss-form-message');
    $el
        .bootstrapValidator(
            $.extend({}, options.bootstrapValidator, {
                fields: {
                    message_name: {
                        selector: '#entry_1450479008',
                        validators: {
                            notEmpty: {
                                message: $.t('about.contact.entry_1450479008.messages.not_empty')
                            }
                        }
                    },
                    message_email: {
                        selector: '#entry_593995947',
                        validators: {
                            notEmpty: {
                                message: $.t('about.contact.entry_593995947.messages.not_empty')
                            },
                            emailAddress: {
                                message: $.t('about.contact.entry_593995947.messages.email_address')
                            }
                        }
                    },
                    message_content: {
                        selector: '#entry_297652874',
                        validators: {
                            notEmpty: {
                                message: $.t('about.contact.entry_297652874.messages.not_empty')
                            }
                        }
                    }
                }
            })
        )
        //.bootstrapValidator('validate')
        .end()
        //$el.filter(':input')
        .on('change', function (e) {
            var $this = $(this);
            if ($this.attr('id')) {
                $el.bootstrapValidator('revalidateField', $this.attr('id'));
            }
        });

    // Use email action instead of Google form
    /*$el = $('#ss-form-message');
    $el.on('submit', function (e) {
      //e.preventDefault();
      $el.attr('action', 'mailto:contact@destinationfilter.tk');
    });*/

    console.timeEnd('contactView.htm view loaded');

});

console.timeEnd('contactController.js script loaded');