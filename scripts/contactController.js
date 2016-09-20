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

var contactModule = (function () {
    'use strict';
    
    var $el;
    
    $(function () {

        $.when(deferred.init.i18next).done(function () {

            // Contact form fields initialization
            $el = $('#ss-form-message');
            $el.bootstrapValidator(
                    $.extend({}, options.bootstrapValidator, {
                        fields: {
                            messageName: {
                                selector: '#entry_1450479008',
                                validators: {
                                    notEmpty: {
                                        message: i18nextInstance.t('inputs.default.messages.notEmpty')
                                    }
                                }
                            },
                            messageEmail: {
                                selector: '#entry_593995947',
                                validators: {
                                    notEmpty: {
                                        message: i18nextInstance.t('inputs.default.messages.notEmpty')
                                    },
                                    emailAddress: {
                                        message: i18nextInstance.t('inputs.default.messages.emailAddress')
                                    }
                                }
                            },
                            messageContent: {
                                selector: '#entry_297652874',
                                validators: {
                                    notEmpty: {
                                        message: i18nextInstance.t('inputs.default.messages.notEmpty')
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
                    $('#ss-submit-message').addClass('disabled');
                })
                .on('success.form.bv', function () {
                    $('#ss-submit-message').removeClass('disabled');
                });
                /*.on('change', function () {
                    var $this = $(this);
                    if ($this.attr('id')) {
                        $el.bootstrapValidator('revalidateField', $this.attr('id'));
                    }
                });*/

        });

        // Use email action instead of Google form
        /*$el = $('#ss-form-message');
        $el.on('submit', function (e) {
          // e.preventDefault();
          $el.attr('action', 'mailto:contact@destinationfilter.tk');
        });*/

    });
    
})();

