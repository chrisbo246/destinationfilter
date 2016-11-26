/*old-jslint indent: 2, unparam: true, plusplus: true */
/*jslint devel: true, browser: true, node: false */
/*global $, Handlebars */
/*global updateResults*/
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
var options,
  languagesDatas,
  currenciesDatas,
  countriesDatas,
  disabled_priorities;
*/

console.time('prioritiesController.js script loaded');

$.extend(true, options, {

    sortable: {
        connectWith: 'ul',
        cursor: 'move',
        forcePlaceholderSize: true,
        handle: ':not(.disabled)',
        helper: 'clone',
        items: '> li:not(.disabled)', //> li:visible:not(.disabled)
        opacity: 0.8,
        placeholder: 'ui-sortable-placeholder',
        revert: true,
        scroll: true,
        tolerance: "pointer"
            //axis: 'y',
            //start: function (event, ui) {
            //  $(this).parent().children( ".ui-sortable-placeholder" ).height( $(this).height() );
            //},
            //containment: 'parent', //parent document window or a selector
            //grid: [ 40, 40 ],
            //cancel: '.disabled',
    },

    mixitupPriorities: {
        animation: {
            animateChangeLayout: true,
            animateResizeTargets: true,
            effects: 'fade rotateX(-40deg) translateZ(-100px)'
        },
        layout: {
            //containerClass: 'list'
        },
        load: {
            //filter: '.popular'
        },
        selectors: {
            target: '.mix',
            filter: '#disabled_priorities_filters .filter',
            sort: '#disabled_priorities_form .sort'
        }
        /*,
            callbacks: {
              onMixEnd: disabledPrioritiesButtonState()
            }*/
    }
});



function disabledPrioritiesButtonState() { //state, futureState

    console.time(disabledPrioritiesButtonState.name + ' function executed');

    var $el = $('#disabled_priorities');

    // Toggle #enable_all_priorities button visibility
    if ($el.find('li:visible').length > 0) {
        $('#enable_all_priorities').removeClass('disabled');
    } else {
        $('#enable_all_priorities').addClass('disabled');
        $('#enable_selected_priorities').addClass('disabled');
    }

    // Toggle #enable_selected_priorities button visibility
    if ($el.find('li.active:visible').length > 0) {
        $('#enable_selected_priorities').removeClass('disabled');
    } else {
        $('#enable_selected_priorities').addClass('disabled');
    }

    console.timeEnd(disabledPrioritiesButtonState.name + ' function executed');

}



$.get('components/priorities/enabledPrioritiesView.mst.htm', function (source) {

    console.time('enabledPrioritiesView.mst.htm view loaded');

    var template = Handlebars.compile(source);
    $('[data-anchor="enabled_priorities"]').html(template({}));

    var $el = $('#enabled_priorities');

    // On sortable priorities change
    $el
        .sortable(options.sortable)
        .disableSelection()
        .on('sortstop sortreceive sortremove', function (event, ui) {

            var ids = $(this).sortable('toArray');

            // Save positions to cookies
            $.cookie('enabled_priorities', ids.join(','), {
                expires: options.cookieExpires
            });
            console.log('enabled_priorities saved to cookies: ' + $.cookie("enabled_priorities"));

            // Make some profile fields required if needed by user priorities
            $.each(ids, function (i, value) {
                if (value === 'speaking_language_priority') {
                    $('#user_speaking_languages').prop('required', true);
                }
                if (value === 'reading_language_priority') {
                    $('#user_reading_languages').prop('required', true);
                }
                if (value === 'visa_free_priority') {
                    $('#user_citizenships').prop('required', true);
                }
                if (value === 'currency_priority' || value === 'change_rate_priority') {
                    $('#user_currencies').prop('required', true);
                }
                if (value === 'ac_plugs_priority' || value === 'ac_voltages_priority') {
                    $('#user_plug_types').prop('required', true);
                    $('#user_plug_voltages').prop('required', true);
                }
                if (value === 'income_level_priority') {
                    $('#user_income_level').prop('required', true);
                }
            });

            // Toggle #disable_selected_priorities button visibility
            if ($el.find('li.active:visible').length > 0) {
                $('#disable_selected_priorities').removeClass('disabled');
            } else {
                $('#disable_selected_priorities').addClass('disabled');
            }


            if (ids.length > 0) {
                // Toggle #disable_selected_priorities button visibility
                $('#disable_all_priorities').removeClass('disabled');
                // Step 2 success
                //alert('prioritiesController');
                validationStepPercent(1, 100);
            } else {
                $('#disable_all_priorities').addClass('disabled');
                $('#disable_selected_priorities').addClass('disabled');
                // Step 2 failed
                //alert('prioritiesController');
                validationStepPercent(1, 0);
            }

        });

    //Disable selected button
    $('#disable_selected_priorities').on('click', function (e) {
        e.preventDefault();
        var array = [];
        $.each($el.find('li.active:visible'), function (i, id) {
            $(this).removeClass('active');
            array.push($(this));
        });
        $('#disabled_priorities').append(array).trigger('sortreceive');
        $el.trigger('sortremove');
        // Trigger a change on the filter to rearrange new disabled priorities
        $('#priority_filters').trigger('change');
    });

    //Disable all button
    $('#disable_all_priorities').on('click', function (e) {
        e.preventDefault();
        var array = [];
        $.each($el.find('li:visible'), function (i, id) {
            $(this).removeClass('active');
            array.push($(this));
        });
        $('#disabled_priorities').append(array).trigger('sortreceive');
        $el.trigger('sortremove');
        // Trigger a change on the filter to rearrange new disabled priorities
        $('#priority_filters').trigger('change');
    });

    // Highlight sortable item when user click it
    $el.on('click', 'li:not(.disabled)', function () {
        $(this).toggleClass('active');
        console.log('click');

        // Toggle #disable_selected_priorities button visibility
        if ($el.find('li.active:visible').length > 0) {
            $('#disable_selected_priorities').removeClass('disabled');
        } else {
            $('#disable_selected_priorities').addClass('disabled');
        }

    });

    console.timeEnd('enabledPrioritiesView.mst.htm view loaded');

});



