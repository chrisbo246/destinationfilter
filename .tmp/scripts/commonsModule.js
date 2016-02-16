//jslint browser: true
//global window, $

/** @global */
'use strict';

var WebFontConfig = {};

var commonsModule = (function () {
    'use strict';

    var modules = {};

    /**
     * Search ad containers in given block and insert ad
     * @param {string} selector - Div selector from where to start ad block search
     * @param {string} settings - Adsense settings
     */
    var _insertAds = function _insertAds(selector, settings) {

        var $block = $(selector);
        if (!$block) {
            return;
        }
        //console.log('Search ad in ' + selector + ' block');

        // Search for visible ads
        $block.find(settings.containers).filter(':visible').each(function (i, container) {

            var $container = $(container);

            if (!$container.attr('data-adsbygoogle-status')) {

                // Inset missing attributs
                if (!$container.attr('data-ad-client')) {
                    $container.attr('data-ad-client', settings.adClient);
                }
                if (!$container.attr('data-ad-slot')) {
                    $container.attr('data-ad-slot', settings.adSlot);
                }
                if (!$container.attr('data-ad-format')) {
                    $container.attr('data-ad-format', settings.adFormat);
                }

                // Initialize ad
                (adsbygoogle = window.adsbygoogle || []).push({});
            }
        });

        // Initialize hidden ads when a pane is opened for the first time
        _insertAdsInHiddenPanes(selector, settings);
    };

    /**
     * Search Bootstrap hidden tabs
     * @param {string} selector - Div selector from where to start ad block search 
     * @param {string} settings - Adsense settings
     */
    var _insertAdsInHiddenPanes = function _insertAdsInHiddenPanes(selector, settings) {

        var $block = $(selector);
        if (!$block) return;

        // Seach for hidden tabs
        $block.find(settings.tabLinksSelector).filter(':not(.active)').each(function (i, tab) {
            $(tab).one('shown.bs.tab', function (e) {
                var paneId = $(e.target).attr('href');
                _insertAds(paneId, settings);
            });
        });
    };

    /**
     * Find ad blocks, add missing attributs and initialise ads
     * @public
     * @param {object} [customSettings] - Adsense parameters
     */
    modules.adsense = function (settings) {

        settings = $.extend(true, settings, {
            containers: '.adsbygoogle',
            adClient: 'ca-pub-8495719252049968', // Client id used when attribut is missing
            adSlot: '3723415549', // Default ad slot when attribut is missing
            adFormat: 'auto', // Default ad format when attribut is missing
            tabLinksSelector: 'a[data-toggle="tab"]' // Tabs where to search ad containers
        });

        $(function () {
            $('body').append('<!-- Google Adsense -->' + '<script async src="//pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"></script>');
        });

        $(window).on('load', function () {
            _insertAds('body', settings);
        });
    };

    /**        
     * Parallax
     */
    modules.parallax = function (settings) {

        settings = $.extend(true, settings, {
            selector: 'section[data-type="background"]'
        });

        $(function () {
            var $window = $(window);
            $(settings.selector).each(function () {
                var $scroll = $(this);
                $window.scroll(function () {
                    var yPos = -($window.scrollTop() / $scroll.data('speed'));
                    var coords = '50% ' + yPos + 'px';
                    $scroll.css({ backgroundPosition: coords });
                });
            });
        });
    };

    /**        
     * Scroll-to links
     */
    modules.scrollTo = function (settings) {

        settings = $.extend(true, settings, {});

        $(function () {
            $('.scroll').click(function () {
                $.scrollTo(this.hash, 1500, { easing: 'swing' });
                return false;
            });
            $('.scroll-top-bottom').click(function () {
                $.scrollTo('#intro', 1500, { easing: 'swing' });
                $.scrollTo('#about', 1500, { easing: 'swing' });
                return false;
            });
        });
    };

    /**
     * Show the last displayed tab  using local storage
     * Usage: tabModule.rememberTab('#main-nav', !localStorage);
     * Tab links must contain a data-toggle attribut
     * @public
     * @param {string} linksSelector - Tab links selector
     * @param {boolean} useHash - Restore tab from URL hash or the transparent localStorage method ?
     */
    modules.storeActiveTab = function (settings) {

        settings = $.extend(true, settings, {
            linksSelector: '.navbar a[data-toggle="tab"]',
            useHash: !localStorage // Use visible URL hash or transparent localStorage method
        });

        var key = 'selectedTabFor' + settings.linksSelector;
        if (!localStorage) {
            settings.useHash = true;
        }

        $(function () {

            var $tabs = $(settings.linksSelector);
            if ($tabs) {
                if (get(key)) {
                    if (typeof $.fn.tab !== 'undefined') {
                        $tabs.filter('[href="' + get(key) + '"]').tab('show');
                    } else {
                        console.warn('Bootstrap tab plugin is not loaded');
                    }
                }
                $tabs.on('click', function (event) {
                    set(key, this.getAttribute('href'));
                });
            }

            function get(key) {
                return settings.useHash ? location.hash : localStorage.getItem(key);
            }

            function set(key, value) {
                if (settings.useHash) {
                    location.hash = value;
                } else {
                    localStorage.setItem(key, value);
                }
            }
        });
    };

    /**
     * Reset cookies and local storage
     */
    var _clearLocalStorage = function _clearLocalStorage() {

        if (document.cookie) {
            var cookies = document.cookie.split(';');
            cookies.forEach(function (cookie) {
                document.cookie = cookie.split('=')[0] + '=; username=; expires=Thu, 01 Jan 1970 00:00:00 UTC';
            });
        }
        if (localStorage) {
            localStorage.clear();
        }
    };

    /**
     * Reset cookies and local storage
     * Display a warning alert when user click the button, then reset cookies and local storage and reload 
     * @param {Object} settings - See defaults
     */
    modules.resetButton = function (settings) {

        settings = $.extend(true, settings, {
            buttonSelector: '#reset_all',
            warning: {
                title: 'Are you sure?',
                text: 'This will reset settings, erase your roadbook and delete local data stored by this application.',
                type: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#DD6B55',
                confirmButtonText: 'Yes reset all',
                cancelButtonText: 'No stop !',
                closeOnConfirm: false,
                closeOnCancel: false
            },
            confirmation: {
                title: 'Cancelled',
                text: 'You can continue where you left off.',
                type: 'error',
                timer: 2000,
                showConfirmButton: false
            }
        });

        $(function () {

            $(settings.buttonSelector).click(function () {
                if (swal) {
                    swal(settings.warning, function (isConfirm) {
                        if (isConfirm) {
                            _clearLocalStorage();
                            location.reload();
                        } else {
                            swal(settings.confirmation);
                        }
                    });
                } else {
                    _clearLocalStorage();
                    location.reload();
                }
            });
        });
    };

    /**
     * Load Google fonts asynchronously
     * @see https://github.com/typekit/webfontloader
     * @param {Object} settings - See defaults
     */
    modules.loadGoogleFonts = function (settings) {

        settings = $.extend(true, settings, {
            fontFamilies: ['Material+Icons'],
            webfontVersion: '1.5.18'
        });

        var $icons = $('.material-icons');

        // WebFontConfig must be defined globally at the top of this file
        $.extend(true, WebFontConfig, {
            google: {
                families: settings.fontFamilies
            },
            active: function active() {
                $icons.show();
            }
        });

        (function (d) {
            $icons.hide();
            var wf = d.createElement('script'),
                s = d.scripts[0];
            wf.src = 'https://ajax.googleapis.com/ajax/libs/webfont/' + settings.webfontVersion + '/webfont.js';
            s.parentNode.insertBefore(wf, s);
        })(document);
    };

    /**
     *
     */
    modules.debug = function (settings) {

        settings = $.extend(true, settings, {
            mixitupSelector: '#disabled_priorities, #faq_list',
            i18nextInstance: null
        });

        // Production options
        // options.i18next.useLocalStorage = true;
        // options.i18next.localStorageExpirationTime = 86400000;

        // All inputs
        var el = $(':input').on('input change click' + ' chosen:updated chosen:maxselected' + ' switchChange.bootstrapSwitch', function (e) {
            var $this = $(this);
            var strings = [];
            strings.push('"' + e.type + '" event fired on ' + $this.prop('tagName') + ' element');
            if ($this.attr('type')) {
                strings.push('type=' + $this.attr('type'));
            }
            if ($this.attr('id')) {
                strings.push('id=' + $this.attr('id'));
            }
            if ($this.attr('name')) {
                strings.push('name=' + $this.attr('name'));
            }
            if (e.type === 'input' || e.type === 'change') {
                strings.push('value=' + $this.val());
                if ($this.attr('type') === 'checkbox' || $this.attr('type') === 'radio') {
                    strings.push('checked=' + this.checked);
                }
            }
            console.log(strings.join(' '));
        });

        /*
        // Input events  
        $(':input').on('input change', function (e) {
            console.log('Input ' + e.type + ' #' + $(this).attr('id') + '=' + $(this).val());
        });
        
        // Checkbox events  
        $(':checkbox')
            .on('click', function (event) {
              console.log('checkbox ' + ($(this).attr('id') || '') + ' checked=' + this.checked);
            })        
            .on('switchChange.bootstrapSwitch', function (event, state) { 
                console.log('bootstrapSwitch #' + $(this).attr('id') + '=' + this.checked);
            });
            
        // Chosen select events
        $(':select').on('chosen:updated', function () {
            console.log('Chosen input #' + $(this).attr('id') + '=' + $(this).val());
        });
        */

        // Bootstrap tab events
        $('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
            var pane_id = $(e.target).attr('href');
            console.log(pane_id + ' tab shown');
        });

        // mixitup events
        if (settings.mixitupSelector) {
            $(settings.mixitupSelector).on('mixLoad mixStart mixEnd mixFail mixBusy', function (event, state) {
                console.log('mixItUp ' + event.type + ': ' + state.totalShow + ' elements match the current filter');
            });
        }

        // jQuery UI sortable events
        $('.ui-sortable').on('sortactivate sortbeforeStop sortchange sortcreate sortdeactivate sortout sortover sortreceive sortremove sort sortstart sortstop sortupdate', function (event, ui) {
            console.log('#' + $(this).attr('id') + ' event ' + event.type + '(' + $(this).sortable('toArray').length + ')');
        });

        // Way events
        $('[way-data]').on('input change', function (e) {
            console.log('[way-data] ' + e.type + ' #' + $(this).attr('id') + '=' + $(this).val());
        });

        // i18next
        /*if (settings.i18nextInstance) {
            settings.i18nextInstance
                .on('initialized', function(options) {
                    console.log('i18next initialized');
                })
                .on('loaded', function(loaded) {
                    console.log('i18next loaded');
                })
                .on('failedLoading', function(lng, ns, msg) {
                    console.warn('i18next failed loading: ' + msg + ' language:' + lng + ' ns:' + ns);
                });
        }*/

        // DOM load events
        console.time('$: HTML loaded (except images) and DOM is ready');
        console.time('$(document).ready: HTML loaded (except images) and DOM is ready');
        console.time('$(window).load: Page is fully loaded, including frames, objects and images');
        $(function () {
            console.timeEnd('$: HTML loaded (except images) and DOM is ready');
        });
        $(document).ready(function () {
            console.timeEnd('$(document).ready: HTML loaded (except images) and DOM is ready');
        });
        $(window).on('load', function () {
            console.timeEnd('$(window).load: Page is fully loaded, including frames, objects and images');
        });

        // URL infos
        console.log('location.hostname', location.hostname);
        console.log('document.location.hostname', document.location.hostname);
        console.log('window.location.hostname', window.location.hostname);
        console.log('document.domain', document.domain);
        console.log('document.URL', document.URL);
        console.log('document.location.href', document.location.href);
        console.log('document.location.origin', document.location.origin);
        console.log('document.location.host', document.location.host);
        console.log('document.location.pathname', document.location.pathname);
    };

    return modules;
})();
//# sourceMappingURL=commonsModule.js.map
