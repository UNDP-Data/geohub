export const resolveRelativeUrl = (relativeUrl: string, base: string) => {
	return new URL(relativeUrl, base).href;
};
