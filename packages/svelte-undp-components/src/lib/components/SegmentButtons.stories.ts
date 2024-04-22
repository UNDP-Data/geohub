import type { Meta, StoryObj } from '@storybook/svelte';
import SegmentButtons, { type SegmentButton } from './SegmentButtons.svelte';

// More on how to set up stories at: https://storybook.js.org/docs/7.0/svelte/writing-stories/introduction
const meta = {
	title: 'Components/SegmentButtons',
	component: SegmentButtons,
	tags: ['autodocs'],
	argTypes: {
		buttons: {
			description: 'An array of SegmentButton objects'
		},
		selected: {
			type: 'string',
			description:
				'Selected value either string or number data type. It is not used when multiSelect is false.'
		},
		multiSelect: {
			type: 'boolean',
			description: 'If true, segment button will be multi select toggle buttons',
			defaultValue: false
		},
		selectedItems: {
			description: 'The state of segment button items. It is used when multiSelect is true'
		},
		wrap: {
			type: 'boolean',
			description: 'If true, wrap segment buttons',
			defaultValue: false
		},
		size: {
			control: 'select',
			options: ['small', 'normal', 'medium', 'large'],
			defaultValue: 'normal'
		},
		capitalized: {
			type: 'boolean',
			description: 'If true, capitalize title',
			defaultValue: false
		},
		uppercase: {
			type: 'boolean',
			description: 'If true, transform title to uppercase',
			defaultValue: false
		},
		fontWeight: {
			control: 'select',
			options: ['light', 'normal', 'medium', 'semibold', 'bold'],
			description: 'Font weight of tab title',
			defaultValue: 'normal'
		}
	}
} satisfies Meta<SegmentButtons>;

export default meta;
type Story = StoryObj<typeof meta>;

const buttons: SegmentButton[] = [
	{
		title: 'button a',
		value: 'a'
	},
	{
		title: 'button b',
		value: 'b'
	},
	{
		title: 'button c',
		value: 'c'
	},
	{
		title: 'button d',
		value: 'd'
	},
	{
		title: 'button e',
		value: 'e'
	},
	{
		title: 'button f',
		value: 'f'
	}
];

// More on writing stories with args: https://storybook.js.org/docs/7.0/svelte/writing-stories/args
export const Primary: Story = {
	args: {
		buttons,
		selected: buttons[0].value
	}
};

export const MultiSelect: Story = {
	args: {
		buttons,
		multiSelect: true,
		selectedItems: {
			c: true,
			e: true
		}
	}
};

export const WithIcons: Story = {
	args: {
		buttons: [
			{ title: 'Card', icon: 'fa-solid fa-border-all', value: 'card' },
			{ title: 'List', icon: 'fa-solid fa-list', value: 'list' },
			{ title: 'Map', icon: 'fa-solid fa-map', value: 'map' }
		],
		selected: 'card'
	}
};

const longButtons = [
	...buttons,
	{
		title: 'button g',
		value: 'g'
	},
	{
		title: 'button h',
		value: 'h'
	},
	{
		title: 'button i',
		value: 'i'
	},
	{
		title: 'button j',
		value: 'j'
	},
	{
		title: 'button k',
		value: 'k'
	},
	{
		title: 'button l',
		value: 'l'
	}
];

export const Wrap: Story = {
	args: {
		buttons: longButtons,
		selected: longButtons[0].value,
		wrap: true
	}
};

export const WithoutWrap: Story = {
	args: {
		buttons: longButtons,
		selected: longButtons[0].value,
		wrap: false
	}
};

export const Capitalized: Story = {
	args: {
		buttons: longButtons,
		selected: longButtons[0].value,
		wrap: true,
		capitalized: true
	}
};

export const Uppercase: Story = {
	args: {
		buttons: longButtons,
		selected: longButtons[0].value,
		wrap: true,
		uppercase: true
	}
};

export const Small: Story = {
	args: {
		buttons,
		selected: buttons[0].value,
		size: 'small'
	}
};

export const Normal: Story = {
	args: {
		buttons,
		selected: buttons[0].value,
		size: 'normal'
	}
};

export const Medium: Story = {
	args: {
		buttons,
		selected: buttons[0].value,
		size: 'medium'
	}
};

export const Large: Story = {
	args: {
		buttons,
		selected: buttons[0].value,
		size: 'large'
	}
};

export const LightFont: Story = {
	args: {
		buttons,
		selected: buttons[0].value,
		fontWeight: 'light'
	}
};

export const NormalFont: Story = {
	args: {
		buttons,
		selected: buttons[0].value,
		fontWeight: 'normal'
	}
};

export const MediumFont: Story = {
	args: {
		buttons,
		selected: buttons[0].value,
		fontWeight: 'medium'
	}
};

export const SemiboldFont: Story = {
	args: {
		buttons,
		selected: buttons[0].value,
		fontWeight: 'semibold'
	}
};

export const BoldFont: Story = {
	args: {
		buttons,
		selected: buttons[0].value,
		fontWeight: 'bold'
	}
};
