<script lang="ts" context="module">
	import type { Meta } from '@storybook/svelte';
	import Sidebar from './Sidebar.svelte';

	export const meta: Meta = {
		title: 'Components/Sidebar',
		component: Sidebar,
		tags: ['autodocs'],
		argTypes: {
			position: {
				control: 'select',
				options: ['left', 'right'],
				defaultValue: 'left'
			}
		}
	};
</script>

<script lang="ts">
	import { Story, Template } from '@storybook/addon-svelte-csf';
</script>

<Template let:args>
	<!--👇 'on:click' allows to forward event to addon-actions  -->
	<Sidebar {...args}>
		<div slot="content">sidebar content</div>
		<div slot="main">main content</div>
	</Sidebar>
</Template>

<Story name="Left sidebar" args={{ position: 'left', height: 300 }} />

<Story name="Right sidebar" args={{ position: 'right', height: 300 }} />

<Story name="Hide border" args={{ position: 'left', border: 'none', height: 300 }} />

<Story
	name="Hide toggle button"
	args={{ position: 'left', showToggleButton: false, height: 300 }}
/>

<Story name="Hide sidebar as default" args={{ position: 'left', show: false, height: 300 }} />
