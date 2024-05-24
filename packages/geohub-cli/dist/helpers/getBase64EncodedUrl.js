"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBase64EncodedUrl = void 0;
/**
 * Get URL with base 64 encoded signature
 * @param url url with signature
 * @returns url after base 64 encoded signature
 */
const getBase64EncodedUrl = (url) => {
    const [base, sign] = url.split('?');
    return `${base}?${btoa(sign)}`;
};
exports.getBase64EncodedUrl = getBase64EncodedUrl;
