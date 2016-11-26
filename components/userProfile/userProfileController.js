/*old-jslint indent: 2, unparam: true, plusplus: true */
/*jslint devel: true, browser: true, node: false */
/*global $ */
/*global updateResults */
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
var options,
  countriesDatas,
  userDatas,
  currenciesDatas;
*/

var countryCodesISO2 = {};

console.time('userProfileController.js script loaded');

/**
 * Load JSON files and aggregate country datas.
 * All datas are stored in countriesDatas global variable.
 */

function populateProfileSelectFields() {

    console.time(populateProfileSelectFields.name + ' function executed');

    var jqxhr = $.when(

        $.getJSON('datas/cache/languagesDatas.json')
        .done(function (json) {
            languagesDatas = json;
            // Populate fields
            appendSelectOptions('#user_speaking_languages', languagesDatas,
                'Code', 'Language', {
                    sort: 'asc',
                    remove: true,
                    attributs: {
                        'data-i18n': 'language.%s'
                    }
                });
            appendSelectOptions('#user_reading_languages', languagesDatas,
                'Code', 'Language', {
                    sort: 'asc',
                    remove: true,
                    attributs: {
                        'data-i18n': 'language.%s'
                    }
                });
            /*appendSelectOptions('#setLng', languagesDatas,
              'Code', 'Language', {
                sort: 'asc',
                remove: true,
                attributs:{
                  'data-i18n': 'language.%s',
                }
              });*/
        }),

        $.getJSON('datas/cache/currenciesDatas.json')
        .done(function (json) {
            currenciesDatas = json;
            // Populate fields
            appendSelectOptions('#user_currencies', currenciesDatas,
                'Ccy', 'CcyNm', {
                    sort: 'asc',
                    remove: true,
                    attributs: {
                        'data-i18n': 'currency.%s',
                    }
                });
        }),

        $.getJSON('datas/cache/countriesDatas.json')
        .done(function (json) {
            countriesDatas = json;
            // Populate fields
            appendSelectOptions('#user_profile', countriesDatas,
                'ISO', 'Country', {
                    sort: 'asc',
                    attributs: {
                        'data-i18n': 'country.%s',
                    }
                });
            appendSelectOptions('#user_country', countriesDatas,
                'ISO', 'Country', {
                    sort: 'asc',
                    remove: true,
                    attributs: {
                        'data-i18n': 'country.%s'
                    }
                });
            appendSelectOptions('#user_citizenships', countriesDatas,
                'ISO', 'Country', {
                    sort: 'asc',
                    remove: true,
                    attributs: {
                        'data-i18n': 'country.%s'
                    }
                });
            appendSelectOptions('#entry_494218657', countriesDatas,
                'ISO', 'Country', {
                    sort: 'asc',
                    remove: true,
                    attributs: {
                        'data-i18n': 'country.%s',
                    }
                });
            appendSelectOptions('#user_income_level', countriesDatas,
                'incomeLevel.id', 'incomeLevel.value', {
                    remove: true,
                    attributs: {
                        'data-i18n': 'incomeLevel.%s'
                    }
                });
            appendSelectOptions('#user_measurement_system', countriesDatas,
                'measurementSystem.MeasurementSystem', 'measurementSystem.MeasurementSystem', {
                    sort: 'asc',
                    remove: true,
                    attributs: {
                        'data-i18n': 'userMeasurementSystem.%s'
                    }
                });
            // ISO3 to ISO2 country codes conversion
            /*$.each(countriesDatas, function (id, country) {
                countryCodesISO2[country.ISO3] = country.ISO;
            });*/

        }),

        $.getJSON('datas/json/custom/select/en/ac_plug.json', function (json) {
            appendSelectOptions('#user_plug_types', json,
                'id', 'text', {
                    sort: 'asc',
                    remove: true,
                    attributs: {
                        'data-i18n': 'plugType.%s',
                        'data-img-src': 'http://www.iec.ch/worldplugs/img/plugs_sockets/%s_3d_plug_s.png'
                    }
                });
        }),

        $.getJSON('datas/json/custom/select/en/ac_voltage.json', function (json) {
            appendSelectOptions('#user_plug_voltages', json,
                'id', 'text', {
                    sort: 'asc',
                    remove: true,
                    attributs: {
                        'data-i18n': 'plugVoltage.%s'
                    }
                });
        })

    );

    console.timeEnd(populateProfileSelectFields.name + ' function executed');

    return jqxhr;

}



