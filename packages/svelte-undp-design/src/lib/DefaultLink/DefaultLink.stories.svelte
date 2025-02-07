<script lang="ts" module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import DefaultLink from './DefaultLink.svelte';

	const { Story } = defineMeta({
		title: 'Components/DefaultLink',
		component: DefaultLink,
		tags: ['autodocs'],
		argTypes: {
			title: {
				type: 'string',
				description: 'Label and tooltip to be shown in link',
				defaultValue: 'UNDP'
			},
			href: {
				type: 'boolean',
				description: 'The URL that the hyperlink points to',
				defaultValue: false
			},
			target: {
				type: 'string',
				description: 'Where the linked document is to be opened',
				defaultValue: '_blank'
			}
		}
	});
</script>

<Story
	name="Primary"
	args={{
		title: 'UNDP',
		href: 'https://undp.org',
		target: '_blank'
	}}
/>
