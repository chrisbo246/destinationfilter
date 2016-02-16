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
    StripeCheckout,
    options: true
*/

var contributionModule = (function () {
    'use strict';

    $(function () {
            
        $('.navbar').find('[href="#contribution_pane"]').one('shown.bs.tab', function (e) {
            
            $.when(appModule.deferred.init.i18next).done(function () {

                var $form = $('#contribution_form');
                $form
                    .bootstrapValidator(
                        $.extend({}, appModule.options.bootstrapValidator, {
                            fields: {
                                donationAmount: {
                                    selector: '#donation_amount',
                                    validators: {
                                        notEmpty: {
                                            message: appModule.i18n.t('fields:default.messages.notEmpty')
                                        },
                                        numeric: {
                                            message: appModule.i18n.t('fields:default.messages.numeric')
                                        }
                                    }
                                }
                            }
                        })
                    )
                    .on('error.form.bv', function () {
                        $('#donate').addClass('disabled');
                    })
                    .on('success.form.bv', function () {
                        alert('success');
                        $('#donate').removeClass('disabled');
                    });
                // .bootstrapValidator('validate')

                        
                $.getScript('https://checkout.stripe.com/checkout.js', function (data, textStatus, jqxhr) {

                    var handler = StripeCheckout.configure({
                        key: 'pk_live_nkX1aJL9uKcKDMfo1EycnpQE',
                        // image: './images/favicon/chrome-touch-icon-196x196.png',
                        token: function () { // token
                            // Use the token to create the charge with a server-side script.
                            // You can access the token ID with `token.id`
                        }
                    });
            
                    $('#donate').on('click', function (e) {
                        e.preventDefault();
                        var amount = $('#donation_amount').val();
                        // Open Checkout with further options
                        handler.open({
                            name: appModule.i18n.t('app.name'),
                            description: appModule.i18n.t('sections:stripe.info', { amount: amount }),
                            currency: 'eur',
                            amount: amount * 100,
                            panelLabel: appModule.i18n.t('buttons:stripePanelLabel.label')
                        });
                        e.preventDefault();
                    });

                    // Close Checkout on page navigation
                    $(window).on('popstate', function () {
                        handler.close();
                    });
                
                });
            });

        });
        
    });
            
})();

