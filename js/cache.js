/*old-jslint indent: 2, unparam: true, plusplus: true */
/*jslint devel: true, browser: true, node: false */
/*global $ */
/*global */
'use strict';

/**
 * www.destinationfilter.tk 0.7.0
 * https://github.com/christopheboisier/DestinationFinder/
 * MIT licensed
 * @author Christophe BOISIER
 *
 * Copyright (C) 2015 Christophe BOISIER
 */
 
var options = {
    cors: 'http://' //http://www.corsproxy.com/
};



/**
 * Display a formatted JSON object in an html element
 *
 * @param {object|array|string} json
 * @param {string} selector HTML element identifier
 */

function displayJson(jsonStr, selector) {

    var jsonObj,
        prettyJson,
        w;

    jsonObj = ($.type(jsonStr) === 'string') ? JSON.parse(jsonStr) : jsonStr;
    prettyJson = JSON.stringify(jsonObj, null, '\t');

    if (!selector || !$(selector)) {
        w = window.open();
        if (w) {
            selector = w.document.body;
        } else {
            selector = 'body';
        }
    }

    $('<pre />').appendTo(selector).text(prettyJson);
    //selector.append('<pre />').text(prettyJson);
}



/**
 * Try to define country id from the name.
 * All datas are stored in countriesDatas global variable.
 *
 * @param {string} name The name of the country
 * @param {array} alternativeNames Alternative country names
 * @return {number} The number of matching names or -1
 */

function inAlternativeNames(name, alternativeNames) {

    //console.time(inAlternativeNames.name + '(' + name + ', ' + alternativeNames + ') function executed');

    var a,
        b,
        i = -1,
        matchingList = [],
        normalizedList = [];

    if (!name) {
        //console.warn('inAlternativeNames() first parameter is empty');
        return false;    
    }
    if (Object.prototype.toString.call(alternativeNames) !== '[object Array]') {
        //console.warn('inAlternativeNames() second parameter is not and array');
        return false;    
    }
    if (alternativeNames.length === 0) {
        //console.warn('inAlternativeNames() second parameter is empty');
        return false;    
    }
    
    a = name
        .normalize('NFKD') // Remove accents
        .replace(/[\u0300-\u036F]/g, '')
        .replace(/(\(((?!\))[\W\w])*\)|\[((?!\])[\W\w])*\]|\{((?!\})[\W\w])*\})/g, '') // Remove text in parentheses
        .replace(/[\s.,;'’_\-]+/g, ' ') // Replace multiple spaces and punctuations by a single space
        .replace(/([^a-zA-Z\s]+|^\s+|\s+$)/g, '') // Remove all other characters
        .replace(/ & /g, ' and ')
        .toLowerCase(); // Convert to lower case

    if ($.isArray(alternativeNames)) {
        $.each(alternativeNames, function (k, v) {

            b = v
                .normalize('NFKD')
                .replace(/[\u0300-\u036F]/g, '')
                .replace(/(\(((?!\))[\W\w])*\)|\[((?!\])[\W\w])*\]|\{((?!\})[\W\w])*\})/g, '')
                .replace(/[\s.,;'’_\-]+/g, ' ')
                .replace(/([^a-zA-Z\s]+|^\s+|\s+$)/g, '')
                .replace(/ & /g, ' and ')
                .toLowerCase();

            if (a === b) {
                i = i + 1;
                matchingList.push(v);
            }
            
            normalizedList.push(b);

        });
        
    }
    
    /*if (name === 'Burma') {
    if (matchingList.length > 0) {
        console.info('Matching country name "' + name + '" ("' + a + '" found in [' + matchingList.join(',') + '])');
    } else {
        console.warn('Unknow country name "' + name + '" ("' + a + '" not in [' + normalizedList.join(',') + '])');
    }
    }*/
    
    //console.timeEnd(inAlternativeNames.name + '(' + name + ', ' + alternativeNames + ') function executed');

    return i;

}



