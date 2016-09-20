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
 
/**
 * Delete cookies
 */

var _deleteCookies = function () {
    'use strict';
    console.time('deleteCookies function executed');

    /*
    var cookies = $.cookie();
    for (var cookie in cookies) {
        $.removeCookie(cookie);
    }
    $.removeCookie('enabled_priorities');
    $.removeCookie('i18next');
    
    if (jQuery().sayt) {
        $('.sayt').filter('form[id]').each(function () {
            var $el = $(this);
            $el.sayt({ erase: true });
        });
    }

    // way.clear();
    
    window.location.reload(true);
    */

    swal({
        title: 'Are you sure?',
        text: 'This will reset settings, erase your priorities and delete local data stored by this application.',
        type: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#DD6B55',
        confirmButtonText: 'Yes reset all',
        cancelButtonText: 'No stop !',
        closeOnConfirm: false,
        closeOnCancel: false
    }, function (isConfirm) {
        if (isConfirm) {
            var cookies = document.cookie.split(';');
            cookies.forEach(function (cookie) {
                document.cookie = cookie.split('=')[0]
                        + '=; username=; expires=Thu, 01 Jan 1970 00:00:00 UTC';
            });
            localStorage.clear();
            location.reload();
            //navigator.geolocation.clearWatch();
        } else {
            swal('Cancelled', 'You can continue where you left off.', 'error');
        }
    });
    
    console.timeEnd('deleteCookies function executed');

}



/**
 * Resize sections according to viewport height when the window size change
 */
 
var resizeSections = function () {
    'use strict';
    console.time('resizeSections function executed');

    var $navbarTop = $('.navbar-fixed-top').filter(':visible');
    var $navbarBottom = $('.tab-pane.active .navbar-fixed-bottom').filter(':visible');
    
    var height = $(window).height(), // $('body').prop('scrollHeight'), // window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight,
        navTop = $navbarTop.height() || 0,
        navBottom = $navbarBottom.height() || 0,
        paddingTop = $navbarTop.outerHeight(true) || 0,
        paddingBottom = $navbarBottom.filter(':visible').outerHeight(true) || 0,
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
    console.timeEnd('resizeSections function executed');

}


// Load JSON data

console.time('Load currencies.json');
$.getJSON('data/json/currencies.json', function (json) {
    currenciesData = json;
    deferred.getJSON.currenciesData.resolve();
    console.timeEnd('Load currencies.json');
});

console.time('Load countries.json');
$.getJSON('data/json/countries.json', function (json) {
    countriesData = json;
    
    // Build an array allowing ISO3 to ISO2 country codes conversion
    $.each(countriesData, function (id, country) {
        if (country.ISO3 && country.ISO) {
            countryCodesISO2[country.shapeId] = country.ISO;
            // countryCodesISO2[country.ISO3] = country.ISO;
        }
    });
    deferred.getJSON.countriesData.resolve();
    console.timeEnd('Load countries.json');
});
 
// i18next translation
console.time('i18next plugin initialization');
var i18nextInstance = i18next.createInstance();

i18nextInstance.on('initialized', function(options) {console.info('i18next initialized');})
i18nextInstance.on('loaded', function(loaded) {console.info('i18next loaded');})
i18nextInstance.on('failedLoading', function(lng, ns, msg) {console.warn(msg+' language:'+lng+' ns:'+ns);})

i18nextInstance.init(options.i18next, (err, t) => {
        deferred.init.i18next.resolve();
        
        // Initialize content translation via HTML attributs
        i18nextJquery.init(i18nextInstance, $);
        
        console.timeEnd('i18next plugin initialization');
    });



var $el = $('#setLng');
$el.val(i18nextInstance.language);
$el.on('change', function () {
    i18nextInstance.language = $el.val();
});
    
