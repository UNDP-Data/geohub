import { cleanName, generateHashKey } from '../helpers';
import { Dataset, PgtileservIndexJson, PgtileservDetailJson } from '../interfaces';

class PgtileservManager {
	private pgtileservUrl: string;

	constructor(pgtileservUrl: string) {
		this.pgtileservUrl = pgtileservUrl;
	}

	public async load() {
		const res = await fetch(this.pgtileservUrl);
		const indexJson: PgtileservIndexJson = await res.json();
		const datasets: Dataset[] = [];
		const tableNames = Object.keys(indexJson);
		for (let i = 0; i < tableNames.length; i++) {
			const id = tableNames[i];
			const layer = indexJson[id];

			const detailUrl = layer.detailurl;
			const resDetail = await fetch(detailUrl);
			const detailJson: PgtileservDetailJson = await resDetail.json();

			const now = new Date().toISOString();
			let bounds = detailJson.bounds;
			if (!bounds) {
				bounds = [-180, -90, 180, 90];
			}

			const dataset: Dataset = {
				id: generateHashKey(detailJson.tileurl),
				url: detailJson.tileurl,
				is_raster: false,
				name: `${layer.schema} ${cleanName(layer.name)}`,
				description: layer.description,
				source: `United Nations Development Programme`,
				bounds: bounds,
				createdat: now,
				updatedat: now,
				tags: [
					{
						key: 'type',
						value: 'pgtileserv'
					},
					{
						key: 'layertype',
						value: layer.type
					},
					{
						key: 'schema',
						value: layer.schema
					},
					{
						key: 'table',
						value: layer.name
					},
					{
						key: 'id',
						value: layer.id
					}
				]
			};
			if (detailJson.geometrytype) {
				dataset.tags?.push({
					key: 'geometrytype',
					value: detailJson.geometrytype
				});
			}
			datasets.push(dataset);
		}
		return { datasets: datasets };
	}
}

export default PgtileservManager;
