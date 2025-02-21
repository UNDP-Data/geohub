import { Endpoint, z, type RouteModifier } from 'sveltekit-api';
import {
	generateLegendFromStyle,
	type LegendLayer
} from '$lib/server/helpers/generateLegendFromStyle';
import type { DashboardMapStyle } from '$lib/types';
import { error } from '@sveltejs/kit';

const outputDescription = `
\`legend\` property is a SVG string for legend image. If you want to generate your own legend, get the original values  from \`raw\` property.
<br><br>
\`shape\` property is only for vector layer. This have to replace the variables before using it. The variables are as follows:

- \`{size}\`: size of SVG shape icon
- \`{style}\`: If it is symbol layer, apply color by using filter.
- \`{color}\`: If it is vector layer except symbol, change color by replacing this variable.
<br><br>
\`colors\`, \`values\`, \`min\`, \`max\`, \`unit\` might be missing depending on the type of legend and layer.
`;

export const Output = z
	.custom<LegendLayer[]>()
	.describe(outputDescription)
	.openapi({
		example: [
			{
				id: 'string',
				name: 'string',
				legend: 'string',
				layer: {
					id: 'string',
					name: 'string',
					info: {},
					dataset: 'string',
					colorMapName: 'string',
					classificationMethod: 'string',
					isExpanded: true,
					activeTab: 'string'
				},
				raw: {
					min: 0,
					max: 0,
					unit: 'string',
					colors: ['Unknown Type: array,string'],
					values: ['Unknown Type: number,string'],
					shape: 'string'
				}
			} as unknown as LegendLayer
		]
	});

export const Query = z.object({
	debug: z
		.enum(['true', 'false'])
		.default('false')
		.describe('If true, return raw property, Default is false'),
	visible_only: z
		.enum(['true', 'false'])
		.default('false')
		.describe('if true, return only layers visible or opacity is not zero. Default is false'),
	width: z
		.string()
		.default('100%')
		.describe('Default is 100%. Set the width of legend if necessary')
});

export const Input = z.custom<DashboardMapStyle>().describe('Map style object');

const description = `
Create a legend in JSON format from style in the body of request.

Legend property in the response may vary depending on the type of the layer and settings.

- Raster
    - RGB layer: return titiler's preview URL
    - algorithm layer: return titiler's preview URL
    - linear legend: return SVG string
    - categoriesed legend: return SVG string
    - unique values legend: return SVG string
- Vector:
    - Simple legend
    - categoriesed legend
    - unique values legend
`;

export const Modifier: RouteModifier = (c) => {
	c.summary = 'Create legend from style';
	c.description = description;
	c.tags = ['style'];
	return c;
};

export default new Endpoint({ Query, Input, Output, Modifier }).handle(
	async (param, { request }) => {
		const debug = param.debug ? param.debug?.toLowerCase() === 'true' : false;

		const visibleOnly = param.visible_only ? param.visible_only?.toLowerCase() === 'true' : false;

		const width = param.width ?? '100%';

		const style: DashboardMapStyle = await request.json();

		if (!style.layers) {
			error(400, { message: 'No layer in this style' });
		}
		const data = await generateLegendFromStyle(style, debug, visibleOnly, width);
		return data;
	}
);
