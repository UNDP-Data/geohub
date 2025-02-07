<script lang="ts" module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { fn } from '@storybook/test';
	import SearchExpand from './SearchExpand.svelte';
	const onchangeFn = fn().mockName('onchange');

	const { Story } = defineMeta({
		title: 'Components/SearchExpand',
		component: SearchExpand,
		tags: ['autodocs'],
		args: {
			onchange: onchangeFn()
		},
		argTypes: {
			value: {
				type: 'string',
				description: 'Input value in textbox',
				defaultValue: ''
			},
			minSearchLength: {
				type: 'number',
				description: 'Minimum length of character start seaching',
				defaultValue: 2
			},
			open: {
				type: 'boolean',
				description: 'If true, textbox is always expanded with underline.',
				defaultValue: false
			},
			placeholder: {
				type: 'string',
				description: 'Placeholder text for input element',
				defaultValue: 'type keywords to search'
			},
			timeout: {
				type: 'number',
				description: 'Timeout (ms) for debounce',
				defaultValue: 500
			},
			fontSize: {
				type: 'number',
				description: 'Font size. Value should be between 1 (3rem) and 7 (0.75rem).',
				defaultValue: 4
			},
			iconSize: {
				type: 'number',
				description: 'Icon size in pixel. Default is 24px.',
				defaultValue: 24
			},
			loading: {
				type: 'boolean',
				description: 'If true, switch search icon to loader',
				defaultValue: false
			},
			disabled: {
				type: 'boolean',
				description: 'If true, disable control',
				defaultValue: false
			},
			forbiddenCharacters: {
				description: `RegExp format for forbidden characters. As default, it prevent users to input & and | char which may affect PostgreSQL query`,
				defaultValue: /&|\|/g
			}
		}
	});
</script>

<Story name="Default" args={{}} />

<Story
	name="Large font"
	args={{
		iconSize: 36,
		fontSize: 2
	}}
/>

<Story
	name="Expand"
	args={{
		open: true
	}}
/>

<Story
	name="Disabled"
	args={{
		disabled: true,
		value: 'test'
	}}
/>

<Story
	name="Loading"
	args={{
		disabled: true,
		loading: true,
		open: true,
		value: 'test'
	}}
/>
