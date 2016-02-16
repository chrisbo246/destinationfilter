/*old-jslint indent: 2, unparam: true, plusplus: true */
/*jslint devel: true, browser: true, node: false */
/*global $, Mustache, scrollReveal */
'use strict';

/**
 * www.destinationfilter.tk 0.7.0
 * https://github.com/christopheboisier/DestinationFinder/
 * MIT licensed
 * @author Christophe BOISIER
 *
 * Copyright (C) 2015 Christophe BOISIER
 */



console.time('app.js script loaded');



/**
 *
 */
/*
function restoreCookies() {

  console.time(restoreCookies.name + ' function executed');

  // Restore sortable priorities from cookies
  if ($.cookie('enabled_priorities')) {
    $.each($.cookie('enabled_priorities').split(','), function (i, id) {
      $('#' + id).appendTo($('#enabled_priorities'));
    });
  }
  //if ($.cookie('disabled_priorities')) {
  //  $.each($.cookie('disabled_priorities').split(','), function (i, id) {
  //    $('#' + id).appendTo($('#disabled_priorities'));
  //  });
  //}

  console.timeEnd(restoreCookies.name + ' function executed');

}
*/


/**
 * Delete cookies
 */

function deleteCookies() {

    console.time(deleteCookies.name + ' function executed');

    var cookies = $.cookie();
    for(var cookie in cookies) {
       $.removeCookie(cookie);
    }

    
    //if (jQuery().sayt()) {
        //$('#profile_form, #disabled_priorities_form, #enabled_priorities_form').sayt({
    $('form[id].sayt').each(function () {
       var $el = $(this);
        $el.sayt({
        //$('form[id].sayt').sayt({
            'erase': true
        });
        //console.log('sayt cookies deleted');
    });
    //}
/*
    $.removeCookie('enabled_priorities');
    $.removeCookie('disabled_priorities');
    $.removeCookie('i18next');
    */
    
    window.location.reload(true);

    console.timeEnd(deleteCookies.name + ' function executed');

}

/**
 *
 */
function resizeSections() {
    
    console.time(resizeSections.name + ' function executed');

    var height,
        paddingTop = $('.navbar-fixed-top').outerHeight(true),
        paddingBottom = $('.navbar-fixed-bottom').outerHeight(true);

    //height = $(window).height() - paddingTop - paddingBottom;

    $('body').css('padding-top', paddingTop);
    $('body').css('padding-bottom', paddingBottom);

    var height = $(window).height() - parseInt($('body').css('padding-top')) - parseInt($('body').css('padding-bottom'));
    $('.section, .slide').css('min-height', height);
    $('.full-height').css('height', height);

    console.log('Section height adjusted to ' + height + 'px, padding-top: ' + paddingTop + 'px, padding-bottom: ' + paddingBottom + 'px');
    
    console.timeEnd(resizeSections.name + ' function executed');

}

// Translate site title / description
$(document).ready(function() {
    $(document).attr('title', $.t('document.title'));
    $(document).attr('description', $.t('document.description'));
});
    
