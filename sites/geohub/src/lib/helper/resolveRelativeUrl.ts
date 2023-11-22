export const resolveRelativeUrl = (relativeUrl: string, root: string) => {
	const urlParts = root.split('/');
	if (relativeUrl.indexOf('../') !== -1) {
		return relativeUrl.replace('../', `${urlParts.slice(0, urlParts.length - 2).join('/')}/`);
	} else if (relativeUrl.indexOf('./') !== -1) {
		return relativeUrl.replace('./', `${urlParts.slice(0, urlParts.length - 1).join('/')}/`);
	} else {
		return relativeUrl;
	}
};
