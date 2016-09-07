"use strict";
var assert = require('assert');
var copyTextApi = require('../copy-text');
var serverVars = require('server-vars');
var path = require('path');
describe('copyText', function () {
    var copyText;
    beforeEach(function () {
        copyText = copyTextApi();
    });
    describe('server-vars integration', function () {
        beforeEach(function () {
            serverVars.get = serverVars._api.buildLayer({
                test: {
                    nextLevel: {
                        copy: {
                            someKeyInSvCopy: 'next level copy'
                        }
                    },
                    copy: {
                        someKeyInSvCopy: 'foo bar foo'
                    }
                }
            });
        });
        it('should default to serverVars paths passed through addGlobalSVPath', function () {
            copyTextApi.addGlobalSVPath('test.copy');
            copyText = copyText.extend({'someKeyThatArrivedThroughExtend': 'bar foo baz'});
            assert.equal(copyText.get('someKeyInSvCopy'), 'foo bar foo');
            assert.equal(copyText.get('someKeyThatArrivedThroughExtend'), 'bar foo baz');
        });
        it('should prefer the last path added by addGlobalSVPath', function () {
            copyTextApi.addGlobalSVPath('test.nextLevel');
            assert.equal(copyText.get('copy.someKeyInSvCopy'), 'next level copy');
            copyTextApi.addGlobalSVPath('test');
            assert.equal(copyText.get('copy.someKeyInSvCopy'), 'foo bar foo');
        });
        it('should use the global registry for server vars paths and global copy', function () {
            var modpath = path.resolve(__dirname + "/../copy-text.js");
            copyTextApi.addGlobalCopy({copyKey: 'copyOnTheGlobalObject'});
            copyTextApi.addGlobalSVPath('test.copy');
            require.cache[modpath] = undefined;
            assert.equal(require('../')().get('copyKey'), 'copyOnTheGlobalObject');
            assert.equal(require('../')().get('someKeyInSvCopy'), 'foo bar foo');
        });
    });
    it('should prefer copy more recently added to the global object', function () {
        copyTextApi.addGlobalCopy({copyKey: 'copyAddedFirst'});
        copyText = copyTextApi();
        assert.equal(copyText.get('copyKey'), 'copyAddedFirst');
        copyTextApi.addGlobalCopy({copyKey: 'copyAddedSecond'});
        copyText = copyTextApi();
        assert.equal(copyText.get('copyKey'), 'copyAddedSecond');
    });
    it('should prefer copy on the instance over the global object', function () {
        copyTextApi.addGlobalCopy({copyKey: 'copyOnTheGlobalObject'});
        copyText = copyTextApi();
        assert.equal(copyText.get('copyKey'), 'copyOnTheGlobalObject');
        copyText = copyText.extend({copyKey: 'copyOnTheInstance'});
        assert.equal(copyText.get('copyKey'), 'copyOnTheInstance');
    });
    describe('passthrough', function () {
        it('should use the key as the copy when there is no copy defined for the key', function () {
            assert.equal(copyText.get('use passthrough by default'), 'use passthrough by default');
        });
        it('should not use the key as the copy when options.passthrough is falsy', function () {
            assert.equal(copyText.get('use passthrough by default', {passthrough: false}), false);
        });
    });
    describe('template object', function () {
        it('should expose options.obj to the template as obj', function () {
            copyText = copyText.extend({fooBar: 'this <%= obj.thing %> is a template'});
            assert.equal(copyText.get('fooBar', {obj: {thing: 'template'}}), 'this template is a template');
        });
        it('should expose the get methos as obj._copy inside the copy template', function () {
            copyText = copyText.extend({
                somethingElse: 'middle',
                fooBar: "begin <%= obj._copy('somethingElse') %> end"
            });
            assert.equal(copyText.get('fooBar'), 'begin middle end');
        });
    });
    describe('extend', function () {
        it('should an extended copy of the original', function () {
            copyText = copyText.extend({foo: "hello"});
            assert.equal(copyText.get('foo'), 'hello');
            assert.equal(copyText.get('bar'), 'bar');
            copyText = copyText.extend({bar: "world"});
            assert.equal(copyText.get('foo'), 'hello');
            assert.equal(copyText.get('bar'), 'world');
        });
    });
});