// Once all html is ready
$(window).on('load', function () {

    initBlock();

    console.time('onepage_scroll plugin initialized');
    //$(".tab-pane").onepage_scroll(options.onepageScroll);
    console.timeEnd('onepage_scroll plugin initialized');

    // Restore cookies
    //restoreCookies();

    // Delete cookies button
    $('.delete-cookies').on('click', function (e) {
        e.preventDefault();
        deleteCookies();
    });

    // Adjust sections height
    $(window).resize(function () {
            resizeSections();
        })
        .trigger('resize');

    var $el = $('.navbar-fixed-top, .navbar-fixed-bottom');
    $el.resize(function () {
        resizeSections();
    });

    $('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
        resizeSections();
    });

    // Secondary fixed navbar
    /*$('.navbar-fixed-top + .navbar').affix({
      offset: {top: 50}
    });*/

    // Adjust modal size
    $('.modal-wide').on('show.bs.modal', function () {
        //var height = $(window).height();
        //$(this).find('.modal-body').css('max-height', height - 200);
    });

    // Toggle accordion chevron
    $('.panel-group').on('shown.bs.collapse hidden.bs.collapse', function (e) {
        console.time('Show .panel-group');
        $(e.target)
            .prev('.panel-heading')
            .find("i.indicator")
            .toggleClass('glyphicon-chevron-down glyphicon-chevron-up');
        console.timeEnd('Show .panel-group');
    });

    // Control tabs from a link
    $(".control-tabs").click(function () {
        var url = $(this).attr('href');
        console.log('url', url);
        if (url.match('#')) {
            var tid = url.split('#')[1];
            console.log('tid', tid);
            $('.nav a[href$=#' + tid + ']').tab('show');
            //window.scrollTo(0, 0);
        }
    });

    // Stop propagation
    $('.dropdown-menu').find('form').click(function (e) {
        e.stopPropagation();
    });
    
    // Auto-save / restore forms (with id) from cookies
    /*$('form[id].sayt').each(function () {
        var $el = $(this);
        //var $el = $('form[id]');
        //if ($el.attr('id')) {
        $el.sayt(options.sayt);
        $el.find(':input').trigger('change');
        $el.bootstrapValidator('validate'); //formValidation
        console.log('#' + $el.attr('id') + ' restored from cookies and validated');
        //$el.find(':input').trigger('change');
        //}
    });*/

    //$('#profile_form').filter(':input').trigger('change');
    /*if($('#profile_form').sayt({'checksaveexists': true}) === true) {
      console.log('Profile form has an existing save cookie.');
    }*/

    // Adapt some colors to Bootstrap theme
    $('head').append(
        '<style>'
        /*+ '.ui-state-default {'
        + 'background-color:' + $('.btn-default.disabled').css('background-color') + ';'
        + 'color:' + $('.btn-default.disabled').css('color') + ';'
        + '}'
        + '.ui-state-primary {'
        + 'background-color:' + $('.btn-primary.disabled').css('background-color') + ';'
        + 'color:' + $('.btn-primary.disabled').css('color') + ';'
        + '}'*/
        /*+ '.ui-state-default {'
        + 'background-color:' + $('.well').css('background-color') + ';'
        + 'color:' + $('.well').css('color') + ';'
        + '}'
        + '.ui-state-highlight {'
        + 'background-color:' + $('.btn-primary').css('background-color') + ';'
        + 'color:' + $('.btn-primary').css('color') + ';'
        + '}'*/
        + '.fp-controlArrow.fp-prev {' + 'border-color: transparent ' + $('.pager li > a').css('background-color') + ' transparent transparent;' + '}' + '.fp-controlArrow.fp-prev:hover {' + 'border-color: transparent ' + $('.pager li > a:hover').css('background-color') + ' transparent transparent;' + '}' + '.fp-controlArrow.fp-next {' + 'border-color: transparent transparent transparent ' + $('.pager li > a').css('background-color') + ';' + '}' + '.fp-controlArrow.fp-next:hover {' + 'border-color: transparent transparent transparent ' + $('.pager li > a:hover').css('background-color') + ';' + '}' + '#fp-nav span, .fp-slidesNav span {' + 'border-color: ' + $('body').css('color') + ';' + '}'
        //+ '.ui-widget-content {'
        //+ 'background-color:' + $('body').css('background-color') + ';'
        //+ 'background-image:' + $('body').css('background-image') + ';'
        //+ 'background-repeat:' + $('body').css('background-repeat') + ';'
        //+ 'background-position:' + $('body').css('background-position') + ';'
        //+ '}'
        //+ '.ui-widget-overlay {'
        //+ 'background-color:' + $('body').css('background-color') + ';'
        //+ 'opacity: .5;'
        //+ '}'
        //+ '.sortable_priorities {'
        //+ 'border-color:' + $('.btn-primary').css('background-color') + ';'
        //+ '}'
        + '</style>'
    );

    // Google Adsense
    setTimeout(function () {
        (adsbygoogle = window.adsbygoogle || []).push({});
    }, 4000);
    $('.navbar-nav li:not(.active) a[data-toggle="tab"]').one('shown.bs.tab', function (e) {
        var pane_id = $(e.target).attr('href');
        if ($(pane_id).find('.adsbygoogle').length > 0) { //&& !$(pane_id).hasClass('active')
            console.log('Ads initialized in ' + pane_id + ' pane');
            setTimeout(function () {
                (adsbygoogle = window.adsbygoogle || []).push({});
            }, 4000);
        }
    });

    // Activate default tabs
    //$('.nav .active').tab('show');

    // Change body class depending on selected tab
    $('#main-menu a[data-toggle="tab"]').on('shown', function (e) {
        var bodyClass = $(e.target).attr('href').replace('#', '');
        $('body').removeClass().addClass(bodyClass);
        console.log('Body class changed to ' + bodyClass);
    });

    // Global logs
    $('.ui-sortable').on('sortactivate sortbeforeStop sortchange sortcreate sortdeactivate sortout sortover sortreceive sortremove sort sortstart sortstop sortupdate', function (event, ui) {
        console.log('#' + $(this).attr('id') + ' event ' + event.type + '(' + $(this).sortable('toArray').length + ')');
    });
    $(':input').on('change', function (e) {
        console.log('Input #' + $(this).attr('id') + '=' + $(this).val());
    });
    $(':input').on('chosen:updated', function (e) {
        console.log('Chosen input #' + $(this).attr('id') + '=' + $(this).val());
    });
    $('#disabled_priorities, #faq_list').on('mixLoad mixStart mixEnd mixFail mixBusy', function (event, state) {
        console.log('mixItUp ' + event.type + ': ' + state.totalShow + ' elements match the current filter');
    });
    $(':checkbox').on('switchChange.bootstrapSwitch', function (event, state) {
        console.log('bootstrapSwitch #' + $(this).attr('id') + '=' + this.checked);
    });
    /*$(':checkbox').on('click', function (event) {
      console.log('checkbox ' + ($(this).attr('id') || '') + ' checked=' + this.checked);
    });*/

});

console.timeEnd('app.js script loaded');