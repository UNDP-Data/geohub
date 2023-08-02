import type { ColorMapRow } from '$lib/types';

export const updateIntervalValues = (event: CustomEvent, colorMapRows: ColorMapRow[]) => {
	const rowIndex = event.detail.index;
	const inputType = event.detail.id;
	let inputValue = event.detail.value as number;
	const currentRow = colorMapRows.at(rowIndex);
	if (rowIndex == 0) {
		const nextRow = colorMapRows.at(rowIndex + 1);
		if (inputType == 'start') {
			inputValue =
				!isNaN(inputValue) && inputValue < currentRow.end && inputValue >= currentRow.start
					? inputValue
					: (currentRow.start as number);
			colorMapRows[rowIndex].start = inputValue;
		} else {
			inputValue =
				!isNaN(inputValue) && inputValue > currentRow.start && inputValue < nextRow.end
					? inputValue
					: (currentRow.end as number);
			colorMapRows[rowIndex].end = inputValue;
			colorMapRows[rowIndex + 1].start = inputValue;
		}
	} else if (rowIndex == colorMapRows.length - 1) {
		const prevRow = colorMapRows.at(rowIndex - 1);
		if (inputType == 'start') {
			inputValue =
				!isNaN(inputValue) && inputValue < currentRow.end && inputValue > prevRow.start
					? inputValue
					: (currentRow.start as number);
			colorMapRows[rowIndex].start = inputValue;
			colorMapRows[rowIndex - 1].end = inputValue;
		} else {
			inputValue =
				!isNaN(inputValue) && inputValue <= currentRow.end && inputValue > prevRow.start
					? inputValue
					: (currentRow.end as number);
			colorMapRows[rowIndex].end = inputValue;
		}
	} else {
		const nextRow = colorMapRows.at(rowIndex + 1);
		const prevRow = colorMapRows.at(rowIndex - 1);

		if (inputType == 'start') {
			inputValue =
				!isNaN(inputValue) && inputValue > prevRow.start && inputValue < currentRow.end
					? inputValue
					: (currentRow.start as number);
			colorMapRows[rowIndex].start = inputValue;
			colorMapRows[rowIndex - 1].end = inputValue;
		} else {
			inputValue =
				!isNaN(inputValue) && inputValue > currentRow.start && inputValue < nextRow.end
					? inputValue
					: (currentRow.end as number);
			colorMapRows[rowIndex].end = inputValue;
			colorMapRows[rowIndex + 1].start = inputValue;
		}
	}
	return colorMapRows;
};
