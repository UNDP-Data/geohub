const disclaimerText = `
<br/><br/><b>Disclaimer</b><br/>
<span>
The boundaries and names shown and the designations used on this map do not imply official endorsement or acceptance by the United Nations.<br />
Final boundary between the Republic of Sudan and the Republic of South Sudan has not yet been determined.<br />
* Non-Self-Governing Territory <br />
** Dotted line represents approximately the Line of Control in Jammu and Kashmir agreed upon by India and Pakistan. The final status of Jammu and Kashmir has not yet been agreed upon by the parties.<br />
*** A dispute exists between the Governments of Argentina and the United Kingdom of Great Britain and Northern Ireland concerning sovereignty over the Falkland Islands (Malvinas)
</span>
`;

export const attribution = `<span><a target="_top" rel="noopener" href="http://undp.org">United Nations Development Programme (UNDP)</a>${disclaimerText}</span>`;

export const getAttribution = (isLink = false) => {
	const label = `© ${new Date().getFullYear()} United Nations Development Programme.`;
	return isLink ? `<a target="_top" rel="noopener" href="http://undp.org">${label}</a>` : label;
};
