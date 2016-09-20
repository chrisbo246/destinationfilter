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
    options: true
*/

var faqModule = (function () {
    'use strict';
    
    $.extend(true, options, {

        mixitupFaq: {
            animation: {
                animateChangeLayout: true, // Animate the positions of targets as the layout changes
                animateResizeTargets: true, // Animate the width/height of targets as the layout changes
                effects: 'fade rotateX(-40deg) translateZ(-100px)'
            },
            layout: {
                display: 'block'
                // containerClass: 'list'
            },
            load: {
                filter: '.application'
            },
            selectors: {
                // target: '.mix',
                filter: '#faq_filters .filter'
            }
        }

    });

    
    
    $(function () {
            
        /*
        $.get('modules/faq/faqView.hbs', function (source) {
            console.time('faqView.hbs view loaded');

            // Load faq data then draw the faq list
            $.getJSON('data/json/faq.json', function (json) {

                var viewData,
                    filters = [];

                $.each(json, function (i, v) {
                    v.order = i;
                    if (v.filters) {
                        filters = filters.concat(v.filters.split(/\s+/));
                    }
                });
                filters = $.distinct(filters);
                viewData = {
                    faq_list: json,
                    faq_filters: filters
                };

                var template = Handlebars.compile(source);
                $('[data-anchor="faq"]').html(template(viewData));

                initBlock('[data-anchor="faq"]');

            });

            // initBlock('[data-anchor="faq"]');

        */
            // Initialize the mixItUp plugin when the #help_pane is visible
            $('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
                var pane_id = $(e.target).attr('href');
                if (pane_id === '#help_pane') {
                    // Load MixItUp on #faq_list
                    if (!$('#faq_list').mixItUp('isLoaded')) {
                        console.log('Load MixItUp on #faq_list');
                        $('#faq_list').mixItUp(options.mixitupFaq);
                    }
                }
            });

        //    console.timeEnd('faqView.hbs view loaded');

        //});
        
    });

})();

