import type { HeaderLink } from '$lib/interfaces';
import type { Meta, StoryObj } from '@storybook/svelte';

import Header from './Header.svelte';

// More on how to set up stories at: https://storybook.js.org/docs/7.0/svelte/writing-stories/introduction
const meta = {
	title: 'Example/Header',
	component: Header,
	tags: ['docsPage'],
	argTypes: {
		region: {
			type: 'string',
			description: 'Region name',
			defaultValue: undefined
		},
		siteTitle: {
			type: 'string',
			description: 'Site title name',
			defaultValue: undefined
		},
		url: {
			type: 'string',
			description: 'URL to link from logo',
			defaultValue: 'https://undp.org'
		},
		logoUrl: {
			type: 'string',
			description: 'UNDP logo URL',
			defaultValue: undefined
		},
		height: {
			type: 'number',
			description:
				'The height of header will be binded in this property in case you want to use it on other component.',
			defaultValue: 75
		},
		showProgressBar: {
			type: 'boolean',
			description: 'If enabled, progress bar will be shown in the bottom of header',
			defaultValue: false
		},
		isPositionFixed: {
			type: 'boolean',
			description: 'If enabled, header will be shown at the top of window',
			defaultValue: true
		},
		progressBarSize:{
			type: 'string',
			description: 'Size of progress bar',
			defaultValue: 'small'
		}
	}
} satisfies Meta<Header>;

export default meta;
type Story = StoryObj<typeof meta>;

const links: HeaderLink[] = [
	{
		id: 'headerLink1',
		title: 'Link 1',
		href: '#',
		icon: 'fa-solid fa-user'
	},
	{
		id: 'headerLink2',
		title: 'Link 2',
		href: '#',
		icon: 'fa-solid fa-user'
	},
	{
		id: 'headerLink3',
		title: 'Link 3',
		href: '#',
		icon: 'fa-solid fa-user'
	},
	{
		id: 'headerLink4',
		title: 'Link 4',
		href: '#',
		icon: 'fa-solid fa-user'
	}
	// {
	// 	id: 'headerLink5',
	// 	title: 'Link 5',
	// 	href: '#',
	// 	icon: 'fa-solid fa-user'
	// },
	// {
	// 	id: 'headerLink6',
	// 	title: 'Link 6',
	// 	href: '#',
	// 	icon: 'fa-solid fa-user'
	// }
];

// More on writing stories with args: https://storybook.js.org/docs/7.0/svelte/writing-stories/args
export const Primary: Story = {
	args: {
		region: 'REGION',
		siteTitle: 'Site Title',
		url: 'https://undpgeohub.org',
		logoUrl: 'assets/undp-logo-blue.svg',
		showProgressBar: false,
		links: links,
		progressBarSize: 'small'
	}
};

// Example source code
// <Header
// 	region="REGION"
// 	siteTitle="Site Title"
// 	url="https://undpgeohub.org"
// 	logoUrl="assets/undp-logo-blue.svg"
// 	bind:showProgressBar
// 	bind:height={headerHeight}
// >
// 	<div slot="menu-buttons" class="menu-buttons">
// 		<div role="button" aria-label="Layer panel" class="menu-button" tabindex="0">
// 			<span class="icon">
// 				<i class="fa-solid fa-bars fa-xl" />
// 			</span>
// 		</div>

// 		<div role="button" aria-label="Layer panel" class="menu-button" tabindex="0">
// 			<span class="icon">
// 				<i class="fa-solid fa-bars fa-xl" />
// 			</span>
// 		</div>
// 	</div>
// </Header>
