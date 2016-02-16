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
console.time('buildHtml.js script loaded');




/**
 * Return each row of a json object that contain a given property
 */

var _findProperty = function (obj, prop) {
    
    var i,
        props = prop.split('.');

    for (i = 0; i < props.length; i = i + 1) {
        if (obj[props[i]]) {
            obj = obj[props[i]];
            if (i === props.length - 1) {
                return obj;
            }
        } else {
            return false;
        }
    }
    return false;
}



/**
 * Fill a select input from a JSON file
 *
 * @param {string} selector - Input CSS selector
 * @param {object} json -  JSON datas
 * @param {string} value - JSON element that will be set as select option value
 * @param {string} text - JSON element that will be set as select option text
 * @param {object} [options] - { blank: "Select...", sort: asc/desc, remove: true }
 * @return {boolean} Return false if JSON call fail
 */

var appendSelectOptions = function (selector, source, valueKey, textKey, options) {
    
    console.time('appendSelectOptions(' + selector + ')');

    var $select = $(selector);

    var json,
        value,
        selectOption,
        text,
        values = [],
        duplicateValues = [],
        selectOptions = [];

    // Remove previous options
    selectOptions = $select.children('option');
    if (options.remove) {
        selectOptions.remove();
    } else if (!options.append && selectOptions.length > 0) {
        return false;
    }
    selectOptions = [];

    json = source;
    if (json === null) {
        return false;
    }

    // Extract options values from JSON object/array
    $.each(json, function (k, v) {
        if (valueKey) {
            value = _findProperty(v, valueKey);
        } else {
            value = k;
        }
        text = _findProperty(v, textKey);
        if (value && text) {
            values.push({
                'value': value,
                'text': text
            });
        }
    });

    // Sort values
    if ($.isArray(values) && options.sort && (options.sort === 'asc' || options.sort === true)) {
        values = values.sort(function (a, b) {
            // return a['text'].localeCompare(b['text']);
            return ((a.text < b.text) ? -1 : ((a.text > b.text) ? 1 : 0));
        });
    }
    if (options.sort && options.sort === 'desc') {
        values = values.sort(function (a, b) {
            // return b['text'].localeCompare(a['text']);
            return ((a.text > b.text) ? -1 : ((a.text < b.text) ? 1 : 0));
        });
    }

    // Add a top option
    if (options.blank) {
        selectOptions.push(new Option('', options.blank));
    }

    // Keep only unique and not empty values
    $.each(values, function (i, v) {
        if (v.value && v.text && $.inArray(v.value, duplicateValues) === -1) {
            duplicateValues.push(v.value);
            selectOption = new Option(v.text, v.value);
            selectOptions.push(selectOption);
        }
    });

    // Append new options to select element
    $select.append(selectOptions);

    // Add some data attributs
    // and try to replace an optional %s string by the current option value
    if (options.attributs) {
        $.each($select.find('option'), function () {
            selectOption = $(this);
            value = this.value;
            $.each(options.attributs, function (k, v) {
                if (value) {
                    selectOption.attr(k, v.replace(/%s/g, value));
                }
            });
        });
    }

    // Select default value
    if (options.value) {
        $select.val(options.value);
    }

    console.timeEnd('appendSelectOptions(' + selector + ')');

}



/**
 * Load JSON files and aggregate country datas.
 * All datas are stored in countriesDatas global variable.
 */
