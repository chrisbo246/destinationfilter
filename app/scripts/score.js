/*old-jslint indent: 2, unparam: true, plusplus: true */
/*
jslint
    devel: true,
    browser: true,
    node: false,
    this: true
*/
/*
global
    $,
    deferred: true,,
    prioritiesData: true,
    oecdIncomeLevels: true
*/
/*
exported
    updateScores,
    checkRequirements,
    hasChanged
*/
 
var scoreModule = (function () {
    'use strict';
    
    /**
     * Calculate scores
     *
     * @return { array } Datas for all countries
     */

    var updateScores = function () {

        console.time('updateScores function executed');

        var $this,
            array,
            countryChangeRate,
            intersect,
            length,
            points,
            enabledPriorities = {},
            profile = {},
            ratio,
            // scoreRatio = 1,
            // scoreValue = 0,
            min,
            max,
            value,
            values;



        // Build an object of user profile values
        $('#user_profile_form').find(':input[id]').each(function () {
            $this = $(this);
            if ($this.attr('id')) {
                profile[$this.attr('id').toCamel()] = $this.val();
            }
        });

        // Build an array or user scripts from his reading languages
        $.when(languagesData).done(function () {
            if ($.isArray(profile.userReadingLanguages) && languagesData) {
                profile.userReadingScripts = [];
                $.each(profile.userReadingLanguages, function (i, languageCode) {
                    if ($.isPlainObject(languagesData[languageCode]) && languagesData[languageCode].ScriptCode) {
                        profile.userReadingScripts.push(languagesData[languageCode].ScriptCode);
                    }
                });
            }
        });

        // Define the strongest user money
        if ($.isArray(profile.userCurrencies)) {
            $.each(profile.userCurrencies, function (i, currencyCode) {
                if (appModule.currenciesData[currencyCode] && appModule.currenciesData[currencyCode].eurExchangeRate && (!profile.userChangeRate || appModule.currenciesData[currencyCode].eurExchangeRate < profile.userChangeRate)) {
                    profile.userChangeRate = parseFloat(appModule.currenciesData[currencyCode].eurExchangeRate); // .replace(/[, ]/g, '')
                }
            });
        }

        console.log('User profile: ' + JSON.stringify(profile));

        // Start reading each countries to calculate scores
        $.when(appModule.countriesData, appModule.currenciesData).done(function () {
            
            $.each(appModule.countriesData, function (cid, country) {

                country.matchingPriorities = {};
                country.points = 0;
                country.missingDataPoints = 0;
                country.percent = 0;
                // country.maxPoints = maxPoints;

                // Is the country use the same currency as the user?
                // if (priorities.currency_priority) {
                country.matchingPriorities.currencyPriority = {};
                country.matchingPriorities.currencyPriority.required = [];

                if (profile.userCurrencies) {
                    country.matchingPriorities.currencyPriority.values = [];

                    if (country.CurrencyCode) {
                        intersect = $.intersect(
                            profile.userCurrencies,
                            [country.CurrencyCode]
                        ).length;
                        if (intersect > 0) {
                            country.matchingPriorities.currencyPriority.values.push(1);
                        }
                    } else {
                        country.matchingPriorities.currencyPriority.missing = true;
                    }

                } else {
                    country.matchingPriorities.currencyPriority.required.push('user_currencies');
                }

                // }

                // Is the country neighborhood to the user one?
                // if (priorities.neighbor_priority) {
                country.matchingPriorities.neighborPriority = {};
                country.matchingPriorities.neighborPriority.required = [];
                country.matchingPriorities.neighborPriority.values = [];

                if (profile.userCountry) {

                    if (country.neighbours) {
                        // if (cid === 'au'){console.warn(profile.userCountry+' in '+country.neighbours);}
                        if ($.inArray(profile.userCountry, country.neighbours) !== -1 || country.ISO === profile.userCountry) {
                            country.matchingPriorities.neighborPriority.values.push(1);
                        }
                    } else {
                        country.matchingPriorities.neighborPriority.missing = true;
                    }

                } else {
                    country.matchingPriorities.neighborPriority.required.push('user_country');
                }

                // }

                // Is that most of the population speak user language?
                // if (priorities.speaking_language_priority) {
                country.matchingPriorities.speakingLanguagePriority = {};
                country.matchingPriorities.speakingLanguagePriority.required = [];
                country.matchingPriorities.speakingLanguagePriority.values = [];

                if (profile.userSpeakingLanguages) {
                    if (country.languagePopulation) {
                        $.each(country.languagePopulation, function (j, language) {
                            intersect = $.intersect(
                                profile.userSpeakingLanguages,
                                [language.type]
                            ).length;
                            if (intersect > 0) {
                                country.matchingPriorities.speakingLanguagePriority.values
                                    .push(language.populationPercent);
                            } else {
                                country.matchingPriorities.speakingLanguagePriority.values
                                    .push(0);
                            }
                        });
                    } else {
                        country.matchingPriorities.speakingLanguagePriority.missing = true;
                    }

                } else {
                    country.matchingPriorities.speakingLanguagePriority.required.push('user_speaking_languages');
                }

                // }

                // Will I be able to read signs?
                // if (priorities.reading_language_priority) {
                country.matchingPriorities.readingLanguagePriority = {};
                country.matchingPriorities.readingLanguagePriority.required = [];
                country.matchingPriorities.readingLanguagePriority.values = [];

                if (profile.userReadingScripts) {

                    if (country.languagePopulation) {
                        $.each(country.languagePopulation, function (j, language) {
                            if (language.officialStatus) {
                                intersect = $.intersect(
                                    profile.userReadingScripts,
                                    [language.ScriptCode]
                                ).length;
                                if (intersect > 0 && $.inArray(
                                    language.officialStatus,
                                    ['official', 'de_facto_official', 'official_regional']
                                ) !== -1) {
                                    country.matchingPriorities.readingLanguagePriority.values
                                        .push(1); // .push(scoreValue)
                                }
                            }
                            /*else {
                                                            country.matchingPriorities.readingLanguagePriority.missing = true;
                                                        }*/
                        });
                    } else {
                        country.matchingPriorities.readingLanguagePriority.missing = true;
                    }

                } else {
                    country.matchingPriorities.readingLanguagePriority.required.push('userReadingScripts');
                }

                // }

                // VISA

                country.matchingPriorities.visaFreePriority = {};
                country.matchingPriorities.voaFeePriority = {};
                country.matchingPriorities.onwardTicketPriority = {};
                country.matchingPriorities.visaFreePriority.values = [];
                country.matchingPriorities.voaFeePriority.values = [];
                country.matchingPriorities.onwardTicketPriority.values = [];
                country.matchingPriorities.visaFreePriority.required = [];
                country.matchingPriorities.voaFeePriority.required = [];
                country.matchingPriorities.onwardTicketPriority.required = [];

                if (profile.userCitizenships) {

                    // If this is user country, no visa is required
                    if (country.ISO) {

                        /*intersect = $.intersect(
                            profile.userCitizenships,
                            [country.ISO]
                        ).length;*/

                        if ($.inArray(country.ISO, profile.userCitizenships) !== -1) {
                            country.matchingPriorities.visaFreePriority.values.push(300);
                            country.matchingPriorities.voaFeePriority.values.push(1);
                            country.matchingPriorities.onwardTicketPriority.values.push(1);
                        }
                    }

                    /*if (intersect > 0) {
                      if (priorities.visa_free_priority) {
                        country.matchingPriorities.visaFreePriority = {
                          'values': [300]
                        };
                      }
                      if (priorities.onward_ticket_priority) {
                        country.matchingPriorities.onwardTicketPriority = {
                          'values': [scoreValue]
                        };
                      }
                    } else*/
                    if (country.touristVisas) {

                        // Else check requirements for each countries
                        $.each(country.touristVisas, function (i, visa) {
                            /*intersect2 = $.intersect(
                                profile.userCitizenships,
                                [visa.originCountryISO]
                            ).length;*/
                            if ($.inArray(visa.originCountryISO, profile.userCitizenships) !== -1) {

                                // Visa-free
                                if (visa.visaFreeLimit || visa.visaFreeLimit === 0) {
                                    if (visa.visaFreeLimit > 0) {
                                        country.matchingPriorities.visaFreePriority.values.push(visa.visaFreeLimit);
                                    } else if (visa.visaFreeLimit === 'unlimited') {
                                        country.matchingPriorities.visaFreePriority.values.push(300);
                                    }
                                }

                                // visa on arrival fee
                                if (!visa['voa-fee']) {
                                    country.matchingPriorities.voaFeePriority.values.push(1);
                                } else {
                                    country.matchingPriorities.voaFeePriority.missing = true;
                                }

                                // onward-ticked
                                if (!visa.requirements || $.inArray('onward-ticket', visa.requirements) === -1) {
                                    country.matchingPriorities.onwardTicketPriority.values.push(1);
                                } else {
                                    country.matchingPriorities.onwardTicketPriority.missing = true;
                                }

                            }

                        });

                    } else {
                        country.matchingPriorities.visaFreePriority.missing = true;
                        country.matchingPriorities.voaFeePriority.missing = true;
                        country.matchingPriorities.onwardTicketPriority.missing = true;
                    }

                } else {
                    country.matchingPriorities.visaFreePriority.required = ['user_citizenships'];
                    country.matchingPriorities.voaFeePriority.required = ['user_citizenships'];
                    country.matchingPriorities.onwardTicketPriority.required = ['user_citizenships'];
                }

                // Is that the country use the same Voltage as the user?
                // if (priorities.ac_voltages_priority || priorities.ac_plugs_priority) {

                country.matchingPriorities.acPlugsPriority = {};
                country.matchingPriorities.acPlugsPriority.required = [];
                country.matchingPriorities.acPlugsPriority.values = [];

                // if (country.ISO === 'FR') {console.warn('profile.userPlugVoltages: '+profile.userPlugVoltages);}
                if (profile.userPlugTypes) {

                    if (country.plugs) {
                        $.each(country.plugs, function (i, plug) {

                            // if (plug['Plug Type']) {
                            //    value = plug['Plug Type'].replace(/Type /g, '');
                            if (plug.plugType) {
                                value = plug.plugType;
                                intersect = $.intersect(
                                    profile.userPlugTypes,
                                    [value]
                                ).length;
                                if (intersect > 0) {
                                    country.matchingPriorities.acPlugsPriority.values.push(1);
                                }
                            } else {
                                country.matchingPriorities.acPlugsPriority.missing = true;
                            }

                        });
                    } else {
                        country.matchingPriorities.acPlugsPriority.missing = true;
                    }

                } else {
                    country.matchingPriorities.acPlugsPriority.required.push('user_plug_types');
                }


                country.matchingPriorities.acVoltagesPriority = {};
                country.matchingPriorities.acFrequenciesPriority = {};
                country.matchingPriorities.acVoltagesPriority.required = [];
                country.matchingPriorities.acFrequenciesPriority.required = [];
                country.matchingPriorities.acVoltagesPriority.values = [];
                country.matchingPriorities.acFrequenciesPriority.values = [];

                if (profile.userPlugVoltages && profile.userPlugFrequencies) {
                    if (country.plugs) {
                        $.each(country.plugs, function (i, plug) {

                            // console.info('Freq: ' + JSON.stringify(plug.frequencies) + ' in ' + console.info(JSON.stringify(profile.userPlugFrequencies.map(Number))));
                            if (plug.frequencies) {
                                // values = plug.Frequency.replace(/[^0-9.,]/g, '').split(',').map(Number);
                                values = plug.frequencies
                                intersect = $.intersect(
                                    profile.userPlugFrequencies.map(Number),
                                    values
                                ).length;

                                if (intersect > 0) {
                                    country.matchingPriorities.acFrequenciesPriority.values.push(1);

                                    if (plug.electricPotentials) {
                                        // value = plug['Electric Potential'].replace(/[^0-9.,]/g, '').split(',').map(Number);
                                        /*values = plug.electricPotentials;
                                        intersect = $.intersect(
                                            profile.userPlugVoltages.map(Number),
                                            values
                                        ).length;
                                        if (intersect > 0) {*/

                                        $.each(profile.userPlugVoltages.map(Number), function (i1, v1) {
                                                $.each(plug.electricPotentials, function (i2, v2) {
                                                    // console.info(country.Country+' '+v1+' '+v2+' '+Math.abs(v1 - v2));
                                                    country.matchingPriorities.acVoltagesPriority.values.push(Math.abs(v1 - v2));
                                                    // min = Math.min(min, Math.abs(v1 - v2));
                                                });
                                            });
                                            // country.matchingPriorities.acVoltagesPriority.values.push(min);
                                            // country.matchingPriorities.acVoltagesPriority.values.push(Math.abs(v1 - v2));
                                        // }
                                    } else {
                                        country.matchingPriorities.acVoltagesPriority.missing = true;
                                    }

                                } else {
                                    country.matchingPriorities.acFrequenciesPriority.values.push(0);
                                }

                            } else {
                                country.matchingPriorities.acFrequenciesPriority.missing = true;
                            }
                        });
                    } else {
                        country.matchingPriorities.acVoltagesPriority.missing = true;
                        country.matchingPriorities.acFrequenciesPriority.missing = true;
                    }

                } else {
                    country.matchingPriorities.acVoltagesPriority.required.push('user_plug_voltages');
                }
                // }



                // Democratic level
                country.matchingPriorities.democracyPriority = {};
                country.matchingPriorities.democracyPriority.required = [];
                country.matchingPriorities.democracyPriority.values = [];

                // Get max / min value for each country priorities
                if (country.democracy && country.democracy.Score) {
                    country.matchingPriorities.democracyPriority.values.push(country.democracy.Score);
                } else {
                    country.matchingPriorities.democracyPriority.missing = true;
                }



                // Is the change rate advantageous for the user?
                // if (priorities.change_rate_priority) {
                country.matchingPriorities.changeRatePriority = {};
                country.matchingPriorities.changeRatePriority.required = [];
                country.matchingPriorities.changeRatePriority.values = [];

                // if (country.ISO === 'FR') {console.warn('profile.userCurrencies: '+profile.userCurrencies);}
                if (profile.userCurrencies && profile.userChangeRate) {

                    if (appModule.currenciesData && appModule.currenciesData[country.currency.CurrencyCode] && appModule.currenciesData[country.currency.CurrencyCode].eurExchangeRate) {

                        // Country official currency value in euro (low rate)
                        countryChangeRate = parseFloat(appModule.currenciesData[country.currency.CurrencyCode].eurExchangeRate); // .replace(/[, ]/g, '')

                        // Get max / min value for each country priorities
                        if (countryChangeRate) {
                            // if (ratio <= 1) {
                            ratio = profile.userChangeRate / countryChangeRate;
                            country.matchingPriorities.changeRatePriority.values.push(Math.min(ratio, 1)); // Math.min(ratio, 1)
                            // scoreRatio = (1 - ratio);
                            // country.matchingPriorities.changeRatePriority.values.push((1 - ratio));
                            // }
                        } else {
                            country.matchingPriorities.changeRatePriority.required.push('userChangeRate');
                        }

                    } else {
                        country.matchingPriorities.changeRatePriority.missing = true;
                    }

                } else {
                    country.matchingPriorities.changeRatePriority.required.push('user_currencies');
                }
                // }



                // Income level
                country.matchingPriorities.incomeLevelPriority = {};
                country.matchingPriorities.incomeLevelPriority.required = [];
                country.matchingPriorities.incomeLevelPriority.values = [];

                if (profile.userIncomeLevel) {
                    if (country.incomeLevel && country.incomeLevel.id) {
                        value = ~~profile.userIncomeLevel - ~~oecdIncomeLevels[country.incomeLevel.id];
                        country.matchingPriorities.incomeLevelPriority.values.push(Math.max(value, 0));
                    } else {
                        country.matchingPriorities.incomeLevelPriority.missing = true;
                    }
                } else {
                    country.matchingPriorities.incomeLevelPriority.required.push('user_income_level');
                }



                // Driving side
                // if (priorities.drivingSidePriority) {
                country.matchingPriorities.drivingSidePriority = {};
                country.matchingPriorities.drivingSidePriority.required = [];
                country.matchingPriorities.drivingSidePriority.values = [];

                if (profile.userDrivingSides) {

                    if (country.drivingSide) {
                        intersect = $.intersect(
                            profile.userDrivingSides,
                            [country.drivingSide]
                        ).length;
                        if (intersect > 0) {
                            country.matchingPriorities.drivingSidePriority.values.push(1);
                        }
                    } else {
                        country.matchingPriorities.drivingSidePriority.missing = true;
                    }

                } else {
                    country.matchingPriorities.drivingSidePriority.required.push('user_driving_sides');
                }
                // }

                // Religion
                // if (priorities.religion_priority) {
                country.matchingPriorities.religionPriority = {};
                country.matchingPriorities.religionPriority.required = [];
                country.matchingPriorities.religionPriority.values = [];

                if (profile.userReligion) {

                    if (country.religions) {
                        $.each([profile.userReligion], function (i, religion) {
                            if (country.religions[religion]) {
                                country.matchingPriorities.religionPriority.values.push(~~country.religions[religion].percent);
                            }
                        });
                    } else {
                        country.matchingPriorities.religionPriority.missing = true;
                    }

                } else {
                    country.matchingPriorities.religionPriority.required.push('user_religion');
                }
                // }


                // Is that the country is an island or have islands
                // if (priorities.island_priority) {
                country.matchingPriorities.islandPriority = {};
                country.matchingPriorities.islandPriority.values = [];

                if (country.islands) {
                    country.matchingPriorities.islandPriority.values.push(1);
                } else {
                    country.matchingPriorities.islandPriority.missing = true;
                }

                // }

                // Better life index
                $.when(prioritiesData).done(function () {

                    $.each(prioritiesData, function (i, priorityData) {

                        var indicator = priorityData.bliIndicator;
                        var pid = priorityData.id;
                        
                        if (indicator && pid) {
                            
                            country.matchingPriorities[pid] = {};
                            country.matchingPriorities[pid].values = [];

                            if (country.betterLifeIndexes) {
                                $.each(country.betterLifeIndexes, function (i, bli) {
                                    if (bli.INDICATOR === indicator && bli.INEQUALITY === 'TOT') {
                                        country.matchingPriorities[pid].values.push(bli.Value);
                                    }
                                });
                            } else {
                                country.matchingPriorities[pid].missing = true;
                            }
                        }

                    });
                });

            });

            $.when(prioritiesData).done(function () {
                
                // Points to give for each priorities
                // The more priority is high, the more it will get points
                // If priority is disabled, give 0 point
                array = $('#enabled_priorities').sortable('toArray');
                length = array.length;
                if (!length) {
                    array = $('#disabled_priorities').sortable('toArray');
                }
                var maxPoints = 0;               
               
                $.each(array, function (i, pid) {
                    enabledPriorities[pid] = {};

                    // Extend enabled priorities data with priorities.json
                    $.each(prioritiesData, function (i, priority) {
                        if (priority.id === pid) {
                            $.extend(enabledPriorities[pid], priority);
                            enabledPriorities[pid].reverse = $('#' + pid).find('.reverse-priority').prop('checked');
                        }
                    });

                    // Define for each priority the maximum of points allowed
                    var priorityRatio = 1;
                    var $el = $('#priority_ratio');
                    if ($el && $el.val()) {
                        priorityRatio = $el.val();
                    }

                    if (length > 0) {
                        enabledPriorities[pid].points = (array.length - i) * priorityRatio * 100;
                    } else {
                        enabledPriorities[pid].points = 100;
                    }
                    console.info('enabledPriorities['+pid+'].points='+enabledPriorities[pid].points);

                    // Calculate the maximum of points a country can have (global var)
                    maxPoints = maxPoints + enabledPriorities[pid].points;

                    // Define the minimum and maximum value returned for each priority of each country
                    $.each(appModule.countriesData, function (cid, country) {

                        if (pid === 'acVoltagesPriority' && cid === 'au') console.info('appModule.countriesData['+cid+'].matchingPriorities['+pid+']='+JSON.stringify(country.matchingPriorities[pid]));
                        if (country.matchingPriorities[pid]
                            // && country.matchingPriorities[pid].values
                            && $.isArray(country.matchingPriorities[pid].values)
                            && country.matchingPriorities[pid].values.length > 0) { //  && country.matchingPriorities[pid].values.length > 0

                            if (pid === 'acVoltagesPriority' && cid === 'au') console.info('Array.max('+JSON.stringify(country.matchingPriorities[pid].values)+', '+enabledPriorities[pid].maxValue+')');
                            max = Math.max.apply(Math, country.matchingPriorities[pid].values.map(Number));
                            enabledPriorities[pid].maxValue = (enabledPriorities[pid].maxValue || enabledPriorities[pid].maxValue === 0) ? Math.max(max, enabledPriorities[pid].maxValue) : max;
                            if (pid === 'acVoltagesPriority' && cid === 'au') console.info(cid+': enabledPriorities['+pid+'].maxValue='+enabledPriorities[pid].maxValue);

                            if (pid === 'acVoltagesPriority' && cid === 'au') console.info('Array.min('+JSON.stringify(country.matchingPriorities[pid].values)+', '+enabledPriorities[pid].minValue+')');
                            min = Math.min.apply(Math, country.matchingPriorities[pid].values.map(Number));
                            enabledPriorities[pid].minValue = (enabledPriorities[pid].minValue || enabledPriorities[pid].minValue === 0) ? Math.min(min, enabledPriorities[pid].minValue) : min;
                            if (pid === 'acVoltagesPriority' && cid === 'au') console.info(cid+': enabledPriorities['+pid+'].minValue='+enabledPriorities[pid].minValue);

                        } else {
                            country.missingDataPoints = country.missingDataPoints + enabledPriorities[pid].points;
                        }
                    });

                    if (pid === 'acVoltagesPriority') console.info('enabledPriorities['+pid+'].points=' + ~~enabledPriorities[pid].points + ' enabledPriorities['+pid+'].maxValue=' + ~~enabledPriorities[pid].maxValue + ' enabledPriorities['+pid+'].minValue=' + ~~enabledPriorities[pid].minValue);
                    if ((enabledPriorities[pid].points || enabledPriorities[pid].points === 0)
                        && (enabledPriorities[pid].maxValue || enabledPriorities[pid].maxValue === 0)
                        && (enabledPriorities[pid].minValue || enabledPriorities[pid].minValue === 0)) {

                        ratio = enabledPriorities[pid].points / ((enabledPriorities[pid].maxValue - enabledPriorities[pid].minValue) || 1);
                        // ratio = enabledPriorities[pid].points / (enabledPriorities[pid].maxValue || 1);
                        if (pid === 'acVoltagesPriority') console.info('enabledPriorities['+pid+'].ratio='+ratio);

                        $.each(appModule.countriesData, function (cid, country) {

                            // if (pid === 'acVoltagesPriority' && cid === 'au') console.info('appModule.countriesData['+cid+'].matchingPriorities['+pid+'].values='+JSON.stringify(country.matchingPriorities[pid].values));

                            // If the country have several matching values
                            if (country.matchingPriorities[pid] && country.matchingPriorities[pid].values && country.matchingPriorities[pid].values.length > 0) {

                                max = Math.max.apply(Math, country.matchingPriorities[pid].values);
                                points = (max - enabledPriorities[pid].minValue) * ratio;
                                if (pid === 'acVoltagesPriority' && cid === 'au') console.info('max(' + JSON.stringify(country.matchingPriorities[pid].values)+ ') = ' + max);
                                if (pid === 'acVoltagesPriority' && cid === 'au') console.info('points = ('+max+' - '+enabledPriorities[pid].minValue+') * '+ratio+'='+points);

                                if (enabledPriorities[pid].reverse) {
                                    //min = Math.min.apply(Math, country.matchingPriorities[pid].values);
                                    //points = (min - enabledPriorities[pid].minValue || min) * ratio;
                                    //if (pid === 'acVoltagesPriority' && cid === 'au') {console.info('min='+min)};
                                    //if (pid === 'acVoltagesPriority' && cid === 'au') {console.info('points='+points)};
                                    points = enabledPriorities[pid].points - points;
                                }

                                country.matchingPriorities[pid].points = points;
                                country.matchingPriorities[pid].percent = country.matchingPriorities[pid].points / enabledPriorities[pid].points * 100;
                                if (pid === 'acVoltagesPriority' && cid === 'au') console.info('appModule.countriesData['+cid+'].matchingPriorities['+pid+'].points='+country.matchingPriorities[pid].points);
                                if (pid === 'acVoltagesPriority' && cid === 'au') console.info('appModule.countriesData['+cid+'].matchingPriorities['+pid+'].percent='+country.matchingPriorities[pid].percent);

                                // Add points to the country total
                                country.points = country.points + points;
                                if (pid === 'acVoltagesPriority' && cid === 'au') console.info('appModule.countriesData['+cid+'].points='+appModule.countriesData[cid].points);

                            }
                        });
                    }

                });
                
                // Once the total has been calculate, convert points to percent
                console.info('maxPoints='+maxPoints);
                $.each(appModule.countriesData, function (cid, country) {
                    country.percent = country.points / maxPoints * 100;
                    country.missingDataPercent = country.missingDataPoints / maxPoints * 100;
                    if (cid === 'au') console.info('appModule.countriesData['+cid+'].percent='+appModule.countriesData[cid].percent);
                });
                
            });

        });

        console.timeEnd('updateScores function executed');

        return true;

    }



    /**
     * Check if required fields are filled correctly
     *
     * @return { boolean }
     */

    var checkRequirements = function () {

        console.time('checkRequirements function executed');

        var requirements = true;

        // Check if required profile fields are not empty
        /*   $('#profile_form').find(':input').each(function () {
            var $this = $(this);
            if ($this.attr('id')) { userData[$this.attr('id')] = $this.val(); }
            userData[$this.attr('id') + '_name'] = $this.children('option:selected').text();
            if (!$this.val()) { requirements = false; }
          });*/

        // Check if required settings fields are not empty
        /*$('#enabled_priorities_form').find(':input').each(function () {
          if (!$(this).val()) {
            requirements = false;
          }
        });*/

        // Check if at least one priority is defined
        if ($('#enabled_priorities').sortable('toArray').length < 1) {
            requirements = false;
        }

        // Show #results if all requirements are satisfied
        /*if (requirements) {
          $('#results').show();
        } else {
          $('#results').hide();
        }*/

        console.timeEnd('checkRequirements function executed');

        return requirements;

    }



    /**
     * Check if some fields change so we need to refresh results
     *
     * @return { boolean }
     */

    var hasChanged = function () {

        console.time('hasChanged function executed');

        var changed = false,
            id,
            value,
            $this;

        // Define a static variable to store each fields values
        if (!hasChanged.fields) {
            hasChanged.fields = [];
        }

        // Check if profile fields or settings changed
        $('#profile_form').find(':input')
            .each(function () {
                $this = $(this);
                if ($this.attr('id')) {
                    id = $this.attr('id');
                    value = $this.val();
                    if ($.isArray(value)) {
                        value = value.join(',');
                    }
                    if (value && (!hasChanged.fields[id] || value !== hasChanged.fields[id])) {
                        changed = true;
                        hasChanged.fields[id] = value;
                    }
                }
            });

        // Check if priorities changed
        id = 'enabled_priorities';
        value = $('#enabled_priorities').sortable('toArray').join(',');
        if (!hasChanged.fields[id] || value !== hasChanged.fields[id]) {
            changed = true;
            hasChanged.fields[id] = value;
        }

        console.timeEnd('hasChanged function executed');

        return changed;

    }



    /**
     * Get scores and update map and country list
     */

     /*
    var updateResults = function () {

        console.time('updateResults function executed');
        // alert('Update score');

        // if (checkRequirements()
        //    && hasChanged()
        //    // && $('#results').visible(true, true, 'vertical')
        //    ) {
        //  scoreModule.updateScores();
        //  drawCountryList();
        //  drawMap();
        // }

        if (
            $('#disabled_priorities').hasClass('ui-sortable') // .data('sortable')
            // $('#profile_form').isValid()
            //  && $('#priorities').sortable('toArray').length < 1
            //  && hasChanged()
        ) {
                        var $el = $('#profile_form');
                $el.bootstrapValidator('validate');
            scoreModule.updateScores();
            drawCountryList();
            // drawMap();
        }

        console.timeEnd('updateResults function executed');

    }
    */


    
    // Load priorities from JSON file
    var prioritiesData = {};  
    console.time('Load disabledPrioritiesModal.json');  
    $.getJSON('data/disabledPrioritiesModal.json', function (json) {
        prioritiesData = json;        
        console.timeEnd('Load disabledPrioritiesModal.json');
    }).promise(prioritiesData);
    
    var languagesData = {};
    console.time('Load languages.json');
    $.getJSON('data/languages.json', function (json) {
        languagesData = json;
        console.timeEnd('Load languages.json');
    }).promise(languagesData);
    
    return {
        updateScores: updateScores
        // checkRequirements: checkRequirements,
        // hasChanged: hasChanged,
        // updateResults: updateResults
    };
    
})();