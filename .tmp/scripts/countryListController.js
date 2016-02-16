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
    updateScores,
    deferred: true,
    options: true,
    maxPoints: true
*/

'use strict';

var countryListModule = (function () {
    'use strict';

    var options = {

        resultLimit: 100

    };

    /**
     * Display matching country list
     *
     * @params { array } datas
     */

    var _drawCountryList = function _drawCountryList() {
        console.time('_drawCountryList function executed');

        var sorted,
            countryData,
            data,
            viewData = {},

        // tmpl,
        i = 0;

        $.when(appModule.countriesData).done(function () {
            console.log('- appModule.countriesData', appModule.countriesData);

            // Create an array of ids/points sorted by points
            sorted = [];
            $.each(appModule.countriesData, function (cid, v) {
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

                // if (appModule.countriesData[v.id].points > 0 && maxPoints
                // && appModule.countriesData[v.id].maxPoints && appModule.countriesData[v.id].maxPoints > 0
                if (!options || !options.resultLimit || i < options.resultLimit) {

                    countryData = appModule.countriesData[v.id];
                    console.log('appModule.countriesData[' + v.id + ']', countryData);
                    data = $.extend(true, {}, countryData, {
                        id: v.id,
                        //i18nId: countryData.ISO,
                        row: v.row,
                        flag: {
                            src: 'images/flags/' + countryData.codes.ISO3.toLowerCase() + '.svg'
                        }
                    });

                    // data.countryName = 'values.countries.' + v.id.toUpperCase(); // appModule.i18n.t('country.' + v.id.toUpperCase()) // countryData.Country

                    if (countryData.percent >= 0) {
                        //&& maxPoints
                        data.percent = countryData.percent.toFixed();
                    }

                    // Check if no data where missing for score calcul, else display a warning icon
                    if (countryData.matchingPriorities) {
                        $.each(countryData.matchingPriorities, function (i, matchingPriority) {

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

            $.get('templates/partials/countryListView.hbs', function (source) {

                var $el, template;

                template = Handlebars.compile(source);

                // Delete previous results
                // $('[data-anchor="country_list"]').empty();

                $('[data-anchor="country_list"]').html(template(viewData));

                // Initialize jQuery plugins in this freshly generated block
                appModule.initBlock('[data-anchor="country_list"]');

                // Update result limit when user change a setting
                $el = $('#result_limit');
                if ($el) {
                    $el.on('change', function () {
                        options.resultLimit = $el.val();
                    });
                }
            });

            console.timeEnd('_drawCountryList function executed');
        });
    };

    $(function () {

        $.when(appModule.countriesData, appModule.deferred.ready.userProfile, appModule.deferred.ready.priorities).done(function () {
            //, appModule.deferred.ready.appSettings

            scoreModule.updateScores();
            _drawCountryList();

            // Validate user profile and redraw country list each time #home_pane pane become visible
            $('.navbar').find('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
                var pane_id = $(e.target).attr('href');
                if (pane_id === '#home_pane') {
                    scoreModule.updateScores();
                    _drawCountryList();
                }
            });
        });

        // Copy to clipboard button
        /*$('#copy-to-clipboard').zclip({
          afterCopy: function () {
            alert('The list of destinations has been saved in your clipboard and is ready to be pasted'
              + ' into a document.');
          },
          copy: function () {
            return $('#country_list_container').html()
              // Remove buttons and links
              // .replace(/<(button|a)\s+((?!<\/\1>)[\w\W])+<\/\1>/g, '')
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
    });
})();
//# sourceMappingURL=countryListController.js.map
