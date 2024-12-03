import type { Meta, StoryObj } from '@storybook/svelte';

import Button from './Button.svelte';

// More on how to set up stories at: https://storybook.js.org/docs/7.0/svelte/writing-stories/introduction
const meta = {
	title: 'Components/Button',
	component: Button,
	tags: ['autodocs'],
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
} satisfies Meta<Button>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/7.0/svelte/writing-stories/args
export const Primary: Story = {
	args: {
		title: 'title',
		isArrow: true,
		isPrimary: true
	}
};

export const Secondary: Story = {
	args: {
		title: 'title',
		isPrimary: false
	}
};

export const ArrowPrimary: Story = {
	args: {
		title: 'title',
		isArrow: true,
		isPrimary: true
	}
};

export const ArrowSecondary: Story = {
	args: {
		title: 'title',
		isArrow: true,
		isPrimary: false
	}
};

export const NoArrowPrimary: Story = {
	args: {
		title: 'title',
		isArrow: false,
		isPrimary: true
	}
};

export const NoArrowSecondary: Story = {
	args: {
		title: 'title',
		isArrow: false,
		isPrimary: false
	}
};

export const DownloadPrimary: Story = {
	args: {
		title: 'title',
		isArrow: false,
		isPrimary: true,
		isDownload: true
	}
};

export const DownloadSecondary: Story = {
	args: {
		title: 'title',
		isArrow: false,
		isPrimary: false,
		isDownload: true
	}
};

export const ExternalLinkPrimary: Story = {
	args: {
		title: 'title',
		isArrow: false,
		isPrimary: true,
		isDownload: false,
		isExternalLink: true
	}
};

export const ExternalLinkSecondary: Story = {
	args: {
		title: 'title',
		isArrow: false,
		isPrimary: false,
		isDownload: false,
		isExternalLink: true
	}
};

export const Disabled: Story = {
	args: {
		title: 'title',
		isArrow: false,
		isPrimary: true,
		isDisabled: true
	}
};

export const DisabledArrow: Story = {
	args: {
		title: 'title',
		isArrow: true,
		isPrimary: true,
		isDisabled: true
	}
};

export const DisabledDownload: Story = {
	args: {
		title: 'title',
		isArrow: false,
		isPrimary: true,
		isDownload: true,
		isDisabled: true
	}
};

export const DisabledExternalLink: Story = {
	args: {
		title: 'title',
		isArrow: false,
		isPrimary: true,
		isExternalLink: true,
		isDisabled: true
	}
};
