<script lang="ts" module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { fn } from '@storybook/test';
	import Radios from './Radios.svelte';
	const onchangeFn = fn().mockName('onchange');

	const { Story } = defineMeta({
		title: 'Components/Radios',
		component: Radios,
		tags: ['autodocs'],
		args: {
			onchange: onchangeFn()
		},
		argTypes: {
			radios: {
				// type: 'string',
				description: 'Items to be shown as radio buttons',
				defaultValue: undefined
			},
			groupName: {
				type: 'string',
				description: 'Group name of radio buttons',
				defaultValue: undefined
			},
			value: {
				type: 'string',
				description: 'Selected radio button value binded in this component',
				defaultValue: undefined
			},
			isVertical: {
				type: 'boolean',
				description: 'If enabled, radio buttons are shown in vertical alignment',
				defaultValue: false
			},
			allowHtml: {
				type: 'boolean',
				description: 'If enabled, HTML text can be used in label of radio buttons',
				defaultValue: false
			}
		}
	});
</script>

<Story
	name="Horizontal layout"
	args={{
		radios: [
			{
				label: 'radio A',
				value: 'a'
			},
			{ label: 'radio B', value: 'b' }
		],
		groupName: 'radio-buttons-1',
		value: 'a',
		isVertical: false
	}}
/>

<Story
	name="Vertical layout"
	args={{
		radios: [
			{
				label: 'radio A',
				value: 'a'
			},
			{ label: 'radio B', value: 'b' }
		],
		groupName: 'radio-buttons-2',
		value: 'a',
		isVertical: true
	}}
/>

<Story
	name="Custom Styled Label"
	args={{
		radios: [
			{
				label: '<b>radio A</b>',
				value: 'a'
			},
			{ label: '<b>radio B</b>', value: 'b' }
		],
		groupName: 'radio-buttons-3',
		value: 'a',
		isVertical: false,
		allowHtml: true
	}}
/>
