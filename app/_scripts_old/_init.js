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
    countriesData,
    countryCodesISO2,
    unknowCountriesData,
    userData,
    currenciesData,
    maxPoints,
    appendSelectOptions,
    deferred,
    oecdIncomeLevels
*/

/**
 * App options
 */

var options = {

    bootstrapValidator: {
            framework: 'bootstrap',
            excluded: [':disabled'], // , ':hidden', ':not(:visible)'
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
            //detectLngQS: 'setLng',
            // detectLngFromPath: 0,
            //lng: 'en',
            fallbackLng: 'en', // 'en', false
            // preload: ['en'],
            whitelist: ['en', 'fr'], // 'ar', 'bn', 'de', 'en', 'es', 'fr', 'hi', 'it', 'ja', 'pt', 'ru', 'zh'
            //load: 'unspecific',
            // getAsync: false,
            debug: true,
            //useDataAttrOptions: true,
            // sendMissingTo: 'all', // fallback|current|all
            //ns: {
            //    namespaces: ['global', 'fields', 'values', 'sections', 'buttons', 'alerts', 'priorities', 'questions'],
            //    defaultNs: 'global'
            //},
            ns:  ['global', 'fields', 'values', 'sections', 'buttons', 'alerts', 'priorities', 'questions'],
            defaultNs: 'global',
            fallbackNS: 'global',
            //dynamicLoad: false,
            //resGetPath: 'locales/__lng__/__ns__.json'
            'backend': {
                loadPath: 'locales/{{lng}}/{{ns}}.json',
                addPath: 'locales/add/{{lng}}/{{ns}}',
                crossDomain: false,
            }
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

    /*parsley: {
        errorClass: 'has-error',
        successClass: 'has-success',
        classHandler: function(ParsleyField) {
            return ParsleyField.$element.parents('.form-group');
        },
        errorsContainer: function(ParsleyField) {
            return ParsleyField.$element.parents('.form-group');
        },
        errorsWrapper: '<span class="help-block">',
        errorTemplate: '<div></div>'
    },*/

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

    /*sayt: {
            autosave: true,
            savenow: false,
            days: 30,
            erase: false,
            recover: false,
            autorecover: true,
            checksaveexists: false
        },*/

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
        getJSON: {
            data: $.Deferred(),
            countriesData: $.Deferred(),
            currenciesData: $.Deferred(),
            languagesData: $.Deferred(),
            prioritiesData: $.Deferred()
        },
        init: {
            i18next: $.Deferred()
        },
        load: {
            map: $.Deferred(),
            mapSettings: $.Deferred()
        },
        ready: {
            userProfile: $.Deferred(),
            userProfileReset: $.Deferred(),
            priorities: $.Deferred(),
            enabledPriorities: $.Deferred(),
            disabledPriorities: $.Deferred(),
            map: $.Deferred(),
            mapControls: $.Deferred(),
            mapInteractions: $.Deferred(),
            mapLayers: $.Deferred(),
            mapOverlays: $.Deferred(),
            mapSettings: $.Deferred(),
            appSettings: $.Deferred()
        }
    },
    countriesData = {},
    countryCodesISO2 = {},
    i18nextInstance,
    userData = {},
    currenciesData = {},
    maxPoints = 0;

var oecdIncomeLevels = {
        'LIC': '1045',
        'LMC': '4125',
        'UMC': '12746',
        'OEC': '25000',
        'NOC': '25000'
    };
    
var steps = [{
    'id': 'userProfile'
}, {
    'id': 'priorities'
}, {
    'id': 'results'
}];

//requirejs.config({});

/**
 * Production options
 */

// options.i18next.useLocalStorage = true;
// options.i18next.localStorageExpirationTime = 86400000;



/**
 * Return each row of a json object that contain a given property
 */

var findProperty = function (obj, prop) {
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
    'use strict';
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
            value = findProperty(v, valueKey);
        } else {
            value = k;
        }
        text = findProperty(v, textKey);
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
 * Validation steps before result udate
 */

var validationStepPercent = function (i, percent) {
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

    if (i !== 2) {
        validationStepPercent(2, (steps[0].percent + steps[1].percent) / 2);
    }

}



/**
 * Initialize jquery plugins in a given block
 * @param selector Initialize plugins in this element
 */

var initBlock = function (selector) {
    'use strict';
    console.time('initBlock(' + selector + ') function executed');

    if (!selector) {
        selector = 'body';
    }

    var $block = $(selector);

    if (!$block) {
        return false;
    }

    // i18next translation
    $.when(deferred.init.i18next).done(function () {
        console.time('i18next strings translated from ' + selector + ' block');
        $block.localize();
        console.timeEnd('i18next strings translated from ' + selector + ' block');
    });

    // Reveal some elements when in viewport
    console.time('scrollReveal plugin initialized');
    window.sr = new ScrollReveal(options.scrollReveal);
    console.timeEnd('scrollReveal plugin initialized');

    // Sort select options
    console.time('Select options sorted from ' + selector + ' block');
    $block.find('select.sort').each(function () {
        var $el = $(this);
        var options = $el.find('option');
        options.sort(function (a, b) {
            return $(a).text() > $(b).text();
        });
        $el.html('').append(options);
    });
    console.timeEnd('Select options sorted from ' + selector + ' block');

    // Convert placeholder attribut (created by i18next) to data-placeholder (used by chosen)
    console.time('chosen data-placeholder generated from placeholder attributs');
    $block.find('.chosen-select').each(function () {
        $(this).attr('data-placeholder', $(this).attr('placeholder'));
    });
    console.timeEnd('chosen data-placeholder generated from placeholder attributs');
    
    // Trigger a "input" event when a chosen value change (chosen fix)
    //$block.on('change', '.chosen-select', function () {
    //    $(this).trigger('input');
    //});

    
    $block.find('.chosen-select').chosen(options.chosen);
    
    $block.find('.image-picker').imagepicker({
            // hide_select: true,
            // limit: 2,
            // show_label: true
        });
        
    // Convert checkboxes into switches
    console.time('bootstrapSwitch plugin initialized from ' + selector + ' block');
    $block.find('.switch').bootstrapSwitch();
    console.timeEnd('bootstrapSwitch plugin initialized from ' + selector + ' block');

    // Bootstrap popover & tooltip
    console.time('popover & tooltip plugin initialized from ' + selector + ' block');
    $block.find('[data-toggle="popover"]').popover(options.popover);
    $block.find('[data-toggle="tooltip"], [title]').tooltip(options.tooltip);
    console.timeEnd('popover & tooltip plugin initialized from ' + selector + ' block');
    
    // Auto-save / restore forms (with id) from cookies
    /*if (jQuery().sayt) {
        console.time('Form values restored from cookies');
        $block.find('form[id].sayt').each(function () {
            var $el = $(this);
            console.time('#' + $el.attr('id') + ' form values restored from cookies and validated');
            $el.sayt(options.sayt);
            $el.find(':input').trigger('change');
            $el.find('.switch').trigger('switchChange');
            $el.bootstrapValidator('validate');
            console.timeEnd('#' + $el.attr('id') + ' form values restored from cookies and validated');
        });
        console.timeEnd('Form values restored from cookies');
    }*/

    // Form validation
    //var $forms = $block.find('form');
    //$forms.parsley();
        
    // Control tabs from a link
    console.time('Control tabs from a link');
    $block.on('click', '.control-tabs', function () {
        var url = $(this).attr('href');
        console.log('url', url);
        if (url.match('#')) {
            var tid = url.split('#')[1];
            console.log('tid', tid);
            $('.nav').find('a[href$=#' + tid + ']').tab('show');
            // window.scrollTo(0, 0);
        }
    });
    console.timeEnd('Control tabs from a link');

    // Initialize Google ads
    /*$(window).on('load', function () {
        console.time('Initialize Google ads');
        $block.find('a[data-toggle="tab"]').filter(':not(.active)').each(function (i, tab) {
            $(tab).one('shown.bs.tab', function (e) {
                var paneId = $(e.target).attr('href');
                var $pane = $(paneId);
                $pane.find('.responsive-advert-container').filter(':visible').each(function (i, container) {
                    var $container = $(container);
                    $container.html('<ins class="adsbygoogle" data-ad-client="ca-pub-8495719252049968" data-ad-slot="3723415549" data-ad-format="auto"></ins>');
                    (adsbygoogle = window.adsbygoogle || []).push({});
                    console.log('Ad initialized in ' + paneId + ' pane');
                });

            });
        });
        console.timeEnd('Initialize Google ads');
    });*/
    
    console.timeEnd('initBlock(' + selector + ') function executed');

}



