/*old-jslint indent: 2, unparam: true, plusplus: true */
/*jslint devel: true, browser: true, node: false */
/*global $, Tour*/
'use strict';

/**
 * www.destinationfilter.tk 0.7.0
 * https://github.com/christopheboisier/DestinationFinder/
 * MIT licensed
 * @author Christophe BOISIER
 *
 * Copyright (C) 2015 Christophe BOISIER
 */

var tour;

console.time('Tour plugin initialized');

tour = new Tour({
        duration: 10000,
        steps: [{
            element: '#priorities',
            title: "Ready to start?",
            content: "Scroll down the page one step below to do  few settings.",
            orphan: true,
            onShow: function (tour) {
                $('#fullpage').fullpage.moveTo('home');
            }
        }, {
            element: '#enabled_priorities',
            title: "Define your priorities",
            content: "Drag and drop the boxes to sort your priorities by order of" + " importance, from top to bottom (you'll do that later).",
            placement: 'top',
            onShow: function (tour) {
                $('#fullpage').fullpage.moveTo('priorities', 'enabled_priorities');
            }
        }, {
            element: "#disable_all_priorities",
            title: "Disable some priorities",
            content: "You can also highlight several items before using this buttons to disable the priorities you don't need.",
            placement: 'right'
        }, {
            element: "div[data-anchor=\"priorities\"] .fp-controlArrow.fp-next",
            title: "Next step",
            content: "Now slide to the next settings using the arrow.",
            placement: 'left',
            reflex: true
        }, {
            element: "#disabled_priorities",
            title: "Disabled priorities",
            content: "Here are disabled priorities. Highlight some and click the enable selection button to activate them.",
            placement: 'top',
            onShow: function (tour) {
                $('#fullpage').fullpage.moveTo('priorities', 'disabled_priorities');
            }
        }, {
            element: '#refresh_profile',
            title: "Prefill your profile",
            content: "Now select your usual place of living then click the button to prefill or reset all fields of your profile.",
            placement: 'bottom',
            reflex: true,
            onShow: function (tour) {
                $('#fullpage').fullpage.moveTo('user', 'profile');
            }
        }, {
            element: '#profile_form fieldset:nth-of-type(2)',
            title: "Fill out your profil",
            content: "Complete each field up to the last step to describe your usual lifestyle." + " Note that required fields vary depending on selected priorities, so you'd better fill all fields.",
            placement: 'left',
            onShow: function (tour) {
                $('#fullpage').fullpage.moveTo('user', 'legal');
            }
        }, {
            title: "Get your destinations",
            content: "Now it's time to scroll the page on step down to get your destinations.",
            orphan: true
        }, {
            element: '#country_list_container li:nth-of-type(1) .show-dialog',
            title: "Top destinations",
            content: "Here his the list of the best destinations sorted by score. Click on the country" + " name (or on the map) to display informations about this country.",
            placement: 'top',
            orphan: true,
            onShow: function (tour) {
                $('#fullpage').fullpage.moveTo('results', 'country_list');
            }
        }, {
            element: '#matches-tab',
            title: "Country details",
            content: "Here you will find matching priorities. Go through each tabs to find a lot of useful" + " informations about this country.",
            placement: 'right',
            onShow: function (tour) {
                if (!$('.ui-dialog').is(':visible')) {
                    $('#country_list_container li:nth-of-type(1) .show-dialog').click();
                }
            },
            onHide: function (tour) {
                if ($(".ui-dialog-content")) {
                    $(".ui-dialog-content").dialog("close");
                }
            }
        }, {
            element: '#geochart_container',
            title: "The map",
            content: "The map show you the best destinations in a more visual way. The more countries are" + " colored, the more they match your priorities.",
            placement: 'top',
            reflex: true,
            onShow: function (tour) {
                $('#fullpage').fullpage.moveTo('results', 'map');
            }
        }, {
            element: '#geochart_region',
            title: "Zoom in / out",
            content: "You can focus on a specific region using this select box. Choose \"World\" to zoom" + " out.",
            placement: 'left',
            reflex: true
        }, {
            title: "Have fun!",
            content: "Now it's your turn. Have a look in the FAQ if you have any questions.",
            placement: 'top',
            orphan: true,
            onShow: function (tour) {
                $('#fullpage').fullpage.moveTo('priorities', 'enabled_priorities');
            }
        }],
        onStart: function (tour) {
            $('.start-tour').addClass('disabled');
        },
        onEnd: function (tour) {
            $('.start-tour').removeClass('disabled');
        },
        onShow: function (tour) {
            $('.start-tour').addClass('disabled');
        },
        onHide: function (tour) {
            $('.start-tour').removeClass('disabled');
        },
        onPause: function (tour) {
            $('.start-tour').removeClass('disabled');
        }
    })
    .init();

console.timeEnd('Tour plugin initialized');