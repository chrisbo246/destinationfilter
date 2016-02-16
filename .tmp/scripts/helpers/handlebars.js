/*old-jslint indent: 2, unparam: true, plusplus: true */
/*
jslint
    devel: true,
    browser: true,
    node: false
*/
/*
global
    Handlebars: true,
    i18n: true
*/

/**
 *
 */

'use strict';

Handlebars.registerHelper('t', function (i18n_key) {
    var result = i18nextInstance.t(i18n_key);

    return new Handlebars.SafeString(result);
});

/**
 *
 */

Handlebars.registerHelper('tr', function (context, options) {
    var opts = i18n.functions.extend(options.hash, context);
    if (options.fn) opts.defaultValue = options.fn(context);

    var result = i18nextInstance.t(opts.key, opts);

    return new Handlebars.SafeString(result);
});

/**
 *
 */

Handlebars.registerHelper('math', function (lvalue, operator, rvalue) {
    'use strict';
    lvalue = ~ ~lvalue;
    rvalue = ~ ~rvalue;

    return ({
        '+': lvalue + rvalue,
        '-': lvalue - rvalue,
        '*': lvalue * rvalue,
        '/': lvalue / rvalue,
        '%': lvalue % rvalue
    })[operator];
});

/**
 *
 */

Handlebars.registerHelper('if-lt', function (a, b) {
    'use strict';
    var options = arguments[arguments.length - 1];
    if (a < b) {
        return options.fn(this);
    } else {
        return options.inverse(this);
    }
});

/**
 *
 */

Handlebars.registerHelper('if-gt', function (a, b) {
    'use strict';
    var options = arguments[arguments.length - 1];
    if (a > b) {
        return options.fn(this);
    } else {
        return options.inverse(this);
    }
});
//# sourceMappingURL=handlebars.js.map
