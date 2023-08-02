export const colorOptions = [
	'is-black',
	'is-primary',
	'is-link',
	'is-info',
	'is-success',
	'is-warning',
	'is-danger',
	'is-primary is-light',
	'is-link is-light',
	'is-info is-light',
	'is-success is-light',
	'is-warning is-light',
	'is-danger is-light'
];

export const getBulmaTagColor = () => {
	const index = Math.floor(Math.random() * colorOptions.length);
	return colorOptions[index];
};
