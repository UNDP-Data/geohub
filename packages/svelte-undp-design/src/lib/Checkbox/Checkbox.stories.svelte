<script lang="ts" module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { fn } from '@storybook/test';
	import Checkbox from './Checkbox.svelte';
	const onclickFn = fn().mockName('onclick');

	const { Story } = defineMeta({
		title: 'Components/Checkbox',
		component: Checkbox,
		tags: ['autodocs'],
		args: {
			onclick: onclickFn()
		},
		argTypes: {
			label: {
				type: 'string',
				description: 'Label to be shown in checkbox',
				defaultValue: undefined
			},
			checked: {
				type: 'boolean',
				description: 'State of checkbox',
				defaultValue: false
			},
			disabled: {
				type: 'boolean',
				description: 'Disable checkbox based on this prop value',
				defaultValue: false
			}
		}
	});
</script>

<Story
	name="Primary"
	args={{
		label: 'checkbox label',
		checked: true,
		disabled: false
	}}
/>

<Story
	name="Unchecked"
	args={{
		label: 'checkbox label',
		checked: false,
		disabled: false
	}}
/>

<Story
	name="Disabled"
	args={{
		label: 'checkbox label',
		checked: false,
		disabled: true
	}}
/>
