<script lang="ts">
	import { getLayerStyle, getValueFromRasterTileUrl } from '$lib/helper';
	import {
		MAPSTORE_CONTEXT_KEY,
		SPRITEIMAGE_CONTEXT_KEY,
		type MapStore,
		type SpriteImageStore
	} from '$stores';
	import LegendSymbol from '@watergis/legend-symbol';
	import chroma from 'chroma-js';
	import { hexToCSSFilter } from 'hex-to-css-filter';
	import { debounce } from 'lodash-es';
	import type { LayerSpecification } from 'maplibre-gl';
	import { getContext } from 'svelte';

	const map: MapStore = getContext(MAPSTORE_CONTEXT_KEY);
	const spriteImageList: SpriteImageStore = getContext(SPRITEIMAGE_CONTEXT_KEY);

	export let layer: LayerSpecification;

	let container: HTMLElement = document.createElement('div');

	const getColorFromExpression = (value) => {
		if (value && Array.isArray(value)) {
			if (value[0] === 'rgb') {
				value = chroma(value.splice(1, 3)).css();
			} else if (value[0] === 'rgba') {
				value = chroma(value.splice(1, 4)).css();
			} else if (value[0] === 'match') {
				const values = value[value.length - 1];
				value = getColorFromExpression(values);
			}
		}
		return value;
	};

	const createSvgIcon = (svgXmlString: string) => {
		let blob = new Blob([svgXmlString], { type: 'image/svg+xml' });
		let url = URL.createObjectURL(blob);
		let image = document.createElement('img');
		image.src = url;
		image.addEventListener('load', () => URL.revokeObjectURL(url), { once: true });
		image.height = 24;
		image.width = 24;
		return image;
	};

	const update = () => {
		if (!(layer && $map.getLayer(layer.id))) return;
		const zoom = $map.getZoom();
		const symbol = LegendSymbol({ zoom: zoom, layer: layer });
		container.innerText = '';

		if (!symbol) {
			if (layer.type === 'hillshade') {
				const svg =
					'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--! Font Awesome Pro 6.2.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. --><path d="M256 32c12.5 0 24.1 6.4 30.7 17L503.4 394.4c5.6 8.9 8.6 19.2 8.6 29.7c0 30.9-25 55.9-55.9 55.9H55.9C25 480 0 455 0 424.1c0-10.5 3-20.8 8.6-29.7L225.2 49c6.6-10.6 18.3-17 30.8-17zm65 192L256 120.4 176.9 246.5 208 288l48-64h65z"/></svg>';
				const image = createSvgIcon(svg);
				container.appendChild(image);
			} else if (layer.type === 'fill-extrusion') {
				const svg =
					'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><!--! Font Awesome Pro 6.2.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. --><path d="M243.583 91.6027L323.695 138.384C326.575 140.026 326.68 144.583 323.695 146.225L228.503 201.854C225.623 203.55 222.22 203.444 219.549 201.854L124.357 146.225C121.425 144.636 121.373 139.973 124.357 138.384L204.417 91.6027V0L0 119.417V358.252L78.3843 312.477V218.914C78.3319 215.576 82.2066 213.192 85.0865 214.993L180.279 270.622C183.159 272.318 184.782 275.338 184.782 278.464V389.669C184.834 393.007 180.959 395.391 178.079 393.589L97.9673 346.808L19.583 392.583L224 512L428.417 392.583L350.033 346.808L269.921 393.589C267.093 395.338 263.114 393.06 263.218 389.669V278.464C263.218 275.126 265.051 272.159 267.721 270.622L362.914 214.993C365.741 213.245 369.72 215.47 369.616 218.914V312.477L448 358.252V119.417L243.583 0V91.6027Z"/></svg>';
				const image = createSvgIcon(svg);
				container.appendChild(image);
			} else if (layer.type === 'raster') {
				const colormap_name = getValueFromRasterTileUrl($map, layer.id, 'colormap_name') as string;
				const colormap = getValueFromRasterTileUrl($map, layer.id, 'colormap') as number[][][];
				if (colormap_name) {
					const isReverse = colormap_name.indexOf('_r') !== -1;
					let color = chroma
						.scale(colormap_name.replace('_r', ''))
						.mode('lrgb')
						.padding([0.25, 0])
						.domain([1, 100])
						.colors(5, 'rgba');
					if (isReverse) {
						color = color.reverse();
					}
					const cssStyle = `height: calc(1px * 24); width: calc(2px * 12); background: linear-gradient(90deg, ${color});`;
					const divColor = document.createElement('div');
					divColor.style.cssText = cssStyle;
					container.appendChild(divColor);
				} else if (colormap) {
					let colors: string[];
					if (Array.isArray(colormap)) {
						colors = colormap.map((c) => chroma.rgb(c[1][0], c[1][1], c[1][2]).css());
					} else {
						colors = Object.values(colormap).map((c) => chroma.rgb(c[0], c[1], c[2]).css());
					}
					const color = chroma
						.scale(colors)
						.mode('lrgb')
						.padding([0.25, 0])
						.domain([1, 100])
						.colors(colormap.length, 'rgba');
					const cssStyle = `height: calc(1px * 24); width: calc(2px * 12); background: linear-gradient(90deg, ${color});`;
					const divColor = document.createElement('div');
					divColor.style.cssText = cssStyle;
					container.appendChild(divColor);
				} else {
					const svg =
						'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--! Font Awesome Pro 6.2.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. --><path d="M0 96C0 60.7 28.7 32 64 32H448c35.3 0 64 28.7 64 64V416c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V96zM323.8 202.5c-4.5-6.6-11.9-10.5-19.8-10.5s-15.4 3.9-19.8 10.5l-87 127.6L170.7 297c-4.6-5.7-11.5-9-18.7-9s-14.2 3.3-18.7 9l-64 80c-5.8 7.2-6.9 17.1-2.9 25.4s12.4 13.6 21.6 13.6h96 32H424c8.9 0 17.1-4.9 21.2-12.8s3.6-17.4-1.4-24.7l-120-176zM112 192c26.5 0 48-21.5 48-48s-21.5-48-48-48s-48 21.5-48 48s21.5 48 48 48z"/></svg>';
					const image = createSvgIcon(svg);
					container.appendChild(image);
				}
			} else if (layer.type === 'heatmap') {
				const color: string[] = $map.getPaintProperty(layer.id, 'heatmap-color') as string[];
				if (color && color[0] === 'interpolate') {
					const colors: string[] = [];
					for (let i = 4; i < color.length; i = i + 2) {
						colors.push(color[i]);
					}
					const colormap = chroma
						.scale(colors)
						.mode('lrgb')
						.padding([0.25, 0])
						.domain([1, 100])
						.colors(colors.length, 'rgba');
					const cssStyle = `height: calc(1px * 24); width: calc(2px * 12); background: linear-gradient(90deg, ${colormap});`;
					const divColor = document.createElement('div');
					divColor.style.cssText = cssStyle;
					container.appendChild(divColor);
				} else {
					const svg =
						'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--! Font Awesome Pro 6.2.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. --><path d="M256 512c141.4 0 256-114.6 256-256S397.4 0 256 0S0 114.6 0 256S114.6 512 256 512zm0-160c-53 0-96-43-96-96s43-96 96-96s96 43 96 96s-43 96-96 96z"/></svg>';
					const image = createSvgIcon(svg);
					container.appendChild(image);
				}
			} else {
				const color = $map.getPaintProperty(layer.id, 'background-color');
				const value = getColorFromExpression(color) ?? '#000000';

				const opacity = $map.getPaintProperty(layer.id, 'background-opacity') ?? 1;

				const divIcon = document.createElement('div');
				divIcon.style.height = '24px';
				divIcon.style.width = '24px';
				divIcon.style.backgroundColor = value;
				divIcon.style.opacity = `${opacity}`;
				container.appendChild(divIcon);
			}
		} else {
			let divIcon: HTMLElement;
			switch (symbol.element) {
				case 'div': {
					if (
						symbol.attributes.style.backgroundImage &&
						!['url(undefined)', 'url(null)'].includes(symbol.attributes.style.backgroundImage)
					) {
						var img = document.createElement('img');
						img.src = symbol.attributes.style.backgroundImage.replace('url(', '').replace(')', '');
						img.alt = layer.id;
						img.style.cssText = `height: 24px; width: 24px;`;
						container.appendChild(img);
					}
					divIcon = document.createElement('div');
					divIcon.style.height = '24px';
					divIcon.style.width = '24px';
					divIcon.style.backgroundColor = symbol.attributes.style.backgroundColor;
					divIcon.style.backgroundPosition = symbol.attributes.style.backgroundPosition;
					divIcon.style.backgroundSize = symbol.attributes.style.backgroundSize;
					divIcon.style.backgroundRepeat = symbol.attributes.style.backgroundRepeat;
					divIcon.style.opacity = symbol.attributes.style.opacity;
					const outlineColor = $map.getPaintProperty(layer.id, 'fill-outline-color') as string;
					if (outlineColor) {
						divIcon.style.border = `1px solid ${outlineColor}`;
					}

					const color = $map.getPaintProperty(layer.id, 'fill-color');
					if (color && ['interval', 'categorical'].includes(color['type'])) {
						const colormap = chroma
							.scale(color['stops'].map((stop) => stop[1]))
							.mode('lrgb')
							.padding([0.25, 0])
							.domain([1, 100])
							.colors(color['stops'].length, 'rgba');
						const style = `height: calc(1px * 24); width: calc(2px * 12); background: linear-gradient(90deg, ${colormap});`;
						divIcon.style.cssText = style;
					} else if (color && Array.isArray(color) && ['match', 'step'].includes(color[0])) {
						const colors: string[] = [];
						if (color[0] === 'match') {
							// match
							for (let i = 3; i < color.length - 1; i = i + 2) {
								colors.push(color[i]);
							}
						} else {
							// step
							for (let i = 2; i < color.length - 1; i = i + 2) {
								colors.push(color[i]);
							}
						}

						const colormap = chroma
							.scale(colors)
							.mode('lrgb')
							.padding([0.25, 0])
							.domain([1, 100])
							.colors(colors.length, 'rgba');
						const style = `height: calc(1px * 24); width: calc(2px * 12); background: linear-gradient(90deg, ${colormap});`;
						divIcon.style.cssText = style;
					}

					container.appendChild(divIcon);
					break;
				}

				case 'svg': {
					if (layer.layout && layer.layout['icon-image']) {
						const icon = $spriteImageList.find((ico) => ico.alt === layer.layout['icon-image']);
						if (icon) {
							let color = $map.getPaintProperty(layer.id, 'icon-color');
							let cssStyle = '';
							if (color && (color['type'] === 'interval' || color['type'] === 'categorical')) {
								cssStyle = `filter: ${hexToCSSFilter(chroma([0, 0, 0]).hex()).filter}`;
								// const colormap = chroma
								// 	.scale(color['stops'].map((stop) => stop[1]))
								// 	.mode('lrgb')
								// 	.padding([0.25, 0])
								// 	.domain([1, 100])
								// 	.colors(color['stops'].length, 'rgba');
								// cssStyle = `background: linear-gradient(90deg, ${colormap}); opacity: 0.6;`;
								// isSimpleLegend = false;
							} else if (color && Array.isArray(color) && ['match', 'step'].includes(color[0])) {
								cssStyle = `filter: ${hexToCSSFilter(chroma([0, 0, 0]).hex()).filter}`;
								// const colors: string[] = [];
								// if (color[0] === 'match') {
								// 	// match
								// 	for (let i = 3; i < color.length - 1; i = i + 2) {
								// 		colors.push(color[i]);
								// 	}
								// } else {
								// 	// step
								// 	for (let i = 2; i < color.length - 1; i = i + 2) {
								// 		colors.push(color[i]);
								// 	}
								// }

								// const colormap = chroma
								// 	.scale(colors)
								// 	.mode('lrgb')
								// 	.padding([0.25, 0])
								// 	.domain([1, 100])
								// 	.colors(colors.length, 'rgba');
								// cssStyle = `background: linear-gradient(90deg, ${colormap}); opacity: 0.6;`;
								// isSimpleLegend = false;
							} else {
								const c = color as string;
								const rgba = chroma(c).rgba();

								cssStyle = `filter: ${
									hexToCSSFilter(chroma([rgba[0], rgba[1], rgba[2]]).hex()).filter
								}`;
							}
							const img = document.createElement('img');
							img.src = icon.src;
							img.alt = icon.alt;
							img.title = icon.alt;
							img.style.cssText = `width: 24px; height: 24px; ${cssStyle}`;
							container.appendChild(img);
						}
					} else if (layer.paint && layer.paint['line-color']) {
						let color = $map.getPaintProperty(layer.id, 'line-color');
						if (color && ['interval', 'categorical'].includes(color['type'])) {
							const colormap = chroma
								.scale(color['stops'].map((stop) => stop[1]))
								.mode('lrgb')
								.padding([0.25, 0])
								.domain([1, 100])
								.colors(color['stops'].length, 'rgba');
							const cssStyle = `height: calc(1px * 6); width: calc(2px * 12);transform: rotate(-45deg); background: linear-gradient(90deg, ${colormap});margin-top: auto; margin-bottom: auto;`;
							const divColor = document.createElement('div');
							divColor.style.cssText = cssStyle;

							container.appendChild(divColor);
						} else if (color && Array.isArray(color) && ['match', 'step'].includes(color[0])) {
							const colors: string[] = [];
							if (color[0] === 'match') {
								// match
								for (let i = 3; i < color.length - 1; i = i + 2) {
									colors.push(color[i]);
								}
							} else {
								// step
								for (let i = 2; i < color.length - 1; i = i + 2) {
									colors.push(color[i]);
								}
							}

							const colormap = chroma
								.scale(colors)
								.mode('lrgb')
								.padding([0.25, 0])
								.domain([1, 100])
								.colors(colors.length, 'rgba');
							const cssStyle = `height: calc(1px * 6); width: calc(2px * 12);transform: rotate(-45deg); background: linear-gradient(90deg, ${colormap});margin-top: auto; margin-bottom: auto;`;
							const divColor = document.createElement('div');
							divColor.style.cssText = cssStyle;

							container.appendChild(divColor);
						} else {
							const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
							svg.style.cssText = 'height: 24px; width: 24px;';
							svg.setAttributeNS(null, 'version', '1.1');
							Object.keys(symbol.attributes).forEach((k) => {
								svg.setAttribute(k, symbol.attributes[k]);
								let group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
								symbol.children.forEach((child) => {
									var c = document.createElementNS('http://www.w3.org/2000/svg', child.element);
									Object.keys(child.attributes).forEach((k2) => {
										c.setAttributeNS(null, k2, child.attributes[k2]);
									});
									group.appendChild(c);
								});
								svg.appendChild(group);
							});
							container.appendChild(svg);
						}
					} else {
						const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
						svg.style.cssText = 'height: 24px;';
						svg.setAttributeNS(null, 'version', '1.1');
						Object.keys(symbol.attributes).forEach((k) => {
							svg.setAttribute(k, symbol.attributes[k]);
							let group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
							symbol.children.forEach(
								(
									/* eslint-disable @typescript-eslint/no-explicit-any */
									child: { element: any; attributes: { [x: string]: string } }
								) => {
									var c = document.createElementNS('http://www.w3.org/2000/svg', child.element);
									Object.keys(child.attributes).forEach((k2) => {
										c.setAttributeNS(null, k2, child.attributes[k2]);
									});
									group.appendChild(c);
								}
							);
							svg.appendChild(group);
						});
						container.appendChild(svg);
					}
					break;
				}

				default:
					console.log(symbol.element);
					return;
			}
		}
	};

	const updateLegend = debounce((e) => {
		if (!layer) return;
		if (e.layerId && layer.id !== e.layerId) return;
		layer = getLayerStyle($map, layer.id);
		update();
	}, 300);

	$map.on('styledata', updateLegend);
	$: layer, update();
</script>

<!-- eslint-disable svelte/no-at-html-tags -->
<div class="legend">{@html container.innerHTML}</div>

<style>
	.legend {
		display: flex;
		flex-direction: row;
		width: 24px;
		height: 24px;
	}
</style>
