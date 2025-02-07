<script lang="ts" module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { fn } from '@storybook/test';
	import Button from './Button.svelte';

	const onclickFn = fn().mockName('onclick');

	const { Story } = defineMeta({
		title: 'Components/Button',
		component: Button,
		tags: ['autodocs'],
		args: {
			onclick: onclickFn
		},
		argTypes: {
			title: {
				type: 'string',
				description: 'Title to be shown in button',
				defaultValue: undefined
			},
			isArrow: {
				type: 'boolean',
				description: 'If enabled, arrow will be shown in button',
				defaultValue: false
			},
			isDownload: {
				type: 'boolean',
				description:
					'If enabled, download icon will be shown in button. If isArrow is true, this is ignored',
				defaultValue: false
			},
			isExternalLink: {
				type: 'boolean',
				description:
					'If enabled, external link icon will be shown in button. If isArrow is true, this is ignored',
				defaultValue: false
			},
			isPrimary: {
				type: 'boolean',
				description: 'If enabled, primary color will be used',
				defaultValue: true
			},
			isDisabled: {
				type: 'boolean',
				description: 'If enabled, will disable selecting the button',
				defaultValue: false
			}
		}
	});
</script>

<Story
	name="Primary"
	args={{
		title: 'title',
		isArrow: true,
		isPrimary: true
	}}
/>

<Story
	name="Secondary"
	args={{
		title: 'title',
		isPrimary: false
	}}
/>

<Story
	name="Arrow Primary"
	args={{
		title: 'title',
		isArrow: true,
		isPrimary: true
	}}
/>

<Story
	name="Arrow Secondary"
	args={{
		title: 'title',
		isArrow: true,
		isPrimary: false
	}}
/>

<Story
	name="No Arrow Primary"
	args={{
		title: 'title',
		isArrow: false,
		isPrimary: true
	}}
/>

<Story
	name="No Arrow Secondary"
	args={{
		title: 'title',
		isArrow: false,
		isPrimary: false
	}}
/>

<Story
	name="Download Primary"
	args={{
		title: 'title',
		isArrow: false,
		isPrimary: true,
		isDownload: true
	}}
/>

<Story
	name="Download Secondary"
	args={{
		title: 'title',
		isArrow: false,
		isPrimary: false,
		isDownload: true
	}}
/>

<Story
	name="External Link Primary"
	args={{
		title: 'title',
		isArrow: false,
		isPrimary: true,
		isDownload: false,
		isExternalLink: true
	}}
/>

<Story
	name="External Link Secondary"
	args={{
		title: 'title',
		isArrow: false,
		isPrimary: false,
		isDownload: false,
		isExternalLink: true
	}}
/>

<Story
	name="Disabled"
	args={{
		title: 'title',
		isArrow: false,
		isPrimary: true,
		isDisabled: true
	}}
/>

<Story
	name="Disabled Arrow"
	args={{
		title: 'title',
		isArrow: true,
		isPrimary: true,
		isDisabled: true
	}}
/>

<Story
	name="Disabled Download"
	args={{
		title: 'title',
		isArrow: false,
		isPrimary: true,
		isDownload: true,
		isDisabled: true
	}}
/>

<Story
	name="Disabled External Link"
	args={{
		title: 'title',
		isArrow: false,
		isPrimary: true,
		isExternalLink: true,
		isDisabled: true
	}}
/>
