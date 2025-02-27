import { Endpoint, z, type RouteModifier, error as appError } from 'sveltekit-api';
import type { DashboardMapStyle } from '$lib/types';
import { generateLegendFromStyle, type LegendLayer } from '$lib/server/helpers';
import { error } from '@sveltejs/kit';
import { AddSecurictyModifier } from '$api/securityModifier';

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
				id: '314ed0ee-10ee-4c68-8bec-cda0467965b6',
				name: 'Digital Elevation Model (DEM) 10m resolution, Rwanda',
				legend:
					'https://titiler-dev.undpgeohub.org/cog/preview?url=https%3A%2F%2Fundpgeohub.blob.core.windows.net%2Fuserdata%2Fa85516c81c0b78d3e89d3f00099b8b15%2Fdatasets%2FDem_Rwanda_10m_allt_20230921150153.tif%2FDem_Rwanda_10m_allt_20230921150153_band1.tif%3Fc3Y9MjAyNC0wOC0wNCZzcz1iJnNydD1vJnNlPTIwMjUtMDgtMTlUMTYlM0ExMyUzQTA2WiZzcD1yJnNpZz02RXMzUVFHRmNIb2glMkZ0S1Qwdng1YWE2ejhYc2pzemVXRHVZWkN5SXYwZmMlM0Q%3D&algorithm=hillshade&algorithm_params=%7B%22azimuth%22%3A57%2C%22angle_altitude%22%3A23.8%2C%22buffer%22%3A3%7D&height=64&width=64'
			},
			{
				id: '068bf5c9-8df8-4523-9632-638686be7a5b',
				name: 'Libya Floods - 34/120200213132/10500100363D0900 - visual',
				legend:
					'https://titiler-dev.undpgeohub.org/cog/preview?url=https%3A%2F%2Fmaxar-opendata.s3.amazonaws.com%2Fevents%2FLibya-Floods-Sept-2023%2Fard%2F34%2F120200213132%2F2023-09-13%2F10500100363D0900-visual.tif&height=64&width=64'
			},
			{
				id: 'd070e328-7b5a-4499-8509-3867eb6f4df0',
				name: 'Anthropogenic Biomes',
				legend:
					"<svg width='100%' height='630' xmlns='http://www.w3.org/2000/svg'><rect x='10' y='10' width='20' height='20' fill='rgb(166,206,227)'/>  <text x='40' y='25' font-family='ProximaNova' font-size='14'>Urban</text><rect x='10' y='32' width='20' height='20' fill='rgb(114,164,203)'/>  <text x='40' y='47' font-family='ProximaNova' font-size='14'>Dense settlements</text><rect x='10' y='54' width='20' height='20' fill='rgb(64,134,176)'/>  <text x='40' y='69' font-family='ProximaNova' font-size='14'>Rice villages</text><rect x='10' y='76' width='20' height='20' fill='rgb(145,193,154)'/>  <text x='40' y='91' font-family='ProximaNova' font-size='14'>Irrigated villages</text><rect x='10' y='98' width='20' height='20' fill='rgb(161,212,125)'/>  <text x='40' y='113' font-family='ProximaNova' font-size='14'>Cropped and pastoral villages</text><rect x='10' y='120' width='20' height='20' fill='rgb(99,178,79)'/>  <text x='40' y='135' font-family='ProximaNova' font-size='14'>Pastoral villages</text><rect x='10' y='142' width='20' height='20' fill='rgb(144,158,92)'/>  <text x='40' y='157' font-family='ProximaNova' font-size='14'>Rainfed villages</text><rect x='10' y='164' width='20' height='20' fill='rgb(232,155,142)'/>  <text x='40' y='179' font-family='ProximaNova' font-size='14'>Rainfed mosaic villages</text><rect x='10' y='186' width='20' height='20' fill='rgb(242,120,120)'/>  <text x='40' y='201' font-family='ProximaNova' font-size='14'>Residential irrigated cropland</text><rect x='10' y='208' width='20' height='20' fill='rgb(228,43,44)'/>  <text x='40' y='223' font-family='ProximaNova' font-size='14'>Residential rainfed mosaic</text><rect x='10' y='230' width='20' height='20' fill='rgb(240,136,81)'/>  <text x='40' y='245' font-family='ProximaNova' font-size='14'>Populated irrigated cropland</text><rect x='10' y='252' width='20' height='20' fill='rgb(253,188,108)'/>  <text x='40' y='267' font-family='ProximaNova' font-size='14'>Populated rainfed cropland</text><rect x='10' y='274' width='20' height='20' fill='rgb(254,156,70)'/>  <text x='40' y='289' font-family='ProximaNova' font-size='14'>Remote cropland</text><rect x='10' y='296' width='20' height='20' fill='rgb(248,136,83)'/>  <text x='40' y='311' font-family='ProximaNova' font-size='14'>Residential rangelands</text><rect x='10' y='318' width='20' height='20' fill='rgb(219,164,179)'/>  <text x='40' y='333' font-family='ProximaNova' font-size='14'>Populated rangelands</text><rect x='10' y='340' width='20' height='20' fill='rgb(183,157,201)'/>  <text x='40' y='355' font-family='ProximaNova' font-size='14'>Remote rangelands</text><rect x='10' y='362' width='20' height='20' fill='rgb(131,97,168)'/>  <text x='40' y='377' font-family='ProximaNova' font-size='14'>Populated forests</text><rect x='10' y='384' width='20' height='20' fill='rgb(173,159,154)'/>  <text x='40' y='399' font-family='ProximaNova' font-size='14'>Remote forests</text><rect x='10' y='406' width='20' height='20' fill='rgb(244,243,153)'/>  <text x='40' y='421' font-family='ProximaNova' font-size='14'>Wild forests</text><rect x='10' y='428' width='20' height='20' fill='rgb(223,198,117)'/>  <text x='40' y='443' font-family='ProximaNova' font-size='14'>Sparse trees</text><rect x='10' y='450' width='20' height='20' fill='rgb(177,89,40)'/>  <text x='40' y='465' font-family='ProximaNova' font-size='14'>Barren</text></svg>"
			},
			{
				id: '98dfef96-2c74-46e2-bcad-1744bb8c02e7',
				name: 'Digital Elevation Model (DEM) 10m resolution, Rwanda',
				legend:
					"<svg width='100%' height='70' xmlns='http://www.w3.org/2000/svg'>  <defs>  <linearGradient id='grad1' x1='0%' y1='0%' x2='100%' y2='0%'><stop offset='19%' style='stop-color:#543005;stop-opacity:1' />,<stop offset='38%' style='stop-color:#d0a55e;stop-opacity:1' />,<stop offset='57%' style='stop-color:#f5f5f5;stop-opacity:1' />,<stop offset='76%' style='stop-color:#62b4aa;stop-opacity:1' />,<stop offset='95%' style='stop-color:#003c30;stop-opacity:1' /></linearGradient>  </defs>  <text x='0' y='15' font-family='ProximaNova' font-size='12' fill='#000000'>m</text>  <rect y='20' width='100%' height='28' fill='url(#grad1)' />    <text x='0' y='65' font-family='ProximaNova' font-size='12' fill='#000000'>100</text>  <text x='100%' y='65' font-family='ProximaNova' font-size='12' fill='#000000' text-anchor='end'>4123</text></svg>"
			},
			{
				id: '23e5f29c-c929-4f96-9458-6b835b8a1f3d',
				name: 'Digital Elevation Model (DEM) 10m resolution, Rwanda',
				legend:
					"<svg width='100%' height='150' xmlns='http://www.w3.org/2000/svg'><text x='10' y='15' font-family='ProximaNova' font-size='12' fill='#000000'>m</text><rect x='10' y='25' width='20' height='20' fill='rgb(103,0,31)'/>  <text x='40' y='40' font-family='ProximaNova' font-size='14'>958 - 1480.06</text><rect x='10' y='47' width='20' height='20' fill='rgb(229,135,107)'/>  <text x='40' y='62' font-family='ProximaNova' font-size='14'>1480.06 - 2063.96</text><rect x='10' y='69' width='20' height='20' fill='rgb(255,255,255)'/>  <text x='40' y='84' font-family='ProximaNova' font-size='14'>2063.96 - 2718.79</text><rect x='10' y='91' width='20' height='20' fill='rgb(163,163,163)'/>  <text x='40' y='106' font-family='ProximaNova' font-size='14'>2718.79 - 3404.31</text><rect x='10' y='113' width='20' height='20' fill='rgb(26,26,26)'/>  <text x='40' y='128' font-family='ProximaNova' font-size='14'>3404.31 - 4123.01</text></svg>"
			}
		] as unknown as LegendLayer[]
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

export const Param = z.object({
	id: z.string().describe('Style ID')
});

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
	c = AddSecurictyModifier(c);
	return c;
};

export const Error = {
	400: appError(400, 'Invalid parameter'),
	403: appError(403, 'Permission error')
};

export default new Endpoint({ Param, Query, Output, Modifier }).handle(async (param, { fetch }) => {
	const styleId = Number(param.id);
	if (!styleId) {
		error(400, { message: `id parameter is required.` });
	}
	const debug = param.debug ? param.debug?.toLowerCase() === 'true' : false;

	const visibleOnly = param.visible_only ? param.visible_only?.toLowerCase() === 'true' : false;

	const width = param.width ?? '100%';

	const res = await fetch(`/api/style/${styleId}`);
	if (!res.ok) {
		const body = await res.json();
		error(res.status, body);
	}
	const style: DashboardMapStyle = await res.json();

	if (!style.layers) {
		error(400, { message: 'No layer in this style' });
	}
	const data = await generateLegendFromStyle(style, debug, visibleOnly, width);

	return data;
});