/**
 * Populate profil form
 *
 * @param { string } countryCode - Country ISO2 code in lower case
 */

function populateProfile(countryCode) {

    console.time(populateProfile.name + '(' + countryCode + ')');

    var $el,
        v,
        max,
        value,
        array = [];

    // Skip if datas are not loaded or country doesn't exists
    if (!countriesDatas) {
        console.warn('countryDatas variable should not be empty');
        return false;
    }
    if (!countriesDatas[countryCode]) {
        console.warn('country ' + countryCode + ' have no data');
        return false;
    }

    v = countriesDatas[countryCode];

    if (!$('#user_country').val()) {
        $('#user_country').val(v.ISO).trigger('change').trigger('chosen:updated');
    }
    $('#user_citizenships').val(v.ISO).trigger('change').trigger('chosen:updated');
    $('#user_currencies').val(v.CurrencyCode).trigger('change').trigger('chosen:updated');
    $('#user_income_level').val(v.incomeLevel ? v.incomeLevel.id : '').trigger('change').trigger('chosen:updated');
    $('#user_driving_sides').val(v.drivingSide).trigger('change').trigger('chosen:updated');

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

    array = [];
    $.each(v.plugs, function (i2, plug) {
        plug.type = plug['Plug Type'].replace(/Type /g, '');
        array = $.union(array, [plug.type]);
    });
    $('#user_plug_types').val(array).trigger('change').trigger('chosen:updated');

    array = [];
    $.each(v.plugs, function (i2, plug) {
        plug.voltages = plug['Electric Potential'].replace(/[\D,]+/g, '').split(',');
        array = $.union(array, plug.voltages);
    });
    $('#user_plug_voltages').val(array).trigger('change').trigger('chosen:updated');

    array = [];
    $.each(v.plugs, function (i2, plug) {
        plug.frequencies = plug.Frequency.replace(/[\D,]+/g, '').split(',');
        array = $.union(array, plug.frequencies);
    });
    $('#user_plug_frequencies').val(array).trigger('change').trigger('chosen:updated');

    $('#user_measurement_system').val(v.measurementSystem.MeasurementSystem).trigger('change').trigger('chosen:updated');
    
    if (v.religions) {
        $.each(v.religions, function (k, religion) {
            if (religion.percent && (religion.percent > max || !max)) {
                max = Number(religion.percent);
                value = k;
            }
        });
        $('#user_religion').val(value).trigger('change').trigger('chosen:updated');
    }

    // Revalidate user profile form
    $('#profile_form').bootstrapValidator('validate');

    console.timeEnd(populateProfile.name + '(' + countryCode + ')');

    return true;

}



/**
 *
 */
