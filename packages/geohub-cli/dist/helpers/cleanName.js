"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cleanName = void 0;
const cleanName = (text) => {
    if (!text)
        return '';
    return text
        .replace(/\r?\n/g, '')
        .replace(/\r?_/g, ' ')
        .replace(/\r?-/g, ' ')
        .replace(/\.[^/.]+$/, '')
        .trim();
};
exports.cleanName = cleanName;
