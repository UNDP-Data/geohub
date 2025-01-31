<script lang="ts" module>
	import type { SidebarItem } from '$lib';
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import Sidebar from './Sidebar.svelte';

	const { Story } = defineMeta({
		title: 'Components/Sidebar',
		component: Sidebar,
		tags: ['autodocs'],
		argTypes: {
			data: {
				description: 'An array of SidebarItem object to be shown at sidebar component'
			},
			isNarrow: {
				type: 'boolean',
				defaultValue: false,
				description: 'If enabled, make height narrower.'
			},
			isFixed: {
				type: 'boolean',
				defaultValue: false,
				description:
					'If true, sidebar width is fixed. if false, width will be flexiblely changed in accordance with parent component.'
			}
		}
	});

	const data: SidebarItem[] = [
		{
			href: '#',
			title: 'PAGE TITLE',
			children: [
				{
					href: '#',
					title: 'Subpage title'
				},
				{
					href: '#',
					title: 'Subpage with an exceptionally long title on two lines'
				},
				{
					href: '#',
					title: 'Subpage title'
				}
			]
		},
		{
			title: 'PAGE TITLE callback example',
			callback: () => {
				alert('clicked');
			}
		},
		{
			href: '#',
			title: 'PAGE TITLE',
			children: [
				{
					href: '#',
					title: 'Subpage title'
				},
				{
					href: '#',
					title: 'Subpage with an exceptionally long title on two lines'
				},
				{
					title: 'Subpage title callback example',
					callback: () => {
						alert('clicked');
					}
				}
			]
		},
		{
			href: '#',
			title: 'PAGE TITLE'
		},
		{
			href: '#',
			title: 'PAGE TITLE'
		}
	];
</script>

<Story
	name="Primary"
	args={{
		data,
		isNarrow: false
	}}
/>

<Story
	name="Narrow"
	args={{
		data,
		isNarrow: true
	}}
/>

<Story
	name="Full Width"
	args={{
		data,
		isNarrow: false,
		isFixed: false
	}}
/>
