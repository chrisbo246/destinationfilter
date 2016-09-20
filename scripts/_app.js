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
console.time('app.js script loaded');



/**
 *
 */
/*
function restoreCookies() {
  'use strict';
  console.time(restoreCookies.name + ' function executed');

  // Restore sortable priorities from cookies
  if ($.cookie('enabled_priorities')) {
    $.each($.cookie('enabled_priorities').split(','), function (i, id) {
      $('#' + id).appendTo($('#enabled_priorities'));
    });
  }
  // if ($.cookie('disabled_priorities')) {
  //  $.each($.cookie('disabled_priorities').split(','), function (i, id) {
  //    $('#' + id).appendTo($('#disabled_priorities'));
  //  });
  // }

  console.timeEnd(restoreCookies.name + ' function executed');

}
*/

/**
 * Delete cookies
 */

function deleteCookies() {
    'use strict';
    console.time(deleteCookies.name + ' function executed');

    var cookies = $.cookie();
    for (var cookie in cookies) {
        $.removeCookie(cookie);
    }


    // if (jQuery().sayt()) {
    // $('#profile_form, #disabled_priorities_form, #enabled_priorities_form').sayt({
    $('form[id].sayt').each(function () {
        var $el = $(this);
        $el.sayt({
            // $('form[id].sayt').sayt({
            erase: true
        });
        // console.log('sayt cookies deleted');
    });
    // }
    /*
        $.removeCookie('enabled_priorities');
        $.removeCookie('disabled_priorities');
        $.removeCookie('i18next');
        */

    window.location.reload(true);

    console.timeEnd(deleteCookies.name + ' function executed');

}



/**
 * Initialize Google Adsense dynamic ads when the document is ready
 */
/*
function initAds() {
    'use strict';
    $(document).ready(function () {
        $('.adsbygoogle').filter(':visible').each(function () {
            var $container = $(this).parent();
            //if ($container.width() > 0 && $container.height() > 0) {
                (adsbygoogle = window.adsbygoogle || []).push({});
                console.log('Ads initialized');
            //}
        });
    });
}
*/


/**
 *
 */
function resizeSections() {
    'use strict';
    console.time(resizeSections.name + ' function executed');

    var height = $(window).height(), // $('body').prop('scrollHeight'), // window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight,
        navTop = $('.navbar-fixed-top').filter(':visible').height(),
        navBottom = $('#fullpage .tab-pane.active .navbar-fixed-bottom').filter(':visible').height(),
        paddingTop = $('.navbar-fixed-top').filter(':visible').outerHeight(true),
        paddingBottom = $('#fullpage .tab-pane.active .navbar-fixed-bottom').filter(':visible').outerHeight(true),
        offset = $('body').offset();

    $('body, .page, .section, .slide')
        .css('min-height', height);

    /*var maxHeight = height - paddingTop - paddingBottom;
    $('.responsive-ad-container').each(function (i, div) {
        var $div = $(div);
        if ($div.height() > maxHeight) {
            $div.css('height', maxHeight);
        }
    });*/

    $('.slide-no-padding')
        .css('height', height);

    $('.slide-no-padding')
        .css('padding-top', navTop)
        .css('padding-bottom', navBottom);

    $('.slide')
        .css('padding-top', paddingTop)
        .css('padding-bottom', paddingBottom);

    // height = height - parseInt($('body').css('padding-top'), 16) - parseInt($('body').css('padding-bottom'), 16);
    // $('.section, .slide').css('min-height', height);
    // $('.full-height').css('height', height);

    console.log('Section height adjusted > ' + height + 'px');
    console.log('Section padding adjusted > padding-top: ' + paddingTop + 'px, padding-bottom: ' + paddingBottom + 'px');
    console.log('Section without padding adjusted > padding-top: ' + navTop + 'px, padding-bottom: ' + navBottom + 'px');
    if (offset.top !== 0 || offset.left !== 0) {
        console.warn('Body offset negative values > top: ' + offset.top + 'px, left: ' + offset.left + 'px'); /* RemoveLogging:skip */
    }
    console.timeEnd(resizeSections.name + ' function executed');

}



