"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var logger_1 = require("../logger/logger");
var Constants = require("../util/constants");
function purgeDecorators(filePath, fileContent) {
    return purgeIndexDecorator(filePath, fileContent);
}
exports.purgeDecorators = purgeDecorators;
function purgeIndexDecorator(filePath, fileContent) {
    if (process.env[Constants.ENV_VAR_IONIC_ANGULAR_ENTRY_POINT] === filePath) {
        logger_1.Logger.debug("Purging index file decorator for " + filePath);
        var DECORATORS_REGEX = getDecoratorRegex();
        var matches = DECORATORS_REGEX.exec(fileContent);
        if (matches && matches.length) {
            return fileContent.replace(matches[0], "/*" + matches[0] + "*/");
        }
    }
    return fileContent;
}
exports.purgeIndexDecorator = purgeIndexDecorator;
function getDecoratorRegex() {
    return /IonicModule.decorators.=[\s\S\n]*?([\s\S\n]*?)];/igm;
}
exports.getDecoratorRegex = getDecoratorRegex;
