<script lang="ts" module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import Footer from './Footer.svelte';

	const { Story } = defineMeta({
		title: 'Components/Footer',
		component: Footer,
		tags: ['autodocs'],
		argTypes: {
			logoUrl: {
				type: 'string',
				description: 'UNDP logo URL',
				defaultValue: undefined
			},
			footerItems: {
				// type: 'string',
				description: 'Items to be shown in footer',
				defaultValue: undefined
			}
		}
	});

	const footerItems: { [key: string]: { title: string; url: string }[] } = {
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
		],
		GeoHub1: [
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
		],
		GeoHub2: [
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
		],
		GeoHub3: [
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
</script>

<Story
	name="Primary"
	args={{
		logoUrl: 'assets/undp-logo-white.svg',
		footerItems: footerItems
	}}
/>

<Story
	name="Inverted"
	args={{
		logoUrl: 'assets/undp-logo-blue.svg',
		footerItems: footerItems,
		isInverted: true
	}}
/>

<Story
	name="Simple"
	args={{
		logoUrl: 'assets/undp-logo-white.svg',
		footerItems: footerItems,
		isSimple: true
	}}
/>

<Story
	name="Simple Inverted"
	args={{
		logoUrl: 'assets/undp-logo-blue.svg',
		footerItems: footerItems,
		isSimple: true,
		isInverted: true
	}}
/>
