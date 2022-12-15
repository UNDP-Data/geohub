<script lang="ts">
	import {
		Accordion,
		Button,
		Breadcrumbs,
		CardWithImage,
		Header,
		Footer,
		Tabs,
		Radios,
		CtaLink
	} from '$lib';
	import Checkbox from '$lib/Checkbox.svelte';
	import type { Breadcrumb, Tab, Radio } from '$lib/interfaces';

	let headerHeight: number;

	let showProgressBar = false;

	let footerItems: { [key: string]: { title: string; url: string }[] } = {
		GeoHub: [
			{
				title: 'GeoHub',
				url: 'https://geohub.data.undp.org'
			},
			{
				title: 'GeoHub dashboard',
				url: 'https://geohub.data.undp.org/dashboards'
			},
			{
				title: 'GeoHub electricity dashboard',
				url: 'https://geohub.data.undp.org/dashboards/electricity'
			}
		]
	};

	let breadcrumbs: Breadcrumb[] = [
		{
			name: 'Home',
			icon: 'fas fa-house',
			url: ''
		},
		{
			name: 'Search result',
			icon: 'fas fa-magnifying-glass',
			url: ''
		}
	];

	let tabs: Tab[] = [
		{ label: 'Data', icon: 'fas fa-database' },
		{ label: 'Layer', icon: 'fas fa-layer-group' }
	];
	let activeTab: string = tabs[0].label;
	let tabHeight: number;

	let checked = false;

	let radios: Radio[] = [
		{
			label: 'radio A',
			value: 'a'
		},
		{ label: 'radio B', value: 'b' }
	];
	let radioValue1 = radios[0].value;
	let radioValue2 = radios[1].value;

	let radiosHtml: Radio[] = [
		{
			label: '<b>radio A</b>',
			value: 'a',
			isLabelHTML: true
		},
		{ label: '<b>radio B</b>', value: 'b', isLabelHTML: true }
	];
	let radioValue3 = radiosHtml[0].value;
</script>

<Header
	region="REGION"
	siteTitle="Site Title"
	url="https://undpgeohub.org"
	logoUrl="assets/undp-logo-blue.svg"
	bind:showProgressBar
	bind:height={headerHeight}
>
	<div slot="menu-buttons" class="menu-buttons">
		<div role="button" aria-label="Layer panel" class="menu-button" tabindex="0">
			<span class="icon">
				<i class="fa-solid fa-bars fa-xl" />
			</span>
		</div>

		<div role="button" aria-label="Layer panel" class="menu-button" tabindex="0">
			<span class="icon">
				<i class="fa-solid fa-bars fa-xl" />
			</span>
		</div>
	</div>
</Header>

<div class="contents" style="margin-top: {headerHeight}px;">
	<h1>Welcome to svelte UNDP design project</h1>

	<h2>Header</h2>

	<input
		type="checkbox"
		id="showProgressBar"
		name="showProgressBar"
		bind:checked={showProgressBar}
	/>
	<label for="showProgressBar">Show progress bar in header</label>

	<h2>Card with image</h2>

	<CardWithImage linkName="READ MORE">
		<div slot="title">
			<h6>content tag</h6>
		</div>
		<div slot="image">
			<img src="media/card-thumbnail.jpg" alt="media/card-thumbnail.jpg" />
		</div>
		<div slot="description">
			<h5>Title of the post goes here and it’s two lines</h5>
		</div>
	</CardWithImage>

	<h2>Accordion</h2>

	<Accordion headerTitle="title">
		<div slot="content">
			Lorem ipsum dolor sit amet, consectetur adipiscing elit. <strong>Pellentesque risus mi</strong
			>, tempus quis placerat ut, porta nec nulla. Vestibulum rhoncus ac ex sit amet fringilla.
			<!-- svelte-ignore a11y-missing-attribute -->
			Nullam gravida purus diam, et dictum <a>felis venenatis</a> efficitur. Aenean ac
			<em>eleifend lacus</em>, in mollis lectus. Donec sodales, arcu et sollicitudin porttitor,
			tortor urna tempor ligula, id porttitor mi magna a neque. Donec dui urna, vehicula et sem
			eget, facilisis sodales sem.
		</div>
	</Accordion>

	<br />

	<h3>Breadcrumbs</h3>

	<Breadcrumbs bind:breadcrumbs />

	<br />

	<h3>Tab</h3>

	<Tabs bind:tabs fontSize="small" bind:height={tabHeight} bind:activeTab />

	<Tabs bind:tabs fontSize="medium" bind:height={tabHeight} bind:activeTab />

	<br />

	<h3>Button</h3>

	<div style="width: 200px;">
		<Button title="Read more" on:clicked={() => console.log('clicked')} />
		<hr />
		<Button title="Read more" isArrow={true} on:clicked={() => console.log('clicked')} />
		<hr />
		<Button title="Read more" on:clicked={() => console.log('clicked')} isPrimary={false} />
	</div>

	<br />

	<h3>CTA Link</h3>

	<CtaLink
		label="Read more"
		on:clicked={() => {
			console.log('clicked cta link');
		}}
	/>
	<br />
	<CtaLink
		label="Read more"
		isArrow={false}
		on:clicked={() => {
			console.log('clicked cta link');
		}}
	/>

	<br />

	<h3>Checkbox</h3>

	<Checkbox label="Category" bind:checked />

	Checked: {checked}

	<br />

	<h3>Radio buttons</h3>

	<Radios bind:radios bind:value={radioValue1} groupName="radio-buttons-1" isVertical={false} />

	Selected: {radioValue1}

	<Radios bind:radios bind:value={radioValue2} groupName="radio-buttons-2" isVertical={true} />

	Selected: {radioValue2}

	<Radios
		bind:radios={radiosHtml}
		bind:value={radioValue3}
		groupName="radio-buttons-3"
		isVertical={true}
	/>

	Selected: {radioValue3}

	<br />
</div>

<Footer logoUrl="assets/undp-logo-white.svg" bind:footerItems />

<style lang="scss">
	@import 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.2.1/css/all.min.css';

	.menu-buttons {
		display: flex;
		color: #006eb5;

		.menu-button {
			cursor: pointer;
			margin-left: 20px;
			margin-right: 5px;
		}
	}
</style>
