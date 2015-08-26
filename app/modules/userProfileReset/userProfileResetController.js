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
    options: true,
    countriesDatas: true,
    oecdIncomeLevels: true
*/

/**
 * www.destinationfilter.tk 0.7.0
 * https://github.com/christopheboisier/DestinationFinder/
 * MIT licensed
 * @author Christophe BOISIER
 *
 * Copyright (C) 2015 Christophe BOISIER
 */

console.time('userProfileResetController.js script loaded');



/**
 * Populate profil form
 *
 * @param { string } countryCode - Country ISO2 code in lower case
 */

function populateUserProfile(countryCode) {
    'use strict';
    console.time(populateUserProfile.name + '(' + countryCode + ')');

    var $el,
        v,
        max,
        value,
        array = [];

    // Skip if datas are not loaded or country doesn't exists
    if (!countriesDatas) {
        console.warn('countryDatas variable should not be empty'); /* RemoveLogging:skip */
        return false;
    }
    if (!countriesDatas[countryCode]) {
        console.warn('country ' + countryCode + ' have no data'); /* RemoveLogging:skip */
        return false;
    }

    v = countriesDatas[countryCode];

    if (!$('#user_country').val()) {
        $('#user_country').val(v.ISO).trigger('change').trigger('chosen:updated');
    }
    $('#user_citizenships').val(v.ISO).trigger('change').trigger('chosen:updated');
    $('#user_currencies').val(v.currency.CurrencyCode).trigger('change').trigger('chosen:updated');
    $('#user_income_level').val(v.incomeLevel ? oecdIncomeLevels[v.incomeLevel.id] : '').trigger('change').trigger('chosen:updated');
    $('#user_driving_sides').val(v.drivingSide).trigger('change').trigger('chosen:updated');

    if (v.languagePopulation) {

        $el = $('#user_speaking_languages');
        $.each(v.languagePopulation, function (j, language) {
            if (language.officialStatus === 'official') {
                $el.val(language.type.toLowerCase()).trigger('change').trigger('chosen:updated');
            }
        });

        $el = $('#user_reading_languages');
        $.each(v.languagePopulation, function (j, language) {
            if (language.officialStatus === 'official') {
                $el.val(language.type.toLowerCase()).trigger('change').trigger('chosen:updated');
            }
        });
    }

    if (v.plugs) {

        array = [];
        $.each(v.plugs, function (i2, plug) {
            // plug.plugType = plug['Plug Type'].replace(/Type /g, '');
            array = $.union(array, [plug.plugType]);
        });
        $('#user_plug_types').val(array).trigger('change').trigger('chosen:updated');

        array = [];
        $.each(v.plugs, function (i2, plug) {
            // plug.electricPotential = plug.['Electric Potential'].replace(/[\D,]+/g, '').split(',');
            array = $.union(array, plug.electricPotentials);
        });
        $('#user_plug_voltages').val(array).trigger('change').trigger('chosen:updated');

        array = [];
        $.each(v.plugs, function (i2, plug) {
            // plug.frequencies = plug.Frequency.replace(/[\D,]+/g, '').split(',');
            array = $.union(array, plug.frequencies);
        });
        $('#user_plug_frequencies').val(array).trigger('change').trigger('chosen:updated');

    }

    if (v.measurementSystem && v.measurementSystem.MeasurementSystem) {
        $('#user_measurement_system').val(v.measurementSystem.MeasurementSystem).trigger('change').trigger('chosen:updated');
    }

    if (v.religions) {
        $.each(v.religions, function (k, religion) {
            if (religion.percent && (religion.percent > max || !max)) {
                max = ~~religion.percent;
                value = k;
            }
        });
        $('#user_religion').val(value).trigger('change').trigger('chosen:updated');
    }

    // Revalidate user profile form
    $('#user_profile_form').bootstrapValidator('validate');

    console.timeEnd(populateUserProfile.name + '(' + countryCode + ')');

    return true;

}





// Auto-save / restore forms (with id) from cookies
/*$(window).on('load', function () {
    $('#profile_modal').find('form[id].sayt').each(function () {
        var $el = $(this);
        $el.sayt(options.sayt);
        // $el.find(':input').trigger('change');
        // $el.bootstrapValidator('validate'); // formValidation
        console.log('#' + $el.attr('id') + ' restored from cookies');
    });
});*/


// Profile initialization form fields initialisation (when modal open)
$('#user_profile_reset_modal').one('shown.bs.modal', function () {
    'use strict';
    console.time('#user_profile_reset_modal initialisation');

    var $form = $('#user_profile_reset_form');

    // Initialize the chosen plugin when #user_profile_pane is visible
    $form.find('.chosen-select')
        .chosen(options.chosen)
        .end()
        .on('change')
        .trigger('chosen:updated');

    // Field validation
    $form
        .bootstrapValidator(
            $.extend({}, options.bootstrapValidator, {
                fields: {
                    userProfile: {
                        selector: '#user_profile',
                        validators: {
                            notEmpty: {
                                message: $.t('fields:default.messages.notEmpty')
                            }
                        }
                    }
                }
            })
        )
        .bootstrapValidator('validate')
        .end()
        .on('change', function () {
            var $this = $(this);
            if ($this.attr('id')) {
                $form.bootstrapValidator('revalidateField', $this.attr('id'));
            }
        });

    // Focus select field
    $('#user_profile')
        .focus()
        .trigger('chosen:activate');

    console.timeEnd('#user_profile_reset_modal initialisation');
});

// Disable populate profile button if user country field is empty
$('#user_profile').on('change', function () {
    'use strict';
    if ($('#user_profile').val()) {
        $('#refresh_profile').attr('disabled', false);
    } else {
        $('#refresh_profile').attr('disabled', true);
    }
});

// Populate profil form when user change his country
$('#refresh_profile').on('click', function (e) {
    'use strict';
    e.preventDefault();
    var $el = $('#user_profile');
    if ($el.val()) {
        populateUserProfile($el.val().toLowerCase());
    }
    $('#profile_modal').modal('hide');
});

deferred.ready.userProfile.resolve();


console.timeEnd('userProfileController.js script loaded');
