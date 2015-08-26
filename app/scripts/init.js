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
    i18n,
    scrollReveal,
    sr
*/
/*
exported
    initBlock,
    validationStepPercent,
    countriesDatas,
    countryCodesISO2,
    languagesDatas,
    unknowCountriesDatas,
    userDatas,
    currenciesDatas,
    prioritiesDatas,
    maxPoints,
    appendSelectOptions,
    deferred,
    oecdIncomeLevels
*/
/**
 * www.destinationfilter.tk 0.7.0
 * https://github.com/christopheboisier/DestinationFinder/
 * MIT licensed
 * @author Christophe BOISIER
 *
 * Copyright (C) 2015 Christophe BOISIER
 */
console.time('init.js script loaded');

var options = {

    bootstrapValidator: {
            framework: 'bootstrap',
            excluded: [':disabled'], // , ':hidden', ':not(:visible)'
            /*feedbackIcons: {
              valid: 'glyphicon glyphicon-ok',
              invalid: 'glyphicon glyphicon-remove',
              validating: 'glyphicon glyphicon-refresh'
            },*/
            live: 'enabled'
        },

    chosen: {
            width: '100%',
            html_template: '<img class="{class_name}" src="{url}">'
        },

    cookieExpires: 30,

    cors: 'http://www.corsproxy.com/',

    fullpage: {
            // anchors: ['home', 'user', 'priorities', 'map', 'country_list'], // , 'help', 'contribution', 'about'
            autoScrolling: true,
            loopHorizontal: false,
            menu: '#main-menu',
            navigation: true,
            navigationPosition: 'right',
            // navigationTooltips: ['Home', 'Profile', 'Priorities', 'Map', 'Country list'], // , 'Help', 'Contribute', 'About'
            normalScrollElements: '.modal',
            // paddingTop: '40px',
            // paddingBottom: '40px',
            fixedElements: '.navbar-fixed-top',
            resize: false,
            scrollOverflow: true,
            // sectionsColor: ['transparent', 'transparent', 'transparent', 'transparent', '#C63D0F', '#1BBC9B', 'transparent'],  // #C63D0F,#1BBC9B,#7E8F7C
            sectionSelector: '#home_pane .section',
            slideSelector: '#home_pane .slide',
            slidesNavigation: true,
            slidesNavPosition: 'bottom',
            fitToSection: false,
            verticalCentered: false,
            touchSensitivity: 15
        },

    i18next: {
            detectLngQS: 'setLng',
            //detectLngFromPath: 0,
            //lng: 'en',
            fallbackLng: 'en',
            //preload: ['en'],
            lngWhitelist: ['en', 'fr'], // 'ar', 'bn', 'de', 'en', 'es', 'fr', 'hi', 'it', 'ja', 'pt', 'ru', 'zh'
            load: 'unspecific',
            //getAsync: false,
            debug: true,
            useDataAttrOptions: true,
            //sendMissingTo: 'all', // fallback|current|all
            ns: {
                namespaces: ['global', 'fields', 'values', 'sections', 'buttons', 'alerts', 'priorities', 'questions'],
                defaultNs: 'global'
            },
            //fallbackNS: 'global',
            dynamicLoad: false,
            resGetPath: 'locales/__lng__/__ns__.json'
            //resPostPath: 'locales/add/__lng__/__ns__.json',
            //resChangePath: 'locales/change/__lng__/__ns__.json',
            //resRemovePath: 'locales/remove/__lng__/__ns__.json'
            // dynamicLoad: true,
            // resGetPath: 'locales/resources.json?lng=__lng__&ns=__ns__',
            //lowerCaseLng: true,
            // nsseparator = ':',
            // keyseparator = '.',
            // interpolationPrefix = '__',
            // interpolationSuffix = '__',
            // lng: 'en-US',
            // ns: 'translation',
            // ns: { namespaces: ['ns.common', 'ns.special'], defaultNs: 'ns.special'},
            // useLocalStorage: true,
            // localStorageExpirationTime: 86400000
        },

    onepageScroll: {
        sectionContainer: '.section'
        /*,
            easing: 'ease',
            animationTime: 1000,
            pagination: true,
            updateURL: false,
            beforeMove: function (index) {},
            afterMove: function (index) {},
            loop: false,
            keyboard: true,
            responsiveFallback: false,
            direction: 'vertical'*/
    },

    popover: {
        container: 'body',
        html: 'true'
        /*,
                    placement: 'auto right',
                    trigger: 'hover', // click | hover | focus | manual
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
        // enter:    'bottom',
        // move:     '8px',
        // over:     '0.6s',
        // wait:     '0s',
        // easing:   'ease',
        // scale:    { direction: 'up', power: '5%' },
        // rotate:   { x: 0, y: 0, z: 0 },
        // opacity:  0,
        mobile:   true
        // reset:    false,
        // viewport: window.document.documentElement,
        // delay:    'once', // 'always' 'onload' 'once'
        // vFactor:  0.60,
        // complete: function ( el ){}
    },

    tooltip: {
            animation: true,
            container: 'body',
            html: 'true',
            delay: {
                'show': 900,
                'hide': 100
            }
            // placement: 'auto top',
            // trigger: 'hover'
        }

},

    deferred = {
        load: {
            data: $.Deferred(),
            language: $.Deferred(),
            map: $.Deferred(),
            mapSettings: $.Deferred(),
            i18next: $.Deferred()
        },
        ready: {
            language: $.Deferred(),
            userProfile: $.Deferred(),
            priorities: $.Deferred(),
            enabledPriorities: $.Deferred(),
            disabledPriorities: $.Deferred(),
            map: $.Deferred(),
            mapSettings: $.Deferred(),
            scores: $.Deferred(),
            appSettings: $.Deferred()
        }
    },
    countriesDatas = {},
    countryCodesISO2 = {},
    languagesDatas = {},
    userDatas = {},
    currenciesDatas = {},
    // For scores
    prioritiesDatas,
    maxPoints = 0;

var oecdIncomeLevels = {
        'LIC': '1045',
        'LMC': '4125',
        'UMC': '12746',
        'OEC': '25000',
        'NOC': '25000'
    };

/**
 * Production options
 */

options.i18next.useLocalStorage = true;
options.i18next.localStorageExpirationTime = 86400000;
// less.env = 'production';


/**
 * Handlebars helpers
 */

Handlebars.registerHelper('math', function (lvalue, operator, rvalue) {
    'use strict';
    lvalue = ~~lvalue;
    rvalue = ~~rvalue;

    return {
        '+': lvalue + rvalue,
        '-': lvalue - rvalue,
        '*': lvalue * rvalue,
        '/': lvalue / rvalue,
        '%': lvalue % rvalue
    }[operator];
});

Handlebars.registerHelper('if-lt', function (a, b) {
    'use strict';
    var options = arguments[arguments.length - 1];
    if (a < b) {
        return options.fn(this);
    } else {
        return options.inverse(this);
    }
});

Handlebars.registerHelper('if-gt', function (a, b) {
    'use strict';
    var options = arguments[arguments.length - 1];
    if (a > b) {
        return options.fn(this);
    } else {
        return options.inverse(this);
    }
});



// i18next translation
console.time('i18next plugin initialized');
// console.info('options.i18next: '+JSON.stringify(options.i18next));
deferred.load.i18next = i18n.init(options.i18next);


$.when(deferred.load.i18next).done(function () {
    'use strict';

    // Translated site title / description and navbar asap
    $(document).ready(function () {
        $('.navbar').find('[data-i18n]').i18n();
        $(document).attr('title', $.t('app.title'));
        $(document).attr('description',$.t('app.description'));
    });

    options.chosen.no_results_text = $.t('strings.chosenNoResultsText');

});

console.timeEnd('i18next plugin initialized');


/**
 *
 */

function findProperty(obj, prop) {
    'use strict';
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
 * Array intersection
 */

/*$.intersect = function (a, b) {
    'use strict';
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
/*
function getAltJSON(source) {
    'use strict';
    if ($.isPlainObject(source)) {
        return source;
    } else {
        $.getJSON(source, function (json) {
            console.log(source + ' loaded');
            return json;
        });
    }

    return false;
}
*/


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
    'use strict';
    console.time(appendSelectOptions.name + '(' + selector + ')');

    var $select = $(selector);

    // Try to load cached options
    // $select.load('cache/inputs.htm ' + selector + ' > *', function (response, status) { // response, status, xhr

        // console.log(selector + ' append status: ' + status);

        // if (status === 'error' || $select.children('option').length === 0) {

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

            // json = getAltJSON(source);
            json = source;
            // alert(json);
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
                    // if (options.attributs['data-i18n']) {
                    //  values.push({'value': value, 'text': $.t(options.attributs['data-i18n'].replace(/%s/g, value))});
                    // } else {
                    values.push({
                        'value': value,
                        'text': text
                    });
                    // }
                }
            });

            // if (!$.isArray(values)) {alert(url);}
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
        // }

    // });

    console.timeEnd(appendSelectOptions.name + '(' + selector + ')');

}



