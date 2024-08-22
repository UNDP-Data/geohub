import { getDecimalPlaces } from '$lib/helper';
import chroma from 'chroma-js';
import { hexToCSSFilter } from 'hex-to-css-filter';

/**
 * SvgLegendCreate options
 */
export interface SvgLegendCreatorOptions {
	unit?: string;
	min?: number;
	max?: number;
	shape?: string;
	width?: string;
}

export class SvgLegendCreator {
	private fontFamily: string;
	private fontSize: string;

	/**
	 * Constructor
	 * @param fontSize font size. default is 14px
	 * @param fontFamily font family. default is ProximaNova
	 */
	constructor(fontSize = '14px', fontFamily = 'ProximaNova') {
		this.fontSize = fontSize;
		this.fontFamily = fontFamily;
	}

	/**
	 * Wrap content by <svg> tag
	 * @param content SVG content
	 * @param height height of SVG
	 * @param width width of SVG. default is 100%
	 * @returns returns complete SVG string
	 */
	public getSVG = (content: string, height: number, width = '100%') => {
		const svgString = `<svg width='${width}' height='${height}' xmlns='http://www.w3.org/2000/svg'>${content}</svg>`;
		return svgString
			.replace(/\n/g, '')
			.replace(/\t/g, '')
			.replace(/\n/g, '')
			.replace(/\s{2,}/g, ' ');
	};

	/**
	 * generate linear legend
	 * @param colors an array of rgba color
	 * @param options Options
	 * @returns SVG string
	 */
	public generateLinearLegend(
		colors: [number, number, number, number][],
		options?: SvgLegendCreatorOptions
	) {
		let minDecimalPlaces = 0;
		if (options?.min && typeof options.min === 'string') {
			options.min = parseFloat(options.min);
			minDecimalPlaces = getDecimalPlaces(options.min);
			if (minDecimalPlaces > 2) minDecimalPlaces = 2;
		}
		let maxDecimalPlaces = 0;
		if (options?.max && typeof options.max === 'string') {
			options.max = parseFloat(options.max);
			maxDecimalPlaces = getDecimalPlaces(options.max);
			if (maxDecimalPlaces > 2) maxDecimalPlaces = 2;
		}
		const contents = `
        <defs>
            <linearGradient id='grad1' x1='0%' y1='0%' x2='100%' y2='0%'>
                ${colors.map((c, index) => {
									let offset = 100 / colors.length - 1;
									if (index > 0) {
										offset += (100 / colors.length - 1) * index;
									}
									return `<stop offset='${offset}%' style='stop-color:${c};stop-opacity:1' />`;
								})}
            </linearGradient>
        </defs>
        ${options?.unit ? `<text x='0' y='15' font-family='${this.fontFamily}' font-size='${this.fontSize}' fill='#000000'>${options?.unit}</text>` : ''}
        <rect y='${options?.unit ? 20 : 0}' width='100%' height='28' fill='url(#grad1)' />
        ${options?.min ? `<text x='0' y='${options?.unit ? 65 : 45}' font-family='${this.fontFamily}' font-size='${this.fontSize}' fill='#000000'>${options?.min.toFixed(minDecimalPlaces)}</text>` : ''}
        ${options?.max ? `<text x='100%' y='${options?.unit ? 65 : 45}' font-family='${this.fontFamily}' font-size='${this.fontSize}' fill='#000000' text-anchor='end'>${options?.max.toFixed(maxDecimalPlaces)}</text>` : ''}
`;

		const height = options?.unit ? 70 : 50;
		return this.getSVG(contents, height, options?.width);
	}

