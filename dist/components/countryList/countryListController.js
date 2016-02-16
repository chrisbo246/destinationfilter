/*old-jslint indent: 2, unparam: true, plusplus: true */
/*jslint devel: true, browser: true, node: false */
/*global $, Handlebars, setMapSelection, triggerRegionClick, updateMapRegion, drawMap */
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
var countriesDatas,
  currenciesDatas,
  countriesDatas,
  userDatas;
*/

console.time('countriesController.js script loaded');

$.extend(true, options, {

    resultLimit: 100

});


/**
 * Display matching country list
 *
 * @params { array } datas
 */

function drawCountryList() {

    console.time(drawCountryList.name + ' function executed');

    var sorted,
        countryDatas,
        data,
        region,
        row,
        viewData = {},
        //tmpl,
        i = 0;


    // Create an array of ids/points sorted by points
    sorted = [];
    $.each(countriesDatas, function (cid, v) {
        sorted.push({
            id: cid,
            row: i,
            points: v.points
        });
        i = i + 1;
    });
    sorted.sort(function (x, y) {
        return y.points - x.points;
    });

    // Display sorted country list
    viewData.countries = [];
    $.each(sorted, function (i, v) {

        //if (countriesDatas[v.id].points > 0 && maxPoints
          //&& countriesDatas[v.id].maxPoints && countriesDatas[v.id].maxPoints > 0
        if (!options || !options.resultLimit || i < options.resultLimit) {

            countryDatas = countriesDatas[v.id];
            data = {};
            data.id = v.id;
            data.row = v.row;
            data.countryName = 'country.' + v.id.toUpperCase(); // $.t('country.' + v.id.toUpperCase()) //countryDatas.Country
            
            if (countryDatas.percent >= 0 && maxPoints) {
                data.percent = countryDatas.percent.toFixed();
                //console.log(countryDatas.points + ' / ' + countryDatas.maxPoints + ' * ' + 100 + ' = ' + country.percent);
            }

            // Check if no data where missing for score calcul, else display a warning icon
            if (countryDatas.matchingPriorities) { 
                $.each(countryDatas.matchingPriorities, function (i, matchingPriority) {
                               
                    if (matchingPriority.required && matchingPriority.required.length > 0) {
                        data.warning = true;
                    }
                    if (matchingPriority.missing) {
                        data.error = true;
                    }
                   
                });      
            }            

            viewData.countries.push(data);

        }
    });

    $.get('components/countryList/countryListView.mst.htm', function (source) {
        
        var $el,
        template;

        template = Handlebars.compile(source);
                
        // Delete previous results
        //$('[data-anchor="country_list"]').empty();
        
        $('[data-anchor="country_list"]').html(template(viewData));
          
          // Initialize jQuery plugins in this freshly generated block
          initBlock('[data-anchor="country_list"]');
          
        // Update result limit when user change a setting
        $el = $('#result_limit');
        $el.on('change', function () {
            options.resultLimit = $el.val();
        });
        
    });

    console.timeEnd(drawCountryList.name + ' function executed');

}



// Validate user profile and redraw country list each time #home_pane pane become visible
$('.navbar').find('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
    var pane_id = $(e.target).attr('href');
    if (pane_id === '#home_pane') {
        updateScores();
        drawCountryList();
    }
});

updateScores();
drawCountryList();


// Copy to clipboard button
/*$('#copy-to-clipboard').zclip({
  afterCopy: function () {
    alert('The list of destinations has been saved in your clipboard and is ready to be pasted'
      + ' into a document.');
  },
  copy: function () {
    return $('#country_list_container').html()
      // Remove buttons and links
      //.replace(/<(button|a)\s+((?!<\/\1>)[\w\W])+<\/\1>/g, '')
      // Replace </h3></li></ul></div> end tags by line breaks
      .replace(/<\/(h[1-6]|li|ul|ol|div)>/g, '\n')
      // Replace ok icon by +
      .replace(/<span class="glyphicon glyphicon-ok">/g, '+')
      // Replace remove icon by -
      .replace(/<span class="glyphicon glyphicon-remove">/g, '-')
      // Remove all other tags
      .replace(/<((?!>)[\w\W])+>/g, '');
  },
  path: 'js/vendor/ZeroClipboard.swf'
});*/

console.timeEnd('countriesController.js script loaded');