const disclaimerText = `
<br/><br/><b>Disclaimer</b><br/>
<span>
  The designations employed and the presentation of material on this map do not imply the expression of any opinion whatsoever on the part of the<br>
  Secretariat of the United Nations or UNDP concerning the legal status of any country, territory, city or area or its authorities, or concerning<br>
  the delimitation of its frontiers or boundaries.
</span>

`;

export const attribution = `<span><a target="_top" rel="noopener" href="http://undp.org">United Nations Development Programme (UNDP)</a>${disclaimerText}</span>`;

export const getAttribution = (isLink = false) => {
	const label = `© ${new Date().getFullYear()} United Nations Development Programme.`;
	return isLink ? `<a target="_top" rel="noopener" href="http://undp.org">${label}</a>` : label;
};
