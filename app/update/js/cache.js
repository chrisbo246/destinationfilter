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
            if (v) {
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
            } else {
                console.warn('Unknow index ' + k + ' in alternative names ' + JSON.stringify(alternativeNames) + ' looking for ' + name);
            }
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
    translationDatas = {},
    countryName,
    unknowCountriesDatas = {},
    unknowCountryNames = [],
    unwanted = [],
    type_script,
    exclude;

var deferred = {
    countries: $.Deferred(),
    languages: $.Deferred(),
    currencies: $.Deferred()
};


$.when(

    // Load country alternative names to be used with noid json
    $.getJSON('data/json/custom/en/country_alt_names.json', function (jsonDatas) {
        console.time('country_alt_names.json');
        $.each(jsonDatas, function (i, v) {            
            id = v.ISO.toLowerCase();
            if (id) {
                countriesDatas[id] = v;
                //countriesDatas[id].priorities = [];
                //countriesDatas[id].slug = v.Country.toLowerCase().replace(/[ ', \.]/g, '-');
            }
            id = v.ISO.toLowerCase();
        });
        deferred.countries.resolve();
        console.timeEnd('country_alt_names.json');
    })
    .error(function(jqXHR, textStatus, errorThrown) {
        console.warn(errorThrown + ' in datas/json/custom/en/country_alt_names.json');
    }),
    
    // Load country data from Bower world-countries
    /*$.getJSON('../bower_components/world-countries/dist/countries.json', function (jsonDatas) {
        console.time('countries.json');
        $.each(jsonDatas, function (i, v) {            
            id = v.cca2.toLowerCase();
            if (id) {
                $.extend(true, countriesDatas[id], v);
            }
        });
        console.timeEnd('countries.json');
    })
    .error(function(jqXHR, textStatus, errorThrown) {
        console.warn(errorThrown + ' in ../bower_components/world-countries/dist/countries.json');
    }),*/    
    
    // Load JSON file and calculate score for each country and build infos string
    $.getJSON('data/json/geonamesorg/en/country_info.json', function (jsonDatas) {
        $.when(deferred.countries).then(function () {
            console.time('country_info.json');
            $.each(jsonDatas, function (i, v) {
                id = v.ISO.toLowerCase();
                if (id) {
                    if (countriesDatas[id]) {
                        $.extend(true, countriesDatas[id], v, {
                            codes: {
                                ISO: v.ISO,
                                ISO3: v.ISO3,
                                'ISO-Numeric': v['ISO-Numeric'],
                                fips: v.fips,
                                EquivalentFipsCode: v.EquivalentFipsCode,
                                geonameid: v.geonameid
                            },
                            currency: {
                                CurrencyCode: v.CurrencyCode,
                                CurrencyName: v.CurrencyName
                            },
                            languages: v.Languages.replace(/[ ]/g, '').split(','),
                            neighbours: v.neighbours.replace(/[ ]/g, '').split(',')
                        });
                        
                        delete countriesDatas[id]['ISO-Numeric'];
                        delete countriesDatas[id].fips;
                        delete countriesDatas[id].EquivalentFipsCode;
                        delete countriesDatas[id].geonameid;
                        delete countriesDatas[id].CurrencyCode;
                        delete countriesDatas[id].CurrencyName;
                        delete countriesDatas[id].Languages;
                            
                    } else {
                        unwanted.push(id);
                        $.extend(unknowCountriesDatas[id], v);
                    }
                }
                /*
                if (id) {
                    countriesDatas[id] = v;
                    countriesDatas[id].priorities = [];
                    countriesDatas[id].slug = v.Country.toLowerCase().replace(/[ ', \.]/g, '-');
                }*/
            });
            console.timeEnd('country_info.json');
        });
    })
    .error(function(jqXHR, textStatus, errorThrown) {
        console.warn(errorThrown + ' in datas/json/geonamesorg/en/country_info.json');
    }),

    // Country slugs
    $.getJSON('data/json/custom/en/country_slugs.json', function (jsonDatas) {
        $.when(deferred.countries).then(function () {
            console.time('country_slugs.json');
            $.each(jsonDatas, function (i, v) {
                id = v.codes.ISO.toLowerCase();
                if (id) {
                    if (countriesDatas[id]) {
                        countriesDatas[id].slugs = v.slugs;
                        countryName = '';
                    } else {
                        unwanted.push(id);
                        $.extend(unknowCountriesDatas[id], v);
                    }
                }
                if (countryName) {
                    unknowCountryNames.push(countryName); // unknowCountryNames = $.union(unknowCountryNames, [countryName]);
                }
            });
            console.timeEnd('country_slugs.json');
        });
    })
    .error(function(jqXHR, textStatus, errorThrown) {
        console.warn(errorThrown + ' in datas/json/custom/en/country_slugs.json');
    }),
    
    // Load JSON file and calculate score for each country and build infos string
    /*$.getJSON('data/json/countries.geojson', function (jsonDatas) {
        console.time('countries.geojson');
        $.each(jsonDatas.features, function (i, v) {
            id = v.id;
            if (id) {
                $.each(countriesDatas, function (i2, v2) {
                    if (id === v2.ISO3) {
                        console.info(v.properties.name + ' (' + id + ') found in ' + v2.Country + ' (' + v2.ISO3 + ')' );
                        id = false;                        
                    }
                });
                if (id) {
                    console.warn(v.properties.name + ' (' + id + ') not found');
                }
            }
        });
        console.timeEnd('countries.geojson');
    })
    .error(function(jqXHR, textStatus, errorThrown) {
        console.warn(errorThrown + ' in datas/json/countries.geojson');
    }),*/    
    
    // Language population
    $.getJSON('data/json/unicodeorg/en/language_population.json', function (jsonDatas) {
        $.when(deferred.countries).then(function () {
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
        });        
    })
    .error(function(jqXHR, textStatus, errorThrown) {
        console.warn(errorThrown + ' in datas/json/unicodeorg/en/language_population.json');
    }),

    // VISA
    $.getJSON('data/json/custom/en/visa.json', function (jsonDatas) {
        $.when(deferred.countries).then(function () {
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
        });
    })
    .error(function(jqXHR, textStatus, errorThrown) {
        console.warn(errorThrown + ' in datas/json/custom/en/visa.json');
    }),

    // Plugs and voltage
    $.getJSON('data/json/iecch/en/plugs_by_location.json', function (jsonDatas) {
        $.when(deferred.countries).then(function () {
            console.time('plugs_by_location.json');
            $.each(jsonDatas, function (i, v) {

                // Try to aggregate using country name
                countryName = v.Location;
                if (countryName) {
                    $.each(countriesDatas, function (id, v2) {
                        if (inAlternativeNames(countryName, $.merge((v2.Country) ? [v2.Country] : [], v2.alternativeNames)) !== -1) {
                            if (!countriesDatas[id].plugs) {
                                countriesDatas[id].plugs = [];
                            }
                            //console.info(countryName + ' = ' + v2.Country);
                            //countriesDatas[id].plugs.push(v);
                            countriesDatas[id].plugs.push({
                                plugType: v['Plug Type'].replace(/Type /g, ''),
                                electricPotentials: v['Electric Potential'].replace(/[^0-9.,]/g, '').split(',').map(Number),
                                frequencies: v.Frequency.replace(/[^0-9.,]/g, '').split(',').map(Number),
                            });
                            return countryName = false;
                        }
                    });
                    if (countryName) {
                        unknowCountryNames.push(countryName); // unknowCountryNames = $.union(unknowCountryNames, [countryName]);
                    }
                }

            });
            
            jQuery.unique(unknowCountryNames);
            if (unknowCountryNames.length > 0) {
                console.warn('plugs_by_location.json: Unknow country names:\n' + JSON.stringify(unknowCountryNames) + '\n');
                unknowCountryNames = [];
            }
        
            console.timeEnd('plugs_by_location.json');
        });
    })
    .error(function(jqXHR, textStatus, errorThrown) {
        console.warn(errorThrown + ' in datas/json/iecch/en/plugs_by_location.json');
    }),

    // Income level
    $.getJSON('data/json/worldbankorg/en/worldbank.json', function (jsonDatas) {
        $.when(deferred.countries).then(function () {
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
        });
    })
    .error(function(jqXHR, textStatus, errorThrown) {
        console.warn(errorThrown + ' in datas/json/worldbankorg/en/worldbank.json');
    }),


    // Islands
    // datas/json/islands.json
    $.getJSON('data/json/custom/en/islands.json', function (jsonDatas) {
        $.when(deferred.countries).then(function () {
            console.time('islands.json');
            $.each(jsonDatas, function (i, v) {
                // Add islands datas to each country
                countryName = v.name;
                if (countryName) {
                    $.each(countriesDatas, function (id, v2) {
                        //if (v2.Country === countryName || (v2.alternativeNames && (inAlternativeNames(v.sovereign_state, v2.alternativeNames) !== -1 || inAlternativeNames(countryName, v2.alternativeNames) !== -1))) {
                        if (inAlternativeNames(countryName, $.merge((v2.Country) ? [v2.Country] : [], v2.alternativeNames)) !== -1
                          || (v.sovereign_state !== '' && inAlternativeNames(v.sovereign_state, (v2.alternativeNames) ? $.merge([v2.Country], v2.alternativeNames) : [v2.Country]) !== -1)) {
                            if (!countriesDatas[id].islands) {
                                countriesDatas[id].islands = [];
                            }
                            countriesDatas[id].islands.push(v);
                            return countryName = false;
                        }
                    });
                    if (countryName) {
                        unknowCountryNames.push(countryName); // unknowCountryNames = $.union(unknowCountryNames, [countryName]);
                    }
                }

            });
            
            jQuery.unique(unknowCountryNames);
            if (unknowCountryNames.length > 0) {
                console.warn('islands.json: Unknow country names:\n' + JSON.stringify(unknowCountryNames) + '\n');
                unknowCountryNames = [];
            }
        
            console.timeEnd('islands.json');
        });
    })
    .error(function(jqXHR, textStatus, errorThrown) {
        console.warn(errorThrown + ' in datas/json/custom/en/islands.json');
    }),

    // Democracy index
    // datas/json/democracy_index.json
    $.getJSON('data/json/custom/en/democracy_index.json', function (jsonDatas) {
        $.when(deferred.countries).then(function () {
            console.time('democracy_index.json');
            $.each(jsonDatas, function (i, v) {
                countryName = v.Country;
                if (countryName) {
                    $.each(countriesDatas, function (id, v2) {
                        if (inAlternativeNames(countryName, $.merge((v2.Country) ? [v2.Country] : [], v2.alternativeNames)) !== -1) {
                            v2.democracy = v;
                            delete v2.democracy.Country;
                            return countryName = false;
                        }
                    });
                    if (countryName) {
                        unknowCountryNames.push(countryName); // unknowCountryNames = $.union(unknowCountryNames, [countryName]);
                    }
                }

            });
            
            jQuery.unique(unknowCountryNames);
            if (unknowCountryNames.length > 0) {
                console.warn('democracy_index.json: Unknow country names:\n' + JSON.stringify(unknowCountryNames) + '\n');
                unknowCountryNames = [];
            }
        
            console.timeEnd('democracy_index.json');
        });
    })
    .error(function(jqXHR, textStatus, errorThrown) {
        console.warn(errorThrown + ' in datas/json/custom/en/democracy_index.json');
    }),
    
    // Load continent names
    $.getJSON('data/json/geonamesorg/en/continents.json', function (jsonDatas) {
        $.when(deferred.countries).then(function () {
            console.time('continents.json');
            $.each(countriesDatas, function (id, country) {
                $.each(jsonDatas, function (i, v) {
                    if (country.Continent === v['ISO 639-2']) {
                        country.continent = v;
                        delete country.Continent;
                        return false;
                    }
                });
            });
            console.timeEnd('continents.json');
        });
    })
    .error(function(jqXHR, textStatus, errorThrown) {
        console.warn(errorThrown + ' in datas/json/geonamesorg/en/continents.json');
    }),

    // User reports
    $.getJSON('data/json/custom/en/user_reports.json', function (jsonDatas) {
        $.when(deferred.countries).then(function () {
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
        });
    })
    .error(function(jqXHR, textStatus, errorThrown) {
        console.warn(errorThrown + ' in datas/json/custom/en/user_reports.json');
    }),

    // Better life index (BLI)
    $.getJSON('data/json/oecdorg/en/better_life_index.json', function (jsonDatas) {
        $.when(deferred.countries).then(function () {
            console.time('better_life_index.json');
            $.each(jsonDatas, function (i, v) {
                $.each(countriesDatas, function (id, country) {
                    if (v.LOCATION === country.ISO3) {
                        if (!countriesDatas[id].betterLifeIndexes) {
                            countriesDatas[id].betterLifeIndexes = [];
                        }
                        delete v.LOCATION;
                        delete v.Country;
                        countriesDatas[id].betterLifeIndexes.push(v);
                        return false;
                    }
                });
            });
            console.timeEnd('better_life_index.json');
        });
    })
    .error(function(jqXHR, textStatus, errorThrown) {
        console.warn(errorThrown + ' in datas/json/oecdorg/en/better_life_index.json');
    }),

    // Driving side
    $.getJSON('data/json/custom/en/driving_side.json', function (jsonDatas) {
        $.when(deferred.countries).then(function () {
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
                if (countryName) {
                    unknowCountryNames.push(countryName); // unknowCountryNames = $.union(unknowCountryNames, [countryName]);
                }
            });
            console.timeEnd('driving_side.json');
        });
    })
    .error(function(jqXHR, textStatus, errorThrown) {
        console.warn(errorThrown + ' in datas/json/custom/en/driving_side.json');
    }),
  
    // Time zones
    $.getJSON('data/json/geonamesorg/en/time_zones.json', function (jsonDatas) {
        $.when(deferred.countries).then(function () {
            console.time('time_zones.json.json');
            $.each(jsonDatas, function (i, v) {
                id = v.CountryCode.toLowerCase();
                if (id && countriesDatas[id]) {
                    if (!countriesDatas[id].timeZones) {
                        countriesDatas[id].timeZones = [];
                    }
                    countriesDatas[id].timeZones.push({
                        timeZoneId: v.TimeZoneId,
                        gmtOffset: v['GMT offset 1. Jan 2013'],
                        dstOffset: v['DST offset 1. Jul 2013'],
                        rawOffset: v['rawOffset (independant of DST)']
                    });
                }
            });
        
            console.timeEnd('time_zones.json.json');
        });
    })
    .error(function(jqXHR, textStatus, errorThrown) {
        console.warn(errorThrown + ' in datas/json/geonamesorg/en/time_zones.json');
    }),
  
    // Measurement systems
    $.getJSON('data/json/custom/en/measurement_systems.json', function (jsonDatas) {
        $.when(deferred.countries).then(function () {
            console.time('measurement_systems.json');
            $.each(jsonDatas, function (i, v) {
                
                countryName = v['CountryName'];
                if (countryName) {
                    $.each(countriesDatas, function (id, v2) {
                        //if (v2.Country === countryName || (v2.alternativeNames && inAlternativeNames(countryName, $.merge([v2.Country], v2.alternativeNames)) !== -1)) {
                        if (inAlternativeNames(countryName, $.merge((v2.Country) ? [v2.Country] : [], v2.alternativeNames)) !== -1) {
                            v2.measurementSystem = v;
                            delete v2.measurementSystem.CountryName;
                            return countryName = false;
                        }
                    });
                    if (countryName) {
                        unknowCountryNames.push(countryName); // unknowCountryNames = $.union(unknowCountryNames, [countryName]);
                    }
                }

            });

            jQuery.unique(unknowCountryNames);
            if (unknowCountryNames.length > 0) {
                console.warn('measurement_systems.json: Unknow country names:\n' + JSON.stringify(unknowCountryNames) + '\n');
                unknowCountryNames = [];
            }
        
            console.timeEnd('measurement_systems.json');
        });
    })
    .error(function(jqXHR, textStatus, errorThrown) {
        console.warn(errorThrown + ' in datas/json/custom/en/measurement_systems.json');
    }),
    
    // Religions

    //var array = [];
    $.getJSON('data/json/custom/en/religions.json', function (jsonDatas) {
        $.when(deferred.countries).then(function () {
            console.time('religions.json');
            $.each(jsonDatas, function (i, v) {
                // Add islands datas to each country
                countryName = v.Country;
                if (countryName) {
                    $.each(countriesDatas, function (id, v2) {
                        if (inAlternativeNames(countryName, $.merge((v2.Country) ? [v2.Country] : [], v2.alternativeNames)) !== -1) {
                            countriesDatas[id].religions = v.religions;
                            //array.push({"ISO":v2.ISO, "ISO3":v2.ISO3, "ISO-Numeric":v2["ISO-Numeric"], "Country":v2.Country, "religions":v.religions});
                            return countryName = false;
                        }
                    });
                    if (countryName) {
                        unknowCountryNames.push(countryName); // unknowCountryNames = $.union(unknowCountryNames, [countryName]);
                    }
                }

            });
            
            jQuery.unique(unknowCountryNames);
            if (unknowCountryNames.length > 0) {
                console.warn('religions.json: Unknow country names:\n' + JSON.stringify(unknowCountryNames) + '\n');
                unknowCountryNames = [];
            }
        
            console.timeEnd('religions.json');
        });
    })
    .error(function(jqXHR, textStatus, errorThrown) {
        console.warn(errorThrown + ' in datas/json/custom/en/religions.json');
    }),


    $.getJSON('data/json/custom/en/groups.json', function (jsonDatas) {
        $.when(deferred.countries).then(function () {
            console.time('groups.json');
            
            $.each(jsonDatas, function (i, v) {
                id = v.ISO.toLowerCase();
                if (id && countriesDatas[id]) {
                    countriesDatas[id].groups = v.groups;
                }
            });
            
            console.timeEnd('groups.json');
        });
    })
    .error(function(jqXHR, textStatus, errorThrown) {
        console.warn(errorThrown + ' in datas/json/custom/en/groups.json');
    }),
    
    // Language codes
    $.getJSON('data/json/geonamesorg/en/languages.json', function (jsonDatas) {
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
        deferred.languages.resolve();
        console.timeEnd('languages.json');
    })
    .error(function(jqXHR, textStatus, errorThrown) {
        console.warn(errorThrown + ' in datas/json/geonamesorg/en/languages.json');
    }),

    // Language script
    $.getJSON('data/json/unicodeorg/en/language_script.json', function (jsonDatas) {
        $.when(deferred.languages).then(function () {
            console.time('language_script.json');
            $.each(jsonDatas, function (i, v) {
                id = v.Code;
                if (id && languagesDatas[id]) {
                    $.extend(languagesDatas[id], v);
                }
            });
            console.timeEnd('language_script.json');
        });
    })
    .error(function(jqXHR, textStatus, errorThrown) {
        console.warn(errorThrown + ' in datas/json/unicodeorg/en/language_script.json');
    }),
    
    $.getJSON('data/json/isoorg/en/currency_iso4217.json', function (jsonDatas) {
        console.time('currency_iso4217.json');
        
        $.each(jsonDatas, function (i, v) {
            id = v.Ccy;
            if (id && currenciesDatas) {
                currenciesDatas[id] = v;
            }
        });
        deferred.currencies.resolve();
        console.timeEnd('currency_iso4217.json');
    })
    .error(function(jqXHR, textStatus, errorThrown) {
        console.warn(errorThrown + ' in datas/json/isoorg/en/currency_iso4217.json');
    }),
    
    // Load change rates in Euro
    // datas/json/ecbeuropaeu/en/euroxref-daily.json
    // datas/json/custom/en/euro_change_rate.json
    $.ajax({
        url: options.cors + 'www.floatrates.com/daily/eur.xml', // http://themoneyconverter.com/rss-feed/EUR/rss.xml  www.floatrates.com/daily/eur.xml
        dataType: 'xml',
        success: function (xmlDatas) {
                $.when(deferred.currencies).then(function () {
                    console.time('www.floatrates.com/daily/eur.xml');
                    var jsonDatas = $.xml2json(xmlDatas);
                    // console.info('EUR:'+JSON.stringify(jsonDatas));
                    $.each(jsonDatas['#document'].channel.item, function (i, v) {
                        id = v.targetCurrency;
                        if (currenciesDatas && currenciesDatas[id]) {
                            $.extend(currenciesDatas[id], {
                                'eurExchangeRate': parseFloat(v.exchangeRate.replace(/[, ]/g, ''))
                            });
                        }
                    });
                    // Add Euro rate
                    $.extend(currenciesDatas.EUR, {
                        'eurExchangeRate': 1
                    });
                    console.timeEnd('www.floatrates.com/daily/eur.xml');
                });
            }
    }),
    
    $.ajax({
        url: options.cors + 'www.floatrates.com/daily/usd.xml', // http://themoneyconverter.com/rss-feed/EUR/rss.xml  www.floatrates.com/daily/eur.xml
        dataType: 'xml',
        success: function (xmlDatas) {
                $.when(deferred.currencies).then(function () {
                    console.time('www.floatrates.com/daily/usd.xml');
                    var jsonDatas = $.xml2json(xmlDatas);
                    $.each(jsonDatas['#document'].channel.item, function (i, v) {
                        id = v.targetCurrency;
                        if (currenciesDatas && currenciesDatas[id]) {
                            $.extend(currenciesDatas[id], {
                                'usdExchangeRate': parseFloat(v.exchangeRate.replace(/[, ]/g, ''))
                            });
                        }
                    });
                    // Add USD rate
                    $.extend(currenciesDatas.USD, {
                        'usdExchangeRate': 1
                    });
                    console.timeEnd('www.floatrates.com/daily/usd.xml');
                });
            }
    }),
    
    // Build country translations
    $.getJSON('../bower_components/world-countries/dist/countries.json', function (jsonDatas) {
        console.time('countries.json');
        
        $.each(jsonDatas, function (i, country) {
            $.each($.extend(true, {'eng': {'common': country.common, 'official': country.official}}, country.name['native'], country.translations), function(k, translation) {
                if (!translationDatas[k]) {
                    translationDatas[k] = {};
                }
                if (!translationDatas[k]['countryCommonNames']) {
                    translationDatas[k]['countryCommonNames'] = {};
                } 
                if (!translationDatas[k]['countryOfficialNames']) {
                    translationDatas[k]['countryOfficialNames'] = {};
                }                              
                translationDatas[k]['countryCommonNames'][country.cca2] = translation.common;
                translationDatas[k]['countryOfficialNames'][country.cca2] = translation.official;
            });
        });
        
        console.timeEnd('countries.json');
    })
    .error(function(jqXHR, textStatus, errorThrown) {
        console.warn(errorThrown + ' in ../bower_components/world-countries/dist/countries.json');
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
                                //language.Script = type_script[1];
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
            if (countryName) {
                // Exclude some values
                if ($.inArray(countryName, exclude) === -1) {
                    $.each(countriesDatas, function (id, v2) {
                        // Try to join using country name (alternative names)
                        if (inAlternativeNames(countryName, $.merge((v2.Country) ? [v2.Country] : [], v2.alternativeNames)) !== -1) {
                            if (!v2.currency) {
                                v2.currency = {};
                            }
                            $.extend(true, v2.currency, v);
                            return countryName = false;
                        }
                    });
                    if (countryName) {
                        unknowCountryNames.push(countryName); // unknowCountryNames = $.union(unknowCountryNames, [countryName]);
                    }
                }
            }

            // Aggregate with currencies
            if (!currenciesDatas[v.Ccy]) {
                currenciesDatas[v.Ccy] = v;
                delete currenciesDatas[v.Ccy].CtryNm;
            }
            
            jQuery.unique(unknowCountryNames);
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
    displayJson(translationDatas);
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    // Merge 2 json 
    var mergeSrc = {};
    $.when(
        $.getJSON('data/json/custom/en/visahq_slugs.json', function (jsonDatas) {           
            $.each(jsonDatas, function (i, v) {
                countryName = v.Country;                        
                if (countryName) {
                    $.each(countriesDatas, function (id, v2) {
                        var countryName2 = v2.Country;
                        if (inAlternativeNames(countryName, $.merge((v2.Country) ? [v2.Country] : [], v2.alternativeNames)) !== -1) {
                            mergeSrc[v2.ISO3] = {
                                slugs:{
                                    'visahq.com': v.slug
                                }
                            };                         
                            return countryName = false;
                        }
                    });
                    if (countryName) {
                        unknowCountryNames.push(countryName); // unknowCountryNames = $.union(unknowCountryNames, [countryName]);
                    }
                }

            });
            
            jQuery.unique(unknowCountryNames);
            if (unknowCountryNames.length > 0) {
                console.warn('goabroad.json: Unknow country names:\n' + JSON.stringify(unknowCountryNames) + '\n');
                unknowCountryNames = [];
            }
            
        })
        .error(function(jqXHR, textStatus, errorThrown) {
            console.warn(errorThrown + ' in datas/json/custom/en/goabroad.json');
        })
        
    ).then(
        
        $.getJSON('data/json/custom/en/country_slugs.json', function (jsonDatas) {            
            console.time('country_slugs.json');
            var mergeDst = [];
            $.each(jsonDatas, function (i, v) {
                countryName = v.Country;                        
                if (countryName) {
                    $.each(countriesDatas, function (id, v2) {
                        var countryName2 = v2.ISO3; 
                        //console.warn(countryName + ' ' + countryName2); 
                        if (inAlternativeNames(countryName, $.merge((v2.Country) ? [v2.Country] : [], v2.alternativeNames)) !== -1) {
                            
                            if (mergeSrc[v2.ISO3]) {
                                mergeDst.push($.extend(true, v, mergeSrc[v2.ISO3], {
                                    Country: v2.Country,
                                    codes:{
                                        ISO: v2.ISO,
                                        ISO3: v2.ISO3,
                                        'ISO-Numeric': v2['ISO-Numeric'],
                                        fips: v2.fips                                    
                                    }
                                }));
                            }                            
                            return countryName = false;
                        }                        
                        
                    });
                    if (countryName) {
                        unknowCountryNames.push(countryName); // unknowCountryNames = $.union(unknowCountryNames, [countryName]);
                    }
                }

            });
            
            jQuery.unique(unknowCountryNames);
            if (unknowCountryNames.length > 0) {
                console.warn('country_slugs.json: Unknow country names:\n' + JSON.stringify(unknowCountryNames) + '\n');
                unknowCountryNames = [];
            }
            
            displayJson(jsonDatas);
            console.timeEnd('country_slugs.json');
            
            
        })
        .error(function(jqXHR, textStatus, errorThrown) {
            console.warn(errorThrown + ' in datas/json/custom/en/country_slugs.json');
        })    
    
    );
    

    
    console.time('Cache builded');

});