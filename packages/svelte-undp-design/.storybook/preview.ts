import '@undp-data/undp-bulma/dist/style.css';

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
