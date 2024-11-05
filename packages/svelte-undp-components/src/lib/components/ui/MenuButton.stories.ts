import type { Meta, StoryObj } from '@storybook/svelte';
import MenuButton from './MenuButton.svelte';

// More on how to set up stories at: https://storybook.js.org/docs/7.0/svelte/writing-stories/introduction
const meta = {
	title: 'Components/UI/MenuButton',
	component: MenuButton,
	tags: ['autodocs'],
	argTypes: {
		button: {
			description: 'MenuButton object. It will be shown the right side of title.'
		},
		subButtons: {
			description: `MenuSubButton object array. It will be shown as dropdown menu under main button.`
		},
		color: {
			control: 'select',
			options: ['primary', 'link', 'info', 'warning', 'danger', 'success', ''],
			description: 'Color of button',
			defaultValue: 'primary'
		}
	}
} satisfies Meta<MenuButton>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/7.0/svelte/writing-stories/args
export const Primary: Story = {
	args: {
		button: {
			title: 'Data upload',
			href: '#',
			tooltip: 'Please upload your datasets to GeoHub!'
		},
		subButtons: [
			{
				title: 'Import external file',
				href: '#',
				tooltip: 'Import a cloud optimized file from external source.',
				callback: (btn) => {
					console.log(btn);
				}
			}
		]
	}
};
