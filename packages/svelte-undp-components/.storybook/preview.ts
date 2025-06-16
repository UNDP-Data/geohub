import type { Preview } from '@storybook/sveltekit';
import '@undp-data/undp-bulma/dist/undp-bulma.css';

const preview: Preview = {
	parameters: {
		controls: {
			matchers: {
				color: /(background|color)$/i,
				date: /Date$/i
			}
		}
	},

	tags: ['autodocs']
};

export default preview;
