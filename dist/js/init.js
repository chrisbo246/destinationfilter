/*old-jslint indent: 2, unparam: true, plusplus: true */
/*jslint devel: true, browser: true, node: false */
/*global $, Mustache */
'use strict';

/**
 * www.destinationfilter.tk 0.7.0
 * https://github.com/christopheboisier/DestinationFinder/
 * MIT licensed
 * @author Christophe BOISIER
 *
 * Copyright (C) 2015 Christophe BOISIER
 */
 
console.time('init.js script loaded');

// i18next translation
console.time('i18next plugin initialized');
var i18nextOptions = {
    detectLngQS: 'setLng',
    dynamicLoad: true,
    fallbackLng: 'en',
    lngWhitelist: ['en', 'fr'],
    load: 'unspecific',
    debug: true,
    getAsync: false,
    ns: {
        namespaces: ['translation'],
        defaultNs: 'translation'
    },
    resGetPath: 'locales/resources.json?lng=__lng__&ns=__ns__',
    useDataAttrOptions: true
        //lng: 'en-US',
        //ns: 'translation',
        //  ns: { namespaces: ['ns.common', 'ns.special'], defaultNs: 'ns.special'},
        //useLocalStorage: true,
        //localStorageExpirationTime: 86400000
};
$.i18n.init(i18nextOptions, function (x) {
    // Initialize navbar text asap
    $('.navbar').find('[data-i18n]').i18n();
});

console.timeEnd('i18next plugin initialized');

var options = {

        bootstrapValidator: {
            framework: 'bootstrap',
            excluded: [':disabled'], //, ':hidden', ':not(:visible)'
            /*feedbackIcons: {
              valid: 'glyphicon glyphicon-ok',
              invalid: 'glyphicon glyphicon-remove',
              validating: 'glyphicon glyphicon-refresh'
            },*/
            live: 'enabled'
        },

        chosen: {
            width: '100%',
            no_results_text: $.t('chosen.no_results_text'),
            html_template: '<img class="{class_name}" src="{url}">'
        },

        cookieExpires: 30,

        cors: 'http://www.corsproxy.com/',

        fullpage: {
            //anchors: ['home', 'user', 'priorities', 'map', 'country_list'],//, 'help', 'contribution', 'about'
            autoScrolling: true,
            loopHorizontal: false,
            menu: '#main-menu',
            navigation: true,
            navigationPosition: 'right',
            //navigationTooltips: ['Home', 'Profile', 'Priorities', 'Map', 'Country list'],//, 'Help', 'Contribute', 'About'
            normalScrollElements: '.modal',
            //paddingTop: '40px',
            //paddingBottom: '40px',
            fixedElements: '.navbar-fixed-top',
            resize: false,
            scrollOverflow: true,
            //sectionsColor: ['transparent', 'transparent', 'transparent', 'transparent', '#C63D0F', '#1BBC9B', 'transparent'],  //#C63D0F,#1BBC9B,#7E8F7C
            sectionSelector: '#home_pane .section',
            slideSelector: '#home_pane .slide',
            slidesNavigation: true,
            slidesNavPosition: 'bottom',
            fitToSection: false,
            verticalCentered: false,
            touchSensitivity: 15
        },

        /*i18next : {
          dynamicLoad: true,
          fallbackLng: 'en',
          lngWhitelist: ['en', 'fr'],
          load: 'unspecific',
          debug: true,
          getAsync: false,
          ns: {
            namespaces: ['translation'],
            defaultNs: 'translation'
          },
          resGetPath: 'locales/resources.json?lng=__lng__&ns=__ns__',
          useDataAttrOptions: true
          //lng: 'en-US',
          //ns: 'translation',
          //  ns: { namespaces: ['ns.common', 'ns.special'], defaultNs: 'ns.special'},
          //  useLocalStorage: false
        },*/

        onepageScroll: {
            sectionContainer: ".section"
                /*,
                    easing: "ease",
                    animationTime: 1000,
                    pagination: true,
                    updateURL: false,
                    beforeMove: function (index) {},
                    afterMove: function (index) {},
                    loop: false,
                    keyboard: true,
                    responsiveFallback: false,
                    direction: "vertical"*/
        },

        popover: {
            container: 'body',
            html: 'true'/*,
            placement: 'auto right',
            trigger: 'hover', //click | hover | focus | manual
            delay: {
                'show': 900,
                'hide': 100
            },
            animation: true*/
        },

        sayt: {
            autosave: true,
            savenow: false,
            days: 30,
            erase: false,
            recover: false,
            autorecover: true,
            checksaveexists: false
        },

        scrollReveal: {
            /*enter:    'bottom',
            move:     '8px',
            over:     '0.6s',
            wait:     '0s',
            easing:   'ease',
            scale:    { direction: 'up', power: '5%' },
            rotate:   { x: 0, y: 0, z: 0 },
            opacity:  0,
            mobile:   false,
            reset:    false,
            viewport: window.document.documentElement,
            delay:    'once', // 'always' 'onload' 'once'
            vFactor:  0.60,
            complete: function ( el ){}*/
        },

        tooltip: {
            container: 'body',
            html: 'true'/*,
            placement: 'auto top',
            trigger: 'hover',
            delay: {
                'show': 900,
                'hide': 100
            },
            animation: true*/
        }

    },

    countriesDatas = {},    
    languagesDatas = {},
    unknowCountriesDatas = {},
    userDatas = {},
    currenciesDatas = {},
    // For scores
    prioritiesDatas,
    maxPoints = 0,

    steps = [{
        'id': 'userProfile',
        'title': $.t('steps.userProfile.title'),
        'info': $.t('steps.userProfile.info'),
        'href': '#user_pane'
    }, {
        'id': 'priorities',
        'title': $.t('steps.priorities.title'),
        'info': $.t('steps.priorities.info'),
        'href': '#priorities_pane'
    }, {
        'id': 'results',
        'title': $.t('steps.results.title'),
        'info': $.t('steps.results.info'),
        'href': '#map_pane'
    }];


