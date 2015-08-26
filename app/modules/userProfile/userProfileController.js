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
    validationStepPercent,
    deferred: true,
    options: true,
    populateUserProfile,
    countriesDatas: true,
    languagesDatas: true,
    currenciesDatas: true,
    userDatas: true,
    countryCodesISO2: true
*/

/**
 * www.destinationfilter.tk 0.7.0
 * https://github.com/christopheboisier/DestinationFinder/
 * MIT licensed
 * @author Christophe BOISIER
 *
 * Copyright (C) 2015 Christophe BOISIER
 */

console.time('userProfileController.js script loaded');



/**
 * Convert hyphen string to camelcase
 */

if (typeof String.prototype.toCamel !== 'function') {
    'use strict';
    String.prototype.toCamel = function () {
        'use strict';
        return this.replace(/[-_]([a-z])/g, function (g) {return g[1].toUpperCase();}).replace(/[\W]/g, '')
    };
}



/**
 * Load JSON files and aggregate country datas.
 * All datas are stored in countriesDatas global variable.
 */

function populateProfileSelectFields() {
    'use strict';
    return $.when(
        $.getJSON('data/json/languagesDatas.json').done(function (json) {
            languagesDatas = json;
        }),
        $.getJSON('data/json/currenciesDatas.json').done(function (json) {
            currenciesDatas = json;
        }),
        $.getJSON('data/json/countriesDatas.json').done(function (json) {
            countriesDatas = json;
            // ISO3 to ISO2 country codes conversion
            $.each(countriesDatas, function (id, country) {
                if (country.ISO3 && country.ISO) {
                    countryCodesISO2[country.shapeId] = country.ISO;
                    // countryCodesISO2[country.ISO3] = country.ISO;
                }
            });
        })
    );
}



/**
 *
 */

function userProfileFormValidation() {
    'use strict';
    console.time(userProfileFormValidation.name + ' function executed');
    var $el = $('#user_profile_form');
    // Field validation
    $el.bootstrapValidator(
            $.extend({}, options.bootstrapValidator, {
                fields: {
                    userCountry: {
                        selector: '#user_country',
                        validators: {
                            notEmpty: {
                                message: $.t('fields:default.messages.notEmpty')
                            }
                        }
                    },
                    userCitizenships: {
                        selector: '#user_citizenships',
                        validators: {
                            notEmpty: {
                                message: $.t('fields:default.messages.notEmpty')
                            }
                        }
                    },
                    userSpeakingLanguages: {
                        selector: '#user_speaking_languages',
                        validators: {
                            notEmpty: {
                                message: $.t('fields:default.messages.notEmpty')
                            }
                        }
                    },
                    userReadingLanguages: {
                        selector: '#user_reading_languages',
                        validators: {
                            notEmpty: {
                                message: $.t('fields:default.messages.notEmpty')
                            }
                        }
                    },
                    userPlugTypes: {
                        selector: '#user_plug_types',
                        validators: {
                            notEmpty: {
                                message: $.t('fields:default.messages.notEmpty')
                            }
                        }
                    },
                    userPlugVoltages: {
                        selector: '#user_plug_voltages',
                        validators: {
                            notEmpty: {
                                message: $.t('fields:default.messages.notEmpty')
                            }
                        }
                    },
                    userPlugFrequencies: {
                        selector: '#user_plug_frequencies',
                        validators: {
                            notEmpty: {
                                message: $.t('fields:default.messages.notEmpty')
                            }
                        }
                    },
                    userCurrencies: {
                        selector: '#user_currencies',
                        validators: {
                            notEmpty: {
                                message: $.t('fields:default.messages.notEmpty')
                            }
                        }
                    },
                    userIncomeLevel: {
                        selector: '#user_income_level',
                        validators: {
                            notEmpty: {
                                message: $.t('fields:default.messages.notEmpty')
                            }
                        }
                    },
                    userDrivingSides: {
                        selector: '#user_driving_sides',
                        validators: {
                            notEmpty: {
                                message: $.t('fields:default.messages.notEmpty')
                            }
                        }
                    },
                    userMeasurementSystem: {
                        selector: '#user_measurement_system',
                        validators: {
                            notEmpty: {
                                message: $.t('fields:default.messages.notEmpty')
                            }
                        }
                    },
                    userFirstDayOfWeek: {
                        selector: '#user_first_day_of_week',
                        validators: {
                            notEmpty: {
                                message: $.t('fields:default.messages.notEmpty')
                            }
                        }
                    },
                    userReligion: {
                        selector: '#user_religion',
                        validators: {
                            notEmpty: {
                                message: $.t('fields:default.messages.notEmpty')
                            }
                        }
                    }
                }
            })
        )
        .on('error.form.bv', function () {
            // alert('userProfile error');
            validationStepPercent(0, 0);
        })
        .on('success.form.bv', function () {
            // alert('userProfile success');
            validationStepPercent(0, 100);
            // Store input values in userDatas object
            var $this;
            $el.find(':input[id]').each(function () {
                $this = $(this);
                userDatas[$this.attr('id').toCamel()] = $this.val();
            });
        });
    /*.on('status.field.bv', function (e) {
        $el.bootstrapValidator('validate');
    });*/

    $el.find('.image-picker').imagepicker({
        // hide_select: true,
        // limit: 2,
        // show_label: true
    })

    // .bootstrapValidator('validate'); // formValidation
    $('.navbar').find('a[data-toggle="tab"]')
        .one('shown.bs.tab', function (e) {
            var paneId = $(e.target).attr('href');
            // Initialize the chosen plugin when #user_profile_pane become visible for the first time
            if (paneId === '#user_profile_pane') {
                $el.find('.chosen-select')
                    .chosen(options.chosen);
            }
        })
        .on('shown.bs.tab', function (e) {
            var previousPaneId = $(e.relatedTarget).attr('href');
            // Validate profile form each time user leave the #user_profile_pane pane
            if (previousPaneId === '#user_profile_pane') {
                $el.bootstrapValidator('validate');
            }
        });
    //  .end()
    /*$el.filter(':input')
      .on('change', function () {
        var $this = $(this);
        if ($this.attr('id')) {
          if ($el.bootstrapValidator('revalidateField', $this.attr('id')).isValid()) {
            updateResults();
          }
        }
      });*/
    console.timeEnd(userProfileFormValidation.name + ' function executed');
}