$(function () {
    'use strict';
    console.info('$(function () {');
    initBlock('body');
});



// Translate site title / description
$(document).ready(function () {
    'use strict';
    console.info('$(document).ready(function ()');

    // Translated site title / description
    //$(document).attr('title', i18nextInstance.t('app.title'));
    //$(document).attr('description', i18nextInstance.t('app.description'));

    $(window).resize(function () {

        // Adapt current section height
        resizeSections();

        $('#main-menu').find('a[data-toggle="tab"]').one('shown.bs.tab', function (e) {

            var paneId = $(e.target).attr('href');

            // Adapt section height in next displayed pane
            resizeSections();

            // Change body class depending on selected tab
            var bodyClass = paneId.replace('#', '');
            $('section').removeClass().addClass(bodyClass);
            console.log('Body class changed to ' + bodyClass);

        });


    }).trigger('resize');

    var $el = $('.navbar-fixed-top, .navbar-fixed-bottom');
    $el.resize(function () {
        resizeSections();
    });

});

// Once all html is ready
$(window).on('load', function () {
    'use strict';
    console.info('$(window).on(\'load\')');

    console.time('onepage_scroll plugin initialized');
    // $('.tab-pane').onepage_scroll(options.onepageScroll);
    console.timeEnd('onepage_scroll plugin initialized');

    // Restore cookies
    // restoreCookies();

    // Delete cookies button
    $('.delete-cookies').on('click', function (e) {
        e.preventDefault();
        deleteCookies();
    });

    // Secondary fixed navbar
    /*$('.navbar-fixed-top + .navbar').affix({
      offset: {top: 50}
    });*/

    // Adjust modal size
    $('.modal-wide').on('show.bs.modal', function () {
        // var height = $(window).height();
        // $(this).find('.modal-body').css('max-height', height - 200);
    });

    // Toggle accordion chevron
    $('.panel-group').on('shown.bs.collapse hidden.bs.collapse', function (e) {
        console.time('Show .panel-group');
        $(e.target)
            .prev('.panel-heading')
            .find('i.indicator')
            .toggleClass('glyphicon-chevron-down glyphicon-chevron-up');
        console.timeEnd('Show .panel-group');
    });

    // Stop propagation
    $('.dropdown-menu').find('form').click(function (e) {
        e.stopPropagation();
    });

    // $('.navbar-fixed-top').addClass('navbar-transparent');
    $(window).scroll(function () {
        var top = $(document).scrollTop();
        $('.background-image').css({'background-position': '0px -' + (top/3).toFixed(2) + 'px'});
        /*if (top > 50) {
            $('.navbar-fixed-top').removeClass('navbar-transparent');
        } else {
            $('.navbar-fixed-top').addClass('navbar-transparent');
        }*/
    });

    // Initialize visible Ads
    $('.responsive-advert-container').filter(':visible').each(function (i, container) {
        var $container = $(container);
        $container.html('<ins class="adsbygoogle" data-ad-client="ca-pub-8495719252049968" data-ad-slot="3723415549" data-ad-format="auto"></ins>');
        (adsbygoogle = window.adsbygoogle || []).push({});
        console.log('Ad initialized');
    });

    // Initialize other ads when a tab become visible for the first time
    $('a[data-toggle="tab"]').filter(':not(.active)').each(function (i, tab) {
        $(tab).one('shown.bs.tab', function (e) {
            var paneId = $(e.target).attr('href');
            var $pane = $(paneId);
            $pane.find('.responsive-advert-container').filter(':visible').each(function (i, container) {
                var $container = $(container);
                $container.html('<ins class="adsbygoogle" data-ad-client="ca-pub-8495719252049968" data-ad-slot="3723415549" data-ad-format="auto"></ins>');
                (adsbygoogle = window.adsbygoogle || []).push({});
                console.log('Ad initialized in ' + paneId + ' pane');
            });

            /*var ads = $pane.find('.fixed-ad-container ins');
            ads.each(function (i, ad) {
                var next = ads[i + 1];
                $(ad).scrollToFixed({
                    marginTop: $('.navbar-fixed-top').filter(':visible').outerHeight(true) + 10,
                    limit: function () {
                        var limit = 0;
                        if (next) {
                            limit = $(next).offset().top - $(this).outerHeight(true) - 10;
                        } else {
                            limit = $('.navbar-fixed-bottom').filter(':visible').offset().top - $(this).outerHeight(true) - 10;
                        }
                        return limit;
                    },
                    zIndex: 999
                });
            });*/

        });
    });

    /*$(document).on('scroll', function () {
        $('.fixed-ad-container').filter(':visible').each(function (i, container) {
            var $container = $(container);
            var $ins = $container.find('ins').first();
            var height = $(window).height();
            var scrollTop = $(document).scrollTop();
            var navTop = $('.navbar-fixed-top').filter(':visible').height();
            var navBottom = $('.navbar-fixed-bottom').filter(':visible').height();
            ins.css('top': Math.max((height - navTop), scrollTop) + 'px')
            //ins.css('bottom': Math.max((height - navBottom), ins.bottom()) + 'px')
        });
    });*/


    // Auto-save / restore forms (with id) from cookies
    /*$('form[id].sayt').each(function () {
        var $el = $(this);
        // var $el = $('form[id]');
        // if ($el.attr('id')) {
        $el.sayt(options.sayt);
        $el.find(':input').trigger('change');
        $el.bootstrapValidator('validate'); // formValidation
        console.log('#' + $el.attr('id') + ' restored from cookies and validated');
        // $el.find(':input').trigger('change');
        // }
    });*/

    // $('#profile_form').filter(':input').trigger('change');
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
        // + '.ui-widget-content {'
        // + 'background-color:' + $('body').css('background-color') + ';'
        // + 'background-image:' + $('body').css('background-image') + ';'
        // + 'background-repeat:' + $('body').css('background-repeat') + ';'
        // + 'background-position:' + $('body').css('background-position') + ';'
        // + '}'
        // + '.ui-widget-overlay {'
        // + 'background-color:' + $('body').css('background-color') + ';'
        // + 'opacity: .5;'
        // + '}'
        // + '.sortable_priorities {'
        // + 'border-color:' + $('.btn-primary').css('background-color') + ';'
        // + '}'
        + '</style>'
    );

    // Google Adsense
    // initAds();
    // (adsbygoogle = window.adsbygoogle || []).push({});

    // Activate default tabs
    // $('.nav .active').tab('show');

    // Global logs
    /*
    $('.ui-sortable').on('sortactivate sortbeforeStop sortchange sortcreate sortdeactivate sortout sortover sortreceive sortremove sort sortstart sortstop sortupdate', function (event) { // event, ui
        console.log('#' + $(this).attr('id') + ' event ' + event.type + '(' + $(this).sortable('toArray').length + ')');
    });
    $(':input').on('change', function () {
        console.log('Input #' + $(this).attr('id') + '=' + $(this).val());
    });
    $(':input').on('chosen:updated', function () {
        console.log('Chosen input #' + $(this).attr('id') + '=' + $(this).val());
    });
    $('#disabled_priorities, #faq_list').on('mixLoad mixStart mixEnd mixFail mixBusy', function (event, state) { // event, state
        console.log('mixItUp ' + event.type + ': ' + state.totalShow + ' elements match the current filter');
    });
    $(':checkbox').on('switchChange.bootstrapSwitch', function () { // event, state
        console.log('bootstrapSwitch #' + $(this).attr('id') + '=' + this.checked);
    });
    */
    /*$(':checkbox').on('click', function (event) {
      console.log('checkbox ' + ($(this).attr('id') || '') + ' checked=' + this.checked);
    });*/

});

console.timeEnd('app.js script loaded');
