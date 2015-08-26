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

/**
 * www.destinationfilter.tk 0.7.0
 * https://github.com/christopheboisier/DestinationFinder/
 * MIT licensed
 * @author Christophe BOISIER
 *
 * Copyright (C) 2015 Christophe BOISIER
 */


var $form = $('#contribution_form');
$form
    .bootstrapValidator(
        $.extend({}, options.bootstrapValidator, {
            fields: {
                donationAmount: {
                    selector: '#donation_amount',
                    validators: {
                        notEmpty: {
                            message: $.t('fields:default.messages.notEmpty')
                        },
                        numeric: {
                            message: $.t('fields:default.messages.numeric')
                        }
                    }
                }
            }
        })
    )
    .on('error.form.bv', function () {
        'use strict';
        $('#donate').addClass('disabled');
    })
    .on('success.form.bv', function () {
        'use strict';
        alert('success');
        $('#donate').removeClass('disabled');
    });
// .bootstrapValidator('validate')

var handler = StripeCheckout.configure({
    key: 'pk_live_nkX1aJL9uKcKDMfo1EycnpQE',
    // image: './images/favicon/chrome-touch-icon-196x196.png',
    token: function () { // token
        // Use the token to create the charge with a server-side script.
        // You can access the token ID with `token.id`
    }
});

$('#donate').on('click', function (e) {
    'use strict';
    var amount = $('#donation_amount').val();
    // Open Checkout with further options
    handler.open({
        name: $.t('app.name'),
        description: $.t('sections:stripe.info', { amount: amount }),
        currency: 'eur',
        amount: amount * 100,
        panelLabel: $.t('buttons:stripePanelLabel.label')
    });
    e.preventDefault();
});

// Close Checkout on page navigation
$(window).on('popstate', function () {
    'use strict';
    handler.close();
});
