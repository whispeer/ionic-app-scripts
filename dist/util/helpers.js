"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var crypto_1 = require("crypto");
var path_1 = require("path");
var fs_extra_1 = require("fs-extra");
var osName = require("os-name");
var Constants = require("./constants");
var logger_1 = require("../logger/logger");
var _context;
var _parsedDeepLinkConfig;
var cachedAppScriptsPackageJson;
function getAppScriptsPackageJson() {
    if (!cachedAppScriptsPackageJson) {
        try {
            cachedAppScriptsPackageJson = fs_extra_1.readJsonSync(path_1.join(__dirname, '..', '..', 'package.json'));
        }
        catch (e) { }
    }
    return cachedAppScriptsPackageJson;
}
exports.getAppScriptsPackageJson = getAppScriptsPackageJson;
function getAppScriptsVersion() {
    var appScriptsPackageJson = getAppScriptsPackageJson();
    return (appScriptsPackageJson && appScriptsPackageJson.version) ? appScriptsPackageJson.version : '';
}
exports.getAppScriptsVersion = getAppScriptsVersion;
function getUserPackageJson(userRootDir) {
    try {
        return fs_extra_1.readJsonSync(path_1.join(userRootDir, 'package.json'));
    }
    catch (e) { }
    return null;
}
function getSystemInfo(userRootDir) {
    var d = [];
    var ionicAppScripts = getAppScriptsVersion();
    var ionicFramework = null;
    var ionicNative = null;
    var angularCore = null;
    var angularCompilerCli = null;
    try {
        var userPackageJson = getUserPackageJson(userRootDir);
        if (userPackageJson) {
            var userDependencies = userPackageJson.dependencies;
            if (userDependencies) {
                ionicFramework = userDependencies['ionic-angular'];
                ionicNative = userDependencies['ionic-native'];
                angularCore = userDependencies['@angular/core'];
                angularCompilerCli = userDependencies['@angular/compiler-cli'];
            }
        }
    }
    catch (e) { }
    d.push("Ionic Framework: " + ionicFramework);
    if (ionicNative) {
        d.push("Ionic Native: " + ionicNative);
    }
    d.push("Ionic App Scripts: " + ionicAppScripts);
    d.push("Angular Core: " + angularCore);
    d.push("Angular Compiler CLI: " + angularCompilerCli);
    d.push("Node: " + process.version.replace('v', ''));
    d.push("OS Platform: " + osName());
    return d;
}
exports.getSystemInfo = getSystemInfo;
function splitLineBreaks(sourceText) {
    if (!sourceText)
        return [];
    sourceText = sourceText.replace(/\\r/g, '\n');
    return sourceText.split('\n');
}
exports.splitLineBreaks = splitLineBreaks;
exports.objectAssign = (Object.assign) ? Object.assign : function (target, source) {
    var output = Object(target);
    for (var index = 1; index < arguments.length; index++) {
        source = arguments[index];
        if (source !== undefined && source !== null) {
            for (var key in source) {
                if (source.hasOwnProperty(key)) {
                    output[key] = source[key];
                }
            }
        }
    }
    return output;
};
function titleCase(str) {
    return str.charAt(0).toUpperCase() + str.substr(1);
}
exports.titleCase = titleCase;
function writeFileAsync(filePath, content) {
    return new Promise(function (resolve, reject) {
        fs_extra_1.writeFile(filePath, content, function (err) {
            if (err) {
                return reject(err);
            }
            return resolve();
        });
    });
}
exports.writeFileAsync = writeFileAsync;
function readFileAsync(filePath) {
    return new Promise(function (resolve, reject) {
        fs_extra_1.readFile(filePath, 'utf-8', function (err, buffer) {
            if (err) {
                return reject(err);
            }
            return resolve(buffer);
        });
    });
}
exports.readFileAsync = readFileAsync;
function readAndCacheFile(filePath, purge) {
    if (purge === void 0) { purge = false; }
    var file = _context.fileCache.get(filePath);
    if (file && !purge) {
        return Promise.resolve(file.content);
    }
    return readFileAsync(filePath).then(function (fileContent) {
        _context.fileCache.set(filePath, { path: filePath, content: fileContent });
        return fileContent;
    });
}
exports.readAndCacheFile = readAndCacheFile;
function unlinkAsync(filePath) {
    var filePaths;
    if (typeof filePath === 'string') {
        filePaths = [filePath];
    }
    else if (Array.isArray(filePath)) {
        filePaths = filePath;
    }
    else {
        return Promise.reject('unlinkAsync, invalid filePath type');
    }
    var promises = filePaths.map(function (filePath) {
        return new Promise(function (resolve, reject) {
            fs_extra_1.unlink(filePath, function (err) {
                if (err) {
                    return reject(err);
                }
                return resolve();
            });
        });
    });
    return Promise.all(promises);
}
exports.unlinkAsync = unlinkAsync;
function rimRafAsync(directoryPath) {
    return new Promise(function (resolve, reject) {
        fs_extra_1.remove(directoryPath, function (err) {
            if (err) {
                return reject(err);
            }
            return resolve();
        });
    });
}
exports.rimRafAsync = rimRafAsync;
function copyFileAsync(srcPath, destPath) {
    return new Promise(function (resolve, reject) {
        var writeStream = fs_extra_1.createWriteStream(destPath);
        writeStream.on('error', function (err) {
            reject(err);
        });
        writeStream.on('close', function () {
            resolve();
        });
        fs_extra_1.createReadStream(srcPath).pipe(writeStream);
    });
}
exports.copyFileAsync = copyFileAsync;
function mkDirpAsync(directoryPath) {
    return new Promise(function (resolve, reject) {
        fs_extra_1.ensureDir(directoryPath, function (err) {
            if (err) {
                return reject(err);
            }
            return resolve();
        });
    });
}
exports.mkDirpAsync = mkDirpAsync;
function readDirAsync(pathToDir) {
    return new Promise(function (resolve, reject) {
        fs_extra_1.readdir(pathToDir, function (err, fileNames) {
            if (err) {
                return reject(err);
            }
            resolve(fileNames);
        });
    });
}
exports.readDirAsync = readDirAsync;
function createFileObject(filePath) {
    var content = fs_extra_1.readFileSync(filePath).toString();
    return {
        content: content,
        path: filePath,
        timestamp: Date.now()
    };
}
exports.createFileObject = createFileObject;
function setContext(context) {
    _context = context;
}
exports.setContext = setContext;
function getContext() {
    return _context;
}
exports.getContext = getContext;
function setParsedDeepLinkConfig(parsedDeepLinkConfig) {
    _parsedDeepLinkConfig = parsedDeepLinkConfig;
}
exports.setParsedDeepLinkConfig = setParsedDeepLinkConfig;
function getParsedDeepLinkConfig() {
    return _parsedDeepLinkConfig;
}
exports.getParsedDeepLinkConfig = getParsedDeepLinkConfig;
function transformSrcPathToTmpPath(originalPath, context) {
    return originalPath.replace(context.srcDir, context.tmpDir);
}
exports.transformSrcPathToTmpPath = transformSrcPathToTmpPath;
function transformTmpPathToSrcPath(originalPath, context) {
    return originalPath.replace(context.tmpDir, context.srcDir);
}
exports.transformTmpPathToSrcPath = transformTmpPathToSrcPath;
function changeExtension(filePath, newExtension) {
    var dir = path_1.dirname(filePath);
    var extension = path_1.extname(filePath);
    var extensionlessfileName = path_1.basename(filePath, extension);
    var newFileName = extensionlessfileName + newExtension;
    return path_1.join(dir, newFileName);
}
exports.changeExtension = changeExtension;
function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}
exports.escapeHtml = escapeHtml;
function escapeStringForRegex(input) {
    return input.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
}
exports.escapeStringForRegex = escapeStringForRegex;
function rangeReplace(source, startIndex, endIndex, newContent) {
    return source.substring(0, startIndex) + newContent + source.substring(endIndex);
}
exports.rangeReplace = rangeReplace;
function stringSplice(source, startIndex, numToDelete, newContent) {
    return source.slice(0, startIndex) + newContent + source.slice(startIndex + Math.abs(numToDelete));
}
exports.stringSplice = stringSplice;
function toUnixPath(filePath) {
    return filePath.replace(/\\/g, '/');
}
exports.toUnixPath = toUnixPath;
function generateRandomHexString(numCharacters) {
    return crypto_1.randomBytes(Math.ceil(numCharacters / 2)).toString('hex').slice(0, numCharacters);
}
exports.generateRandomHexString = generateRandomHexString;
function getStringPropertyValue(propertyName) {
    var result = process.env[propertyName];
    return result;
}
exports.getStringPropertyValue = getStringPropertyValue;
function getIntPropertyValue(propertyName) {
    var result = process.env[propertyName];
    return parseInt(result, 0);
}
exports.getIntPropertyValue = getIntPropertyValue;
function getBooleanPropertyValue(propertyName) {
    var result = process.env[propertyName];
    return result === 'true';
}
exports.getBooleanPropertyValue = getBooleanPropertyValue;
function convertFilePathToNgFactoryPath(filePath) {
    var directory = path_1.dirname(filePath);
    var extension = path_1.extname(filePath);
    var extensionlessFileName = path_1.basename(filePath, extension);
    var ngFactoryFileName = extensionlessFileName + '.ngfactory' + extension;
    return path_1.join(directory, ngFactoryFileName);
}
exports.convertFilePathToNgFactoryPath = convertFilePathToNgFactoryPath;
function printDependencyMap(map) {
    map.forEach(function (dependencySet, filePath) {
        logger_1.Logger.unformattedDebug('\n\n');
        logger_1.Logger.unformattedDebug(filePath + " is imported by the following files:");
        dependencySet.forEach(function (importeePath) {
            logger_1.Logger.unformattedDebug("   " + importeePath);
        });
    });
}
exports.printDependencyMap = printDependencyMap;
function webpackStatsToDependencyMap(context, stats) {
    var statsObj = stats.toJson({
        source: false,
        timings: false,
        version: false,
        errorDetails: false,
        chunks: false,
        chunkModules: false
    });
    return processStatsImpl(statsObj);
}
exports.webpackStatsToDependencyMap = webpackStatsToDependencyMap;
function processStatsImpl(webpackStats) {
    var dependencyMap = new Map();
    if (webpackStats && webpackStats.modules) {
        webpackStats.modules.forEach(function (webpackModule) {
            var moduleId = purgeWebpackPrefixFromPath(webpackModule.identifier);
            var dependencySet = new Set();
            webpackModule.reasons.forEach(function (webpackDependency) {
                var depId = purgeWebpackPrefixFromPath(webpackDependency.moduleIdentifier);
                dependencySet.add(depId);
            });
            dependencyMap.set(moduleId, dependencySet);
        });
    }
    return dependencyMap;
}
exports.processStatsImpl = processStatsImpl;
function purgeWebpackPrefixFromPath(filePath) {
    return filePath.replace(process.env[Constants.ENV_OPTIMIZATION_LOADER], '').replace(process.env[Constants.ENV_WEBPACK_LOADER], '').replace('!', '');
}
exports.purgeWebpackPrefixFromPath = purgeWebpackPrefixFromPath;
function replaceAll(input, toReplace, replacement) {
    if (!replacement) {
        replacement = '';
    }
    return input.split(toReplace).join(replacement);
}
exports.replaceAll = replaceAll;
function ensureSuffix(input, suffix) {
    if (!input.endsWith(suffix)) {
        input += suffix;
    }
    return input;
}
exports.ensureSuffix = ensureSuffix;
function removeSuffix(input, suffix) {
    if (input.endsWith(suffix)) {
        input = input.substring(0, input.length - suffix.length);
    }
    return input;
}
exports.removeSuffix = removeSuffix;
function buildErrorToJson(buildError) {
    return {
        message: buildError.message,
        name: buildError.name,
        stack: buildError.stack,
        hasBeenLogged: buildError.hasBeenLogged,
        isFatal: buildError.isFatal
    };
}
exports.buildErrorToJson = buildErrorToJson;
