/*old-jslint indent: 2, unparam: true, plusplus: true */
/*jslint devel: true, browser: true, node: false, this: true */
/*global $ */
/*global drawCountryList, drawMap */
/*global countriesDatas, languagesDatas, currenciesDatas, prioritiesDatas, maxPoints*/

/**
 * www.destinationfilter.tk 0.7.0
 * https://github.com/christopheboisier/DestinationFinder/
 * MIT licensed
 * @author Christophe BOISIER
 *
 * Copyright (C) 2015 Christophe BOISIER
 */

/*
var languagesDatas,
  currenciesDatas,
  countriesDatas,
  prioritiesDatas;
*/

/**
 * Calculate scores
 *
 * @return { array } Datas for all countries
 */

function updateScores() {

    'use strict';
    console.time(updateScores.name + ' function executed');

    var $this,
        array,
        bliPriorities,
        countryChangeRate,
        intersect,
        intersect2,
        length,
        points,
        priorities = {},
        profile = {},
        ratio,
        //scoreRatio = 1,
        //scoreValue = 0,
        min,
        max,
        value;

    bliPriorities = {
        HO_BASE: {
            id: 'dwellings_without_basic_facilities_priority'
        },
        HO_HISH: {
            id: 'housing_expenditure_priority'
        },
        HO_NUMR: {
            id: 'rooms_per_person_priority'
        },
        IW_HADI: {
            id: 'household_net_adjusted_disposable_income_priority'
        },
        IW_HNFW: {
            id: 'household_net_financial_wealth_priority'
        },
        JE_EMPL: {
            id: 'employment_rate_priority'
        },
        JE_JT: {
            id: 'job_security_priority'
        },
        JE_LTUR: {
            id: 'long-term_unemployment_rate_priority'
        },
        JE_PEARN: {
            id: 'personal_earnings_priority'
        },
        SC_SNTWS: {
            id: 'quality_of_support_network_priority'
        },
        ES_EDUA: {
            id: 'educational_attainment_priority'
        },
        ES_STCS: {
            id: 'student_skills_priority'
        },
        ES_EDUEX: {
            id: 'years_in_education_priority'
        },
        EQ_AIRP: {
            id: 'air_pollution_priority'
        },
        EQ_WATER: {
            id: 'water_quality_priority'
        },
        CG_TRASG: {
            id: 'consultation_on_rule-making_priority'
        },
        CG_VOTO: {
            id: 'voter_turnout_priority'
        },
        HS_LEB: {
            id: 'life_expectancy_priority'
        },
        HS_SFRH: {
            id: 'self-reported_health_priority'
        },
        SW_LIFS: {
            id: 'life_satisfaction_priority'
        },
        PS_SFRV: {
            id: 'assault_rate_priority'
        },
        PS_REPH: {
            id: 'homicide_rate_priority'
        },
        WL_EWLH: {
            id: 'employees_working_very_long_hours_priority'
        },
        WL_TNOW: {
            id: 'time_devoted_to_leisure_and_personal_care_priority'
        }
    };

    // Build an object of user profile values
    $('#profile_form').find(':input[id]').each(function () {
        $this = $(this);
        if ($this.attr('id')) {
            profile[$this.attr('id')] = $this.val();
        }
    });

    // Build an array or user scripts from his reading languages
    if ($.isArray(profile.user_reading_languages) && languagesDatas) {
        profile.userReadingScripts = [];
        $.each(profile.user_reading_languages, function (i, languageCode) {
            if ($.isPlainObject(languagesDatas[languageCode]) && languagesDatas[languageCode].ScriptCode) {
                profile.userReadingScripts.push(languagesDatas[languageCode].ScriptCode);
            }
        });
    }

    // Define the strongest user money
    if ($.isArray(profile.user_currencies)) {
        $.each(profile.user_currencies, function (i, currencyCode) {
            if (currenciesDatas[currencyCode] && (!profile.userChangeRate || currenciesDatas[currencyCode].rate < profile.userChangeRate)) {
                profile.userChangeRate = parseFloat(currenciesDatas[currencyCode].rate.replace(/, /g, ''));
            }
        });
    }

    // Start reading each countries to calculate scores
    if (countriesDatas) {
        $.each(countriesDatas, function (cid, country) {

            country.matchingPriorities = {};
            country.points = 0;
            country.percent = 0;
            //country.maxPoints = maxPoints;

            // Is the country use the same currency as the user?
            //if (priorities.currency_priority) {
            country.matchingPriorities.currency_priority = {};
            country.matchingPriorities.currency_priority.required = [];

            if (profile.user_currencies) {
                country.matchingPriorities.currency_priority.values = [];

                if (country.CurrencyCode) {
                    intersect = $.intersect(
                        profile.user_currencies,
                        [country.CurrencyCode]
                    ).length;
                    if (intersect > 0) {
                        country.matchingPriorities.currency_priority.values.push(1);
                    }
                } else {
                    country.matchingPriorities.currency_priority.missing = true;
                }

            } else {
                country.matchingPriorities.currency_priority.required.push('user_currencies');
            }

            //}

            // Is the country neighborhood to the user one?
            //if (priorities.neighbor_priority) {
            country.matchingPriorities.neighbor_priority = {};
            country.matchingPriorities.neighbor_priority.required = [];
            country.matchingPriorities.neighbor_priority.values = [];

            if (profile.user_country) {

                if (country.neighbours) {
                    //if (cid === 'fr'){console.warn(profile.user_country+' in '+country.neighbours);}
                    if ($.inArray(profile.user_country, country.neighbours.split(',')) !== -1 || country.ISO === profile.user_country) {
                        country.matchingPriorities.neighbor_priority.values.push(1);
                    }
                } else {
                    country.matchingPriorities.neighbor_priority.missing = true;
                }

            } else {
                country.matchingPriorities.neighbor_priority.required.push('user_country');
            }

            //}

            // Is that most of the population speak user language?
            //if (priorities.speaking_language_priority) {
            country.matchingPriorities.speaking_language_priority = {};
            country.matchingPriorities.speaking_language_priority.required = [];
            country.matchingPriorities.speaking_language_priority.values = [];

            if (profile.user_speaking_languages) {

                if (country.languagePopulation) {
                    $.each(country.languagePopulation, function (j, language) {
                        intersect = $.intersect(
                            profile.user_speaking_languages,
                            [language.type]
                        ).length;
                        if (intersect > 0) {
                            country.matchingPriorities.speaking_language_priority.values
                                .push(language.populationPercent);
                        }
                    });
                } else {
                    country.matchingPriorities.speaking_language_priority.missing = true;
                }

            } else {
                country.matchingPriorities.speaking_language_priority.required.push('user_speaking_languages');
            }

            //}

            // Will I be able to read signs?
            //if (priorities.reading_language_priority) {
            country.matchingPriorities.reading_language_priority = {};
            country.matchingPriorities.reading_language_priority.required = [];
            country.matchingPriorities.reading_language_priority.values = [];

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
                                country.matchingPriorities.reading_language_priority.values
                                    .push(1); //.push(scoreValue)
                            }
                        }
                        /*else {
                                                        country.matchingPriorities.reading_language_priority.missing = true;
                                                    }*/
                    });
                } else {
                    country.matchingPriorities.reading_language_priority.missing = true;
                }

            } else {
                country.matchingPriorities.reading_language_priority.required.push('userReadingScripts');
            }

            //}

            // VISA

            country.matchingPriorities.visa_free_priority = {};
            country.matchingPriorities.voa_fee_priority = {};
            country.matchingPriorities.onward_ticket_priority = {};
            country.matchingPriorities.visa_free_priority.values = [];
            country.matchingPriorities.voa_fee_priority.values = [];
            country.matchingPriorities.onward_ticket_priority.values = [];
            country.matchingPriorities.visa_free_priority.required = [];
            country.matchingPriorities.voa_fee_priority.required = [];
            country.matchingPriorities.onward_ticket_priority.required = [];

            if (profile.user_citizenships && country.ISO) {
                // If this is one of user citizenships
                intersect = $.intersect(
                    profile.user_citizenships,
                    [country.ISO]
                ).length;
                /*if (intersect > 0) {
                  if (priorities.visa_free_priority) {
                    country.matchingPriorities.visa_free_priority = {
                      'values': [300]
                    };
                  }
                  if (priorities.onward_ticket_priority) {
                    country.matchingPriorities.onward_ticket_priority = {
                      'values': [scoreValue]
                    };
                  }
                } else*/
                if (country.touristVisas) {
                    if (intersect > 0) {
                        // Else check requirements for each countries
                        $.each(country.touristVisas, function (i, visa) {
                            intersect2 = $.intersect(
                                profile.user_citizenships,
                                [visa.originCountryISO]
                            ).length;
                            if (intersect > 0 || intersect2 > 0) {

                                // Visa-free
                                if (visa.visaFreeLimit) {
                                    if (visa.visaFreeLimit > 0) {
                                        country.matchingPriorities.visa_free_priority.values.push(visa.visaFreeLimit);
                                    } else if (intersect > 0 || visa.visaFreeLimit === 'unlimited') {
                                        country.matchingPriorities.visa_free_priority.values.push(300);
                                    }
                                } else {
                                    country.matchingPriorities.visa_free_priority.missing = true;
                                }

                                // visa on arrival fee
                                if (!visa['voa-fee']) {
                                    country.matchingPriorities.voa_fee_priority.values.push(1);
                                } else {
                                    country.matchingPriorities.voa_fee_priority.missing = true;
                                }

                                // onward-ticked
                                if (!visa.requirements || $.inArray('onward-ticket', visa.requirements) === -1) {
                                    country.matchingPriorities.onward_ticket_priority.values.push(1);
                                } else {
                                    country.matchingPriorities.onward_ticket_priority.missing = true;
                                }

                            }

                        });
                    }
                } else {
                    country.matchingPriorities.visa_free_priority.missing = true;
                    country.matchingPriorities.voa_fee_priority.missing = true;
                    country.matchingPriorities.onward_ticket_priority.missing = true;
                }

            } else {
                country.matchingPriorities.visa_free_priority.required = ['user_citizenships'];
                country.matchingPriorities.voa_fee_priority.required = ['user_citizenships'];
                country.matchingPriorities.onward_ticket_priority.required = ['user_citizenships'];
            }

            // Is that the country use the same Voltage as the user?
            //if (priorities.ac_voltages_priority || priorities.ac_plugs_priority) {

            country.matchingPriorities.ac_plugs_priority = {};
            country.matchingPriorities.ac_plugs_priority.required = [];
            country.matchingPriorities.ac_plugs_priority.values = [];

            //if (country.ISO === 'FR') {console.warn('profile.user_plug_voltages: '+profile.user_plug_voltages);}
            if (profile.user_plug_types) {

                if (country.plugs) {
                    $.each(country.plugs, function (i, plug) {

                        if (plug['Plug Type']) {
                            value = plug['Plug Type'].replace(/Type /g, '');
                            intersect = $.intersect(
                                profile.user_plug_types,
                                [value]
                            ).length;
                            if (intersect > 0) {
                                country.matchingPriorities.ac_plugs_priority.values.push(1);
                            }
                        } else {
                            country.matchingPriorities.ac_plugs_priority.missing = true;
                        }

                    });
                } else {
                    country.matchingPriorities.ac_plugs_priority.missing = true;
                }

            } else {
                country.matchingPriorities.ac_plugs_priority.required.push('user_plug_types');
            }


            country.matchingPriorities.ac_voltages_priority = {};
            country.matchingPriorities.ac_frequencies_priority = {};
            country.matchingPriorities.ac_voltages_priority.required = [];
            country.matchingPriorities.ac_frequencies_priority.required = [];
            country.matchingPriorities.ac_voltages_priority.values = [];
            country.matchingPriorities.ac_frequencies_priority.values = [];

            if (profile.user_plug_voltages && profile.user_plug_frequencies) {

                if (country.plugs) {
                    $.each(country.plugs, function (i, plug) {

                        if (plug['Electric Potential']) {
                            value = parseFloat(plug['Electric Potential']);
                            intersect = $.intersect(
                                profile.user_plug_voltages.map(Number),
                                [Number(value)]
                            ).length;
                            //if (cid === 'fr') {console.warn('$.intersect('+JSON.stringify(profile.user_plug_voltages.map(Number))+', ['+Number(value)+']).length = '+intersect);}
                            if (intersect > 0) {

                                if (plug.Frequency) {
                                    value = parseFloat(plug.Frequency);
                                    intersect = $.intersect(
                                        profile.user_plug_frequencies.map(Number),
                                        [Number(value)]
                                    ).length;
                                    //if (cid === 'fr') {console.warn('$.intersect('+JSON.stringify(profile.user_plug_frequencies.map(Number))+', ['+Number(value)+']).length = '+intersect);}
                                    if (intersect > 0) {
                                        country.matchingPriorities.ac_voltages_priority.values.push(1);
                                        country.matchingPriorities.ac_frequencies_priority.values.push(1);
                                    }
                                } else {
                                    country.matchingPriorities.ac_voltages_priority.missing = true;
                                }

                            }
                        } else {
                            country.matchingPriorities.ac_voltages_priority.missing = true;
                        }

                    });
                } else {
                    country.matchingPriorities.ac_voltages_priority.missing = true;
                }

            } else {
                country.matchingPriorities.ac_voltages_priority.required.push('user_plug_voltages');
            }
            //}

            // Income level
            /*if (priorities.ac_plugs_priority.points && $('#user_income_level')) {
              var intersect = $.intersect(profile.user_income_level, country.plug_type).length;
              if (intersect > 0) {
                var scoreRatio = 1;
                //country.score += priorities.user_income_level.points;
                country.matchingPriorities.user_income_level = { 'ratio': scoreRatio };
              }
              if (!(country.score>=0)) alert('Income level for country is not a number (' + country.score + ')');
            }*/

            // Is the change rate advantageous for the user?
            //if (priorities.change_rate_priority) {
            country.matchingPriorities.change_rate_priority = {};
            country.matchingPriorities.change_rate_priority.required = [];
            country.matchingPriorities.change_rate_priority.values = [];

            //if (country.ISO === 'FR') {console.warn('profile.user_currencies: '+profile.user_currencies);}
            if (profile.user_currencies && profile.userChangeRate) {

                if (currenciesDatas && currenciesDatas[country.CurrencyCode] && currenciesDatas[country.CurrencyCode].rate) {

                    // Country official currency value in euro (low rate)
                    countryChangeRate = parseFloat(currenciesDatas[country.CurrencyCode].rate.replace(/, /g, ''));

                    // Get max / min value for each country priorities
                    if (countryChangeRate) {
                        //if (ratio <= 1) {
                        ratio = profile.userChangeRate / countryChangeRate;
                        country.matchingPriorities.change_rate_priority.values.push(Math.min(ratio, 1)); //Math.min(ratio, 1)
                        //scoreRatio = (1 - ratio);
                        //country.matchingPriorities.change_rate_priority.values.push((1 - ratio));
                        //}
                    } else {
                        country.matchingPriorities.change_rate_priority.required.push('userChangeRate');
                    }

                } else {
                    country.matchingPriorities.change_rate_priority.missing = true;
                }

            } else {
                country.matchingPriorities.change_rate_priority.required.push('user_currencies');
            }
            //}



            // Driving side
            //if (priorities.driving_side_priority) {
            country.matchingPriorities.driving_side_priority = {};
            country.matchingPriorities.driving_side_priority.required = [];
            country.matchingPriorities.driving_side_priority.values = [];

            if (profile.user_driving_sides) {

                if (country.drivingSide) {
                    intersect = $.intersect(
                        profile.user_driving_sides,
                        [country.drivingSide]
                    ).length;
                    if (intersect > 0) {
                        country.matchingPriorities.driving_side_priority.values.push(1);
                    }
                } else {
                    country.matchingPriorities.driving_side_priority.missing = true;
                }

            } else {
                country.matchingPriorities.driving_side_priority.required.push('user_driving_sides');
            }
            //}

            // Religion
            //if (priorities.religion_priority) {
            country.matchingPriorities.religion_priority = {};
            country.matchingPriorities.religion_priority.required = [];
            country.matchingPriorities.religion_priority.values = [];

            if (profile.user_religion) {

                if (country.religions) {
                    $.each([profile.user_religion], function (i, religion) {
                        if (country.religions[religion]) {
                            country.matchingPriorities.religion_priority.values.push(Number(country.religions[religion].percent));
                        }
                    });
                } else {
                    country.matchingPriorities.religion_priority.missing = true;
                }

            } else {
                country.matchingPriorities.religion_priority.required.push('user_religion');
            }
            //}


            // Is that the country is an island or have islands
            //if (priorities.island_priority) {
            country.matchingPriorities.island_priority = {};
            country.matchingPriorities.island_priority.values = [];

            if (country.islands) {
                country.matchingPriorities.island_priority.values.push(1);
            } else {
                country.matchingPriorities.island_priority.missing = true;
            }

            //}

            // Better life index
            $.each(bliPriorities, function (indicator, bliPriority) {

                //if (priorities[bliPriority.id]) {
                country.matchingPriorities[bliPriority.id] = {};
                country.matchingPriorities[bliPriority.id].values = [];

                if (country.betterLifeIndexes) {
                    $.each(country.betterLifeIndexes, function (i, bli) {
                        if (bli.INDICATOR === indicator && bli.INEQUALITY === 'TOT') {
                            country.matchingPriorities[bliPriority.id].values.push(bli.Value);
                            //if (country.ISO === 'FR') {console.warn('matchingPriorities['+bliPriority.id+'].values.push('+bli.Value+')');}
                        }
                    });
                } else {
                    country.matchingPriorities[bliPriority.id].missing = true;
                }

                //}

            });
            /*if (country.betterLifeIndexes) {
                $.each(country.betterLifeIndexes, function (i, index) {
                    priority = bliPriorities[index.INDICATOR].id;

                    if (priorities[priority]) {
                        country.matchingPriorities[priority] = {};
                        country.matchingPriorities[priority].values = [];

                        country.matchingPriorities[priority].values.push(index.Value);
                    }
                });
            }*/

        });

        // Points to give for each priorities
        // The more priority is high, the more it will get points
        // If priority is disabled, give 0 point
        array = $('#enabled_priorities').sortable('toArray');
        length = array.length;
        if (!(length > 0)) {
            array = $('#disabled_priorities').sortable('toArray');
        }
        maxPoints = 0;
        $.each(array, function (i, pid) {
            priorities[pid] = {};

            // Merge data from priorities.json
            if (prioritiesDatas) {
                $.each(prioritiesDatas, function (i, priority) {
                    if (priority.id === pid) {
                        $.extend(priorities[pid], priority);
                    }
                });
            } else {
                console.warn('prioritiesDatas global variable is not defined');
            }
            //if (pid === 'change_rate_priority') console.info('priorities['+pid+']='+JSON.stringify(priorities[pid]));

            // Define for each priority the maximum of points allowed
            if (length > 0) {
                priorities[pid].points = (array.length - i) * 100;
            } else {
                priorities[pid].points = 100;
            }
            //if (pid === 'change_rate_priority') console.info('priorities['+pid+'].points='+priorities[pid].points);

            // Calculate the maximum of points a country can have (global var)
            maxPoints = maxPoints + priorities[pid].points;
            //if (pid === 'change_rate_priority') console.info('maxPoints='+maxPoints);

            // Define the minimum and maximum value returned for each priority of each country
            $.each(countriesDatas, function (cid, country) {
                if (country.matchingPriorities[pid] && country.matchingPriorities[pid].values) { //  && country.matchingPriorities[pid].values.length > 0

                    //if (pid === 'change_rate_priority' && cid === 'fr') console.info('Array.max('+JSON.stringify(country.matchingPriorities[pid].values)+', '+priorities[pid].maxValue+')');
                    max = Math.max.apply(Math, country.matchingPriorities[pid].values);
                    priorities[pid].maxValue = (priorities[pid].maxValue) ? Math.max(max, priorities[pid].maxValue) : max;
                    //if (pid === 'change_rate_priority' && cid === 'fr') console.info('priorities['+pid+'].maxValue='+priorities[pid].maxValue);

                    //if (pid === 'change_rate_priority') console.info('Array.min('+JSON.stringify(country.matchingPriorities[pid].values)+', '+priorities[pid].minValue+')');
                    min = Math.min.apply(Math, country.matchingPriorities[pid].values);
                    priorities[pid].minValue = (priorities[pid].minValue) ? Math.min(min, priorities[pid].minValue) : min;
                    //if (pid === 'change_rate_priority') console.info('priorities['+pid+'].minValue='+priorities[pid].minValue);

                }
            });

            if (priorities[pid].points && priorities[pid].maxValue && priorities[pid].minValue) {

                ratio = priorities[pid].points / (priorities[pid].maxValue - priorities[pid].minValue || 1);
                //ratio = priorities[pid].points / (priorities[pid].maxValue || 1);
                //if (pid === 'change_rate_priority') console.info('ratio='+ratio);

                $.each(countriesDatas, function (cid, country) {

                    //if (pid === 'change_rate_priority' && cid === 'fr') console.info('countriesDatas['+cid+'].matchingPriorities['+pid+'].values='+JSON.stringify(country.matchingPriorities[pid].values));

                    // If the country have several matching values
                    if (country.matchingPriorities[pid] && country.matchingPriorities[pid].values && country.matchingPriorities[pid].values.length > 0) {

                        // Convert the maximum or minimum value to points
                        // !!! priorities[pid].minValue and priorities[pid].minValue must not be = 0
                        if (priorities[pid].reverse_score && priorities[pid].reverse_score === 1) {
                            min = Math.min.apply(Math, country.matchingPriorities[pid].values);
                            points = (min - priorities[pid].minValue || min) * ratio;
                            //if (pid === 'change_rate_priority' && cid === 'fr') {console.info('min='+min)};
                            //if (pid === 'change_rate_priority' && cid === 'fr') {console.info('points='+points)};
                            points = priorities[pid].points - points;
                            if (!priorities[pid].minValue) {
                                console.warn('priorities[' + pid + '].minValue = ' + priorities[pid].minValue);
                            }
                        } else {
                            max = Math.max.apply(Math, country.matchingPriorities[pid].values);
                            points = (max - priorities[pid].minValue || max) * ratio;
                            //if (pid !== 'change_rate_priority' && cid === 'fr') console.info('('+max+' - '+priorities[pid].minValue+') * '+ratio+'='+points);
                            if (!priorities[pid].maxValue) {
                                console.warn('priorities[' + pid + '].minValue = ' + priorities[pid].maxValue);
                            }
                        }
                        country.matchingPriorities[pid].points = points;
                        country.matchingPriorities[pid].percent = country.matchingPriorities[pid].points / priorities[pid].points * 100;
                        //if (pid === 'change_rate_priority' && cid === 'fr') console.info('countriesDatas['+cid+'].matchingPriorities['+pid+'].points='+country.matchingPriorities[pid].points);
                        //if (pid === 'change_rate_priority' && cid === 'fr') console.info('countriesDatas['+cid+'].matchingPriorities['+pid+'].percent='+country.matchingPriorities[pid].percent);

                        // Add points to the country total
                        country.points = country.points + points;
                        country.percent = country.points / maxPoints * 100;
                            //if (pid === 'change_rate_priority' && cid === 'fr') console.info('countriesDatas['+cid+'].points='+countriesDatas[cid].points);
                            //if (pid === 'change_rate_priority' && cid === 'fr') console.info('countriesDatas['+cid+'].percent='+countriesDatas[cid].percent);

                    }
                });
            }

        });

    } else {
        console.warn('countriesDatas variable is not defined');
    }

    console.timeEnd(updateScores.name + ' function executed');

    return true;

}



