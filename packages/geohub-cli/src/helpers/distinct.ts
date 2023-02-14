export const distinct = (value: string | undefined, index: unknown, self: string | unknown[]) => {
	return value && self.indexOf(value) === index;
};
