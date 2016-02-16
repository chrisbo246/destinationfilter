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
    deferred: true,
    options: true,
    prioritiesData: true

*/

var disabledPrioritiesModule = (function () {
    'use strict';
    
    var options = {
        sortable: {
            connectWith: 'ul',
            cursor: 'move',
            forcePlaceholderSize: true,
            handle: ':not(.disabled)',
            helper: 'clone',
            items: '> li:not(.disabled)', // > li:visible:not(.disabled)
            opacity: 0.8,
            placeholder: 'ui-sortable-placeholder',
            revert: true,
            scroll: true,
            tolerance: 'pointer'
            // axis: 'y',
            // start: function (event, ui) {
            //  $(this).parent().children('.ui-sortable-placeholder').height( $(this).height() );
            // },
            // containment: 'parent', // parent document window or a selector
            // grid: [ 40, 40 ],
            // cancel: '.disabled',
        },
        mixitupPriorities: {
            animation: {
                animateChangeLayout: true,
                animateResizeTargets: true,
                effects: 'fade rotateX(-40deg) translateZ(-100px)'
            },
            layout: {
                // containerClass: 'list'
            },
            load: {
                filter: '.popular'
            },
            selectors: {
                target: '.mix',
                filter: '#disabled_priorities_filters .filter',
                sort: '#disabled_priorities_form .sort'
            }
            /*,
                callbacks: {
                  onMixEnd: _disabledPrioritiesButtonState()
                }*/
        }
    };

    
    /**
     * Restore enabled priorities from cookies
     */
    var _restoreCookies = function () {

        console.time('Priorities restored from cookies');
        
        /*if ($.cookie('enabled_priorities')) {
            $.each($.cookie('enabled_priorities').split(','), function (i, id) {
                $('#' + id).find('.glyphicon-plus').removeClass('glyphicon-plus').addClass('glyphicon-remove');
                $('#' + id).appendTo('#enabled_priorities');
            });
        }*/
        
        var $el = $('#stored_priorities');
        if ($el) {
            $el.garlic({
                excluded: '',
                onRetrieve: function (elem, retrievedValue) {
                    $.each(retrievedValue.split(','), function (i, id) {
                        $('#' + id).find('.glyphicon-plus').removeClass('glyphicon-plus').addClass('glyphicon-remove');
                        $('#' + id).appendTo('#enabled_priorities');
                    });
                },
                onPersist: function (elem, storedValue) {

                }
            });
        }
        
        $('#enabled_priorities').trigger('sortreceive');
        
        console.timeEnd('Priorities restored from cookies');

    };
                    
                    
    /**
     * Toggle button state
     */

    var _disabledPrioritiesButtonState = function () { // state, futureState
        console.time('_disabledPrioritiesButtonState function executed');

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

        console.timeEnd('_disabledPrioritiesButtonState function executed');

    }

    
    
    $(function () {

        /*
        $.get('templates/assets/disabledPrioritiesModal.hbs', function (source) {
            console.time('disabledPrioritiesModal.hbs view loaded');

            // Load priorities from JSON file
            $.getJSON('data/disabledPrioritiesModal.json', function (json) {
                var viewData,
                    // rendered,
                    filters = [];

                // Draw disabled priorities and filters
                prioritiesData = json;
                appModule.deferred.getJSON.prioritiesData.resolve();
            });
        */
                /*
                $.each(json, function (i, v) {
                    v.order = i;
                    if (v.filters) {
                        filters = filters.concat(v.filters.split(/\s+/));
                    }
                    if (v.reverse) {
                        v.checked = 'checked';
                        v.dataInverse = 'true';
                        v.dataOffColor = 'primary';
                        v.dataOnColor = 'default';
                    } else {
                        v.checked = '';
                        v.dataInverse = 'false';
                        v.dataOffColor = 'default';
                        v.dataOnColor = 'primary';
                    }
                });
                filters = $.distinct(filters);

                viewData = {
                    disabledPriorities: json,
                    disabledPrioritiesFilters: filters
                };

                // Append disabled priorities modal to body
                var template = Handlebars.compile(source);
                //$('body').append(template(viewData));
                $('#disabled_priorities_modal').replaceWith(template(viewData));

                */

                appModule.initBlock('#disabled_priorities_modal');

                var $el = $('#disabled_priorities');

                // When #disabled_priorities modal open
                $('#disabled_priorities_modal').one('shown.bs.modal', function () {

                    // Initialize MixItUp on #disabled_priorities (only if not already)
                    if (!$el.mixItUp('isLoaded')) {

                        console.log('Load MixItUp on #disabled_priorities');
                        $el.mixItUp(options.mixitupPriorities);


                        $el.on('mixEnd', function () { // e, state
                            _disabledPrioritiesButtonState();
                        });

                        // Filter selector (for select field only)
                        $('#disabled_priorities_filters')
                            .val(options.mixitupPriorities.load.filter || 'all')
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
                            }).trigger('change');



                    }

                })
                // Trigger Mixitup filter each time the modal is opened to ensure that new disabled priorities will be visible
                .on('shown.bs.modal', function () {
                    if ($el.mixItUp('isLoaded')) {
                        //$('#disabled_priorities_filters').trigger('change');
                        // $el.mixItUp('filter')
                    }
                });


                // On sortable disabled_priorities change
                $el
                    .sortable(options.sortable)
                    .disableSelection()
                    .on('sortstop sortreceive sortremove', function () { // event, ui

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

                        _disabledPrioritiesButtonState();

                    })
                    .trigger('sortstop');


                // Enable selected button
                $('#enable_selected_priorities').on('click', function (e) {
                    e.preventDefault();
                    var array = [];
                    $.each($el.find('li.active:visible'), function () { // i, id
                        $(this)
                            .removeClass('active')
                            .removeAttr('style')
                            .show();
                        $(this).find('.glyphicon-plus').removeClass('glyphicon-plus').addClass('glyphicon-remove');
                        array.push($(this));
                    });

                    $('#enabled_priorities').append(array).trigger('sortreceive');
                    $el.trigger('sortremove');
                });

                // Highlight sortable item when user click it
                $el.on('click', 'li:not(.disabled)', function () {
                    $(this).toggleClass('active');
                    _disabledPrioritiesButtonState();
                });

                $.when(appModule.deferred.ready.enabledPriorities).done(function () {
                    
                    _restoreCookies();
                    
                    // Enable all button
                    $('#enable_all_priorities').on('click', function (e) {
                        e.preventDefault();
                        var array = [];
                        $.each($el.find('li:visible'), function () { // i, id
                            $(this)
                                .removeClass('active')
                                .removeAttr('style')
                                .show();
                            $(this).find('.glyphicon-plus').removeClass('glyphicon-plus').addClass('glyphicon-remove');
                            array.push($(this));
                        });
                        $('#enabled_priorities').append(array).trigger('sortreceive');
                        $el.trigger('sortremove');
                    });

                    // Enable button
                    $el.on('click', '.switch-priority', function (e) {
                        e.preventDefault();
                        e.stopPropagation();
                        var $block = $(this).closest('.list-group-item');
                        $block.removeClass('active').removeAttr('style');
                        $(this).find('.glyphicon-plus').removeClass('glyphicon-plus').addClass('glyphicon-remove');
                        $('#enabled_priorities').append($block).trigger('sortreceive');
                        $el.trigger('sortremove');
                        console.log('Priority switched');
                    });

                    $el.on('click', '.bootstrap-switch-container', function (e) { // event, state
                        e.preventDefault();
                        e.stopPropagation();
                    });
                    /*$el.on('switchChange.bootstrapSwitch', '.reverse-priority', function (e) { // event, state
                        e.preventDefault();
                        e.stopPropagation();
                    });*/

                    appModule.deferred.ready.priorities.resolve();
                });

                appModule.deferred.ready.disabledPriorities.resolve();


        /*
            });

            console.timeEnd('disabledPrioritiesModal.hbs view loaded');

        });
        */
        
    });

})();