/**
 * Check if required fields are filled correctly
 *
 * @return { boolean }
 */

function checkRequirements() {

    'use strict';
    console.time(checkRequirements.name + ' function executed');

    var requirements = true;

    // Check if required profile fields are not empty
    /*   $('#profile_form').find(':input').each(function () {
        var $this = $(this);
        if ($this.attr('id')) { userDatas[$this.attr('id')] = $this.val(); }
        userDatas[$this.attr('id') + '_name'] = $this.children("option:selected").text();
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

    console.timeEnd(checkRequirements.name + ' function executed');

    return requirements;

}



/**
 * Check if some fields change so we need to refresh results
 *
 * @return { boolean }
 */

function hasChanged() {

    'use strict';
    console.time(hasChanged.name + ' function executed');

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

    console.timeEnd(hasChanged.name + ' function executed');

    return changed;

}



/**
 * Get scores and update map and country list
 */

 /*
function updateResults() {

    'use strict';
    console.time(updateResults.name + ' function executed');
    //alert('Update score');

    //if (checkRequirements()
    //    && hasChanged()
    //    //&& $('#results').visible(true, true, 'vertical')
    //    ) {
    //  updateScores();
    //  drawCountryList();
    //  drawMap();
    //}

    if (
        $('#disabled_priorities').hasClass('ui-sortable') //.data('sortable')
        //$('#profile_form').isValid()
        //  && $('#priorities').sortable('toArray').length < 1
        //  && hasChanged()
    ) {
                    var $el = $('#profile_form');
            $el.bootstrapValidator('validate');
        updateScores();
        drawCountryList();
        //drawMap();
    }

    console.timeEnd(updateResults.name + ' function executed');

}
*/