	/**
	 * generate categorised legend
	 * @param colors an array of colors either rgba or string
	 * @param values an array of values. each element in an array has another nested array which contains min and max.
	 * @param options Options
	 * @returns SVG string
	 */
	public getCategorizedLegend = (
		colors: [number, number, number, number][] | string[],
		values: number[][],
		options?: SvgLegendCreatorOptions
	) => {
		const contents = `
        ${options?.unit ? `<text x='0' y='15' font-family='${this.fontFamily}' font-size='${this.fontSize}' fill='#000000'>${options?.unit}</text>` : ''}
			${colors
				.map((c, index) => {
					let color = '';
					if (Array.isArray(c)) {
						color = `rgba(${c.join(',')})`;
					} else {
						color = c;
					}
					const value = values[index].join(' - ');
					let shape = `<rect x='0' y='0' width='20' height='20' fill='${color}'/>`;
					if (options?.shape) {
						const size = options.shape.indexOf('<circle') === -1 ? '20' : '10';
						shape = options.shape.replace(/{size}/g, size).replace(/{color}/g, color);
					}

					try {
						const chromaColor = chroma(color);
						if (shape.indexOf('{style}') !== -1) {
							const filter = `filter: ${hexToCSSFilter(chromaColor.hex()).filter}`;
							shape = shape.replace('{style}', filter);
						}

						if (chromaColor.alpha() === 0) {
							shape = `<svg height='20' viewBox='0 -960 960 960' width='20' fill='#5f6368'><path d='m637-425-62-62q4-38-23-65.5T487-576l-62-62q13-5 27-7.5t28-2.5q70 0 119 49t49 119q0 14-2.5 28t-8.5 27Zm133 133-52-52q36-28 65.5-61.5T833-480q-49-101-144.5-158.5T480-696q-26 0-51 3t-49 10l-58-58q38-15 77.5-21t80.5-6q143 0 261.5 77.5T912-480q-22 57-58.5 103.5T770-292Zm-2 202L638-220q-38 14-77.5 21t-80.5 7q-143 0-261.5-77.5T48-480q22-57 58-104t84-85L90-769l51-51 678 679-51 51ZM241-617q-35 28-65 61.5T127-480q49 101 144.5 158.5T480-264q26 0 51-3.5t50-9.5l-45-45q-14 5-28 7.5t-28 2.5q-70 0-119-49t-49-119q0-14 3.5-28t6.5-28l-81-81Zm287 89Zm-96 96Z'/></svg>`;
						}
					} catch {
						// skip this error
					}
					return `
                    <svg x='0' y='${(options?.unit ? 25 : 10) + 22 * index}'>${shape}</svg>
                    <text x='30' y='${(options?.unit ? 40 : 25) + 22 * index}' font-family='${this.fontFamily}' font-size='${this.fontSize}'>${value}</text>
                    `;
				})
				.join('')}
        `;

		let height = 22 * colors.length;
		if (options?.unit) {
			height += 22;
		}
		height += 15;
		return this.getSVG(contents, height, options?.width);
	};

	/**
	 * generate unique value legend
	 * @param colors an array of colors either rgba or string
	 * @param values an array of values.
	 * @param options Options
	 * @returns SVG string
	 */
	public getUniqueValueLegend = (
		colors: [number, number, number, number][] | string[],
		values: string[],
		options?: SvgLegendCreatorOptions
	) => {
		const contents = `
            ${options?.unit ? `<text x='0' y='15' font-family='${this.fontFamily}' font-size='${this.fontSize}' fill='#000000'>${options.unit}</text>` : ''}
        ${colors
					.map((c, index) => {
						let color = '';
						if (Array.isArray(c)) {
							color = `rgba(${c.join(',')})`;
						} else {
							color = c;
						}
						let shape = `<rect x='0' y='0' width='20' height='20' fill='${color}'/>`;
						if (options?.shape) {
							const size = options.shape.indexOf('<circle') === -1 ? '20' : '10';
							shape = options.shape.replace(/{size}/g, size).replace(/{color}/g, color);
						}

						try {
							const chromaColor = chroma(color);
							if (shape.indexOf('{style}') !== -1) {
								const filter = `filter: ${hexToCSSFilter(chromaColor.hex()).filter}`;
								shape = shape.replace('{style}', filter);
							}
							if (chromaColor.alpha() === 0) {
								shape = `<svg height='20' viewBox='0 -960 960 960' width='20' fill='#5f6368'><path d='m637-425-62-62q4-38-23-65.5T487-576l-62-62q13-5 27-7.5t28-2.5q70 0 119 49t49 119q0 14-2.5 28t-8.5 27Zm133 133-52-52q36-28 65.5-61.5T833-480q-49-101-144.5-158.5T480-696q-26 0-51 3t-49 10l-58-58q38-15 77.5-21t80.5-6q143 0 261.5 77.5T912-480q-22 57-58.5 103.5T770-292Zm-2 202L638-220q-38 14-77.5 21t-80.5 7q-143 0-261.5-77.5T48-480q22-57 58-104t84-85L90-769l51-51 678 679-51 51ZM241-617q-35 28-65 61.5T127-480q49 101 144.5 158.5T480-264q26 0 51-3.5t50-9.5l-45-45q-14 5-28 7.5t-28 2.5q-70 0-119-49t-49-119q0-14 3.5-28t6.5-28l-81-81Zm287 89Zm-96 96Z'/></svg>`;
							}
						} catch {
							// skip this error
						}
						return `
                        <svg x='0' y='${(options?.unit ? 25 : 10) + 22 * index}'>${shape}</svg>
                        <text x='30' y='${(options?.unit ? 40 : 25) + 22 * index}' font-family='${this.fontFamily}' font-size='${this.fontSize}'>${values[index]}</text>
                        `;
					})
					.join('')}
        `;

		let height = 22 * colors.length;
		if (options?.unit) {
			height += 22;
		}
		height += 15;
		return this.getSVG(contents, height, options?.width);
	};
}
