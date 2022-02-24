let _account = "";
if (typeof import.meta.env.VITE_AZURE_STORAGE_ACCOUNT === 'string') {
    _account = import.meta.env.VITE_AZURE_STORAGE_ACCOUNT
}

let _accountKey = "";
if (typeof import.meta.env.VITE_AZURE_STORAGE_ACCESS_KEY === 'string') {
    _accountKey = import.meta.env.VITE_AZURE_STORAGE_ACCESS_KEY
}

let _titilerEndpoint = "";
if (typeof import.meta.env.VITE_TITILER_ENDPOINT === 'string') {
    _titilerEndpoint = import.meta.env.VITE_TITILER_ENDPOINT
}

export const AZURE_STORAGE_ACCOUNT: string = _account;
export const AZURE_STORAGE_ACCESS_KEY: string = _accountKey;
export const TITILER_ENDPOINT: string = _titilerEndpoint;
