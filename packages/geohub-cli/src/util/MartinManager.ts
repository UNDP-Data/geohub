import { cleanName, generateHashKey } from '../helpers';
import { MartinIndexJson, Dataset } from '../interfaces';

class MartinManager {
	private martinUrl: string;

	constructor(martinUrl: string) {
		this.martinUrl = martinUrl;
	}

	public async load() {
		const res = await fetch(this.martinUrl);
		const indexJson: MartinIndexJson = await res.json();
		const datasets: Dataset[] = [];
		Object.keys(indexJson).forEach((tableName) => {
			const layer = indexJson[tableName];
			const datasetUrl = this.martinUrl.replace('index', layer.id);
			const now = new Date().toISOString();

			const dataset: Dataset = {
				id: generateHashKey(datasetUrl),
				url: datasetUrl,
				is_raster: false,
				name: `${layer.schema} ${cleanName(layer.table)}`,
				description: `${layer.table} data in ${layer.schema} schema in PostGIS database`,
				bounds: layer.bounds,
				createdat: now,
				updatedat: now,
				tags: [
					{
						key: 'type',
						value: 'martin'
					},
					{
						key: 'schema',
						value: layer.schema
					},
					{
						key: 'table',
						value: layer.table
					},
					{
						key: 'geometry_column',
						value: layer.geometry_column
					},
					{
						key: 'geometry_type',
						value: layer.geometry_type
					},
					{
						key: 'srid',
						value: layer.srid.toString()
					},
					{
						key: 'id',
						value: layer.id
					},
					{
						key: 'provider',
						value: 'United Nations Development Programme (UNDP)'
					}
				]
			};
			if (layer.id_column) {
				dataset.tags?.push({
					key: 'id_column',
					value: layer.id_column
				});
			}
			datasets.push(dataset);
		});

		return { datasets: datasets };
	}
}

export default MartinManager;
