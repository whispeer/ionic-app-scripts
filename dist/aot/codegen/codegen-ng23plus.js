"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var CompilerCLI = require("@angular/compiler-cli");
function isAngular23Plus() {
    if (CompilerCLI.NodeCompilerHostContext) {
        return true;
    }
    return false;
}
exports.isAngular23Plus = isAngular23Plus;
function runCodegen(options) {
    var NodeCompilerHostContext = CompilerCLI.NodeCompilerHostContext;
    var instance = new NodeCompilerHostContext();
    var codeGenerator = CompilerCLI.CodeGenerator.create(options.angularCompilerOptions, options.cliOptions, options.program, options.compilerHost, instance);
    // angular 2.3+ api for codegen does not take any options
    return codeGenerator.codegen();
}
exports.runCodegen = runCodegen;
