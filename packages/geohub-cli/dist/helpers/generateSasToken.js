"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateSasToken = void 0;
const storage_blob_1 = require("@azure/storage-blob");
const generateSasToken = (blobServiceClient) => {
    const expiredOn = 86400000; // 1 day
    const ACCOUNT_SAS_TOKEN_URI = blobServiceClient.generateAccountSasUrl(new Date(new Date().valueOf() + expiredOn), storage_blob_1.AccountSASPermissions.parse('r'), 'o');
    return new URL(ACCOUNT_SAS_TOKEN_URI).search;
};
exports.generateSasToken = generateSasToken;
