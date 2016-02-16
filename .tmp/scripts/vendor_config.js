'use strict';

window.ParsleyConfig = {
    errorClass: 'has-error',
    successClass: 'has-success',
    classHandler: function classHandler(ParsleyField) {
        return ParsleyField.$element.parents('.form-group');
    },
    errorsContainer: function errorsContainer(ParsleyField) {
        return ParsleyField.$element.parents('.form-group');
    },
    errorsWrapper: '<span class="help-block">',
    errorTemplate: '<div></div>'
};
//# sourceMappingURL=vendor_config.js.map
