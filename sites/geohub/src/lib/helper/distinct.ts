export const distinct = (value: string, index: unknown, self: string | unknown[]) => {
	return self.indexOf(value) === index;
};
