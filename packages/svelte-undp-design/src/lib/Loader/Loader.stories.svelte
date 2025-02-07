<script lang="ts" module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import Loader from './Loader.svelte';

	const { Story } = defineMeta({
		title: 'Components/Loader',
		component: Loader,
		tags: ['autodocs'],
		argTypes: {
			size: {
				type: 'string',
				description: 'Size of the loader',
				defaultValue: 'medium',
				constrol: { type: 'select' },
				options: ['small', 'medium', 'large']
			}
		}
	});
</script>

<Story
	name="Small"
	args={{
		size: 'small'
	}}
/>

<Story
	name="Medium"
	args={{
		size: 'medium'
	}}
/>

<Story
	name="Large"
	args={{
		size: 'large'
	}}
/>
