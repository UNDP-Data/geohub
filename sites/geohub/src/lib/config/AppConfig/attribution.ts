export const attribution =
	'<a target="_top" rel="noopener" href="http://undp.org">United Nations Development Programme (UNDP)</a>';

export const getAttribution = (isLink = false) => {
	const label = `© ${new Date().getFullYear()} United Nations Development Programme`;
	return isLink ? `<a target="_top" rel="noopener" href="http://undp.org">${label}</a>` : label;
};
