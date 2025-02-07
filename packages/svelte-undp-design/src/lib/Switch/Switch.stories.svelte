<script lang="ts" module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { fn } from '@storybook/test';
	import Switch from './Switch.svelte';
	const onchangeFn = fn().mockName('onchange');

	const { Story } = defineMeta({
		title: 'Components/Switch',
		component: Switch,
		tags: ['autodocs'],
		args: {
			onchange: onchangeFn()
		},
		argTypes: {
			toggled: {
				type: 'boolean',
				defaultValue: false
			},
			size: {
				type: 'string',
				defaultValue: 'default',
				control: { type: 'select' },
				options: ['small', 'default']
			},
			disabled: {
				type: 'boolean',
				defaultValue: false
			},
			showIcon: {
				type: 'boolean',
				defaultValue: false
			},
			showValue: {
				type: 'boolean',
				defaultValue: false
			},
			label: {
				type: 'string',
				defaultValue: ''
			},
			toggledText: {
				type: 'string',
				defaultValue: 'On'
			},
			untoggledText: {
				type: 'string',
				defaultValue: 'Off'
			}
		}
	});
</script>

<Story
	name="Default"
	args={{
		size: 'default',
		toggled: true
	}}
/>

<Story
	name="Small"
	args={{
		size: 'small'
	}}
/>

<Story
	name="Disabled"
	args={{
		size: 'default',
		disabled: true
	}}
/>

<Story
	name="Show Icon"
	args={{
		size: 'default',
		toggled: true,
		showIcon: true
	}}
/>

<Story
	name="Show Value"
	args={{
		size: 'default',
		toggled: true,
		showValue: true
	}}
/>

<Story
	name="Show Icon And Value"
	args={{
		size: 'default',
		toggled: true,
		showIcon: true,
		showValue: true
	}}
/>

<Story
	name="Show Label"
	args={{
		size: 'default',
		toggled: true,
		label: 'Label:'
	}}
/>

<Story
	name="Show Label And Value"
	args={{
		size: 'default',
		toggled: true,
		label: 'Label:',
		showValue: true
	}}
/>

<Story
	name="Customise Value Text"
	args={{
		size: 'default',
		toggled: true,
		showValue: true,
		toggledText: 'Enabled',
		untoggledText: 'Disabled'
	}}
/>
