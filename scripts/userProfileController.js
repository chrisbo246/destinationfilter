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
    countriesData: true,
    currenciesData: true,
    userData: true,
    countryCodesISO2: true
*/

var userProfileModule = (function () {
    'use strict';

    /**
     * Populate profil form
     *
     * @param { string } countryCode - Country ISO2 code in lower case
     */

    var populateUserProfile = function (countryCode) {
        console.time('populateUserProfile(' + countryCode + ')');

        var $el,
            v,
            max,
            value,
            array = [];

        $.when(deferred.getJSON.countriesData).done(function () {
            
            // Skip if datas are not loaded or country doesn't exists
            if (!countriesData[countryCode]) {
                console.warn('country ' + countryCode + ' have no data'); /* RemoveLogging:skip */
                return false;
            }

            v = countriesData[countryCode];

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

            console.timeEnd('populateUserProfile(' + countryCode + ')');
            
            return true;
        });
        
    }



    /**
     *
     */

    var _userProfileFormValidation = function () {
        console.time('_userProfileFormValidation function executed');

        var $el = $('#user_profile_form');

        $.when(deferred.init.i18next).done(function () {

            // Field validation
            $el.bootstrapValidator(
                    $.extend({}, options.bootstrapValidator, {
                        fields: {
                            userCountry: {
                                selector: '#user_country',
                                validators: {
                                    notEmpty: {
                                        message: i18nextInstance.t('fields:default.messages.notEmpty')
                                    }
                                }
                            },
                            userCitizenships: {
                                selector: '#user_citizenships',
                                validators: {
                                    notEmpty: {
                                        message: i18nextInstance.t('fields:default.messages.notEmpty')
                                    }
                                }
                            },
                            userSpeakingLanguages: {
                                selector: '#user_speaking_languages',
                                validators: {
                                    notEmpty: {
                                        message: i18nextInstance.t('fields:default.messages.notEmpty')
                                    }
                                }
                            },
                            userReadingLanguages: {
                                selector: '#user_reading_languages',
                                validators: {
                                    notEmpty: {
                                        message: i18nextInstance.t('fields:default.messages.notEmpty')
                                    }
                                }
                            },
                            userPlugTypes: {
                                selector: '#user_plug_types',
                                validators: {
                                    notEmpty: {
                                        message: i18nextInstance.t('fields:default.messages.notEmpty')
                                    }
                                }
                            },
                            userPlugVoltages: {
                                selector: '#user_plug_voltages',
                                validators: {
                                    notEmpty: {
                                        message: i18nextInstance.t('fields:default.messages.notEmpty')
                                    }
                                }
                            },
                            userPlugFrequencies: {
                                selector: '#user_plug_frequencies',
                                validators: {
                                    notEmpty: {
                                        message: i18nextInstance.t('fields:default.messages.notEmpty')
                                    }
                                }
                            },
                            userCurrencies: {
                                selector: '#user_currencies',
                                validators: {
                                    notEmpty: {
                                        message: i18nextInstance.t('fields:default.messages.notEmpty')
                                    }
                                }
                            },
                            userIncomeLevel: {
                                selector: '#user_income_level',
                                validators: {
                                    notEmpty: {
                                        message: i18nextInstance.t('fields:default.messages.notEmpty')
                                    }
                                }
                            },
                            userDrivingSides: {
                                selector: '#user_driving_sides',
                                validators: {
                                    notEmpty: {
                                        message: i18nextInstance.t('fields:default.messages.notEmpty')
                                    }
                                }
                            },
                            userMeasurementSystem: {
                                selector: '#user_measurement_system',
                                validators: {
                                    notEmpty: {
                                        message: i18nextInstance.t('fields:default.messages.notEmpty')
                                    }
                                }
                            },
                            userFirstDayOfWeek: {
                                selector: '#user_first_day_of_week',
                                validators: {
                                    notEmpty: {
                                        message: i18nextInstance.t('fields:default.messages.notEmpty')
                                    }
                                }
                            },
                            userReligion: {
                                selector: '#user_religion',
                                validators: {
                                    notEmpty: {
                                        message: i18nextInstance.t('fields:default.messages.notEmpty')
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
                    // Store input values in userData object
                    var $this;
                    $el.find(':input[id]').each(function () {
                        $this = $(this);
                        userData[$this.attr('id').toCamel()] = $this.val();
                    });
                });
            /*.on('status.field.bv', function (e) {
                $el.bootstrapValidator('validate');
            });*/

        });

        // .bootstrapValidator('validate'); // formValidation
        $('.navbar').find('a[data-toggle="tab"]')
            /*.one('shown.bs.tab', function (e) {
                var paneId = $(e.target).attr('href');
                // Initialize the chosen plugin when #user_profile_pane become visible for the first time
                if (paneId === '#user_profile_pane') {
                    $el.find('.chosen-select')
                        .chosen(options.chosen);
                }
            })*/
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
        console.timeEnd('_userProfileFormValidation function executed');
    }

    
    
    $(function () {
            
        // Load global datas and populate select fields
        // _loadData();

        // If #user_profile_form have no cookie, try to detect user country and populate the form
        /*if (!$('#user_profile_form').sayt({
                checksaveexists: true
            })) {*/


        // Initialize form validation
        //_userProfileFormValidation();
        
        
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



        // If user currency field change, add change rate to user datas
        $.when(deferred.getJSON.currenciesData).done(function () {
            $('#user_currencies').on('change', function () {
                if ($(this).val()) {
                    userData.currencies = {};
                    $.each($(this).val(), function (i, currencyCode) {
                        if (currenciesData[currencyCode]) {
                            userData.currencies[currencyCode] = {};
                            userData.currencies[currencyCode].changeRate = currenciesData[currencyCode].rate;
                        }
                    });
                }
            });
        });

        deferred.ready.userProfile.resolve();
        
    });
    
    

    return {
        populateUserProfile: populateUserProfile
    };

})();