// When HTML is loaded (except images) and DOM is ready
$(function () {
    'use strict';
    console.info('HTML loaded (except images) and DOM is ready');
    
    // Translate the site title, description and plugin options
    $.when(deferred.init.i18next).done(function () {
        console.time('Translate site title and various strings');
        
        $(document).attr('title', i18nextInstance.t('app.title'));
        $(document).attr('description',i18nextInstance.t('app.description'));
        
        options.chosen.no_results_text = i18nextInstance.t('strings.chosenNoResultsText');
        
        console.timeEnd('Translate site title and various strings');
    });

    // Initialize various plugins for the whole document
    initBlock('body');

    // Delete cookies button event
    $('.delete-cookies').on('click', function (e) {
        console.time('delete-cookies button clicked');
        e.preventDefault();
        _deleteCookies();
    });
    /*$('#reset_settings').click(function () {
        $('#settings form').garlic('destroy');
        location.reload();
    });*/
    
    // Adapt sections height when the window size change
    $(window).resize(function () {
        resizeSections();
    }).trigger('resize');

    // When a tab is shown for the first time...
    $('#main-menu').find('a[data-toggle="tab"]').one('shown.bs.tab', function (e) {

        // Adjust sections height in next displayed pane
        resizeSections();

        // Change section class depending on selected tab (for background-image)
        var paneId = $(e.target).attr('href');
        var bodyClass = paneId.replace('#', '');
        $('section').removeClass().addClass(bodyClass);
        console.log('Body class changed to ' + bodyClass);

    });
        
    // Adjust sections height if navbar height change
    var $el = $('.navbar-fixed-top, .navbar-fixed-bottom');
    $el.resize(function () {
        resizeSections();
    });
    
    // Toggle chevrons when user open a panel
    $('.panel-group').on('shown.bs.collapse hidden.bs.collapse', function (e) {
        console.time('Show .panel-group');
        $(e.target)
            .prev('.panel-heading')
            .find('.indicator')
            .toggleClass('glyphicon-chevron-down glyphicon-chevron-up');
        console.timeEnd('Show .panel-group');
    });

    // Stop propagation
    $('.dropdown-menu').find('form').on('click', function (e) {
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

    

    /*console.time('onepage_scroll plugin initialized');
    $('.tab-pane').onepage_scroll(options.onepageScroll);
    console.timeEnd('onepage_scroll plugin initialized');*/

    // Secondary fixed navbar
    /*$('.navbar-fixed-top + .navbar').affix({
      offset: {top: 50}
    });*/
    
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

    // $('#profile_form').find(':input').trigger('change');
    /*if($('#profile_form').sayt({'checksaveexists': true}) === true) {
      console.log('Profile form has an existing save cookie.');
    }*/

    // Adapt some colors to Bootstrap theme
    /*$('head').append(
        '<style>'
        + '.ui-state-default {'
        + 'background-color:' + $('.btn-default.disabled').css('background-color') + ';'
        + 'color:' + $('.btn-default.disabled').css('color') + ';'
        + '}'
        + '.ui-state-primary {'
        + 'background-color:' + $('.btn-primary.disabled').css('background-color') + ';'
        + 'color:' + $('.btn-primary.disabled').css('color') + ';'
        + '}'
        + '.ui-state-default {'
        + 'background-color:' + $('.well').css('background-color') + ';'
        + 'color:' + $('.well').css('color') + ';'
        + '}'
        + '.ui-state-highlight {'
        + 'background-color:' + $('.btn-primary').css('background-color') + ';'
        + 'color:' + $('.btn-primary').css('color') + ';'
        + '}'
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
    );*/
    
    // Activate default tabs
    // $('.nav .active').tab('show');
    

    //$._data($('#test2'), 'events');
    var el = $(':input');
    //el.on(getAllEvents(el[0]).replace(/mouse(enter|leave|over|out|move)\s*/, ''), function (e) {
    el.on('input change chosen:updated chosen:maxselected', function (e) {
        var $this = $(this);
        var strings = [];
        strings.push('"' + e.type + '" event fired on ' + $this.prop('tagName') + ' element');
        if ($this.attr('type')) {strings.push('type=' + $this.attr('type'));}
        if ($this.attr('id')) {strings.push('id=' + $this.attr('id'));}
        if ($this.attr('name')) {strings.push('name=' + $this.attr('name'));}        
        if (e.type === 'input' || e.type === 'change') {
            strings.push('value=' + $this.val());
            if ($this.attr('type') === 'checkbox' || $this.attr('type') === 'radio') {strings.push('checked=' + this.checked);}
        }
        console.log(strings.join(' '));
    });

    // Global logs
    //var el = $('.ui-sortable');
    //el.on(getAllEvents(el[0]).replace(/\b(?!sort)\S+\s*/, ''), function (event, state) {
    $('.ui-sortable').on('sortactivate sortbeforeStop sortchange sortcreate sortdeactivate sortout sortover sortreceive sortremove sort sortstart sortstop sortupdate', function (event) { // event, ui
        console.log('#' + $(this).attr('id') + ' event ' + event.type + '(' + $(this).sortable('toArray').length + ')');
    });
    //$(':input').on('input change', function (e) {
    //    console.log('Input ' + e.type + ' #' + $(this).attr('id') + '=' + $(this).val());
    //});
    $('[way-data]').on('input change', function (e) {
        console.log('[way-data] ' + e.type + ' #' + $(this).attr('id') + '=' + $(this).val());
    });
    //$(':input').on('chosen:updated', function () {
    //    console.log('Chosen input #' + $(this).attr('id') + '=' + $(this).val());
    //});
    
    //var el = $('#disabled_priorities, #faq_list');
    //el.on(getAllEvents(el[0]).replace(/\b(?!mix)\S+\s*/, ''), function (event, state) {
    $('#disabled_priorities, #faq_list').on('mixLoad mixStart mixEnd mixFail mixBusy', function (event, state) { // event, state
        console.log('mixItUp ' + event.type + ': ' + state.totalShow + ' elements match the current filter');
    });
    $(':checkbox').on('switchChange.bootstrapSwitch', function () { // event, state
        console.log('bootstrapSwitch #' + $(this).attr('id') + '=' + this.checked);
    });
    //$(':checkbox').on('click', function (event) {
    //  console.log('checkbox ' + ($(this).attr('id') || '') + ' checked=' + this.checked);
    //});
    $('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
        var pane_id = $(e.target).attr('href');
        console.log(pane_id + ' tab shown');
    });
    
    
    /*
    var db = new PouchDB('destinationfilter');

    db.put({
      _id: 'dave@gmail.com',
      name: 'David',
      age: 68
    });

    db.changes().on('change', function () {
      console.log('Ch-Ch-Changes');
    });

    db.replicate.to('http://example.com/mydb');
    */
    
    /*$.rdbHostConfig({
        userName: 's0000001629',
        errback: function (errcode, errmsg) {
            alert( errcode.toString() + ' ' + errmsg );
        }
    });*/
     
    /*var p = $.postData({
        q:        'SELECT * FROM personnel WHERE id = %s',
        args:     [ 10 ],
        callback: function (r){ alert(JSON.stringify(r)); }
    });*/
    
    /*var p = $.postData({
        q:            'SELECT * FROM personnel WHERE id = %(empId)',
        kw:           'getPerson',
        namedParams:  {empId: 10},
    });
    
    p.done(function (r){
        console.log(JSON.stringify(r));
    });
     
    p.fail(function (errArray) {
        var errCode = errArray[0];
        if ( errCode === '42P01' ) { // table does not exist
            $.superPostData({
                q: 'CREATE TABLE personnel (id INTEGER, firstName TEXT, lastName TEXT);'
            });
        }
    });*/

    //$.postFormData($('#user_profile_form')).then(function (r) {
    //    console.log(JSON.stringify(r));
    //}, function (errArray) {
    //    console.warn(errArray[1]);
    //});
    
    
    
    


    
});



// When page is fully loaded, including frames, objects and images
$(window).on('load', function () {
    'use strict';

    console.info('Page is fully loaded, including frames, objects and images');
/*
    // Initialize visible Ads
    console.time('Google ads initialized');
    $('.responsive-advert-container').filter(':visible').each(function (i, container) {
        var $container = $(container);
        $container.html('<ins class="adsbygoogle" data-ad-client="ca-pub-8495719252049968" data-ad-slot="3723415549" data-ad-format="auto"></ins>');
        (adsbygoogle = window.adsbygoogle || []).push({});
        console.timeEnd('Google ads initialized');
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

        });
    });
*/
});



