"use strict";
var serverVars = require('bunsen/helpers/serverVars');
var _ = require('underscore');
var baseCopy = _.extend(
    {},
    serverVars.get('mc.copy')
    // add more objects that might have copy in them here
);
var CopyText = function (options) {
    options = _.extend({
        copy: {}
    }, options);
    this._copy = options.copy;
    return this;
};
CopyText.prototype = {
    get: function (copyKey) {
        return this._copy[copyKey];
    },
    object: function () {
        return this._copy;
    },
    extend: function (morecopy) {
        return new CopyText({copy: _.extend({}, this._copy, morecopy)});
    }
};

module.exports = new CopyText({copy: baseCopy});
