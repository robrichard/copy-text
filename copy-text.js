"use strict";
var serverVars = require('server-vars');
var template = require('lodash.template');
var GLOBALCOPYKEY = '__COPYTEXT_GLOBAL_COPY__';
var SVPATHSKEY = '__COPYTEXT_SV_COPY_PATHS__';
var globalCopy = global[GLOBALCOPYKEY] = global[GLOBALCOPYKEY] || {};
var svCopyPaths = global[SVPATHSKEY] = global[SVPATHSKEY] || [];
var CopyText = function (options) {
    options = Object.assign({
        copy: {}
    }, options);
    this._copy = options.copy;
    return this;
};
CopyText.prototype = {
    get: function (copyKey, options) {
        var text;
        var templateVars;
        options = Object.assign({
            passthrough: true
        }, options);
        text = this._copy[copyKey] || globalCopy[copyKey];
        if (undefined === text) {
            text = svCopyPaths.reduceRight(function (text, keyPrefix) {
                return text || serverVars.get(keyPrefix + '.' + copyKey);
            }, text) || options.passthrough && copyKey;
        }
        if ('string' !== typeof text) {
            return false;
        }
        templateVars = Object.assign({}, options.obj, {
            _copy: this.get.bind(this)
        });
        text = template(text)(templateVars);
        return text;
    },
    object: function () {
        return this._copy;
    },
    extend: function (morecopy) {
        return new CopyText({copy: Object.assign({}, this._copy, morecopy)});
    }
};

module.exports = function () {
    return new CopyText();
};
module.exports.addGlobalSVPath = function (svCopyPath) {
    svCopyPaths.push(svCopyPath);
    return module.exports;
};
module.exports.addGlobalCopy = function (copyObj) {
    Object.assign(globalCopy, copyObj);
    return module.exports;
};
