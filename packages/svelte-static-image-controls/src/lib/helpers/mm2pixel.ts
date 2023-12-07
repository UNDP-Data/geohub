export const mm2pixel = (mm: number, dpi: number = 96) => {
	const pixel = (mm / 25.4) * dpi;
	return Math.round(pixel);
};
