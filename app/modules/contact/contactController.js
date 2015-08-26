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

console.time('contactController.js script loaded');





var $el;

// Contact form fields initialization
$el = $('#ss-form-message');
$el.bootstrapValidator(
        $.extend({}, options.bootstrapValidator, {
            fields: {
                messageName: {
                    selector: '#entry_1450479008',
                    validators: {
                        notEmpty: {
                            message: $.t('inputs.default.messages.notEmpty')
                        }
                    }
                },
                messageEmail: {
                    selector: '#entry_593995947',
                    validators: {
                        notEmpty: {
                            message: $.t('inputs.default.messages.notEmpty')
                        },
                        emailAddress: {
                            message: $.t('inputs.default.messages.emailAddress')
                        }
                    }
                },
                messageContent: {
                    selector: '#entry_297652874',
                    validators: {
                        notEmpty: {
                            message: $.t('inputs.default.messages.notEmpty')
                        }
                    }
                }
            }
        })
    )
    // .bootstrapValidator('validate')
    //.end()
    // $el.filter(':input')
    .on('error.form.bv', function () {
        'use strict';
        $('#ss-submit-message').addClass('disabled');
    })
    .on('success.form.bv', function () {
        'use strict';
        $('#ss-submit-message').removeClass('disabled');
    });
    /*.on('change', function () {
        'use strict';
        var $this = $(this);
        if ($this.attr('id')) {
            $el.bootstrapValidator('revalidateField', $this.attr('id'));
        }
    });*/

// Use email action instead of Google form
/*$el = $('#ss-form-message');
$el.on('submit', function (e) {
  // e.preventDefault();
  $el.attr('action', 'mailto:contact@destinationfilter.tk');
});*/



console.timeEnd('contactController.js script loaded');
