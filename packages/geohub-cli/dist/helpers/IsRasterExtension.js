"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isRasterExtension = void 0;
const isRasterExtension = (name) => {
    const splitAt = name.lastIndexOf('.');
    const ext = name.slice(splitAt, name.length);
    const extensions = ['.tif', '.tiff'];
    const v = extensions.includes(ext.toLowerCase());
    return v;
};
exports.isRasterExtension = isRasterExtension;
