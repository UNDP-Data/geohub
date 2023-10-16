import { VectorTile } from '@mapbox/vector-tile';
import Pbf from 'pbf';
import arraystat from 'arraystat';
import { mean, std, median } from 'mathjs';
import { UniqueValueThreshold } from '$lib/config/AppConfig';

// fetch vector tiles info from
export const fetchVectorTileInfo = async (path: string, layerName: string) => {
	let attributesArray = [];

	let pbf: Pbf;

	await fetch(`${path}`)
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		.then((response) => (response?.path ? response.json() : response.arrayBuffer()))
		.then((arrayBuffer) => (pbf = new Pbf(arrayBuffer)))
		.catch((error) => (attributesArray = error));

	const tile: VectorTile = new VectorTile(pbf);

	const layer = tile.layers[layerName];
	if (!layer) {
		// layerName doesn't exist in layers
		throw new Error(`We couldn't find a layer with that name.`);
	}

	// since we are pushing values, we need to force the attributesArray to be empty at this point

	if (attributesArray.length > 0) {
		attributesArray = [];
	}

	let geometryType: number;
	const propsObj = {};

	// The layer._keys is a list with all the available attributes in the layer.
	// Mapping through the attributes to get the attributeArray object
	layer['_keys'].map((property) => {
		propsObj[property] = [];

		for (let featureIndex = 0; featureIndex < layer.length; featureIndex++) {
			const feature = layer.feature(featureIndex);
			geometryType = feature.type;
			if (!feature.properties?.[property]) continue;
			let value = Number(feature.properties[property]);
			if (!value) {
				value = feature.properties[property];
			}
			layer['_keys'][property] = propsObj[property].push(value);
		}

		const firstValue = propsObj[property][0];
		if (!firstValue) return;
		const dataType = String(typeof firstValue);

		if (isNaN(firstValue)) {
			// The first value is not a number, mathematical operations will result in NaN
			const values = [...new Set(propsObj[property])];
			const attribute = {
				attribute: property,
				type: dataType,
				count: propsObj[property].length,
				values: values.length > UniqueValueThreshold ? values.slice(0, 100) : values
			};
			// Add the attribute to the attributes array
			attributesArray.push(attribute);
		} else {
			const attribute = {
				attribute: property,
				type: dataType,
				count: propsObj[property].length,
				min: Math.min(...propsObj[property]),
				max: Math.max(...propsObj[property]),
				mean: mean(propsObj[property]),
				median: median(propsObj[property]),
				std: std(propsObj[property])
			};

			// The first value is a number, so assume all values as number
			// Look for the unique values, if the number of unique values is less/equal to 25,
			// this is a unique value attribute
			const uniqueValues = [...new Set(propsObj[property])];
			if (uniqueValues.length <= UniqueValueThreshold) {
				attribute['values'] = [...new Set(propsObj[property])].sort(
					(previous: number, after: number) => {
						return previous - after;
					}
				);
				attribute['mean'] = mean(propsObj[property]);
				attribute['median'] = median(propsObj[property]);
				attribute['std'] = std(propsObj[property]);
			} else {
				// There are too many values, this is not a unique values
				// Need to generate the histogram here
				const histogram = { count: [], bins: [] };
				arraystat(propsObj[property]).histogram.map((item) => {
					histogram.bins.push(item.max), histogram.count.push(item.nb);
				});
				histogram.bins.unshift(Math.min(...propsObj[property]));

				attribute['histogram'] = histogram;
			}

			attributesArray.push(attribute);
		}
	});

	return {
		layer: layer.name,
		geometry: geometryType === 1 ? 'Point' : geometryType === 2 ? 'LineString' : 'Polygon',
		count: layer.length,
		attributeCount: attributesArray.length,
		attributes: attributesArray
	};
};
