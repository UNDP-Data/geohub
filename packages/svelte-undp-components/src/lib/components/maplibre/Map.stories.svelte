<script lang="ts" module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import Map from './Map.svelte';

	const { Story } = defineMeta({
		title: 'Components/Maplibre/Map',
		component: Map,
		tags: ['autodocs'],
		argTypes: {
			title: {
				type: 'string',
				description: 'Title of map compoent'
			}
		}
	});

	let title = 'Map Component';
</script>

<Story
	name="Primary"
	args={{
		title: title
	}}
/>
