<script lang="ts" module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { fn } from '@storybook/test';
	import Chips from './Chips.svelte';
	const ondeleteFn = fn().mockName('ondelete');

	const { Story } = defineMeta({
		title: 'Components/Chips',
		component: Chips,
		tags: ['autodocs'],
		args: {
			ondelete: ondeleteFn()
		},
		argTypes: {
			label: {
				type: 'string',
				description: 'Label to be shown in chip',
				defaultValue: undefined
			},
			showDelete: {
				type: 'boolean',
				description: 'Show delete button if true',
				defaultValue: false
			}
		}
	});
</script>

<Story
	name="Primary"
	args={{
		label: 'Label',
		showDelete: false
	}}
/>

<Story
	name="Show Close"
	args={{
		label: 'Label',
		showDelete: true
	}}
/>
