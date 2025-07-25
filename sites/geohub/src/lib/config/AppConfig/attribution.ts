const disclaimerText = `
<br/><br/><b>Disclaimer</b><br/>
<span class="mr-2">
  The designations employed and the presentation of material on this map do not imply the expression of any opinion whatsoever on the part<br>
  of the Secretariat of the United Nations or UNDP concerning the legal status of any country, territory, city or area or its authorities,<br>
  or concerning the delimitation of its frontiers or boundaries.
</span>


`;

export const attribution = `<span>${disclaimerText}</span>`;

export const getAttribution = (isLink = false) => {
	const label = `© ${new Date().getFullYear()}`;
	return isLink ? ` ` : label;
};
