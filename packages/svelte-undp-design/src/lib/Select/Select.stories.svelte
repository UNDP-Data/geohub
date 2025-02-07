<script lang="ts" module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { fn } from '@storybook/test';
	import Select from './Select.svelte';
	const onselectFn = fn().mockName('onselect');

	const { Story } = defineMeta({
		title: 'Components/Select',
		component: Select,
		tags: ['autodocs'],
		args: {
			onselect: onselectFn()
		},
		argTypes: {
			placeholder: {
				type: 'string',
				description: 'Placeholder of selectbox'
			},
			items: {
				description: 'The list of items of SelectItem interface'
			},
			selectedItem: {
				description: 'Selected item'
			}
		}
	});

	const items = [
		{ label: 'All', value: 'default' },
		{ label: 'Pasto', value: 'pasto' },
		{ label: 'Dari', value: 'dari' },
		{ label: 'English', value: 'english' },
		{ label: 'Albanian', value: 'albanian' },
		{ label: 'Arabic', value: 'arabic' },
		{ label: 'Portuguese', value: 'portuguese' }
	];
</script>

<Story
	name="Primary"
	args={{
		placeholder: 'Category',
		items: items,
		selectedItem: undefined
	}}
/>

<Story
	name="Selected"
	args={{
		placeholder: 'Category',
		items: items,
		selectedItem: items[items.length - 1]
	}}
/>