/**
 * Production options
 */

i18nextOptions.useLocalStorage = true;
i18nextOptions.localStorageExpirationTime = 86400000;
less.env = 'production';


/**
 *
 */

function traverseObject(obj) {
    $.each(obj, function (i, prop) {
        if (typeof obj[prop] === 'object') {
            traverseObject(obj[prop[i]]);
        }
    });
}



/**
 *
 */

function findProperty(obj, prop) {
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
 * Return length of a JSON object
 *
 * @param {object} json - A JSON object
 * @return {number} - The length of a JSON object
 */

function jsonLength(json) {
    var key, count = 0;
    for (key in json) {
        if (json.hasOwnProperty(key)) {
            count += 1;
        }
    }
    return count;
}



/**
 * Get HTML input value if available or set a default value
 *
 * @param {string} selector - Input CSS selector
 * @param {(string|number)} value - Default value if input value is empty
 * @return {(string|number)} Current value of input
 */

/*function syncInputValue(selector, value) {
  if ($(selector) && $(selector).val() !== '') {
    value = $(selector).val();
  } else {
    $(selector).val(value);
  }
  return value;
}*/



/**
 * Array intersection
 */

/*$.intersect = function (a, b) {
  return $.grep(a, function (i) {
    return $.inArray(i, b) > -1;
  });
};*/



/**
 * Check if given parameter is a JSON object or try to load as a JSON file instead
 *
 * @param {object|string} source -  JSON datas or filename
 * @return {object|boolean} JSON object or false
 */

function getAltJSON(source) {

    if ($.isPlainObject(source)) {
        return source;
    } else {
        $.getJSON(source, function (json) {
            console.log(source + ' loaded');
            return json;
        });
    }
    //console.log('End of getAltJSON');
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

function appendSelectOptions(selector, source, valueKey, textKey, options) {

    console.time(appendSelectOptions.name + '(' + selector + ')');

    var $select = $(selector);

    // Try to load cached options
    $select.load('datas/cache/form.htm ' + selector + ' > *', function (response, status, xhr) {
        
        //console.log(selector + ' append status: ' + status);
        
        if (status === 'error' || $select.children('option').length === 0) {

            var json,
                value,
                selectOption,
                text,
                values = [],
                duplicateValues = [],
                selectOptions = [];

            //json = getAltJSON(source);
            json = source;
            //alert(json);
            if (json === null) {
                return false;
            }

            // Extract options values from JSON object/array
            $.each(json, function (k, v) {
                if (valueKey) {
                    value = findProperty(v, valueKey);
                } else {
                    value = k;
                }
                text = findProperty(v, textKey);
                if (value && text) {
                    //if (options.attributs['data-i18n']) {
                    //  values.push({'value': value, 'text': $.t(options.attributs['data-i18n'].replace(/%s/g, value))});
                    //} else {
                    values.push({
                        'value': value,
                        'text': text
                    });
                    //}
                }
            });

            //if (!$.isArray(values)) {alert(url);}
            // Sort values
            if ($.isArray(values) && options.sort && (options.sort === 'asc' || options.sort === true)) {
                values = values.sort(function (a, b) {
                    //return a['text'].localeCompare(b['text']);
                    return ((a.text < b.text) ? -1 : ((a.text > b.text) ? 1 : 0));
                });
            }
            if (options.sort && options.sort === 'desc') {
                values = values.sort(function (a, b) {
                    //return b['text'].localeCompare(a['text']);
                    return ((a.text > b.text) ? -1 : ((a.text < b.text) ? 1 : 0));
                });
            }

            // Remove previous options
            if (options.remove && options.remove === true) {
                $select.find('option').remove();
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
        }

    });

    console.timeEnd(appendSelectOptions.name + '(' + selector + ')');

}



/**
 * Compare two strings ignoring accents, punctuation, redondent spaces, all non alpha characters and case
 *
 * @param {string} string1
 * @param {string} string1
 * @return {boolean}
 */

function flexCompare(string1, string2) {

    var a,
        b;

    a = string1
        .normalize('NFKD') // Remove accents
        .replace(/[\u0300-\u036F]/g, '')
        .replace(/(\([^\)]*\)|\[[^\]]*\]|\{[^\}]*\})/g, '') // Remove text in parentheses
        .replace(/[[:punct:]\s]+/g, ' ') // Replace multiple spaces and punctuations by a single space
        .replace(/([^[:alfa:]\s]+|^\s+|\s+$)/g, '') // Remove all other characters
        .toLowerCase(); // Convert to lower case

    b = string2
        .normalize('NFKD')
        .replace(/[\u0300-\u036F]/g, '')
        .replace(/(\([^\)]*\)|\[[^\]]*\]|\{[^\}]*\})/g, '')
        .replace(/[[:punct:]\s]+/g, ' ')
        .replace(/([^[:alfa:]\s]+|^\s+|\s+$)/g, '')
        .toLowerCase();

    return (a === b) ? true : false;

}



