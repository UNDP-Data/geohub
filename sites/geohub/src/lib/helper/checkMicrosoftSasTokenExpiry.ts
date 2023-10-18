export const checkMicrosoftSasTokenExpiry = (url: string, currentTime = new Date()) => {
	const urlObj = new URL(url);
	const expiry = urlObj.searchParams.get('se');
	const expiryDate = new Date(expiry);
	const isExpired = currentTime > expiryDate;
	return isExpired;
};