/**
 * Function to get the Maximam value in Array
 */

Array.max = function (array) {
    'use strict';
    return Math.max.apply(Math, array);
};



/**
 * Function to get the Minimam value in Array
 */

Array.min = function (array) {
    'use strict';
    return Math.min.apply(Math, array);
};



/**
 * Try to detect user country
 *
 * @param {object} options
 */
/*
function getUserCountry(options) {
  'use strict';
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function (position) {
      var geocoder = new google.maps.Geocoder();
      geocoder.geocode({
      'location': new google.maps.LatLng(position.coords.latitude, position.coords.longitude)
      },
      function (results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
          j = 0;
          alert(JSON.stringify(results));
          for (var i = 0; i < results[j].address_components.length; i++) {
            if (results[j].address_components[i].types[0] === 'country')
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
 * Validation steps before result udate
 */

var steps = [{
    'id': 'userProfile'
}, {
    'id': 'priorities'
}, {
    'id': 'results'
}];

function validationStepPercent(i, percent) {
    'use strict';

    var $el;

    if (!steps[i]) {
        return false;
    }

    if (steps[i].percent === 100 && steps[i].percent === percent) {
        return false;
    }

    steps[i].percent = percent;

    // Update text class
    $el = $('#steps').find('div:nth-child(' + (i + 1) + ') .surrounded');
    if ($el) {
        $el
            .removeClass('text-success text-warning text-danger')
            .addClass((percent === 100) ? 'text-success' : (percent > 0) ? 'text-warning' : 'text-danger');
    }

    // Update the progress bar class
    $el = $('#steps-progress');
    if ($el) {
        $el.find('.progress-bar:nth-child(' + (i + 1) + ')')
            .removeClass('progress-bar-success progress-bar-warning progress-bar-danger')
            .addClass((percent === 100) ? 'progress-bar-success' : (percent > 0) ? 'progress-bar-warning' : 'progress-bar-danger');
        $el.find('.progress-bar').css('width', (100 / steps.length).toFixed(2) + '%');
    }

    if (i === 2) {
        /*if (steps[0].percent === 100) { // && hasChanged()
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
    // alert('Update score');
    // updateResults();

}



/**
 * Initialize jquery plugins in a given block
 * @param selector Initialize plugins in this element
 */

function initBlock(selector) {
    'use strict';
    console.time(initBlock.name + '(' + selector + ') function executed');

    if (!selector) {
        selector = 'body';
    }

    var $block = $(selector);

    if (!$block) {
        return false;
    }

    // i18next translation
    // console.time('i18next strings translated from ' + selector + ' block');
    $.when(deferred.load.i18next).done(function () {
        $block.find('[data-i18n]').i18n();
    });
    // console.timeEnd('i18next strings translated from ' + selector + ' block');

    // $(function () {
        // Reveal some elements when in viewport
        // console.time('scrollReveal plugin initialized');
        window.sr = new scrollReveal(options.scrollReveal);
    // });

    // $(document).on('page:load', function () {
        sr.init();
        // console.timeEnd('scrollReveal plugin initialized');
    // });

    // Sort select options
    // console.time('Select options sorted from ' + selector + ' block');
    $block.find('select.sort').each(function () {
        var $el = $(this);
        var options = $el.find('option');
        options.sort(function (a, b) {
            return $(a).text() > $(b).text();
        });
        $el.html('').append(options);
    });
    // console.timeEnd('Select options sorted from ' + selector + ' block');

    // Convert placeholder attribut (created by i18next) to data-placeholder (used by chosen)
    // console.time('chosen data-placeholder generated from placeholder attributs');
    $block.find('.chosen-select').each(function () {
        $(this).attr('data-placeholder', $(this).attr('placeholder'));
    });
    // console.timeEnd('chosen data-placeholder generated from placeholder attributs');

    // Convert checkboxes into switches
    $block.find('.switch').filter(':checkbox').bootstrapSwitch();
    $block.on('click', '.bootstrap-switch', function (e) {
        e.stopPropagation();
    });

    // Bootstrap popover & tooltip
    // console.time('popover & tooltip plugin initialized from ' + selector + ' block');
    $block.find('[data-toggle="popover"]').popover(options.popover);
    $block.find('[data-toggle="tooltip"], [title]').tooltip(options.tooltip);
    // console.timeEnd('popover & tooltip plugin initialized from ' + selector + ' block');

    $(window).on('load', function () {
    //$(function () {
        // Auto-save / restore forms (with id) from cookies
        $block.find('form[id].sayt').each(function () {
            var $el = $(this);
            $el.sayt(options.sayt);
            $el.find(':input').trigger('change');
            $el.find('.switch').trigger('switchChange');
            $el.bootstrapValidator('validate');
            console.log('#' + $el.attr('id') + ' restored from cookies and validated');
        });
    });
    
    // Control tabs from a link
    $block.find('.control-tabs').click(function () {
        var url = $(this).attr('href');
        console.log('url', url);
        if (url.match('#')) {
            var tid = url.split('#')[1];
            console.log('tid', tid);
            $('.nav a[href$=#' + tid + ']').tab('show');
            // window.scrollTo(0, 0);
        }
    });
    
    console.timeEnd(initBlock.name + '(' + selector + ') function executed');

}

console.timeEnd('init.js script loaded');
