<script lang="ts">
	import type { Link, StacCatalog, StacCollection } from '$lib/types';
	import { DateInput } from '@undp-data/date-picker-svelte';
	import dayjs from 'dayjs';
	import { onMount } from 'svelte';

	export let collectionUrl: string;
	export let collection: StacCollection;

	let intervalDatetime = collection.extent.temporal.interval[0];

	let temporalIntervalFrom: Date = dayjs(intervalDatetime[0]).toDate();
	let temporalIntervalTo: Date = dayjs(intervalDatetime[1]).toDate();

	let selectedDate: Date = temporalIntervalTo;

	let years: { year: number; link: Link; catalog: StacCatalog }[] = [];
	let months: { year: number; month: number; link: Link; catalog: StacCatalog }[] = [];
	let dates: { date: Date; link: Link }[] = [];
	let enabledDates: Date[] = [];

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
			for (const day of dayLinks) {
				const date = dayjs(day.date, 'yyyyMMdd').toDate();
				if (dates.find((d) => d.date.toUTCString() === date.toUTCString())) continue;
				dates.push({
					date,
					link: day
				});
			}
		}
		console.log(dates);
		enabledDates = [...dates.map((d) => d.date)];
	};

	const initialize = async () => {
		await loadYears();
		await loadMonths();
		loadDatetimes();
	};

	onMount(() => {
		initialize();
	});
</script>

<DateInput
	bind:value={selectedDate}
	bind:min={temporalIntervalFrom}
	bind:max={temporalIntervalTo}
	{enabledDates}
	format="MM/dd/yyyy"
	closeOnSelection={true}
/>

<style lang="scss">
</style>