function userProfileFormValidation() {

    console.time(userProfileFormValidation.name + ' function executed');

    var $el = $('#profile_form');

    // Field validation
    $el.bootstrapValidator( //formValidation
            $.extend({}, options.bootstrapValidator, {
                fields: {
                    user_country: {
                        selector: '#user_country',
                        validators: {
                            notEmpty: {
                                message: $.t('user.profile.location.user_country.messages.not_empty')
                            }
                        }
                    },
                    user_citizenships: {
                        selector: '#user_citizenships',
                        validators: {
                            notEmpty: {
                                message: $.t('user.profile.legal.user_citizenships.messages.not_empty')
                            }
                        }
                    },
                    user_speaking_languages: {
                        selector: '#user_speaking_languages',
                        validators: {
                            notEmpty: {
                                message: $.t('user.profile.communication_ability.user_speaking_languages.messages.not_empty')
                            }
                        }
                    },
                    user_reading_languages: {
                        selector: '#user_reading_languages',
                        validators: {
                            notEmpty: {
                                message: $.t('user.profile.communication_ability.user_reading_languages.messages.not_empty')
                            }
                        }
                    },
                    user_plug_types: {
                        selector: '#user_plug_types',
                        validators: {
                            notEmpty: {
                                message: $.t('user.profile.appliances.user_plug_types.messages.not_empty')
                            }
                        }
                    },
                    user_plug_voltages: {
                        selector: '#user_plug_voltages',
                        validators: {
                            notEmpty: {
                                message: $.t('user.profile.appliances.user_plug_voltages.messages.not_empty')
                            }
                        }
                    },
                    user_plug_frequencies: {
                        selector: '#user_plug_frequencies',
                        validators: {
                            notEmpty: {
                                message: $.t('user.profile.appliances.user_plug_frequencies.messages.not_empty')
                            }
                        }
                    },
                    user_currencies: {
                        selector: '#user_currencies',
                        validators: {
                            notEmpty: {
                                message: $.t('user.profile.purchasing-power.user_currencies.messages.not_empty')
                            }
                        }
                    },
                    user_income_level: {
                        selector: '#user_income_level',
                        validators: {
                            notEmpty: {
                                message: $.t('user.profile.purchasing-power.user_income_level.messages.not_empty')
                            }
                        }
                    },
                    user_driving_sides: {
                        selector: '#user_driving_sides',
                        validators: {
                            notEmpty: {
                                message: $.t('user.profile.habits.user_driving_sides.messages.not_empty')
                            }
                        }
                    },
                    user_measurement_system: {
                        selector: '#user_measurement_system',
                        validators: {
                            notEmpty: {
                                message: $.t('user.profile.habits.user_measurement_system.messages.not_empty')
                            }
                        }
                    },
                    user_first_day_of_week: {
                        selector: '#user_first_day_of_week',
                        validators: {
                            notEmpty: {
                                message: $.t('user.profile.habits.user_first_day_of_week.messages.not_empty')
                            }
                        }
                    },
                    user_religion: {
                        selector: '#user_religion',
                        validators: {
                            notEmpty: {
                                message: $.t('user.profile.culture.user_religion.messages.not_empty')
                            }
                        }
                    }
                }
            })
        )
        .on('error.form.bv', function (e) {
            //alert('userProfile error');
            validationStepPercent(0, 0);
        })
        .on('success.form.bv', function (e) {
            //alert('userProfile success');
            validationStepPercent(0, 100);
        });
        /*.on('status.field.bv', function (e) {
            $el.bootstrapValidator('validate');
        });*/
    //.bootstrapValidator('validate'); //formValidation

    $('.navbar').find('a[data-toggle="tab"]')
        .one('shown.bs.tab', function (e) {
            var paneId = $(e.target).attr('href');
            // Initialize the chosen plugin when #user_pane become visible for the first time
            if (paneId === '#user_pane') {                
                $el.find('.chosen-select')
                    .chosen(options.chosen);
            }
        })
        .on('shown.bs.tab', function (e) {
            var previousPaneId = $(e.relatedTarget).attr('href');
            // Validate profile form each time user leave the #user_pane pane
            if (previousPaneId === '#user_pane') {
                $el.bootstrapValidator('validate');
            }
        });
    
    //  .end()
    /*$el.filter(':input')
      .on('change', function (e) {
        var $this = $(this);
        if ($this.attr('id')) {
          if ($el.bootstrapValidator('revalidateField', $this.attr('id')).isValid()) {
            updateResults();
          }
        }
      });*/

    // Profile initialization form fields initialisation (when modal open)
    $('#profile_modal').one('shown.bs.modal', function (e) {

        $el = $('#profile_initialization_form');

        // Initialize the chosen plugin when #user_pane is visible
        $el.find('.chosen-select')
            .chosen(options.chosen)
            .end()
            .on('change')
            .trigger('chosen:updated');

        // Field validation
        $el
            .bootstrapValidator(
                $.extend({}, options.bootstrapValidator, {
                    fields: {
                        user_profile: {
                            selector: '#user_profile',
                            validators: {
                                notEmpty: {
                                    message: $.t('user.profile.profile.user_profile.messages.not_empty')
                                }
                            }
                        }
                    }
                })
            )
            .bootstrapValidator('validate')
            .end()
            .on('change', function (e) {
                var $this = $(this);
                if ($this.attr('id')) {
                    $el.bootstrapValidator('revalidateField', $this.attr('id'));
                }
            });

        // Focus select field
        $('#user_profile').focus();
        $('#user_profile').trigger('chosen:activate');

    });

    console.timeEnd(userProfileFormValidation.name + ' function executed');

}



