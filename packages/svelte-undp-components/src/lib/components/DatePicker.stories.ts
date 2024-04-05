import type { Meta, StoryObj } from '@storybook/svelte';
import DatePicker from './DatePicker.svelte';
import dayjs from 'dayjs';

// More on how to set up stories at: https://storybook.js.org/docs/7.0/svelte/writing-stories/introduction
const meta = {
	title: 'Components/DatePicker',
	component: DatePicker,
	tags: ['autodocs'],
	argTypes: {
		value: {
			description:
				'A selected date currently. If value is after max date, max date will be default. If value is before min date, min date will be default. Otherwise, default is today.'
		},
		min: { description: 'Minimum date for picker. Default is 100 years before maximum date' },
		max: { description: 'Maximum date for picker. Default is today.' },
		enabledDates: {
			description:
				'Enabled dates. All dates will be disabled except them. Default is not specified. Disabled dates will be ignored if this is used.',
			defaultValue: []
		},
		disabledDates: {
			description: 'Disabled dates. Dates on the array will be disabled.',
			defaultValue: []
		},
		format: {
			type: 'string',
			description:
				'Date format shown in textbox. See dayjs documentation. https://day.js.org/docs/en/display/format',
			defaultValue: 'MMMM D, YYYY'
		},
		size: {
			control: 'select',
			options: ['small', 'normal', 'medium', 'large'],
			description: 'Size of date picker',
			defaultValue: 'normal'
		},
		tooltip: {
			type: 'string',
			description: 'Tooltip text for calendar button tooltip',
			defaultValue: 'Select a date'
		},
		icon: {
			type: 'string',
			description: 'Fontawesome class name for button icon',
			defaultValue: 'fas fa-calendar-days fa-lg'
		},
		disabled: {
			type: 'boolean',
			description: 'If true, the control will be disabled.',
			defaultValue: false
		},
		width: {
			type: 'number',
			description: 'Set width of textbox in pixel',
			defaultValue: undefined
		}
	}
} satisfies Meta<DatePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/7.0/svelte/writing-stories/args
export const Primary: Story = {
	args: {
		value: dayjs().toDate()
	}
};

export const Yesterday: Story = {
	args: {
		value: dayjs().add(-1, 'day').toDate()
	}
};

export const MinMaxDate: Story = {
	args: {
		value: dayjs().toDate(),
		min: dayjs().add(-1, 'week').toDate(),
		max: dayjs().add(1, 'week').toDate()
	}
};

const enabledDates = [
	dayjs().add(-3, 'day').toDate(),
	dayjs().add(-1, 'day').toDate(),
	dayjs().toDate(),
	dayjs().add(1, 'day').toDate(),
	dayjs().add(3, 'day').toDate()
];

export const EnabledDates: Story = {
	args: {
		value: dayjs().toDate(),
		enabledDates: [
			dayjs().add(-3, 'day').toDate(),
			dayjs().add(-1, 'day').toDate(),
			dayjs().toDate(),
			dayjs().add(1, 'day').toDate(),
			dayjs().add(3, 'day').toDate()
		],
		min: enabledDates[0],
		max: enabledDates[enabledDates.length - 1]
	}
};

export const DisabledDates: Story = {
	args: {
		value: dayjs().toDate(),
		disabledDates: [dayjs().add(-3, 'day').toDate(), dayjs().add(3, 'day').toDate()],
		min: dayjs().set('date', 1).toDate(),
		max: dayjs().set('date', dayjs().daysInMonth()).toDate()
	}
};

export const DateFormat: Story = {
	args: {
		value: dayjs().toDate(),
		format: 'YYYY/MM/DD'
	}
};

export const Small: Story = {
	args: {
		value: dayjs().toDate(),
		size: 'small'
	}
};

export const Normal: Story = {
	args: {
		value: dayjs().toDate(),
		size: 'normal'
	}
};

export const Medium: Story = {
	args: {
		value: dayjs().toDate(),
		size: 'medium'
	}
};

export const Large: Story = {
	args: {
		value: dayjs().toDate(),
		size: 'large'
	}
};

export const Disabled: Story = {
	args: {
		value: dayjs().toDate(),
		disabled: true
	}
};

export const SmallWithWidth: Story = {
	args: {
		value: dayjs().toDate(),
		size: 'small',
		width: 100
	}
};
