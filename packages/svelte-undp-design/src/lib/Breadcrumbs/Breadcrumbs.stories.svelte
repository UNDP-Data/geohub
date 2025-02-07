<script lang="ts" module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import type { Breadcrumb } from '../interfaces';
	import Breadcrumbs from './Breadcrumbs.svelte';

	const breadcrumbs: Breadcrumb[] = [
		{
			name: 'Home',
			icon: 'fas fa-house',
			url: ''
		},
		{
			name: 'Search result',
			icon: 'fas fa-magnifying-glass',
			url: ''
		}
	];

	const { Story } = defineMeta({
		title: 'Components/Breadcrumbs',
		component: Breadcrumbs,
		tags: ['autodocs'],
		argTypes: {
			breadcrumbs: {
				description: `Breadcrumbs data to be shown. Each object should contain 'name', 'icon' and 'url'. URL is optional. Icon can use either fontawesome of any icon image's URL. flag-icon package's icon also can be used. You have to import fontawesome or flag-icon CSS if you want to use it.`,
				defaultValue: []
			},
			fontSize: {
				type: 'string',
				description: 'Font size either large, medium or small',
				defaultValue: 'medium',
				control: { type: 'select' },
				options: ['small', 'medium', 'large']
			},
			disabled: {
				type: 'boolean',
				description: 'Disable breadcrumbs',
				defaultValue: false
			}
		}
	});
</script>

<Story
	name="Primary"
	args={{
		breadcrumbs: breadcrumbs
	}}
/>

<Story
	name="Small"
	args={{
		breadcrumbs: breadcrumbs,
		fontSize: 'small'
	}}
/>

<Story
	name="Medium"
	args={{
		breadcrumbs: breadcrumbs,
		fontSize: 'medium'
	}}
/>

<Story
	name="Large"
	args={{
		breadcrumbs: breadcrumbs,
		fontSize: 'large'
	}}
/>

<Story
	name="Disabled"
	args={{
		breadcrumbs: breadcrumbs,
		disabled: true
	}}
/>