function populateProfileSelectFields() {
    'use strict';
    return $.when(
        $.getJSON('data/json/languagesDatas.json')
        .done(function (json) {
            languagesDatas = json;

            Populate fields
            appendSelectOptions('#user_speaking_languages', languagesDatas,
                'Code', 'Language', {
                    sort: 'asc',
                    remove: true,
                    attributs: {
                        'data-i18n': 'values:languages.%s'
                    }
                });
            appendSelectOptions('#user_reading_languages', languagesDatas,
                'Code', 'Language', {
                    sort: 'asc',
                    remove: true,
                    attributs: {
                        'data-i18n': 'values:languages.%s'
                    }
                });

        }),
        $.getJSON('data/json/currenciesDatas.json')
        .done(function (json) {
            currenciesDatas = json;

            Populate fields
            appendSelectOptions('#user_currencies', currenciesDatas,
                'Ccy', 'CcyNm', {
                    sort: 'asc',
                    remove: true,
                    attributs: {
                        'data-i18n': 'values:currencies.%s'
                    }
                });

        }),
        $.getJSON('data/json/countriesDatas.json').done(function (json) {
            countriesDatas = json;
            ISO3 to ISO2 country codes conversion
            $.each(countriesDatas, function (id, country) {
                if (country.ISO3 && country.ISO) {
                    countryCodesISO2[country.shapeId] = country.ISO;
                    countryCodesISO2[country.ISO3] = country.ISO;
                }
            });
            
            Populate fields
            appendSelectOptions('#user_profile', countriesDatas,
                'ISO', 'Country', {
                    sort: 'asc',
                    attributs: {
                        'data-i18n': 'values:countries.%s'
                    }
                });
            appendSelectOptions('#user_country', countriesDatas,
                'ISO', 'Country', {
                    sort: 'asc',
                    remove: true,
                    attributs: {
                        'data-i18n': 'values:countries.%s'
                    }
                });
            appendSelectOptions('#user_citizenships', countriesDatas,
                'ISO', 'Country', {
                    sort: 'asc',
                    remove: true,
                    attributs: {
                        'data-i18n': 'values:countries.%s'
                    }
                });
            appendSelectOptions('#entry_494218657', countriesDatas,
                'ISO', 'Country', {
                    sort: 'asc',
                    remove: true,
                    attributs: {
                        'data-i18n': 'values:countries.%s'
                    }
                });
            appendSelectOptions('#user_income_level', countriesDatas,
                'incomeLevel.id', 'incomeLevel.value', {
                    remove: true,
                    attributs: {
                        'data-i18n': 'values:incomeLevels.%s'
                    }
                });
            appendSelectOptions('#user_measurement_system', countriesDatas,
                'measurementSystem.MeasurementSystem', 'measurementSystem.MeasurementSystem', {
                    sort: 'asc',
                    remove: true,
                    attributs: {
                        'data-i18n': 'values:measurementSystems.%s'
                    }
                });

        }),
        
        
        
        $.getJSON('data/json/ac_plug.json', function (json) {
            
            appendSelectOptions('#user_plug_types', json,
                'id', 'text', {
                    sort: 'asc',
                    remove: true,
                    attributs: {
                        'data-i18n': 'values:plugTypes.%s',
                        'data-img-src': 'http://www.iec.ch/worldplugs/img/plugs_sockets/%s_3d_plug_s.png'
                    }
                });
            
        }),
        $.getJSON('data/json/ac_voltage.json', function (json) {
            
            appendSelectOptions('#user_plug_voltages', json,
                'id', 'text', {
                    sort: 'asc',
                    remove: true,
                    attributs: {
                        'data-i18n': 'values:plugVoltage.%s'
                    }
                });
            
        })
    );
}



$('[data-anchor="user_profile"]').load('modules/userProfile/userProfileView.htm', function () {
    'use strict';
    populateProfileSelectFields();
    deferred.ready.userProfile.resolve();
});

$('[data-anchor="app_settings"]').load('modules/appSettings/appSettingsView.htm', function () {
    'use strict';
    initBlock('[data-anchor="app_settings"]');
});

$('[data-anchor="contact"]').load('modules/contact/contactView.htm', function () {
    'use strict';
    initBlock('[data-anchor="contact"]');
});

$('[data-anchor="contribution"]').load('modules/contribution/contributionView.htm', function () {
    'use strict';
    initBlock('[data-anchor="contribution"]');
});  

$.get('modules/userProfileReset/userProfileResetModal.htm', function (template) {
    'use strict';
    $('body').append(template);
    initBlock('#user_profile_reset_modal');
});
    
$('[data-anchor="home"]').load('modules/home/homeView.htm', function () {
    'use strict';
    initBlock('[data-anchor="home"]');
    $('[data-anchor="home"]').find('[data-i18n]').localize();
});
       
$('[data-anchor="map_settings"]').load('modules/mapSettings/mapSettingsView.htm', function () {
    'use strict';
    deferred.load.mapSettings.resolve();
    initBlock('[data-anchor="map_settings"]');    
});

$('[data-anchor="map"]').load('modules/map/mapView.htm', function () {
    'use strict';
});


$('[data-anchor="user_profile"]').load('modules/userProfile/userProfileView.htm', function () {
   'use strict';
   initBlock('[data-anchor="user_profile"]');
});
    
console.timeEnd('buildHtml.js script loaded');
