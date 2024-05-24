"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateHashKey = void 0;
const crypto_1 = __importDefault(require("crypto"));
const generateHashKey = (data) => {
    return crypto_1.default.createHash('md5').update(data).digest('hex');
};
exports.generateHashKey = generateHashKey;
