/*old-jslint indent: 2, unparam: true, plusplus: true */
/*jslint devel: true, browser: true, node: false */
/*global $ */
/*global */
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
var tour;
*/

console.time('stepsController.js script loaded');


//$('[data-anchor="steps"]').load('components/steps/stepsView.htm', function () {
$.get('components/steps/stepsView.mst.htm', function (source) {

    console.time('stepsView.htm view loaded');

    var i = 1;
    var viewData = {
        'steps': steps/*,
        'number': function () {
            return i++;
        }*/
    };
    
    Handlebars.registerHelper("math", function(lvalue, operator, rvalue, options) {
        lvalue = parseFloat(lvalue);
        rvalue = parseFloat(rvalue);
            
        return {
            "+": lvalue + rvalue,
            "-": lvalue - rvalue,
            "*": lvalue * rvalue,
            "/": lvalue / rvalue,
            "%": lvalue % rvalue
        }[operator];
    });

    var template = Handlebars.compile(source);
    $('[data-anchor="steps"]').append(template(viewData));

    console.timeEnd('stepsView.htm view loaded');

});

console.timeEnd('stepsController.js script loaded');