<script lang="ts" module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import Download from './Download.svelte';

	const { Story } = defineMeta({
		title: 'Components/Download',
		component: Download,
		tags: ['autodocs'],
		argTypes: {
			url: {
				type: 'string',
				description: 'URL for doanloaded file'
			},
			title: {
				type: 'string',
				description: 'Title for file',
				defaultValue: ''
			}
		}
	});
</script>

<Story
	name="Primary"
	args={{
		url: 'assets/undp-logo-blue.svg',
		title: 'undp-logo-blue.svg'
	}}
/>
