<script lang="ts">
	import type { StoryMapConfig } from '$lib/interfaces/index.js';
	import { Map, NavigationControl, type StyleSpecification } from 'maplibre-gl';
	import 'maplibre-gl/dist/maplibre-gl.css';
	import { marked } from 'marked';
	import scrollama from 'scrollama';
	import { onMount } from 'svelte';

	export let config: StoryMapConfig;

	let mapContainer: HTMLDivElement;
	let map: Map;
	let activeId: string = config.chapters[0].id;
	let navigationControl: NavigationControl;
	let currentStyle: StyleSpecification | string;

	onMount(() => {
		map = new Map({
			container: mapContainer,
			style: config.style,
			hash: false,
			interactive: true,
			dragPan: false,
			dragRotate: false,
			doubleClickZoom: false,
			scrollZoom: false,
			touchZoomRotate: false
		});

		if (!navigationControl) {
			navigationControl = new NavigationControl();
		}

		const scroller = scrollama();
		scroller
			.setup({
				step: '.step',
				offset: 0.5,
				progress: true
			})
			.onStepEnter(async (response) => {
				activeId = response.element.id;

				const chapter = config.chapters.find((c) => c.id === activeId);
				if (!chapter) return;

				if (chapter.style) {
					currentStyle = chapter.style;
					map.setStyle(chapter.style);
				} else if (currentStyle !== config.style) {
					currentStyle = config.style;
					map.setStyle(currentStyle);
				}

				map[chapter.mapAnimation || 'flyTo']({
					center: chapter.location.center,
					zoom: chapter.location.zoom,
					bearing: chapter.location.bearing ?? 0,
					pitch: chapter.location.pitch ?? 0
				});

				const navPosition = chapter.mapNavigationPosition ?? 'top-right';

				if (chapter.mapInteractive) {
					map.addControl(navigationControl, navPosition);
					map.scrollZoom.disable(); //disable scrollZoom because it will conflict with scrolling chapters
					map.boxZoom.enable();
					map.dragRotate.enable();
					map.dragPan.enable();
					map.keyboard.enable();
					map.doubleClickZoom.enable();
					map.touchZoomRotate.enable();
					map.touchPitch.enable();
					map.getCanvas().style.cursor = 'grab';
				} else {
					if (map.hasControl(navigationControl)) {
						map.removeControl(navigationControl);
					}
					map.scrollZoom.disable();
					map.boxZoom.disable();
					map.dragRotate.disable();
					map.dragPan.disable();
					map.keyboard.disable();
					map.doubleClickZoom.disable();
					map.touchZoomRotate.disable();
					map.touchPitch.disable();
					map.getCanvas().style.cursor = 'default';
				}

				if (chapter.rotateAnimation) {
					map.once('moveend', () => {
						const rotateNumber = map.getBearing();
						map.rotateTo(rotateNumber + 180, {
							duration: 30000,
							easing: function (t) {
								return t;
							}
						});
					});
				}

				if (chapter.spinGlobe) {
					map.once('moveend', () => {
						const center = map.getCenter();
						const newCenter: [number, number] = [center.lng + 360, center.lat];
						map.easeTo({ center: newCenter, duration: 20000, easing: (n) => n });
					});
				}
			})
			.onStepExit((response) => {
				if (activeId === response.element.id) {
					activeId = '';
				}
			});
	});
</script>

<div bind:this={mapContainer} class="storymap"></div>
<div class="story">
	<div class="header">
		{#if config.title}
			<h1>{config.title}</h1>
		{/if}
		{#if config.logo}
			<img src={config.logo} alt={config.logo} />
		{/if}
		{#if config.subtitle}
			<h2>{config.subtitle}</h2>
		{/if}
		{#if config.byline}
			<p>{config.byline}</p>
		{/if}
	</div>

	{#each config.chapters as chapter}
		<section
			id={chapter.id}
			class="step {activeId === chapter.id ? 'active' : ''} {chapter.alignment ??
				'center'} {chapter.hidden ? 'hidden' : ''}"
		>
			<div>
				{#if chapter.title}
					<h3>{chapter.title}</h3>
				{/if}
				{#if chapter.description}
					<!-- eslint-disable svelte/no-at-html-tags -->
					{@html marked.parse(chapter.description)}
				{/if}
			</div>
		</section>
	{/each}

	<div class="footer">
		{#if config.footer}
			<p>{config.footer}</p>
		{/if}
	</div>
</div>
