<script lang="ts" module>
	import type { Tab } from '$lib/interfaces';
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import Tabs from './Tabs.svelte';

	const { Story } = defineMeta({
		title: 'Components/Tabs',
		component: Tabs,
		tags: ['autodocs'],
		argTypes: {
			tabs: {
				// type: 'string',
				description: 'Items to be shown as tabs. Icon can use from fontawesome.',
				defaultValue: undefined
			},
			activeTab: {
				type: 'string',
				description: 'Active tab selected',
				defaultValue: undefined
			},
			height: {
				type: 'number',
				description: 'The height of tabs will be bined in this property',
				defaultValue: undefined
			},
			fontSize: {
				type: 'string',
				description: 'Font size either medium or small',
				defaultValue: 'medium',
				control: { type: 'select' },
				options: ['medium', 'small']
			},
			isToggleTab: {
				type: 'boolean',
				description: 'If enabled, tab can be toggled',
				defaultValue: false
			}
		}
	});

	const tabs: Tab[] = [
		{ id: 'data', label: 'Data', icon: 'fas fa-database' },
		{ id: 'layer', label: 'Layer', icon: 'fas fa-layer-group' }
	];
	const activeTab = tabs[0].label;
</script>

<Story
	name="Small"
	args={{
		tabs: tabs,
		activeTab: activeTab,
		height: 40,
		fontSize: 'small',
		isToggleTab: false
	}}
/>

<Story
	name="Medium"
	args={{
		tabs: tabs,
		activeTab: activeTab,
		height: 40,
		fontSize: 'medium',
		isToggleTab: false
	}}
/>

<Story
	name="Large"
	args={{
		tabs: tabs,
		activeTab: activeTab,
		height: 40,
		fontSize: 'large',
		isToggleTab: false
	}}
/>

<Story
	name="Toggled"
	args={{
		tabs: tabs,
		activeTab: activeTab,
		height: 40,
		fontSize: 'medium',
		isToggleTab: true
	}}
/>
