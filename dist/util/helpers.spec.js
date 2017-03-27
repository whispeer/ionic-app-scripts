"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var errors_1 = require("./errors");
var helpers = require("./helpers");
var originalEnv = null;
describe('helpers', function () {
    beforeEach(function () {
        originalEnv = process.env;
        process.env = {};
    });
    afterEach(function () {
        process.env = originalEnv;
    });
    describe('getIntPropertyValue', function () {
        it('should return an int', function () {
            // arrange
            var propertyName = 'test';
            var propertyValue = '3000';
            process.env[propertyName] = propertyValue;
            // act
            var result = helpers.getIntPropertyValue(propertyName);
            // assert
            expect(result).toEqual(3000);
        });
        it('should round to an int', function () {
            // arrange
            var propertyName = 'test';
            var propertyValue = '3000.03';
            process.env[propertyName] = propertyValue;
            // act
            var result = helpers.getIntPropertyValue(propertyName);
            // assert
            expect(result).toEqual(3000);
        });
        it('should round to a NaN', function () {
            // arrange
            var propertyName = 'test';
            var propertyValue = 'tacos';
            process.env[propertyName] = propertyValue;
            // act
            var result = helpers.getIntPropertyValue(propertyName);
            // assert
            expect(result).toEqual(NaN);
        });
    });
    describe('getBooleanPropertyValue', function () {
        beforeEach(function () {
            originalEnv = process.env;
            process.env = {};
        });
        afterEach(function () {
            process.env = originalEnv;
        });
        it('should return true when value is "true"', function () {
            // arrange
            var propertyName = 'test';
            var propertyValue = 'true';
            process.env[propertyName] = propertyValue;
            // act
            var result = helpers.getBooleanPropertyValue(propertyName);
            // assert
            expect(result).toEqual(true);
        });
        it('should return false when value is undefined/null', function () {
            // arrange
            var propertyName = 'test';
            // act
            var result = helpers.getBooleanPropertyValue(propertyName);
            // assert
            expect(result).toEqual(false);
        });
        it('should return false when value is not "true"', function () {
            // arrange
            var propertyName = 'test';
            var propertyValue = 'taco';
            process.env[propertyName] = propertyValue;
            // act
            var result = helpers.getBooleanPropertyValue(propertyName);
            // assert
            expect(result).toEqual(false);
        });
    });
    describe('processStatsImpl', function () {
        it('should convert object graph to known module map', function () {
            // arrange
            var moduleOne = '/Users/noone/myModuleOne.js';
            var moduleTwo = '/Users/noone/myModuleTwo.js';
            var moduleThree = '/Users/noone/myModuleThree.js';
            var moduleFour = '/Users/noone/myModuleFour.js';
            var objectGraph = {
                modules: [
                    {
                        identifier: moduleOne,
                        reasons: [
                            {
                                moduleIdentifier: moduleTwo
                            },
                            {
                                moduleIdentifier: moduleThree
                            }
                        ]
                    },
                    {
                        identifier: moduleTwo,
                        reasons: [
                            {
                                moduleIdentifier: moduleThree
                            }
                        ]
                    },
                    {
                        identifier: moduleThree,
                        reasons: [
                            {
                                moduleIdentifier: moduleOne
                            }
                        ]
                    },
                    {
                        identifier: moduleFour,
                        reasons: []
                    }
                ]
            };
            // act
            var result = helpers.processStatsImpl(objectGraph);
            // assert
            var setOne = result.get(moduleOne);
            expect(setOne.has(moduleTwo)).toBeTruthy();
            expect(setOne.has(moduleThree)).toBeTruthy();
            var setTwo = result.get(moduleTwo);
            expect(setTwo.has(moduleThree)).toBeTruthy();
            var setThree = result.get(moduleThree);
            expect(setThree.has(moduleOne)).toBeTruthy();
            var setFour = result.get(moduleFour);
            expect(setFour.size).toEqual(0);
        });
    });
    describe('ensureSuffix', function () {
        it('should not include the suffix of a string that already has the suffix', function () {
            expect(helpers.ensureSuffix('dan dan the sunshine man', ' man')).toEqual('dan dan the sunshine man');
        });
        it('should ensure the suffix of a string without the suffix', function () {
            expect(helpers.ensureSuffix('dan dan the sunshine', ' man')).toEqual('dan dan the sunshine man');
        });
    });
    describe('removeSuffix', function () {
        it('should remove the suffix of a string that has the suffix', function () {
            expect(helpers.removeSuffix('dan dan the sunshine man', ' man')).toEqual('dan dan the sunshine');
        });
        it('should do nothing if the string does not have the suffix', function () {
            expect(helpers.removeSuffix('dan dan the sunshine man', ' woman')).toEqual('dan dan the sunshine man');
        });
    });
    describe('replaceAll', function () {
        it('should replace a variable', function () {
            expect(helpers.replaceAll('hello $VAR world', '$VAR', 'my')).toEqual('hello my world');
        });
        it('should replace a variable with newlines', function () {
            expect(helpers.replaceAll('hello\n $VARMORETEXT\n world', '$VAR', 'NO')).toEqual('hello\n NOMORETEXT\n world');
        });
        it('should replace a variable and handle undefined', function () {
            expect(helpers.replaceAll('hello $VAR world', '$VAR', undefined)).toEqual('hello  world');
        });
    });
    describe('buildErrorToJson', function () {
        it('should return a pojo', function () {
            var buildError = new errors_1.BuildError('message1');
            buildError.name = 'name1';
            buildError.stack = 'stack1';
            buildError.isFatal = true;
            buildError.hasBeenLogged = false;
            var object = helpers.buildErrorToJson(buildError);
            expect(object.message).toEqual('message1');
            expect(object.name).toEqual(buildError.name);
            expect(object.stack).toEqual(buildError.stack);
            expect(object.isFatal).toEqual(buildError.isFatal);
            expect(object.hasBeenLogged).toEqual(buildError.hasBeenLogged);
        });
    });
});
