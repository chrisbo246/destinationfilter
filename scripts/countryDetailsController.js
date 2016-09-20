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
    countriesData: true,
    currenciesData: true,
    userData: true
*/
/*
exported
    showCountryDetails
*/

var countryDetailsModule = (function () {
    'use strict';
    
    /**
     * Build country details template and open country details modal
     *
     * @param { array } countryData - Datas for this country
     * @return { string } HTML
     */
 
    var showCountryDetails = function (cid) {
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
            countryData = countriesData[cid];

        if (!countryData) {
            return;
        }

        // Adapt visa requirements to user citizenship
        str.citizenships = [];
        console.info('touristVisas: ' + JSON.stringify(countryData.touristVisas) + ' #user_citizenships' + JSON.stringify($('#user_citizenships').val()));
        userCitizenships = $('#user_citizenships').val();
        if (countryData.touristVisas && userCitizenships) {
            console.info('userCitizenships: ' + JSON.stringify(userCitizenships));
            $.each(countryData.touristVisas, function (i, v) {
                console.log('Is ' + v.originCountryISO + ' in ' + JSON.stringify(userCitizenships));
                if ($.inArray(v.originCountryISO, userCitizenships) !== -1) {
                    console.info('Is ' + v.originCountryISO + ' in ' + JSON.stringify(userCitizenships));
                    var citizenshipId = v.originCountryISO.toLowerCase(),
                        // country = {},
                        href;
                    /*
                    country.country = countriesData[v.originCountryISO.toLowerCase()].Country;
                    country.visaFreeLimit = (v.visaFreeLimit === 'unlimited') ? 'Unlimited' : 'Up to ' + v.visaFreeLimit + ' days';
                    country.voaFee = v['voa-fee'] || 'none';
                    country.requirements = (v.requirements) ? v.requirements.join(',') : 'none';
                    */

                    if (countryData.slugs && countryData.slugs['visahq.com']) {
                        var url = 'https://' + countryData.slugs['visahq.com'] + '.visahq.com/requirements/';
                        if (citizenshipId && countriesData[citizenshipId] && countriesData[citizenshipId].slugs['visahq.com']) {
                            href = url;
                            if (countriesData[citizenshipId].slugs['visahq.com']) {
                                href = href + countriesData[citizenshipId].slugs['visahq.com'] + '/';
                            }
                            var userCountryId = $('#user_country').val().toLowerCase();
                            if (userCountryId && countriesData[userCountryId].slugs['visahq.com']) {
                                href = href + 'resident-' + countriesData[userCountryId].slugs['visahq.com'] + '/';
                            }
                        }
                    }

                    str.citizenships.push($.extend(true, {}, v, {
                        //'citizenship': countriesData[citizenshipId].Country,
                        'href': href
                    }));

                    // str.citizenships.push(country);
                }
            });
        }
        console.info('Citizenships: ' + JSON.stringify(str.citizenships));


        // Adapt change rate to user currencies
        if (countryData.currency.CurrencyCode && $('#user_currencies').val()) {
            str.userCurrencies = [];
            $.each($('#user_currencies').val(), function (i, currencyCode) {
                var currencyName,
                    localCurrencyValue,
                    currencyData;
                if (currenciesData && currenciesData[currencyCode] && currenciesData[currencyCode].eurExchangeRate > 0) {
                    currencyName = currenciesData[currencyCode].CcyNm;
                    localCurrencyValue = currenciesData[currencyCode].eurExchangeRate;
                } else {
                    currencyName = currenciesData.EUR.CcyNm;
                    localCurrencyValue = 1;
                }
                currencyData = currenciesData[countryData.currency.CurrencyCode];
                if (currencyData && currencyCode !== 'EUR') {
                    str.userCurrencies.push({
                        'currencyValue': (1 / (currencyData.eurExchangeRate / localCurrencyValue)).toFixed(2),
                        'currencyName': currencyName,
                        'localCurrencyValue': (currencyData.eurExchangeRate / localCurrencyValue).toFixed(2),
                        'localCurrencyName': currencyData.CcyNm,
                        'changeRateURL': 'http://www.xe.com/fr/currencyconverter/convert/?Amount=1&From=' + currencyCode + '&To=' + countryData.currency.CurrencyCode
                    });
                }
            });
        }

        // URLs
        str.costOfLivingURL = 'http://www.numbeo.com/cost-of-living/';
        if (countryData.slugs) {
            // str.climatURL = 'http://www.weather-and-climate.com/average-monthly-Rainfall-Temperature-' + 'Sunshine-in-' + countryData.slug.charAt(0).toUpperCase() + countryData.slug.slice(1);
            str.climatURL = 'http://www.weather-and-climate.com/average-monthly-Rainfall-Temperature-' + 'Sunshine-in-' + countryData.slugs['weather-and-climate.com'];
            // $('#user_country').val().toLowerCase() // userData.user_country.toLowerCase()
            str.embassiesURL = 'http://embassy.goabroad.com/embassies-in/' + countryData.slugs['goabroad.com'];
            // console.warn(JSON.stringify(userData));
            // console.warn($('#user_country').val());
            if (userData && userData.address && userData.address.ISO) {
                userCountry = userData.address.ISO;
            } else if ($('#user_country').val()) {
                userCountry = $('#user_country').val();
            }
            if (userCountry && countryData.slugs['goabroad.com'] && userCountry.toLowerCase() !== cid.toLowerCase()) {
                str.localEmbassiesURL = 'http://embassy.goabroad.com/embassies-of-' + countryData.slugs['goabroad.com'];
                if (countriesData[userCountry.toLowerCase()] && countriesData[userCountry.toLowerCase()].slugs['goabroad.com']) {
                    str.localEmbassiesURL = str.localEmbassiesURL + '-in-' + countriesData[userCountry.toLowerCase()].slugs['goabroad.com'];
                }
            }

            // str.costOfLivingURL = 'http://www.numbeo.com/cost-of-living/country_result.jsp?country=' + countryData.slug.charAt(0).toUpperCase() + countryData.slug.slice(1);
            str.costOfLivingURL = 'http://www.numbeo.com/cost-of-living/country_result.jsp?country=' + countryData.slugs['numbeo.com'];

            // str.visaFreeURL = 'http://embassy-finder.com/' + countryData.slugs['default'] + '_visa';



            str.betterLifeIndexURL = 'http://www.oecdbetterlifeindex.org/countries/' + countryData.slug + '/';
        }
        // str.plugTypesURL = 'http://www.iec.ch/worldplugs/list_bylocation.htm';

        // Matches
        if (countryData.points) {
            str.fixedScore = countryData.points.toFixed();
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

            if (countryData.matchingPriorities[pid]) {
                if (countryData.matchingPriorities[pid].percent >= 0) {
                    // data.percent = countryData.matchingPriorities[pid].percent;
                    data.percent = countryData.matchingPriorities[pid].percent.toFixed();
                }
                if (countryData.matchingPriorities[pid].required
                  && countryData.matchingPriorities[pid].required.length > 0) {
                    data.warning = true;
                }
                if (countryData.matchingPriorities[pid].missing) {
                    data.error = true;
                }
            }

            /*if (countryData.matchingPriorities[pid] && countryData.matchingPriorities[pid].values) {
                data.iconClass = 'glyphicon glyphicon-info-sign text-info';
                if (countryData.matchingPriorities[pid].percent > 0) {
                    data.percent = (countryData.matchingPriorities[pid].percent * 100).toFixed();
                    data.iconClass = 'glyphicon glyphicon-ok text-success';
                }
            }*/

            str.matches.push(data);
        });

        // Better life indexes
        if (countryData.betterLifeIndexes) {
            rows = {};
            $.each(countryData.betterLifeIndexes, function (i, v) {
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

        viewData = $.extend(true, str, countryData, {
            // id: cid
            flag: {
                src: 'images/flags/' + countryData.codes.ISO3.toLowerCase() + '.svg'
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
            $.when(deferred.ready.map).done(function () {
                $('#center_country').on('click', function (e) {
                    e.preventDefault();
                    var zoom = 2;
                    if (countryData['Area(in sq km)']) {
                        zoom = (4 - ~~countryData['Area(in sq km)'] / (17100000 / 4)).toFixed();
                    }
                    if (countryData.longitude && countryData.latitude) {
                        //centerMap(~~countryData.longitude, ~~countryData.latitude, zoom);
                        mapModule.fitCountry(countryData.codes.ISO3);
                    }
                    // console.log('Center map at longitude: ' + countryData.longitude + ' latitude: ' + countryData.latitude + ' zoom: ' + zoom);
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
            // $('#country_details').find('[data-i18n]').localize();

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

    // Public methods
    return {
        showCountryDetails: showCountryDetails
    };

})();

