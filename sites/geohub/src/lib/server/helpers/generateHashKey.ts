import crypto from 'crypto';

export const generateHashKey = (data: string) => {
	return crypto.createHash('md5').update(data).digest('hex');
};
