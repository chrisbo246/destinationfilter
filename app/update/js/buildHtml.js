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
    $('[data-anchor="home"]').find('[data-i18n]').i18n();
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
