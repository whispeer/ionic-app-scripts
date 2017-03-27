"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var codegen_ng22_1 = require("./codegen/codegen-ng22");
var codegen_ng23plus_1 = require("./codegen/codegen-ng23plus");
function doCodegen(options) {
    if (codegen_ng22_1.isAngular22()) {
        return codegen_ng22_1.runCodegen(options);
    }
    return codegen_ng23plus_1.runCodegen(options);
}
exports.doCodegen = doCodegen;
