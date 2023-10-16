import { DatasetSortingColumns } from '../AppConfig';

export const DataPageSortingColumn = DatasetSortingColumns.find(
	(col) => col.value === 'updatedat,desc'
).value;
