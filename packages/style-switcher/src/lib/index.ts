import type {
	ControlPosition,
	IControl,
	Map as MaplibreMap,
	StyleSpecification
} from 'maplibre-gl';
import stringify from 'json-stable-stringify';
import tippy from 'tippy.js';
import 'tippy.js/dist/tippy.css';

/**
 * Style definition for Maplibre StyleSwitcher control
 */
export interface StyleDefinition {
	/**
	 * Title of style
	 */
	title: string;
	/**
	 * URL for style.json
	 */
	uri: string;
	/**
	 * Image URL for style.json. This image will be shown as preview.
	 * You maybe can use GeoHub static image API here.
	 * https://staticimage.undpgeohub.org/api
	 */
	image: string;
	/**
	 * This style property will be used internally in StyleSwitcher control. It will be overwritten by calling initialise function.
	 */
	style?: StyleSpecification;
}

/**
 * MaplibreStyleSwitcher Options
 */
export interface Options {
	/**
	 * Optional. If want to specify default style, put the title here. If undefined, use the first style as default.
	 */
	defaultStyle?: string;
}

/**
 * Style swicher control for Maplibre GL JS
 */
export default class MaplibreStyleSwitcherControl implements IControl {
	private controlContainer?: HTMLElement;
	private buttonContainer?: HTMLDivElement;
	private image?: HTMLImageElement;
	private map?: MaplibreMap;
	private styles: StyleDefinition[];

	private activeStyle: StyleDefinition;
	private buttonStyle: StyleDefinition;

	/**
	 * Default values for Options
	 */
	private options: Options = {};

	constructor(styles: StyleDefinition[], options?: Options) {
		this.styles = styles;
		if (options) {
			this.options = Object.assign(this.options, options);
		}
		if (!this.options.defaultStyle) {
			this.options.defaultStyle = this.styles[0].title;
		}

		const index = this.styles.findIndex((s) => s.title === this.options?.defaultStyle);
		this.activeStyle = this.styles[index];
		this.buttonStyle = this.styles[this.getNextStyleIndex()];
	}

	private getNextStyleIndex() {
		const activeIndex = this.styles.findIndex((s) => s.title === this.activeStyle.title);
		if (activeIndex === this.styles.length - 1) {
			return 0;
		} else {
			return activeIndex + 1;
		}
	}

	/**
	 * Initialise active and button style by checking the initial map style
	 * This method must be called at 'styledata' or 'load' event of maplibre
	 */
	public async initialise() {
		if (!this.map) return;
		const currentStyle = this.map.getStyle();
		for (const style of this.styles) {
			const res = await fetch(style.uri);
			style.style = await res.json();

			// check if all layers in secondary style exists in current style
			let doesAllLayersExists = true;
			style.style?.layers.forEach((l) => {
				// voyager and dark style consists of same layer IDs, thus it compares the entire layer object to ensure it is same style or not.
				const exists = currentStyle.layers?.find((x) => stringify(x) === stringify(l));
				if (!exists) {
					doesAllLayersExists = false;
					return;
				}
			});

			// switch to current selected style to secondary
			if (doesAllLayersExists) {
				const index = this.styles.findIndex((s) => s.title === style.title);
				this.activeStyle = this.styles[index];
			}
		}
		this.buttonStyle = this.styles[this.getNextStyleIndex()];
		if (this.image) {
			this.image.src = this.buttonStyle.image;
			this.image.alt = this.buttonStyle.title;

			this.hideActiveStyleOption();
		}
	}

