// jshint devel:true

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
    initBlock,
    adsbygoogle: true
*/

/**
 * www.destinationfilter.tk 0.7.0
 * https://github.com/christopheboisier/DestinationFinder/
 * MIT licensed
 * @author Christophe BOISIER
 *
 * Copyright (C) 2015 Christophe BOISIER
 */

'use strict';

var appModule = (function () {
    'use strict';

    var debug = document.domain === 'localhost';

    var options = {

        // http://formvalidation.io/
        bootstrapValidator: {
            framework: 'bootstrap',
            excluded: [':disabled'], // , ':hidden', ':not(:visible)'
            live: 'enabled'
        },

        // https://harvesthq.github.io/chosen/
        chosen: {
            width: '100%',
            html_template: '<img class="{class_name}" src="{url}">'
        },

        // http://i18next.com/docs/options/
        i18next: {
            whitelist: ['en', 'fr'], // 'ar', 'bn', 'de', 'en', 'es', 'fr', 'hi', 'it', 'ja', 'pt', 'ru', 'zh'
            ns: ['global', 'fields', 'values', 'sections', 'buttons', 'alerts', 'priorities', 'questions'],
            fallbackLng: 'en',
            fallbackNS: 'global',
            defaultNs: 'global',
            debug: debug,
            //https://github.com/i18next/i18next-browser-languageDetector
            detection: {
                lookupQuerystring: 'lng'
            },
            // https://github.com/i18next/i18next-xhr-backend
            backend: {
                loadPath: 'locales/{{lng}}/{{ns}}.json',
                addPath: 'locales/add/{{lng}}/{{ns}}',
                crossDomain: false
            },
            // https://github.com/i18next/i18next-localStorage-cache
            cache: {}
        },

        // http://rvera.github.io/image-picker/
        imagePicker: {
            // hide_select: true,
            // limit: 2,
            // show_label: true
        },

        // https://github.com/i18next/jquery-i18next
        jqueryI18next: {},

        // https://github.com/peachananr/onepage-scroll
        onepageScroll: {
            sectionContainer: '.section' /*,
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
            html: 'true' /*,
                         placement: 'auto right',
                         trigger: 'hover', // click | hover | focus | manual
                         delay: {
                         'show': 900,
                         'hide': 100
                         },
                         animation: true*/
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
            mobile: true
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
        currenciesData = {};

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

    /**
     * Validation steps before result udate
     */
    var validationStepPercent = function validationStepPercent(i, percent) {

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
            $el.removeClass('text-success text-warning text-danger').addClass(percent === 100 ? 'text-success' : percent > 0 ? 'text-warning' : 'text-danger');
        }

        // Update the progress bar class
        $el = $('#steps-progress');
        if ($el) {
            $el.find('.progress-bar:nth-child(' + (i + 1) + ')').removeClass('progress-bar-success progress-bar-warning progress-bar-danger').addClass(percent === 100 ? 'progress-bar-success' : percent > 0 ? 'progress-bar-warning' : 'progress-bar-danger');
            $el.find('.progress-bar').css('width', (100 / steps.length).toFixed(2) + '%');
        }

        if (i !== 2) {
            validationStepPercent(2, (steps[0].percent + steps[1].percent) / 2);
        }
    };

    /**
     * Initialize jquery plugins in a freshly created block
     * @param selector Initialize plugins in this element
     */
    var initBlock = function initBlock(selector) {

        console.time('initBlock(' + selector + ') function executed');

        if (!selector) {
            selector = 'body';
        }

        var $block = $(selector);

        if (!$block) {
            return false;
        }

        // Translate elements with a data-i18n attribut
        $.when(deferred.init.i18next).done(function () {
            $block.localize();
        });

        // Reveal some elements when in viewport
        window.sr = new ScrollReveal(options.scrollReveal);

        // Sort select options
        $block.find('select.sort').each(function () {
            var $el = $(this);
            var options = $el.find('option');
            options.sort(function (a, b) {
                return $(a).text() > $(b).text();
            });
            $el.html('').append(options);
        });

        // Convert placeholder attribut (created by i18next) to data-placeholder (used by chosen)
        $block.find('.chosen-select').each(function () {
            $(this).attr('data-placeholder', $(this).attr('placeholder'));
        });

        // Initialize chosen select inputs
        $block.find('.chosen-select').chosen(options.chosen);

        // Image picker
        $block.find('.image-picker').imagepicker(options.imagePicker);

        // Convert checkboxes into switches
        $block.find('.switch').bootstrapSwitch();

        // Bootstrap popover & tooltip
        $block.find('[data-toggle="popover"]').popover(options.popover);
        $block.find('[data-toggle="tooltip"], [title]').tooltip(options.tooltip);

        // Form validation
        //var $forms = $block.find('form');
        //$forms.parsley();

        console.timeEnd('initBlock(' + selector + ') function executed');
    };

    /**
     * Resize sections according to viewport height when the window size change
     */
    var resizeSections = function resizeSections() {

        console.time('resizeSections function executed');

        var $navbarTop = $('.navbar-fixed-top').filter(':visible');
        var $navbarBottom = $('.tab-pane.active .navbar-fixed-bottom').filter(':visible');

        var height = $(window).height(),
            navTop = $navbarTop.height() || 0,
            navBottom = $navbarBottom.height() || 0,
            paddingTop = $navbarTop.outerHeight(true) || 0,
            paddingBottom = $navbarBottom.filter(':visible').outerHeight(true) || 0,
            offset = $('body').offset();

        $('body, .page, .section, .slide').css('min-height', height);

        $('.slide-no-padding').css('height', height);

        $('.slide-no-padding').css('padding-top', navTop).css('padding-bottom', navBottom);

        $('.slide').css('padding-top', paddingTop).css('padding-bottom', paddingBottom);

        console.log('Section height adjusted > ' + height + 'px');
        console.log('Section padding adjusted > padding-top: ' + paddingTop + 'px, padding-bottom: ' + paddingBottom + 'px');
        console.log('Section without padding adjusted > padding-top: ' + navTop + 'px, padding-bottom: ' + navBottom + 'px');
        if (offset.top !== 0 || offset.left !== 0) {
            console.warn('Body offset negative values > top: ' + offset.top + 'px, left: ' + offset.left + 'px'); /* RemoveLogging:skip */
        }
        console.timeEnd('resizeSections function executed');
    };

    commonsModule.adsense();
    commonsModule.storeActiveTab();
    commonsModule.resetButton({ buttonSelector: '.delete-cookies' });
    if (debug) {
        commonsModule.debug({
            mixitupSelector: '#disabled_priorities, #faq_list',
            i18nextInstance: i18nextInstance
        });
    } else {
        console.log = function () {};
        console.time = function () {};
        console.timeEnd = function () {};
    }
    //commonsModule.loadGoogleFonts();
    //commonsModule.parallax();

    // Load JSON data
    console.time('Load currencies.json');
    $.getJSON('data/currencies.json', function (json) {
        currenciesData = json;
        console.timeEnd('Load currencies.json');
    }).promise(currenciesData);
    console.time('Load countries.json');

    console.time('Load countries.json');
    $.getJSON('data/countries.json', function (json) {
        countriesData = json;
        console.log('countriesData', countriesData);
        // Build an array allowing ISO3 to ISO2 country codes conversion
        $.each(json, function (id, country) {
            if (country.ISO && country.shapeId) {
                countryCodesISO2[country.shapeId] = id;
            }
        });
        console.timeEnd('Load countries.json');
    }).promise(countriesData);
    /*
    $.when(appModule.countriesData).then(function () {
        //console.log('main.js d', d);
        console.log('main.js appModule.countriesData', appModule.countriesData);
    });*/

    // i18next translation
    console.time('i18next plugin initialization');
    var i18nextInstance = i18next.createInstance();
    i18nextInstance.use(i18nextXHRBackend).use(i18nextBrowserLanguageDetector).init(options.i18next, function (err, t) {

        // Initialize content translation via HTML attributs
        i18nextJquery.init(i18nextInstance, $, options.i18nextJquery);

        $(function () {
            // Translate site title and description
            $(document).attr('title', i18nextInstance.t('app.title'));
            $(document).attr('description', i18nextInstance.t('app.description'));
            // Translate chosen strings
            options.chosen.no_results_text = i18nextInstance.t('strings.chosenNoResultsText');
        });

        console.timeEnd('i18next plugin initialization');
        deferred.init.i18next.resolve();
    });

    // When HTML is loaded (except images) and DOM is ready
    $(function () {

        // Initialize various plugins for the whole document
        initBlock('body');

        // Adapt sections height
        // when the window size change
        $(window).resize(function () {
            resizeSections();
        }).trigger('resize');
        // when navbar height change
        var $el = $('.navbar-fixed-top, .navbar-fixed-bottom');
        $el.resize(function () {
            resizeSections();
        });
        // when a page (tab) is shown for the first time
        $('#main-menu').find('a[data-toggle="tab"]').one('shown.bs.tab', function (e) {
            resizeSections();
        });

        // Change section class depending on selected tab (for background-image)
        // When a tab is shown for the first time...
        $('#main-menu').find('a[data-toggle="tab"]').one('shown.bs.tab', function (e) {
            var paneId = $(e.target).attr('href');
            var bodyClass = paneId.replace('#', '');
            $('section').removeClass().addClass(bodyClass);
            console.log('Body class changed to ' + bodyClass);
        });

        // Toggle chevrons when user open a panel
        $('.panel-group').on('shown.bs.collapse hidden.bs.collapse', function (e) {
            console.time('Show .panel-group');
            $(e.target).prev('.panel-heading').find('.indicator').toggleClass('glyphicon-chevron-down glyphicon-chevron-up');
            console.timeEnd('Show .panel-group');
        });

        // Stop propagation
        $('.dropdown-menu').find('form').on('click', function (e) {
            e.stopPropagation();
        });

        $(window).scroll(function () {
            var top = $(document).scrollTop();
            $('.background-image').css({ 'background-position': '0px -' + (top / 3).toFixed(2) + 'px' });
        });
    });

    return {
        options: options,
        initBlock: initBlock,
        validationStepPercent: validationStepPercent,
        deferred: deferred,
        i18n: i18nextInstance,
        countriesData: countriesData,
        currenciesData: currenciesData,
        countryCodesISO2: countryCodesISO2
    };
})();

$.when(appModule.countriesData).done(function () {
    console.log('appModule.countriesData', appModule.countriesData);
    console.log('appModule.countriesData.promise()', appModule.countriesData.promise());
});
//# sourceMappingURL=main.js.map
