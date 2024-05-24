"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cleanText = void 0;
const cleanText = (text) => {
    if (!text)
        return text;
    return text.replace(/\r?\n/g, '').trim();
};
exports.cleanText = cleanText;
