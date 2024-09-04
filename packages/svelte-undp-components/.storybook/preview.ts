import type { Preview } from '@storybook/svelte';
import '@undp-data/undp-bulma/dist/style.css';

const preview: Preview = {
	parameters: {
		controls: {
			matchers: {
				color: /(background|color)$/i,
				date: /Date$/i
			}
		}
	}
};

export default preview;
