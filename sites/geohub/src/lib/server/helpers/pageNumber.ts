export const pageNumber = (total: number, limit: number, offset: number) => {
	return offset >= total ? 1 : parseInt((offset / limit).toString()) + 1;
};
