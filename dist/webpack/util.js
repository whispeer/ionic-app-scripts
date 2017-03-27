"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ContextElementDependency = require("webpack/lib/dependencies/ContextElementDependency");
function createResolveDependenciesFromContextMap(createContextMap) {
    return function (fs, resource, recursive, regExp, callback) {
        createContextMap(fs, function (err, map) {
            if (err) {
                return callback(err);
            }
            var dependencies = Object.keys(map)
                .map(function (key) { return new ContextElementDependency(map[key], key); });
            callback(null, dependencies);
        });
    };
}
exports.createResolveDependenciesFromContextMap = createResolveDependenciesFromContextMap;
