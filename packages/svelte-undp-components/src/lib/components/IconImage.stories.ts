import type { Meta, StoryObj } from '@storybook/svelte';
import IconImage from './IconImage.svelte';

// More on how to set up stories at: https://storybook.js.org/docs/7.0/svelte/writing-stories/introduction
const meta = {
	title: 'Components/IconImage',
	component: IconImage,
	tags: ['autodocs'],
	argTypes: {
		selected: {
			type: 'string',
			description: 'selected icon name'
		},
		images: {
			description:
				'An array of image objects. Each object should have alt and src properties. alt is unique icon name, and src is data URL of an image.',
			defaultValue: []
		},
		readonly: {
			type: 'boolean',
			description: 'If true, disable icon image button',
			defaultValue: false
		}
	}
} satisfies Meta<IconImage>;

export default meta;
type Story = StoryObj<typeof meta>;

const images = [
	{
		src: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAYAAAA7MK6iAAABE0lEQVR4AeXBP0ocYRwA0De/DAEbg6V/wq7TegNB7GNra+sN0lt6BPcCuUAKT+ANLFKEcRbFUpNOF+O6MAMfQhxUmHxF3pNL4X2WcIA7fMOD1gpGGGOETYwxxgjn2LFQeptljHCML1pf8QdjfNJvrlN4bgmrqFChQoUKa1jV7w7XqFGjRo0aNW51CskZtvX7jQYltrS+4wgNbrxSKXnEL0zRoMEFpmgwxa3WR9xr7WPmjUrJjtebSWbeIWQSMgmZFJI9TLBuGFc4xKmFkJxg3XA2MNEJyYbhfdYJmZReVug31yr0m/uLkEnIJGQSMgmZhExCJoVk7t8oLIRMQiYhk5BcGd6lzgfJD+xi2TAucYif/ktPaJ8yCaIF03cAAAAASUVORK5CYII=',
		alt: 'aerialway'
	},
	{
		src: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAYAAAA7MK6iAAABYUlEQVR4Ae3BPWtTUQAA0PPuoz+gDoLUVjpIEdy0GdSl0myiReime8FJBPUfaEchOLrpKKUVHBK6FB3dtVuDH39AKUgTh164L01sE/rupOf45xTGt4AVNDGDWYe6+Io2NvDZGAonu4p13DSej3iMD45R+LspvMAaCpPp4yUe4rcRSqOdwTusojC5Ag3cwCb2HVEaNoUtLDm9eVzDaxyoKA1rYVV9LmAa71UEgxaxpn4PcEVFMGgdhfoVeK4iSC5hST7LWBAFyR353RYFybL8mqIgmZPfnChIzslvRhQkffn1REHyXX7fREGyJ789UZB05NcWBclb+W2KgmQX2/Lp4IsoGPQIPfXr46mK0qAfOIuGerXwSkVpWBvXMa8eO7iHAxWlYT1soYF5p7ONu/jpiNJo+3iDaSyiMJkeWriPX0YonOwynuGW8XTwBJ8cozC+i1hBE7M471AXXXSwgV3/jfAH9Iw923TSOkQAAAAASUVORK5CYII=',
		alt: 'circle'
	},
	{
		src: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAYAAAA7MK6iAAABcElEQVR4Ae3BsWpTYRgA0HP/tFhEQdBJl9TFSRClQ+Mg6DOIo+JUEJ9BoQ+QUd9BhEKtBaUhIO0gLgUHdREdRBCJQo1VUuOQIYTkv73fnRw8pxB3Cato4QfWcR+fBRRiLuMZjpr0Di18VVFDzGM0TTuJP9hSUVLdcSzJuyogqS5hKK8Q0HC4AtdxExcwZ7Z9nME+PjpEodwxrOGamAe4g6GMhnJt3BC3hPfYlZHkLeC2+m4pkeSdwIK8vnKnlUjyvqAnr4uevDdKJHkHaJttgHtom22AVSUaym1jHstIRvawgk1sYx7LSEb2sIJNJQrVLKKFPrrombSIFvrooudf1VDPRTzEFbzGd0GF6o7gEc6jadJbPMddFSXV/cIpNE07h4GAJGZDXkdAEvPEbAd4ISCJ2cUH017hm4Ak7qlpHUFJ3IZpHUFJXAd9Y7+xIyiJ+4ktYzvoC0rq2TDWUUNSzzqGRjpqmFPPJ6zhLF76r4K/4IpMNiVJANwAAAAASUVORK5CYII=',
		alt: 'ice-cream'
	},
	{
		src: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAYAAAA7MK6iAAAAwElEQVR4Ae3BsVEDMRAAwNWNQqjCPVEG5OTfAO4CarKLYIYQi0DBBzaP5uxBAez6c4ptzfWKC8Ik1Zid1UG3szroilWzoRpzdO7oCmGSMEmYJEwSJqluqxkUJqlu6xkveMJiQzWmOdec2+MDeyw2hNt6xB0e/aAa82D1qgs03ONdt2AxoBrz5ntNQpUX+ESzKlbNhpBXdCcJIS90TULIK7qThJBXdE1CyAtdkxDyiu4kIeSFrkkotjXXKy4I/37JFysGHzYZ7OR2AAAAAElFTkSuQmCC',
		alt: 'prison'
	},
	{
		src: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAYAAAA7MK6iAAABdElEQVR4Ae3BvWsTcQAA0Hd3oWARQRGLwS8UrOjWyUG71AZBHBwE0VGwUNBVcDEt6F+gFt1Esgg61aFDERHpIEiXQCiCQxGHiIO0aOiicMKvyeWKsZfJvGdgoF8ixTmGW5jEQbSwhFm81yFSjAm8xC5ZG7iJxzZJbF8Zi9ituwQXsIYlfyS2ZwjzOGFrESr4iXd+S/y7o3iOcX/vHDbwNpLvOGZQwR7Fuhvp7hJq2KFPIllX8RQlfRRpN4VHiPXPOl5Fgmk8QKR4n3HAJrHUHTzELCIsK9aCDjGu4B5mUMV+nFScj7itQwlVqarUDQzJWsEYjmAcExjDCIZlreAF7mNNhxJG0RRcFtRwTWoe66ijjjlBE3u1G7WFGF8wJXUYp6Q+YVqwIF9Dj0ooC04LruO74IN8DZzRg1i7Q1Jv8FrwDV/la+hRrN2I1LKgiZ3YJ19d1jPEciTatXARZ7GIVbRQwSSe6G4V51EWDKOGHwYG/gu/AMXERIrzSGBkAAAAAElFTkSuQmCC',
		alt: 'zoo'
	}
];

// More on writing stories with args: https://storybook.js.org/docs/7.0/svelte/writing-stories/args
export const Primary: Story = {
	args: {
		selected: 'circle',
		images: images
	}
};

export const Readonly: Story = {
	args: {
		selected: 'circle',
		images: images,
		readonly: true
	}
};