/**
 * Merge language datas to language population before adding to country
 *
 */

function updateCache() {

    console.time(updateCache.name + ' function executed');

    console.timeEnd(updateCache.name + ' function executed');

}




/**
 * Load JSON files and aggregate country datas.
 * All datas are stored in countriesDatas global variable.
 */

console.time('Cache builded');

var id,
    countriesDatas = {},
    languagesDatas = {},
    currenciesDatas = {},
    countryName,
    unknowCountriesDatas = {},
    unknowCountryNames = [],
    unwanted = [],
    type_script,
    exclude;

$.when(

    // Load JSON file and calculate score for each country and build infos string
    $.getJSON('datas/json/geonamesorg/en/country_info.json', function (jsonDatas) {
        console.time('country_info.json');
        $.each(jsonDatas, function (i, v) {
            id = v.ISO.toLowerCase();
            if (id) {
                countriesDatas[id] = v;
                countriesDatas[id].priorities = [];
                countriesDatas[id].slug = v.Country.toLowerCase().replace(/[ ', \.]/g, '-');
            }
        });
        console.timeEnd('country_info.json');
    })
    .error(function(jqXHR, textStatus, errorThrown) {
        console.warn(errorThrown + ' in datas/json/geonamesorg/en/country_info.json');
    }),

    // Load country alternative names to be used with noid json
    $.getJSON('datas/json/custom/en/country_alt_names.json', function (jsonDatas) {
        console.time('country_alt_names.json');
        $.each(jsonDatas, function (i, v) {
            id = v.ISO.toLowerCase();
            if (id) {
                if (countriesDatas[id]) {
                    $.extend(countriesDatas[id], v);
                } else {
                    unwanted.push(id);
                    $.extend(unknowCountriesDatas[id], v);
                }
            }
        });
        console.timeEnd('country_alt_names.json');
    })
    .error(function(jqXHR, textStatus, errorThrown) {
        console.warn(errorThrown + ' in datas/json/custom/en/country_alt_names.json');
    }),

    // Language population
    $.getJSON('datas/json/unicodeorg/en/language_population.json', function (jsonDatas) {
        console.time('language_population.json');
        $.each(jsonDatas, function (i, v) {

            // Make sure that languagePopulation is an array and not a single object
            if (!$.isArray(v.languagePopulation)) {
                v.languagePopulation = [v.languagePopulation];
            }

            // Extend country
            id = v.type.toLowerCase();
            if (id) {
                if (countriesDatas[id]) {
                    $.extend(countriesDatas[id], v);
                } else {
                    unwanted.push(id);
                    $.extend(unknowCountriesDatas[id], v);
                }
            }

        });
        console.time('language_population.json');
    })
    .error(function(jqXHR, textStatus, errorThrown) {
        console.warn(errorThrown + ' in datas/json/unicodeorg/en/language_population.json');
    }),

    // VISA
    $.getJSON('datas/json/custom/en/visa.json', function (jsonDatas) {
        console.time('visa.json');
        $.each(jsonDatas, function (i, v) {
            id = v.ISO.toLowerCase();
            if (id) {
                if (countriesDatas[id]) {
                    $.extend(countriesDatas[id], v);
                } else {
                    unwanted.push(id);
                    $.extend(unknowCountriesDatas[id], v);
                }
            }
        });
        console.time('visa.json');
    })
    .error(function(jqXHR, textStatus, errorThrown) {
        console.warn(errorThrown + ' in datas/json/custom/en/visa.json');
    }),

    // Plugs and voltage
    $.getJSON('datas/json/iecch/en/plugs_by_location.json', function (jsonDatas) {
        console.time('plugs_by_location.json');
        $.each(jsonDatas, function (i, v) {

            // Try to aggregate using country name
            countryName = v.Location;
            if (countryName !== '') {
                $.each(countriesDatas, function (id, v2) {
                    if (inAlternativeNames(countryName, (v2.alternativeNames) ? $.merge([v2.Country], v2.alternativeNames) : [v2.Country]) !== -1) {
                        if (!countriesDatas[id].plugs) {
                            countriesDatas[id].plugs = [];
                        }
                        countriesDatas[id].plugs.push(v);
                        return countryName = false;
                    }
                });
                if (countryName !== false) {
                    unknowCountryNames = $.union(unknowCountryNames, [countryName]);
                }
            }

        });
        
        if (unknowCountryNames.length > 0) {
            console.warn('plugs_by_location.json: Unknow country names:\n' + JSON.stringify(unknowCountryNames) + '\n');
            unknowCountryNames = [];
        }
    
        console.timeEnd('plugs_by_location.json');
    })
    .error(function(jqXHR, textStatus, errorThrown) {
        console.warn(errorThrown + ' in datas/json/iecch/en/plugs_by_location.json');
    }),

    // Income level
    $.getJSON('datas/json/worldbankorg/en/worldbank.json', function (jsonDatas) {
        console.time('worldbank.json');
        $.each(jsonDatas[1], function (i, v) {
            id = v.iso2Code.toLowerCase();
            if (v.lendingType.value !== 'Aggregates') {
                if (id) {
                    if (countriesDatas[id]) {
                        $.extend(true, countriesDatas[id], v);
                    } else {
                        unwanted.push(id);
                        $.extend(unknowCountriesDatas[id], v);
                    }
                }
            }
        });
        console.timeEnd('worldbank.json');
    })
    .error(function(jqXHR, textStatus, errorThrown) {
        console.warn(errorThrown + ' in datas/json/worldbankorg/en/worldbank.json');
    }),


    // Islands
    // datas/json/islands.json
    $.getJSON('datas/json/custom/en/islands.json', function (jsonDatas) {
        console.time('islands.json');
        $.each(jsonDatas, function (i, v) {
            // Add islands datas to each country
            countryName = v.name;
            if (countryName !== '') {
                $.each(countriesDatas, function (id, v2) {
                    //if (v2.Country === countryName || (v2.alternativeNames && (inAlternativeNames(v.sovereign_state, v2.alternativeNames) !== -1 || inAlternativeNames(countryName, v2.alternativeNames) !== -1))) {
                    if (inAlternativeNames(countryName, (v2.alternativeNames) ? $.merge([v2.Country], v2.alternativeNames) : [v2.Country]) !== -1
                      || (v.sovereign_state !== '' && inAlternativeNames(v.sovereign_state, (v2.alternativeNames) ? $.merge([v2.Country], v2.alternativeNames) : [v2.Country]) !== -1)) {
                        if (!countriesDatas[id].islands) {
                            countriesDatas[id].islands = [];
                        }
                        countriesDatas[id].islands.push(v);
                        return countryName = false;
                    }
                });
                if (countryName !== false) {
                    unknowCountryNames = $.union(unknowCountryNames, [countryName]);
                }
            }

        });
        
        if (unknowCountryNames.length > 0) {
            console.warn('islands.json: Unknow country names:\n' + JSON.stringify(unknowCountryNames) + '\n');
            unknowCountryNames = [];
        }
    
        console.timeEnd('islands.json');
    })
    .error(function(jqXHR, textStatus, errorThrown) {
        console.warn(errorThrown + ' in datas/json/custom/en/islands.json');
    }),

    // Load continent names
    $.getJSON('datas/json/geonamesorg/en/continents.json', function (jsonDatas) {
        console.time('continents.json');
        $.each(countriesDatas, function (id, country) {
            $.each(jsonDatas, function (i, v) {
                if (country.Continent === v['ISO 639-2']) {
                    $.extend(countriesDatas[id], v);
                    return false;
                }
            });
        });
        console.timeEnd('continents.json');
    })
    .error(function(jqXHR, textStatus, errorThrown) {
        console.warn(errorThrown + ' in datas/json/geonamesorg/en/continents.json');
    }),

    // User reports
    $.getJSON('datas/json/custom/en/user_reports.json', function (jsonDatas) {
        console.time('user_reports.json');
        $.each(jsonDatas, function (i, v) {
            id = v.ISO.toLowerCase();
            if (id) {
                if (countriesDatas[id]) {
                    $.extend(countriesDatas[id], v);
                } else {
                    unwanted.push(id);
                    $.extend(unknowCountriesDatas[id], v);
                }
            }
        });
        console.timeEnd('user_reports.json');
    })
    .error(function(jqXHR, textStatus, errorThrown) {
        console.warn(errorThrown + ' in datas/json/custom/en/user_reports.json');
    }),

    // Better life index
    $.getJSON('datas/json/oecdorg/en/better_life_index.json', function (jsonDatas) {
        console.time('better_life_index.json');
        $.each(jsonDatas, function (i, v) {
            $.each(countriesDatas, function (id, country) {
                if (v.LOCATION === country.ISO3) {
                    if (!countriesDatas[id].betterLifeIndexes) {
                        countriesDatas[id].betterLifeIndexes = [];
                    }
                    countriesDatas[id].betterLifeIndexes.push(v);
                    return false;
                }
            });
        });
        console.timeEnd('better_life_index.json');
    })
    .error(function(jqXHR, textStatus, errorThrown) {
        console.warn(errorThrown + ' in datas/json/oecdorg/en/better_life_index.json');
    }),

    // Driving side
    $.getJSON('datas/json/custom/en/driving_side.json', function (jsonDatas) {
        console.time('driving_side.json');
        $.each(jsonDatas, function (i, v) {
            id = v.ISO;
            $.each(countriesDatas, function (id, v2) {
                if (id) {
                    if (countriesDatas[id]) {
                        countriesDatas[id].drivingSide = v.drivingSide;
                        countryName = '';
                    } else {
                        unwanted.push(id);
                        $.extend(unknowCountriesDatas[id], v);
                    }
                }
            });
            if (countryName !== false) {
                unknowCountryNames = $.union(unknowCountryNames, [countryName]);
            }
        });
        console.timeEnd('driving_side.json');
    })
    .error(function(jqXHR, textStatus, errorThrown) {
        console.warn(errorThrown + ' in datas/json/custom/en/driving_side.json');
    }),
    
    // Measurement systems
    $.getJSON('datas/json/custom/en/measurement_systems.json', function (jsonDatas) {
        console.time('measurement_systems.json');
        $.each(jsonDatas, function (i, v) {
            
            countryName = v['CountryName'];
            if (countryName !== '') {
                $.each(countriesDatas, function (id, v2) {
                    //if (v2.Country === countryName || (v2.alternativeNames && inAlternativeNames(countryName, $.merge([v2.Country], v2.alternativeNames)) !== -1)) {
                    if (inAlternativeNames(countryName, (v2.alternativeNames) ? $.merge([v2.Country], v2.alternativeNames) : [v2.Country]) !== -1) {
                        v2.measurementSystem = v;
                        return countryName = false;
                    }
                });
                if (countryName !== false) {
                    unknowCountryNames = $.union(unknowCountryNames, [countryName]);
                }
            }

        });

        if (unknowCountryNames.length > 0) {
            console.warn('measurement_systems.json: Unknow country names:\n' + JSON.stringify(unknowCountryNames) + '\n');
            unknowCountryNames = [];
        }
    
        console.timeEnd('measurement_systems.json');
    })
    .error(function(jqXHR, textStatus, errorThrown) {
        console.warn(errorThrown + ' in datas/json/custom/en/measurement_systems.json');
    }),
    
    // Religions

    //var array = [];
    $.getJSON('datas/json/custom/en/religions.json', function (jsonDatas) {
        console.time('religions.json');
        $.each(jsonDatas, function (i, v) {
            // Add islands datas to each country
            countryName = v.Country;
            if (countryName !== '') {
                $.each(countriesDatas, function (id, v2) {
                    if (inAlternativeNames(countryName, (v2.alternativeNames) ? $.merge([v2.Country], v2.alternativeNames) : [v2.Country]) !== -1) {
                        countriesDatas[id].religions = v.religions;
                        //array.push({"ISO":v2.ISO, "ISO3":v2.ISO3, "ISO-Numeric":v2["ISO-Numeric"], "Country":v2.Country, "religions":v.religions});
                        return countryName = false;
                    }
                });
                if (countryName !== false) {
                    unknowCountryNames = $.union(unknowCountryNames, [countryName]);
                }
            }

        });
        
        if (unknowCountryNames.length > 0) {
            console.warn('religions.json: Unknow country names:\n' + JSON.stringify(unknowCountryNames) + '\n');
            unknowCountryNames = [];
        }
    
        console.timeEnd('religions.json');
    })
    .error(function(jqXHR, textStatus, errorThrown) {
        console.warn(errorThrown + ' in datas/json/custom/en/religions.json');
    }),

    // Language codes
    $.getJSON('datas/json/geonamesorg/en/languages.json', function (jsonDatas) {
        console.time('languages.json');
        $.each(jsonDatas, function (i, v) {
            if (v['ISO 639-3']) {
                id = v['ISO 639-3'];
            }
            if (v['ISO 639-2']) {
                id = v['ISO 639-2'];
            }
            if (v['ISO 639-1']) {
                id = v['ISO 639-1'];
            }
            if (id) {
                languagesDatas[id] = v;
            }
        });
        console.timeEnd('languages.json');
    })
    .error(function(jqXHR, textStatus, errorThrown) {
        console.warn(errorThrown + ' in datas/json/geonamesorg/en/languages.json');
    }),

    // Language script
    $.getJSON('datas/json/unicodeorg/en/language_script.json', function (jsonDatas) {
        console.time('language_script.json');
        $.each(jsonDatas, function (i, v) {
            id = v.Code;
            if (id && languagesDatas[id]) {
                $.extend(languagesDatas[id], v);
            }
        });
        console.timeEnd('language_script.json');
    })
    .error(function(jqXHR, textStatus, errorThrown) {
        console.warn(errorThrown + ' in datas/json/unicodeorg/en/language_script.json');
    }),

    $.getJSON('datas/json/isoorg/en/currency_iso4217.json', function (jsonDatas) {
        console.time('currency_iso4217.json');
        $.each(jsonDatas, function (i, v) {
            id = v.Ccy;
            if (id && currenciesDatas) {
                currenciesDatas[id] = v;
            }
        });
        console.timeEnd('currency_iso4217.json');
    })
    .error(function(jqXHR, textStatus, errorThrown) {
        console.warn(errorThrown + ' in datas/json/isoorg/en/currency_iso4217.json');
    }),

    // Load change rates in Euro
    // datas/json/ecbeuropaeu/en/euroxref-daily.json
    // datas/json/custom/en/euro_change_rate.json
    $.ajax({
        //type: 'POST',
        //data: null,
        //crossDomain: true,
        xhrFields: {
            //withCredentials: true
        },
        /*processData: false,
        headers: {
            'Authorization':'Basic xxxxxxxxxxxxx',
            'X_CSRF_TOKEN':'xxxxxxxxxxxxxxxxxxxx',
            'Content-Type':'application/json'
        },

        crossDomain: false,
        global: false,
        ifModified: false,
        accepts: {xml: 'text/xml', text: 'text/plain'},
        converters: {'text xml': $.parseXML},
        */
        url: options.cors + 'www.floatrates.com/daily/eur.xml', // http://themoneyconverter.com/rss-feed/EUR/rss.xml  www.floatrates.com/daily/eur.xml
        dataType: 'xml',
        success: function (xmlDatas) {
                console.time('www.floatrates.com/daily/eur.xml');
                var jsonDatas = $.xml2json(xmlDatas);
                $.each(jsonDatas.item, function (i, v) {
                    id = v.targetCurrency;
                    if (currenciesDatas && currenciesDatas[id]) {
                        $.extend(currenciesDatas[id], {
                            'rate': v.exchangeRate
                        });
                    }
                });
                // Manually add missing Euro rate
                $.extend(currenciesDatas.EUR, {
                    'rate': '1'
                });
                console.timeEnd('www.floatrates.com/daily/eur.xml');
            }
    })

).done(function () {

    console.log('Start merging datas...');
    
    /*if (unwanted.length > 0) {
      console.log('Unwanted datas for:\n'+JSON.stringify(unwanted)+'\n');
    }*/

    console.time('Merge languages');
    if (countriesDatas && languagesDatas) {
        $.each(countriesDatas, function (id, v) {
            if (v.languagePopulation) {
                $.each(v.languagePopulation, function (i, languagePopulation) {
                    $.each(languagesDatas, function (k, language) {
                        type_script = languagePopulation.type.split('_');
                        if (type_script[0] === language['ISO 639-1'] || type_script[0] === language['ISO 639-2'] || type_script[0] === language['ISO 639-3']) {
                            // Change script code if the second part of type explicitly give it
                            if (type_script[1]) {
                                language.ScriptCode = type_script[1];
                                language.Script = type_script[1];
                            }
                            $.extend(countriesDatas[id].languagePopulation[i], language);
                            return false;
                        }
                    });
                });
            } else {
                console.log('Missing datas: countriesDatas.' + id + '.languagePopulation');
            }
        });
    }
    console.timeEnd('Merge languages');


    // Merge currencies
    console.time('Merge currencies');
    if (currenciesDatas && countriesDatas) {

        exclude = [
            "EUROPEAN UNION",
            "INTERNATIONAL MONETARY FUND (IMF) ",
            "MEMBER COUNTRIES OF THE AFRICAN DEVELOPMENT BANK GROUP",
            "SISTEMA UNITARIO DE COMPENSACION REGIONAL DE PAGOS \"SUCRE\"",
            "ZZ01_Bond Markets Unit European_EURCO",
            "ZZ02_Bond Markets Unit European_EMU-6",
            "ZZ03_Bond Markets Unit European_EUA-9",
            "ZZ04_Bond Markets Unit European_EUA-17",
            "ZZ06_Testing_Code",
            "ZZ07_No_Currency",
            "ZZ08_Gold",
            "ZZ09_Palladium",
            "ZZ10_Platinum",
            "ZZ11_Silver"
        ];

        $.each(currenciesDatas, function (i, v) {
            countryName = v.CtryNm;
            if (countryName !== '') {
                // Exclude some values
                if ($.inArray(countryName, exclude) === -1) {
                    $.each(countriesDatas, function (id, v2) {
                        // Try to join using country name (alternative names)
                        if (inAlternativeNames(countryName, (v2.alternativeNames) ? $.merge([v2.Country], v2.alternativeNames) : [v2.Country]) !== -1) {
                            countriesDatas[id].currency = {};
                            $.extend(countriesDatas[id].currency, v);
                            return countryName = false;
                        }
                    });
                    if (countryName !== false) {
                        unknowCountryNames = $.union(unknowCountryNames, [countryName]);
                    }
                }
            }

            // Aggregate with currencies
            if (!currenciesDatas[v.Ccy]) {
                currenciesDatas[v.Ccy] = v;
                delete currenciesDatas[v.Ccy].CtryNm;
            }
            
            if (unknowCountryNames.length > 0) {
                console.warn('Merge currencies: Unknow country names:\n' + JSON.stringify(unknowCountryNames) + '\n');
                unknowCountryNames = [];
            }

        });
        
    }
    console.time('Merge currencies');

    displayJson(countriesDatas);
    displayJson(languagesDatas);
    displayJson(currenciesDatas);

    console.time('Cache builded');

});