/**
 * Load a Google drive spreadsheet as JSON object
 * https://developers.google.com/gdata/samples/spreadsheet_sample
 *
 * @param {string} key Google drive ID of the spreadsheet
 * @param {integer} [worksheet] Spreadsheet number starting from 1
 * @param {string} [feed] Feed type, list or cells
 * @return {object}
 */

function getSpreadsheet(key, worksheet, feed) {

    var url,
        cors = 'https://', // https:// http://www.corsproxy.com/ http://cors.io/
        mode = 'values', //values / basic
        type = 'json', // json
        row = {},
        rows = [];

    // Default worksheet id
    if (!(worksheet > 0)) {
        worksheet = 1;
    }
    //default feed
    if (feed !== 'list' || feed !== 'cells') {
        feed = 'list';
    }

    url = cors + 'spreadsheets.google.com/feeds/' + feed + '/' + key + '/' + worksheet + '/public/' + mode + '?alt=' + type;

    $.getJSON(url, function (json) {
        $.each(json.feed.entry, function (k, entry) {
            row = {};
            $.each(entry, function (key, value) {
                if (key.match(/^gsx\$/g)) {
                    row[key.replace(/^gsx\$/g, '')] = value['$t'];
                }
            });
            rows.push(row);
        });
        console.log('not returned:\n' + rows);
        return rows;
    });

}



/**
 * Function to get the Maximam value in Array
 */

Array.max = function (array) {
    return Math.max.apply(Math, array);
};



/**
 * Function to get the Minimam value in Array
 */

Array.min = function (array) {
    return Math.min.apply(Math, array);
};



/**
 * Try to detect user country
 *
 * @param {object} options
 */
/*
function getUserCountry(options) {

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function (position) {
      var geocoder = new google.maps.Geocoder();
      geocoder.geocode({
      "location": new google.maps.LatLng(position.coords.latitude, position.coords.longitude)
      },
      function (results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
          j = 0;
          alert(JSON.stringify(results));
          for (var i = 0; i < results[j].address_components.length; i++) {
            if (results[j].address_components[i].types[0] == "country")
              country = results[j].address_components[i];
          }
          alert(JSON.stringify(country));
        }
      });

      return country;
    });
  }

}
*/


