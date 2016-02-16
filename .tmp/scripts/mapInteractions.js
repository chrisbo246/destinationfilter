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
    ol,
    deferred: true,
    map: true
*/

'use strict';

var mapInteractionsModule = (function () {
    'use strict';

    console.time('Map interactions initialized');

    /**
     *
     * See See http://openlayers.org/en/v3.4.0/examples/select-features.html
     */

    var select, selectSingleClick, selectClick, selectPointerMove, selectElement;

    select = null; // ref to currently selected interaction

    // select interaction working on "singleclick"
    selectSingleClick = new ol.interaction.Select();

    // select interaction working on "click"
    selectClick = new ol.interaction.Select({
        condition: ol.events.condition.click
    });

    // select interaction working on "pointermove"
    selectPointerMove = new ol.interaction.Select({
        condition: ol.events.condition.pointerMove
    });

    // Functions _______________________________________________________________________________________

    /**
     * Change mouse interaction
     * See http://openlayers.org/en/v3.4.0/examples/select-features.html
     */

    var _changeInteraction = function _changeInteraction(map) {

        if (select !== null) {
            map.removeInteraction(select);
        }
        var value = selectElement.value;
        if (value === 'singleclick') {
            select = selectSingleClick;
        } else if (value === 'click') {
            select = selectClick;
        } else if (value === 'pointermove') {
            select = selectPointerMove;
        } else {
            select = null;
        }
        if (select !== null) {
            map.addInteraction(select);
            select.on('select', function (e) {
                if (e.selected) {
                    $('#status').html('&nbsp;' + e.target.getFeatures().getLength() + ' selected features (last operation selected ' + e.selected.length + ' and deselected ' + e.deselected.length + ' features)');
                }
            });
        }
    };

    // Events __________________________________________________________________________________________

    $(function () {

        // Country selection mode (click, double click)
        selectElement = document.getElementById('action_type');
        $.when(appModule.deferred.ready.map, appModule.deferred.load.mapSettings).done(function () {
            selectElement.onchange = _changeInteraction;
            _changeInteraction(map);
        });
    });

    var interactions = ol.interaction.defaults({}).extend([new ol.interaction.DragRotateAndZoom()]);

    return {
        interactions: interactions
    };

    // return mapModule;
})();

appModule.deferred.ready.mapInteractions.resolve();
console.timeEnd('Map interactions initialized');
//# sourceMappingURL=mapInteractions.js.map