$.get('components/priorities/disabledPrioritiesModal.mst.htm', function (source) {

    console.time('disabledPrioritiesModal.mst.htm view loaded');

    // Load priorities from JSON file
    $.getJSON('json/priorities.json', function (json) {
        var viewData,
            rendered,
            filters = [];

        // Draw disabled priorities and filters
        prioritiesDatas = json;
        $.each(json, function (i, v) {
            v.order = i;
            if (v.filters) {
                filters = filters.concat(v.filters.split(/\s+/));
            }
        });
        filters = $.distinct(filters);
        viewData = {
            disabled_priorities: json,
            disabled_priorities_filters: filters
        };

        // Append disabled priorities modal to body
        var template = Handlebars.compile(source);
        $('body').append(template(viewData));
    
        // Auto-save / restore forms (with id) from cookies
        $(window).on('load', function () {
            $('#disabled_priorities_modal').find('form[id].sayt').each(function () {
                var $el = $(this);
                $el.sayt(options.sayt);
                $el.find(':input').trigger('change');
                console.log('#' + $el.attr('id') + ' restored from cookies');
            });
        });
        
        // Restore enabled priorities from cookies
        console.time('Priorities restored from cookies');
        if ($.cookie('enabled_priorities')) {
            $.each($.cookie('enabled_priorities').split(','), function (i, id) {
                $('#' + id).appendTo('#enabled_priorities');
            });
        }
        $('#enabled_priorities').trigger('sortreceive');
        console.timeEnd('Priorities restored from cookies');

        var $el = $('#disabled_priorities');

        // When #disabled_priorities modal open
        $('#disabled_priorities_modal').one('shown.bs.modal', function (e) {
        
            // Initialize MixItUp on #disabled_priorities (only if not already)
            if (!$el.mixItUp('isLoaded')) {

                console.log('Load MixItUp on #disabled_priorities');
                $el.mixItUp(options.mixitupPriorities);

                $el.on('mixEnd', function (e, state) {
                    disabledPrioritiesButtonState();
                });

                // Filter selector (for select field only)
                $('#disabled_priorities_filters')
                    .on('change', function () {
                        $el.mixItUp('filter', this.value);
                        console.log('Disabled priorities filter changed to ' + this.value);
                    });
                
                /*
                // Sort order selector
                $('#disabled_priorities_sort')
                    .on('change', function () {
                        $el.mixItUp('sort', this.value);
                        console.log('Disabled priorities order changed to ' + this.value);
                    });
                */
                
                // Layout selector
                $('#disabled_priorities_layout')
                    .on('change', function () {
                        $el.mixItUp('changeLayout', {
                            containerClass: this.value                            
                        });
                        console.log('Disabled priorities layout changed to ' + this.value);
                    });

            }

        });



        // On sortable disabled_priorities change
        $el
            .sortable(options.sortable)
            .disableSelection()
            .on('sortstop sortreceive sortremove', function (event, ui) {

                var ids = $(this).sortable('toArray');

                // Disable profile fields required if no longer needed by user priorities
                $.each(ids, function (i, value) {
                    if (value === 'speaking_language_priority') {
                        $('#user_speaking_languages').prop('required', false);
                    }
                    if (value === 'reading_language_priority') {
                        $('#user_reading_languages').prop('required', false);
                    }
                    if (value === 'visa_free_priority') {
                        $('#user_citizenships').prop('required', false);
                    }
                    if (value === 'currency_priority' || value === 'change_rate_priority') {
                        $('#user_currencies').prop('required', false);
                    }
                    if (value === 'ac_plugs_priority' || value === 'ac_voltages_priority') {
                        $('#user_plug_types').prop('required', false);
                        $('#user_plug_voltages').prop('required', false);
                    }
                    if (value === 'income_level_priority') {
                        $('#user_income_level').prop('required', false);
                    }
                });

                disabledPrioritiesButtonState();

            })
            .trigger('sortstop');


        // Enable selected button
        $('#enable_selected_priorities').on('click', function (e) {
            e.preventDefault();
            var array = [];
            $.each($el.find('li.active:visible'), function (i, id) {
                $(this)
                    .removeClass('active')
                    .removeAttr('style')
                    .show();
                array.push($(this));
            });
            $('#enabled_priorities').append(array).trigger('sortreceive');
            $el.trigger('sortremove');
        });

        // Enable all button
        $('#enable_all_priorities').on('click', function (e) {
            e.preventDefault();
            var array = [];
            $.each($el.find('li:visible'), function (i, id) {
                $(this)
                    .removeClass('active')
                    .removeAttr('style')
                    .show();
                array.push($(this));
            });
            $('#enabled_priorities').append(array).trigger('sortreceive');
            $el.trigger('sortremove');
        });

        // Highlight sortable item when user click it
        $el.on('click', 'li:not(.disabled)', function () {
            $(this).toggleClass('active');
            disabledPrioritiesButtonState();
        });

    });

    console.timeEnd('disabledPrioritiesModal.mst.htm view loaded');

});



console.timeEnd('prioritiesController.js script loaded');