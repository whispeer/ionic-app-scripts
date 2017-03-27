"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var CompilerCLI = require("@angular/compiler-cli");
function isAngular22() {
    if (CompilerCLI.NodeReflectorHostContext) {
        return true;
    }
    return false;
}
exports.isAngular22 = isAngular22;
function runCodegen(options) {
    var NodeReflectorHostContextConstructor = CompilerCLI.NodeReflectorHostContext;
    var instance = new NodeReflectorHostContextConstructor(options.compilerHost);
    var codeGenerator = CompilerCLI.CodeGenerator.create(options.angularCompilerOptions, options.cliOptions, options.program, options.compilerHost, instance);
    // angular 2.2 api to codegen
    return codeGenerator.codegen({ transitiveModules: true });
}
exports.runCodegen = runCodegen;