$('[data-anchor="user_profile"]').load('components/userProfile/userProfileView.htm', function () {

    console.time('userProfileView.htm view loaded');

    // Load global datas and populate select fields
    populateProfileSelectFields()
        .done(function () {
                  
            userProfileFormValidation();
            
            // If #profile_form have no cookie, try to detect user country and populate the form
            if (!$('#profile_form').sayt({'checksaveexists': true})) {
                console.time('freegeoip.net geolocation');
                $.getJSON('http://freegeoip.net/json/', function (result) {
                    if (result.country_code) {
                        //alert(JSON.stringify(result));
                        $('#user_profile').val(result.country_code).trigger('change');
                        $('#user_country').val(result.country_code).trigger('change');
                        $('#user_address').val(result.zip_code + ' ' + result.city + ', ' + result.country_name).trigger('change');
                        populateProfile(result.country_code.toLowerCase());
                    }
                });
                console.timeEnd('freegeoip.net geolocation');
            }
            
            // Auto-save / restore forms (with id) from cookies
            $(window).on('load', function () {
                $('[data-anchor="user_profile"]').find('form[id].sayt').each(function () {
                    var $el = $(this);
                    $el.sayt(options.sayt);
                    //$el.find(':input').trigger('change');
                    $el.bootstrapValidator('validate');
                    console.log('#' + $el.attr('id') + ' restored from cookies and validated');
                });
                    
            });

        });
      
    // If user currency field change, add change rate to user datas
    $('#user_currencies').on('change', function () {
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
        
    console.timeEnd('userProfileView.htm view loaded');

});



$.get('components/userProfile/resetModal.htm', function (template) {

    console.time('resetModal.htm view loaded');

    $('body').append(template);

    // Auto-save / restore forms (with id) from cookies
    /*$(window).on('load', function () {
        $('#profile_modal').find('form[id].sayt').each(function () {
            var $el = $(this);
            $el.sayt(options.sayt);
            //$el.find(':input').trigger('change');
            //$el.bootstrapValidator('validate'); //formValidation
            console.log('#' + $el.attr('id') + ' restored from cookies');
        });
    });*/
    
    // Disable populate profile button if user country field is empty
    $('#user_profile').on('change', function () {
        if ($('#user_profile').val()) {
            $('#refresh_profile').attr('disabled', false);
        } else {
            $('#refresh_profile').attr('disabled', true);
        }
    });

    // Populate profil form when user change his country
    $('#refresh_profile').on('click', function (e) {
        e.preventDefault();
        var $el = $('#user_profile');
        if ($el.val()) {
            populateProfile($el.val().toLowerCase());
        }
        $('#profile_modal').modal('hide');
    });

    console.timeEnd('resetModal.htm view loaded');

});

console.timeEnd('userProfileController.js script loaded');