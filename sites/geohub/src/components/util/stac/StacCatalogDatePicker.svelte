<script lang="ts">
	import type {
		Link,
		RasterAlgorithm,
		StacAsset,
		StacCatalog,
		StacCollection,
		StacItemFeature
	} from '$lib/types';
	import { DatePicker } from '@undp-data/svelte-undp-components';
	import { Loader } from '@undp-data/svelte-undp-design';
	import dayjs from 'dayjs';
	import { createEventDispatcher, onMount } from 'svelte';

	const dispatch = createEventDispatcher();

	export let collectionUrl: string;
	export let collection: StacCollection;
	export let selectedAsset: StacAsset;
	export let algorithm: RasterAlgorithm;
	export let bandIndex: number;

	let intervalDatetime = collection.extent.temporal.interval[0];

	let temporalIntervalFrom: Date = dayjs(intervalDatetime[0]).toDate();
	let temporalIntervalTo: Date = dayjs(intervalDatetime[1]).toDate();

	export let selectedDate: Date = temporalIntervalTo;

	let years: { year: number; link: Link; catalog: StacCatalog }[] = [];
	let months: { year: number; month: number; link: Link; catalog: StacCatalog }[] = [];
	let dates: { date: Date; link: Link; item?: StacItemFeature }[] = [];
	let enabledDates: Date[] = [];

	let assetItems: { [key: string]: StacAsset } = {};

	let isLoading = false;

	const loadYears = async () => {
		const children = collection.links.filter((l) => l.rel === 'child');

		const pattern = /\/(\d{4})\/catalog\.json/;
		for (const child of children) {
			const match = child.href.match(pattern);
			const year = match ? match[1] : null;
			if (!year) continue;
			if (years.find((y) => y.year === parseInt(year))) continue;

			child.href = new URL(child.href, collectionUrl).href;

			const res = await fetch(child.href);
			const catalog: StacCatalog = await res.json();

			years.push({
				year: parseInt(year),
				link: child,
				catalog: catalog
			});
		}

		years = years.sort((a, b) => a.year - b.year);
	};

	const loadMonths = async () => {
		const pattern = /\/(\d{2})\/catalog\.json/;
		for (const parent of years) {
			const monthLinks = parent.catalog.links.filter((l) => l.rel === 'child');
			for (const child of monthLinks) {
				const match = child.href.match(pattern);
				const month = match ? match[1] : null;
				if (!month) continue;
				if (months.find((y) => y.year === parent.year && y.month === parseInt(month))) continue;

				child.href = new URL(child.href, parent.link.href).href;
				const res = await fetch(child.href);
				const catalog: StacCatalog = await res.json();

				months.push({
					year: parent.year,
					month: parseInt(month),
					link: child,
					catalog: catalog
				});
			}
		}

		months = months.sort(
			(a, b) => parseInt(`${a.year}${a.month}`) - parseInt(`${b.year}${b.month}`)
		);
	};

	const loadDatetimes = () => {
		for (const month of months) {
			const dayLinks = month.catalog.links.filter((l) => l.rel === 'item');
			for (const dayLink of dayLinks) {
				const date = dayjs(dayLink.date, 'yyyyMMdd').toDate();
				if (dates.find((d) => d.date.toUTCString() === date.toUTCString())) continue;
				dayLink.href = new URL(dayLink.href, month.link.href).href;
				dates.push({
					date,
					link: dayLink
				});
			}
		}
		enabledDates = [...dates.map((d) => d.date)];
	};

	const initialize = async () => {
		await loadYears();
		await loadMonths();
		loadDatetimes();
		await handleDateSelected();
	};

	const handleDateSelected = async () => {
		assetItems = {};
		if (!selectedDate) return;

		const dateInfo = await getSelectedAssetItems();
		if (!dateInfo) return;

		selectedAsset = undefined;

		selectMatchedAsset();

		dispatch('dateChanged', {
			date: selectedDate,
			asset: selectedAsset
		});
	};

	const getSelectedAssetItems = async () => {
		const dateInfo = dates.find((d) => d.link.date === dayjs(selectedDate).format('YYYYMMDD'));
		if (!dateInfo) return;
		const itemUrl = dateInfo.link.href;

		const res = await fetch(itemUrl);
		if (!res.ok) return;
		const item: StacItemFeature = await res.json();
		Object.keys(item.assets).forEach((assetName) => {
			const asset = item.assets[assetName];
			asset.href = new URL(asset.href, itemUrl).href;
		});
		assetItems = item.assets;
		dateInfo.item = item;
		return dateInfo;
	};

	const selectMatchedAsset = () => {
		// if any keywords are matched to asset name, select the asset as default
		if (algorithm.inputs.bands) {
			const keywords = algorithm.inputs.bands[bandIndex].keywords;
			if (keywords?.length > 0) {
				for (const name of Object.keys(assetItems)) {
					let matched = false;
					const asset = assetItems[name];
					for (const keyword of keywords) {
						if (asset.title.toLowerCase().indexOf(keyword.toLowerCase()) !== -1) {
							matched = true;
							break;
						}
					}
					if (matched) {
						selectedAsset = asset;
						break;
					}
				}
			}
		}
	};

	const handleAssetChanged = () => {
		dispatch('assetChanged', {
			date: selectedDate,
			asset: selectedAsset
		});
	};

	$: if (!selectedAsset && selectedDate) {
		if (assetItems && Object.keys(assetItems).length > 0) {
			const formattedDate = dayjs(selectedDate).format('YYYY/M/D');
			selectMatchedAsset();
			// if selected asset's date does not match to list of assetitems in selectbox, update asset from remote.
			if (selectedAsset?.href.indexOf(formattedDate) === -1) {
				getSelectedAssetItems().then((dateInfo) => {
					if (!dateInfo) return;
					selectedAsset = undefined;
					selectMatchedAsset();
				});
			}
		}
	}

	onMount(() => {
		isLoading = true;
		initialize().then(() => {
			isLoading = false;
		});
	});
</script>

<div class="is-flex">
	<DatePicker
		bind:value={selectedDate}
		bind:min={temporalIntervalFrom}
		bind:max={temporalIntervalTo}
		{enabledDates}
		on:select={handleDateSelected}
	/>

	<div class="is-flex is-justify-content-center is-align-items-center ml-1">
		{#if isLoading}
			<Loader size="small" />
		{:else}
			{@const assets = Object.keys(assetItems).filter(
				(key) => assetItems[key].type.indexOf('profile=cloud-optimized') !== -1
			)}
			{#if assets.length === 0}
				No assets in this date
			{:else}
				<div class="select">
					<select bind:value={selectedAsset} on:change={handleAssetChanged}>
						{#each assets as name}
							{@const asset = assetItems[name]}
							<option value={asset}>{asset.title ?? name}</option>
						{/each}
					</select>
				</div>
			{/if}
		{/if}
	</div>
</div>
