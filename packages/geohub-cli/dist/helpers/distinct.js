"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.distinct = void 0;
const distinct = (value, index, self) => {
    return value && self.indexOf(value) === index;
};
exports.distinct = distinct;
