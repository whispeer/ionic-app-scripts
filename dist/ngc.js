"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Constants = require("./util/constants");
var logger_1 = require("./logger/logger");
var config_1 = require("./util/config");
var aot_compiler_1 = require("./aot/aot-compiler");
function ngc(context, configFile) {
    var configFiles = config_1.getUserConfigFile(context, taskInfo, configFile);
    var logger = new logger_1.Logger('ngc');
    return Promise.all(configFiles.map(function (configPath) {
        return ngcWorker(context, configPath);
    })).then(function () {
        logger.finish();
    })
        .catch(function (err) {
        throw logger.fail(err);
    });
}
exports.ngc = ngc;
function ngcWorker(context, configFile) {
    var ngcConfig = config_1.fillConfigDefaults(configFile, taskInfo.defaultConfigFile);
    ngcConfig.rootDir = context.rootDir;
    ngcConfig.appNgModuleClass = process.env[Constants.ENV_APP_NG_MODULE_CLASS],
        ngcConfig.appNgModulePath = process.env[Constants.ENV_APP_NG_MODULE_PATH];
    var compiler = new aot_compiler_1.AotCompiler(context, ngcConfig);
    return compiler.compile();
}
exports.ngcWorker = ngcWorker;
var taskInfo = {
    fullArg: '--ngc',
    shortArg: '-n',
    envVar: 'IONIC_NGC',
    packageConfig: 'ionic_ngc',
    defaultConfigFile: 'ngc.config'
};