/**
 * Return datas of a single or all countries
 *
 * @param {string} id Country ISO2
 * @return {object|boolean}
 */




/**
 * Initialize Fields
 *
 * @constructor
 */

/*
function initFields() {

  console.time(initFields.name + ' function executed');

  var deferred = $.Deferred(),
    $el;





  console.timeEnd(initFields.name + ' function executed');

  return deferred.promise();

}
*/




/**
 * Initialize jQuery widgets
 *
 * @constructor
 */

function initPlugins() {

    console.time(initPlugins.name + ' function executed');

    console.timeEnd(initPlugins.name + ' function executed');

}



/**
 * Validation steps before result udate
 */

function validationStepPercent(i, percent) {

    if (!steps || !steps[i]) {
        return false;
    }

    if (steps[i].percent === 100 && steps[i].percent === percent) {
        return false;
    }

    steps[i].percent = percent;

    // Update text class
    var $el = $('#steps').find('div:nth-child(' + (i + 1) + ') .icon-lg');
    if ($el) {
        $el
            .removeClass('text-success text-warning text-danger')
            .addClass((percent === 100) ? 'text-success' : (percent > 0) ? 'text-warning' : 'text-danger');
    }

    // Update the progress bar class
    var $el = $('#steps-progress');
    if ($el) {
        $el.find('.progress-bar:nth-child(' + (i + 1) + ')')
            .removeClass('progress-bar-success progress-bar-warning progress-bar-danger')
            .addClass((percent === 100) ? 'progress-bar-success' : (percent > 0) ? 'progress-bar-warning' : 'progress-bar-danger');
        $el.find('.progress-bar').css('width', (100 / steps.length).toFixed(2) + '%');
    }

    if (i === 2) {
        /*if (steps[0].percent === 100) { //&& hasChanged()
            updateResults();
        }*/
    } else {
        
        /*if (steps[0].percent === 0) {
            
        }*/
        validationStepPercent(2, (steps[0].percent + steps[1].percent) / 2);
        /*if (steps[0].percent && steps[1].percent) {
            validationStepPercent(2, true);
        } else {
            validationStepPercent(2, false);
        }*/
    }
    //alert('Update score');
    //updateResults();

}



/**
 * Initialize jquery plugins in a given block
 * @param selector Initialize plugins in this element
 */

function initBlock(selector) {
    
    console.time(initBlock.name + ' function executed');
    
    if (!selector) {
      selector = 'body';
    }
  
    // i18next translation
    //console.time('i18next strings translated from ' + selector + ' block');
    $(selector).find('[data-i18n]').i18n();
    //console.timeEnd('i18next strings translated from ' + selector + ' block');
       
    // Sort select options
    //console.time('Select options sorted from ' + selector + ' block');
    $(selector).find('select.sort').each(function () {
        var $el = $(this);
        var options = $el.find('option');
        options.sort(function (a, b) {
            return $(a).text() > $(b).text();
        });
        $el.html('').append(options);
    });
    //console.timeEnd('Select options sorted from ' + selector + ' block');
    
    // Convert placeholder attribut (created by i18next) to data-placeholder (used by chosen)
    //console.time('chosen data-placeholder generated from placeholder attributs');
    $(selector).find('.chosen-select').each(function () {
        $(this).attr('data-placeholder', $(this).attr('placeholder'));
    });
    //console.timeEnd('chosen data-placeholder generated from placeholder attributs');
    
    // Bootstrap popover & tooltip
    //console.time('popover & tooltip plugin initialized from ' + selector + ' block');
    $(selector).find('[data-toggle="popover"]').popover(options.popover);
    $(selector).find('[data-toggle="tooltip"], [title]').tooltip(options.tooltip);
    //console.timeEnd('popover & tooltip plugin initialized from ' + selector + ' block');
    
    //Reveal some elements when in viewport
    console.time('scrollReveal plugin initialized');
    //window.ready(function () {
        //window.scrollReveal = new scrollReveal(options.scrollReveal);
    //});
    $(function () {
      window.sr = new scrollReveal(options.scrollReveal);
    });
    $(document).on('page:load', function () {
      sr.init();
    });
    console.timeEnd('scrollReveal plugin initialized');
    
    console.timeEnd(initBlock.name + ' function executed');
    
}



console.timeEnd('init.js script loaded');