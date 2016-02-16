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
    deferred: true,
    options: true,
    oecdIncomeLevels: true
*/

var userProfileResetModule = (function () {
    'use strict';

    $(function () {
            
        // Profile initialization form fields initialisation (when modal open)
        $('#user_profile_reset_modal').one('shown.bs.modal', function () {
            console.time('#user_profile_reset_modal initialisation');

            var $form = $('#user_profile_reset_form');

            // Initialize the chosen plugin when #user_profile_pane is visible
            //$form.find('.chosen-select')
            //    .chosen(options.chosen);
                //.end()
                //.on('change')
                //.trigger('chosen:updated');

            $.when(appModule.deferred.init.i18next).done(function () {

                // Field validation
                $form
                    .bootstrapValidator(
                        $.extend({}, appModule.options.bootstrapValidator, {
                            fields: {
                                userProfile: {
                                    selector: '#user_profile',
                                    validators: {
                                        notEmpty: {
                                            message: appModule.i18n.t('fields:default.messages.notEmpty')
                                        }
                                    }
                                }
                            }
                        })
                    )
                    .bootstrapValidator('validate')
                    .end()
                    .on('change', function () {
                        var $this = $(this);
                        if ($this.attr('id')) {
                            $form.bootstrapValidator('revalidateField', $this.attr('id'));
                        }
                    });

            });

            // Focus select field
            $('#user_profile')
                .focus()
                .trigger('chosen:activate');

            console.timeEnd('#user_profile_reset_modal initialisation');
        });

        // Disable populate profile button if user country field is empty
        $('#user_profile').on('change', function () {
            if ($('#user_profile').val()) {
                $('#refresh_profile').attr('disabled', false);
            } else {
                $('#refresh_profile').attr('disabled', true);
            }
        });

        // Populate profil form when user change his country
        $('#refresh_profile').on('click', function (e) {
            e.preventDefault();
            var $el = $('#user_profile');
            if ($el.val()) {
                //$.when(appModule.deferred.ready.userProfile).done(function () {
                    userProfileModule.populateUserProfile($el.val().toLowerCase());
                //});
            }
            $('#profile_modal').modal('hide');
        });

        appModule.deferred.ready.userProfileReset.resolve();
        
    });

})();

