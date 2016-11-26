/*old-jslint indent: 2, unparam: true, plusplus: true */
/*jslint devel: true, browser: true, node: false */
/*global $, Handlebars, setMapSelection, triggerRegionClick, updateMapRegion, drawMap */
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
 
/*
var countriesDatas,
  currenciesDatas,
  countriesDatas,
  userDatas;
*/

console.time('countryDetailsController.js script loaded');

/**
 * Build country details template and open country details modal
 *
 * @param { array } countryDatas - Datas for this country
 * @return { string } HTML
 */

function showCountryDetails(cid) {

    var array,
        //iconClass,
        //colorClass,
        rows,
        //percent,
        data,
        str = {},
        //template,
        userCitizenships,
        viewData,
        countryDatas = countriesDatas[cid];

    if (!countryDatas) {
        return;
    }

    // Adapt visa requirements to user citizenship
    str.citizenships = [];
    if (countryDatas.touristVisas && $('#user_citizenships').val()) {
        userCitizenships = $('#user_citizenships').val();
        $.each(countryDatas.touristVisas, function (i, v) {
            if ($.inArray(v.originCountryISO, userCitizenships) !== -1) {
                var country = {};
                country.country = countriesDatas[v.originCountryISO.toLowerCase()].Country;
                country.visaFreeLimit = (v.visaFreeLimit === 'unlimited') ? 'Unlimited' : 'Up to ' + v.visaFreeLimit + ' days';
                country.voaFee = v['voa-fee'] || 'none';
                country.requirements = (v.requirements) ? v.requirements.join(',') : 'none';
                str.citizenships.push(country);
                return false;
            }
        });
    }

    // Adapt change rate to user currencies
    if (countryDatas.CurrencyCode && $('#user_currencies').val()) {
        str.userCurrencies = [];
        $.each($('#user_currencies').val(), function (i, currencyCode) {
            var currencyName,
                localCurrencyValue;
            if (currenciesDatas && currenciesDatas[currencyCode]) {
                currencyName = currenciesDatas[currencyCode].CcyNm;
                localCurrencyValue = currenciesDatas[currencyCode].rate;
            } else {
                currencyName = currenciesDatas.EUR.CcyNm;
                localCurrencyValue = 1;
            }
            if (currenciesDatas[countryDatas.CurrencyCode]) {
                str.userCurrencies.push({
                    'currencyName': currencyName,
                    'localCurrencyValue': currenciesDatas[countryDatas.CurrencyCode].rate / localCurrencyValue,
                    'localCurrencyName': currenciesDatas[countryDatas.CurrencyCode].CcyNm,
                    'changeRateURL': 'http://www.xe.com/fr/currencyconverter/convert/?Amount=1&From=' + currencyCode + '&To=' + countryDatas.CurrencyCode
                });
            }
        });
    }

    // URLs
    str.costOfLivingURL = 'http://www.numbeo.com/cost-of-living/';
    if (countryDatas.slug) {
        str.climatURL = 'http://www.weather-and-climate.com/average-monthly-Rainfall-Temperature-' + 'Sunshine-in-' + countryDatas.slug.charAt(0).toUpperCase() + countryDatas.slug.slice(1);
        str.embassiesURL = 'http://embassy.goabroad.com/';
        //$('#user_country').val().toLowerCase()//userDatas.user_country.toLowerCase()
        if (userDatas && userDatas.address && userDatas.address.ISO) {
            str.embassiesURL = str.embassiesURL + 'embassies-of-' + countryDatas.slug + '-in-' + countriesDatas[userDatas.address.ISO.toLowerCase()].slug;
        }
        str.costOfLivingURL = 'http://www.numbeo.com/cost-of-living/country_result.jsp?country=' + countryDatas.slug.charAt(0).toUpperCase() + countryDatas.slug.slice(1);
        str.visaFreeURL = 'http://embassy-finder.com/' + countryDatas.slug + '_visa';
        str.betterLifeIndexURL = 'http://www.oecdbetterlifeindex.org/countries/' + countryDatas.slug + '/';
    }
    str.plugTypesURL = 'http://www.iec.ch/worldplugs/list_bylocation.htm';

    // Matches
    str.fixedScore = countryDatas.points.toFixed();

    str.matches = [];
    array = $('#enabled_priorities').sortable('toArray');
    if (!(array.length > 0)) {
        array = $('#disabled_priorities').sortable('toArray');
    }
    $.each(array, function (i, pid) {        

        data = {
            id: pid
        };
    
        if (countryDatas.matchingPriorities[pid]) {            
            if (countryDatas.matchingPriorities[pid].percent >= 0) {
                //data.percent = countryDatas.matchingPriorities[pid].percent;
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
            rows[v.INDICATOR].INDICATOR = v.INDICATOR;
            rows[v.INDICATOR][v.INEQUALITY] = Math.round(v.Value * 100) / 100;
        });
        str.bli = rows;
    }

    viewData = $.extend(str, countryDatas);

    $.get('components/countryDetails/modalContent.mst.htm', function (source) {
        var template = Handlebars.compile(source);
        
        $('#country_details')
          .find('.modal-content')
          .html(template(viewData));
          
          // Initialize jQuery plugins in this freshly generated block
          initBlock('#country_details');
          
        //$('#modal_container').html(rendered);
        //$('#country_details').modal('show');
        //$('#country_details').find('[data-i18n]').i18n();

        /*$('#country_details').on('shown.bs.modal', function (event) {
          var button = $(event.relatedTarget),
            id = button.data('id');
          console.log('#country_details modal opened cibling country ' + id);
          showCountryDetails(id);
        });*/

    });

}



$.get('components/countryDetails/modalDialog.htm', function (template) {

    console.time('modalDialog.htm loaded');

    var $el;

    $('body').append(template);

    $('#country_details').on('shown.bs.modal', function (event) {
        var button = $(event.relatedTarget),
            id = button.data('id');
        console.log('#country_details modal opened cibling country ' + id);
        showCountryDetails(id);
    });

    console.timeEnd('countryDetailsView.mst.htm loaded');

});

console.timeEnd('modalDialog.htm script loaded');