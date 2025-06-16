import '@undp-data/undp-bulma/dist/undp-bulma.css';

export const parameters = {
	backgrounds: {
		default: 'light'
	},
	controls: {
		matchers: {
			color: /(background|color)$/i,
			date: /Date$/
		}
	}
};
export const tags = ['autodocs'];