	/**
	 * Switch style
	 * @param target if undefined, use next style in the array
	 * @returns
	 */
	private async changeStyle(target?: string) {
		if (!this.map) return;

		// preserve sources and layers added in current style
		const currentStyle = this.map.getStyle();
		if (this.activeStyle.style) {
			this.activeStyle.style.layers.forEach((layer) => {
				const index = currentStyle.layers.findIndex((l) => l.id === layer.id);
				if (index === -1) return;
				currentStyle.layers.splice(index, 1);
			});

			const deleteSources: string[] = [];
			Object.keys(currentStyle.sources).forEach((key) => {
				const layers = currentStyle.layers.filter(
					(layer) => 'source' in layer && layer.source === key
				);
				if (layers.length === 0) {
					deleteSources.push(key);
				}
			});
			deleteSources.forEach((key) => {
				delete currentStyle.sources[key];
			});
		}

		let next = this.getNextStyleIndex();
		if (target) {
			next = this.styles.findIndex((s) => s.title === target);
		}
		this.activeStyle = this.styles[next];
		this.buttonStyle = this.styles[this.getNextStyleIndex()];

		if (this.image) {
			this.image.src = this.buttonStyle.image;
			this.image.alt = this.buttonStyle.title;
		}

		if (this.activeStyle.style) {
			const nextStyle: StyleSpecification = JSON.parse(JSON.stringify(this.activeStyle.style));

			// restore additional layers and sources to new style
			let firstSymbolId: string | undefined = undefined;
			for (const layer of nextStyle.layers) {
				if (layer.type === 'symbol') {
					firstSymbolId = layer.id;
					break;
				}
			}

			Object.keys(currentStyle.sources).forEach((key) => {
				nextStyle.sources[key] = currentStyle.sources[key];
			});
			currentStyle.layers.forEach((layer) => {
				if (layer.type === 'raster') {
					const firstSymbolIndex = nextStyle.layers.findIndex((l) => l.id === firstSymbolId);
					nextStyle.layers.splice(firstSymbolIndex, 0, layer);
				} else {
					nextStyle.layers.push(layer);
				}
			});

			this.map.setStyle(nextStyle);
		}
		this.hideActiveStyleOption();
		if (target) {
			this.changeStyleOptionsVisibility(false);
		}
	}

	private changeStyleOptionsVisibility(isActive: boolean) {
		const styleOptions = document.getElementsByClassName('maplibre-style-switcher-map-options');
		if (styleOptions?.length > 0) {
			if (isActive) {
				styleOptions[0].classList.add('active');
			} else {
				styleOptions[0].classList.remove('active');
			}
		}
	}

	private hideActiveStyleOption() {
		const styleOptions = document.getElementsByClassName('maplibre-style-switcher-map-option');
		if (styleOptions?.length > 0) {
			const activeStyleClass = this.activeStyle.title.replace(/\s/g, '').toLowerCase();
			for (const option of styleOptions) {
				if (option.classList.contains(activeStyleClass)) {
					option.classList.add('active');
				} else {
					option.classList.remove('active');
				}
			}
		}
	}

	public getDefaultPosition(): ControlPosition {
		const defaultPosition = 'top-left';
		return defaultPosition;
	}

	public onAdd(map: MaplibreMap): HTMLElement {
		this.map = map;
		this.controlContainer = document.createElement('div');
		this.controlContainer.classList.add('maplibregl-ctrl');

		this.buttonContainer = document.createElement('div');
		this.buttonContainer.classList.add('maplibregl-style-switcher-control');
		this.buttonContainer.addEventListener(
			'mouseenter',
			this.changeStyleOptionsVisibility.bind(this, true)
		);
		this.buttonContainer.addEventListener(
			'mouseleave',
			this.changeStyleOptionsVisibility.bind(this, false)
		);

		const options = document.createElement('div');
		options.classList.add('maplibre-style-switcher-map-options');
		options.addEventListener('mouseleave', this.changeStyleOptionsVisibility.bind(this, false));
		this.styles.forEach((style) => {
			const styleImg = document.createElement('img');
			styleImg.classList.add('maplibre-style-switcher-map-option');
			styleImg.classList.add(style.title.replace(/\s/g, '').toLowerCase());
			styleImg.src = style.image;
			styleImg.alt = style.title;
			styleImg.addEventListener('click', this.changeStyle.bind(this, style.title));
			tippy(styleImg, {
				content: `Switch to ${style.title}`
			});
			options.appendChild(styleImg);
		});
		this.buttonContainer.appendChild(options);

		this.image = document.createElement('img');
		this.image.classList.add('maplibre-style-switcher-map-image');
		this.image.src = this.buttonStyle.image;
		this.image.alt = this.buttonStyle.title;
		this.image.addEventListener('click', this.changeStyle.bind(this, undefined));
		tippy(this.image, {
			content: 'Switch to the next style',
			placement: 'right'
		});
		this.buttonContainer.appendChild(this.image);

		this.controlContainer.appendChild(this.buttonContainer);

		return this.controlContainer;
	}

	public onRemove(): void {
		if (!this.controlContainer || !this.controlContainer.parentNode || !this.map) {
			return;
		}
		this.controlContainer.parentNode.removeChild(this.controlContainer);
		this.map = undefined;
	}
}
