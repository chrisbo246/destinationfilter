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
    validationStepPercent,
    deferred: true,
    options: true
*/

var enabledPrioritiesModule = (function () {
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
        cookieExpires: 30
    };

    /**
     * Save positions to cookies
     */
    var _saveCookies = function (ids) { 

        $.cookie('enabled_priorities', ids.join(','), {
            expires: options.cookieExpires
        });
        
        console.log('enabled_priorities saved to cookies: ' + $.cookie('enabled_priorities'));
        
    };

    $(function () {
            
        // var template = Handlebars.compile(source);
        // $('[data-anchor="enabled_priorities"]').html(template({}));

        // appModule.initBlock('[data-anchor="enabled_priorities"]');

        var $el = $('#enabled_priorities');

        // On sortable priorities change
        $el
            .sortable(options.sortable)
            .disableSelection()
            .on('sortstop sortreceive sortremove', function () { // event, ui
                var ids = $(this).sortable('toArray');

                //_saveCookies(ids);
                $('#stored_priorities').val(ids.join(',')).trigger('change');

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
                    $('#no_priority_alert').hide();
                    // $('a[href="#disabled_priorities_modal"]').removeClass('btn-primary');
                    // Step 2 success
                    // alert('prioritiesController');
                    appModule.validationStepPercent(1, 100);
                } else {
                    $('#disable_all_priorities').addClass('disabled');
                    $('#disable_selected_priorities').addClass('disabled');
                    $('#no_priority_alert').fadeIn();
                    // $('a[href="#disabled_priorities_modal"]').addClass('btn-primary');
                    // Step 2 failed
                    // alert('prioritiesController');
                    appModule.validationStepPercent(1, 0);
                }

            });

        // Disable selected button
        $('#disable_selected_priorities').on('click', function (e) {
            e.preventDefault();
            var array = [];
            $.each($el.find('li.active:visible'), function () { // i, id
                $(this).removeClass('active');
                $(this).find('.glyphicon-remove').removeClass('glyphicon-remove').addClass('glyphicon-plus');
                array.push($(this));
            });
            $('#disabled_priorities').append(array).trigger('sortreceive');
            $el.trigger('sortremove');
            // Trigger a change on the filter to rearrange new disabled priorities
            $('#priority_filters').trigger('change');
        });

        // Disable all button
        $('#disable_all_priorities').on('click', function (e) {
            e.preventDefault();
            var array = [];
            $.each($el.find('li:visible'), function () { // i, id
                $(this).removeClass('active');
                $(this).find('.glyphicon-remove').removeClass('glyphicon-remove').addClass('glyphicon-plus');
                array.push($(this));
            });
            $('#disabled_priorities').append(array).trigger('sortreceive');
            $el.trigger('sortremove');
            // Trigger a change on the filter to rearrange new disabled priorities
            $('#priority_filters').trigger('change');
        });

        // Disable button
        $el.on('click', '.switch-priority', function (e) {
            e.preventDefault();
            e.stopPropagation();
            var $block = $(this).closest('.list-group-item');
            $block
                .removeClass('active')
                .removeAttr('style');
            $(this).find('.glyphicon-remove').removeClass('glyphicon-remove').addClass('glyphicon-plus');
            $('#disabled_priorities').append($block).trigger('sortreceive');
            $el.trigger('sortremove');
        });

        // Highlight sortable item when user click it
        $el.on('click', 'li:not(.disabled)', function () {
            $(this).toggleClass('active');

            // Toggle #disable_selected_priorities button visibility
            if ($el.find('li.active:visible').length > 0) {
                $('#disable_selected_priorities').removeClass('disabled');
            } else {
                $('#disable_selected_priorities').addClass('disabled');
            }

        });

        appModule.deferred.ready.enabledPriorities.resolve();
        
    });

})();

