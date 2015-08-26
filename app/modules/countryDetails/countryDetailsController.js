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
    Handlebars,
    initBlock,
    fitCountry,
    deferred: true,
    countriesDatas: true,
    currenciesDatas: true,
    userDatas: true
*/
/*
exported
    showCountryDetails
*/

/**
 * www.destinationfilter.tk 0.7.0
 * https://github.com/christopheboisier/DestinationFinder/
 * MIT licensed
 * @author Christophe BOISIER
 *
 * Copyright (C) 2015 Christophe BOISIER
 */

console.time('countryDetailsController.js script loaded');

/**
 * Build country details template and open country details modal
 *
 * @param { array } countryDatas - Datas for this country
 * @return { string } HTML
 */

function showCountryDetails(cid) {
    'use strict';
    var array,
        // iconClass,
        // colorClass,
        rows,
        // percent,
        data,
        str = {},
        // template,
        userCitizenships,
        userCountry,
        viewData,
        countryDatas = countriesDatas[cid];

    if (!countryDatas) {
        return;
    }

    // Adapt visa requirements to user citizenship
    str.citizenships = [];
    console.info('touristVisas: ' + JSON.stringify(countryDatas.touristVisas) + ' #user_citizenships' + JSON.stringify($('#user_citizenships').val()));
    userCitizenships = $('#user_citizenships').val();
    if (countryDatas.touristVisas && userCitizenships) {
        console.info('userCitizenships: ' + JSON.stringify(userCitizenships));
        $.each(countryDatas.touristVisas, function (i, v) {
            console.log('Is ' + v.originCountryISO + ' in ' + JSON.stringify(userCitizenships));
            if ($.inArray(v.originCountryISO, userCitizenships) !== -1) {
                console.info('Is ' + v.originCountryISO + ' in ' + JSON.stringify(userCitizenships));
                var citizenshipId = v.originCountryISO.toLowerCase(),
                    // country = {},
                    href;
                /*
                country.country = countriesDatas[v.originCountryISO.toLowerCase()].Country;
                country.visaFreeLimit = (v.visaFreeLimit === 'unlimited') ? 'Unlimited' : 'Up to ' + v.visaFreeLimit + ' days';
                country.voaFee = v['voa-fee'] || 'none';
                country.requirements = (v.requirements) ? v.requirements.join(',') : 'none';
                */

                if (countryDatas.slugs && countryDatas.slugs['visahq.com']) {
                    var url = 'https://' + countryDatas.slugs['visahq.com'] + '.visahq.com/requirements/';
                    if (citizenshipId && countriesDatas[citizenshipId] && countriesDatas[citizenshipId].slugs['visahq.com']) {
                        href = url;
                        if (countriesDatas[citizenshipId].slugs['visahq.com']) {
                            href = href + countriesDatas[citizenshipId].slugs['visahq.com'] + '/';
                        }
                        var userCountryId = $('#user_country').val().toLowerCase();
                        if (userCountryId && countriesDatas[userCountryId].slugs['visahq.com']) {
                            href = href + 'resident-' + countriesDatas[userCountryId].slugs['visahq.com'] + '/';
                        }
                    }
                }

                str.citizenships.push($.extend(true, {}, v, {
                    //'citizenship': countriesDatas[citizenshipId].Country,
                    'href': href
                }));

                // str.citizenships.push(country);
            }
        });
    }
    console.info('Citizenships: ' + JSON.stringify(str.citizenships));


    // Adapt change rate to user currencies
    if (countryDatas.currency.CurrencyCode && $('#user_currencies').val()) {
        str.userCurrencies = [];
        $.each($('#user_currencies').val(), function (i, currencyCode) {
            var currencyName,
                localCurrencyValue,
                currencyDatas;
            if (currenciesDatas && currenciesDatas[currencyCode] && currenciesDatas[currencyCode].eurExchangeRate > 0) {
                currencyName = currenciesDatas[currencyCode].CcyNm;
                localCurrencyValue = currenciesDatas[currencyCode].eurExchangeRate;
            } else {
                currencyName = currenciesDatas.EUR.CcyNm;
                localCurrencyValue = 1;
            }
            currencyDatas = currenciesDatas[countryDatas.currency.CurrencyCode];
            if (currencyDatas && currencyCode !== 'EUR') {
                str.userCurrencies.push({
                    'currencyValue': (1 / (currencyDatas.eurExchangeRate / localCurrencyValue)).toFixed(2),
                    'currencyName': currencyName,
                    'localCurrencyValue': (currencyDatas.eurExchangeRate / localCurrencyValue).toFixed(2),
                    'localCurrencyName': currencyDatas.CcyNm,
                    'changeRateURL': 'http://www.xe.com/fr/currencyconverter/convert/?Amount=1&From=' + currencyCode + '&To=' + countryDatas.currency.CurrencyCode
                });
            }
        });
    }

    // URLs
    str.costOfLivingURL = 'http://www.numbeo.com/cost-of-living/';
    if (countryDatas.slugs) {
        // str.climatURL = 'http://www.weather-and-climate.com/average-monthly-Rainfall-Temperature-' + 'Sunshine-in-' + countryDatas.slug.charAt(0).toUpperCase() + countryDatas.slug.slice(1);
        str.climatURL = 'http://www.weather-and-climate.com/average-monthly-Rainfall-Temperature-' + 'Sunshine-in-' + countryDatas.slugs['weather-and-climate.com'];
        // $('#user_country').val().toLowerCase() // userDatas.user_country.toLowerCase()
        str.embassiesURL = 'http://embassy.goabroad.com/embassies-in/' + countryDatas.slugs['goabroad.com'];
        // console.warn(JSON.stringify(userDatas));
        // console.warn($('#user_country').val());
        if (userDatas && userDatas.address && userDatas.address.ISO) {
            userCountry = userDatas.address.ISO;
        } else if ($('#user_country').val()) {
            userCountry = $('#user_country').val();
        }
        if (userCountry && countryDatas.slugs['goabroad.com'] && userCountry.toLowerCase() !== cid.toLowerCase()) {
            str.localEmbassiesURL = 'http://embassy.goabroad.com/embassies-of-' + countryDatas.slugs['goabroad.com'];
            if (countriesDatas[userCountry.toLowerCase()] && countriesDatas[userCountry.toLowerCase()].slugs['goabroad.com']) {
                str.localEmbassiesURL = str.localEmbassiesURL + '-in-' + countriesDatas[userCountry.toLowerCase()].slugs['goabroad.com'];
            }
        }

        // str.costOfLivingURL = 'http://www.numbeo.com/cost-of-living/country_result.jsp?country=' + countryDatas.slug.charAt(0).toUpperCase() + countryDatas.slug.slice(1);
        str.costOfLivingURL = 'http://www.numbeo.com/cost-of-living/country_result.jsp?country=' + countryDatas.slugs['numbeo.com'];

        // str.visaFreeURL = 'http://embassy-finder.com/' + countryDatas.slugs['default'] + '_visa';



        str.betterLifeIndexURL = 'http://www.oecdbetterlifeindex.org/countries/' + countryDatas.slug + '/';
    }
    // str.plugTypesURL = 'http://www.iec.ch/worldplugs/list_bylocation.htm';

    // Matches
    if (countryDatas.points) {
        str.fixedScore = countryDatas.points.toFixed();
    }

    str.matches = [];
    array = $('#enabled_priorities').sortable('toArray');
    if (!array.length) {
        array = $('#disabled_priorities').sortable('toArray');
    }
    $.each(array, function (i, pid) {

        data = {
            id: pid
        };

        if (countryDatas.matchingPriorities[pid]) {
            if (countryDatas.matchingPriorities[pid].percent >= 0) {
                // data.percent = countryDatas.matchingPriorities[pid].percent;
                data.percent = countryDatas.matchingPriorities[pid].percent.toFixed();
            }
            if (countryDatas.matchingPriorities[pid].required
              && countryDatas.matchingPriorities[pid].required.length > 0) {
                data.warning = true;
            }
            if (countryDatas.matchingPriorities[pid].missing) {
                data.error = true;
            }
        }

        /*if (countryDatas.matchingPriorities[pid] && countryDatas.matchingPriorities[pid].values) {
            data.iconClass = 'glyphicon glyphicon-info-sign text-info';
            if (countryDatas.matchingPriorities[pid].percent > 0) {
                data.percent = (countryDatas.matchingPriorities[pid].percent * 100).toFixed();
                data.iconClass = 'glyphicon glyphicon-ok text-success';
            }
        }*/

        str.matches.push(data);
    });

    // Better life indexes
    if (countryDatas.betterLifeIndexes) {
        rows = {};
        $.each(countryDatas.betterLifeIndexes, function (i, v) {
            if (!rows[v.INDICATOR]) {
                rows[v.INDICATOR] = {};
            }
            // rows[v.INDICATOR].INDICATOR = v.INDICATOR;
            // rows[v.INDICATOR][v.INEQUALITY] = Math.round(v.Value * 100) / 100;
            rows[v.INDICATOR][v.INEQUALITY] = $.extend({}, v, {

            });
        });
        str.bli = rows;
    }

    /*str.bli.units = {
        AVSCORE: 'averageScore',
        HOUR: 'hours',
        MICRO_M3: 'microgramsPerCubicMetres',
        PC: 'percentage',
        RATIO: 'ratio',
        USD: 'usDollar',
        YR: 'years'
    };*/

    viewData = $.extend(true, str, countryDatas, {
        // id: cid
        flag: {
            src: 'images/flags/' + countryDatas.codes.ISO3.toLowerCase() + '.svg'
        }
    });

    // console.info('viewData: ' + JSON.stringify(viewData));
    $.get('modules/countryDetails/countryDetails.hbs', function (source) {
        var template = Handlebars.compile(source);

        $('#country_details')
            .find('.modal-dialog')
            .html(template(viewData));
            /*.end()
            .removeClass(function (index, css) {
                return (css.match (/(^|\s)background-\S+/g) || []).join(' ');
            })
            .addClass('background-image background-' + cid + '-v');*/
            //.replaceWith(template(viewData));



        // Initialize jQuery plugins in this freshly generated block
        initBlock('#country_details');

        // Center map on selected country
        $.when(deferred.ready.map).then(function () {
            $('#center_country').on('click', function () {
                var zoom = 2;
                if (countryDatas['Area(in sq km)']) {
                    zoom = (4 - ~~countryDatas['Area(in sq km)'] / (17100000 / 4)).toFixed();
                }
                if (countryDatas.longitude && countryDatas.latitude) {
                    //centerMap(~~countryDatas.longitude, ~~countryDatas.latitude, zoom);
                    fitCountry(countryDatas.codes.ISO3);
                }
                // console.log('Center map at longitude: ' + countryDatas.longitude + ' latitude: ' + countryDatas.latitude + ' zoom: ' + zoom);
            });
        });

        // Select the BLI table column to display
        var $table = $('.bli-table');
        var $select = $('#bli_visible_column');
        if ($table && $select) {
            $select.on('change', function () {
                $select.find('option').each(function () { // :not(option[' + $select.val() + '])
                    $table.find('tr :nth-child(' + $(this).val() + ')').hide(); // tr :not(:nth-child(' + $(this).val() + '))
                });
                $table.find('tr :nth-child(' + $select.val() + ')').show();
            }).trigger('change');
        }

        // $('#modal_container').html(rendered);
        // $('#country_details').modal('show');
        // $('#country_details').find('[data-i18n]').i18n();

        /*$('#country_details').on('shown.bs.modal', function (event) {
          // var button = $(event.relatedTarget),
          //  id = button.data('id');
          var id = $(this).find('[data-id]').first().attr('data-id').toLowerCase();
          console.log('#country_details modal opened cibling country ' + id);
          // showCountryDetails(id);
          $(this).find('.modal-content').removeClass('background-*').addClass('background-image background-' + id);
        });*/

    });

}



console.timeEnd('countryDetailsController.js script loaded');
