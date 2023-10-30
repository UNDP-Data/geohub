import CryptoJS from 'crypto-js';

export const generateHashKey = (data: string) => {
	return CryptoJS.MD5(data).toString();
};
