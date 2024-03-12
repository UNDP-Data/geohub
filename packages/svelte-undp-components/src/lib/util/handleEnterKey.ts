export const handleEnterKey = (e: KeyboardEvent) => {
	if (e.key === 'Enter') {
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		e.target.click();
	}
};
