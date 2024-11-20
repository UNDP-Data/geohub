<script lang="ts">
	import { replaceState } from '$app/navigation';
	import { page } from '$app/stores';
	import DataView from '$components/pages/map/data/DataView.svelte';
	import LayerList from '$components/pages/map/layers/LayerList.svelte';
	import { MapStyles, TabNames } from '$lib/config/AppConfig';
	import {
		LAYERLISTSTORE_CONTEXT_KEY,
		PAGE_DATA_LOADING_CONTEXT_KEY,
		type LayerListStore,
		type PageDataLoadingStore
	} from '$stores';
	import {
		StaticImageControl,
		type ControlOptions
	} from '@undp-data/svelte-geohub-static-image-controls';
	import {
		MAPSTORE_CONTEXT_KEY,
		Tabs,
		type MapStore,
		type Tab
	} from '@undp-data/svelte-undp-components';
	import { Loader } from '@undp-data/svelte-undp-design';
	import { getContext, onMount } from 'svelte';

	const map: MapStore = getContext(MAPSTORE_CONTEXT_KEY);
	const layerListStore: LayerListStore = getContext(LAYERLISTSTORE_CONTEXT_KEY);
	const pageDataLoadingStore: PageDataLoadingStore = getContext(PAGE_DATA_LOADING_CONTEXT_KEY);

	export let splitterHeight: number;
	let tabsHeight: number;
	$: contentHeight = splitterHeight - tabsHeight;

	let styleUrl = MapStyles[0].uri;
	let exportOptions: ControlOptions = {
		width: 300,
		height: 200,
		bbox: [-180, -90, 180, 90],
		latitude: 0,
		longitude: 0,
		zoom: 3,
		bearing: 0,
		pitch: 0,
		ratio: 1,
		defaultApi: 'center',
		extension: 'png',
		pageSize: 'A4',
		orientation: 'landscape'
	};
	let staticApiUrl = '';
	let isExporting = false;

	let tabs: Tab[] = [
		{
			id: TabNames.DATA,
			label: `${TabNames.DATA}`
		},
		{
			id: TabNames.LAYERS,
			label: `${TabNames.LAYERS}`
		}
	];

	let activeTab: TabNames = TabNames.DATA;

	$: $layerListStore, updateLayerLabel();
	const updateLayerLabel = () => {
		let defaultTab = $layerListStore.length > 0 ? TabNames.LAYERS : TabNames.DATA;
		let defaultActiveTab = ($page.url.searchParams.get('activetab') ?? defaultTab) as TabNames;
		if (
			!(defaultActiveTab && [`${TabNames.DATA}`, `${TabNames.LAYERS}`].includes(defaultActiveTab))
		) {
			defaultActiveTab = defaultTab;
		}
		activeTab = defaultActiveTab;

		const layerTab = tabs.find((t) => t.id === TabNames.LAYERS);
		layerTab.counter = $layerListStore.length;
		tabs = [...tabs];
	};

	const handleClickTab = (e) => {
		activeTab = e.detail;
		const url = $page.url;
		url.searchParams.set('activetab', activeTab);
		replaceState(url, '');
	};

	const handleUrlChanged = (e: { detail: { url: string } }) => {
		staticApiUrl = e.detail.url;
	};
	const handleExport = async () => {
		try {
			isExporting = true;

			const url = new URL(staticApiUrl);
			url.searchParams.delete('url');

			const styleJson = $map.getStyle();

			const urlParts = url.pathname.split('.');
			const extension = urlParts[urlParts.length - 1];

			const res = await fetch(url, {
				method: 'POST',
				body: JSON.stringify(styleJson)
			});
			const blob = await res.blob();
			const blobUrl = window.URL.createObjectURL(blob);
			let a = document.createElement('a');
			a.href = blobUrl;
			a.download = `${styleJson.name ?? 'map'}.${extension}`;
			document.body.appendChild(a);
			a.click();
			a.remove();
		} finally {
			isExporting = false;
		}
	};

	const addExportTab = () => {
		tabs = [
			...tabs.filter((t) => t.id !== TabNames.EXPORT),
			{
				id: TabNames.EXPORT,
				label: `${TabNames.EXPORT}`
			}
		];
		activeTab = TabNames.EXPORT;
	};

	const removeExportTab = () => {
		tabs = [...tabs.filter((t) => t.id !== TabNames.EXPORT)];
		activeTab = TabNames.LAYERS;
	};

	onMount(() => {
		const style = $page.data.style;
		if (style) {
			styleUrl = style.links.find((l) => l.rel === 'stylejson').href;
		}
	});
</script>

<div class="is-fullwidth" bind:clientHeight={tabsHeight}>
	<Tabs
		size="is-normal"
		isBoxed={false}
		isFullwidth={false}
		bind:tabs
		bind:activeTab
		on:tabChange={handleClickTab}
		isUppercase={true}
		fontWeight="semibold"
	/>
</div>

<div hidden={activeTab !== TabNames.DATA} class="mx-4">
	<DataView bind:contentHeight />
</div>
<div hidden={activeTab !== TabNames.LAYERS}>
	{#if $pageDataLoadingStore === true}
		<div class="is-flex is-justify-content-center is-align-items-center" style="margin-top: 40%;">
			<Loader size="medium" />
		</div>
	{:else}
		<LayerList bind:contentHeight bind:activeTab on:export={addExportTab} />
	{/if}
</div>
<div class="mx-4" hidden={activeTab !== TabNames.EXPORT}>
	{#if $map}
		<StaticImageControl
			bind:map={$map}
			show={activeTab === TabNames.EXPORT}
			bind:style={styleUrl}
			apiBase={$page.data.staticApiUrl}
			showAdvanced={true}
			hiddenApiTypes={true}
			bind:options={exportOptions}
			on:change={handleUrlChanged}
		/>

		{#if staticApiUrl}
			<div class="is-flex mt-4">
				<button
					class="button is-link is-uppercase has-text-weight-bold is-fullwidth {isExporting
						? 'is-loading'
						: ''}"
					on:click={handleExport}
					disabled={isExporting}
				>
					Export
				</button>
				<button
					class="button {isExporting
						? ''
						: 'is-link is-outlined'} is-uppercase has-text-weight-bold ml-2"
					disabled={isExporting}
					on:click={removeExportTab}
				>
					<span class="icon is-small">
						<span class="material-symbols-outlined"> close </span>
					</span>
				</button>
			</div>
		{/if}
	{/if}
</div>