// Load global datas and populate select fields
populateProfileSelectFields().done(function () {
    'use strict';

    // Tell the world that datas are ready
    deferred.load.data.resolve();
    // Initialize form validation
    userProfileFormValidation();

    // If #user_profile_form have no cookie, try to detect user country and populate the form
    if (!$('#user_profile_form').sayt({
            checksaveexists: true
        })) {        
        $.getJSON('http://freegeoip.net/json/', function (result) {
            console.time('freegeoip.net geolocation');
            if (result.country_code) {
                // alert(JSON.stringify(result));
                $('#user_profile').val(result.country_code).trigger('change');
                $('#user_country').val(result.country_code).trigger('change');
                $('#user_address').val(result.zip_code + ' ' + result.city + ', ' + result.country_name).trigger('change');
                populateUserProfile(result.country_code.toLowerCase());
            }
            console.timeEnd('freegeoip.net geolocation');
        });        
    }
    
    // Auto-save / restore forms (with id) from cookies
    /*$(window).on('load', function () {
        $('[data-anchor="user_profile"]').find('form[id].sayt').each(function () {
            var $el = $(this);
            $el.sayt(options.sayt);
            // $el.find(':input').trigger('change');
            $el.bootstrapValidator('validate');
            console.log('#' + $el.attr('id') + ' restored from cookies and validated');
        });
    });*/
});



// If user currency field change, add change rate to user datas
$('#user_currencies').on('change', function () {
    'use strict';
    if ($(this).val()) {
        userDatas.currencies = {};
        $.each($(this).val(), function (i, currencyCode) {
            if (currenciesDatas[currencyCode]) {
                userDatas.currencies[currencyCode] = {};
                userDatas.currencies[currencyCode].changeRate = currenciesDatas[currencyCode].rate;
            }
        });
    }
});

deferred.ready.userProfile.resolve();



console.timeEnd('userProfileController.js script loaded');
